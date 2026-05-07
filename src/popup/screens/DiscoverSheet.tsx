import { useState } from 'react'
import type { Tool } from '@t/index'
import { T, getCatHue, getCatIconKey } from '../tokens'
import { Icon, IconPaths, type IconKey } from '../icons'
import { IconBtn } from '../components/IconBtn'
import { RECOMMENDED_TOOLS, normaliseUrl } from '@lib/recommendations'

interface DiscoverSheetProps {
  open: boolean
  tools: Tool[]
  onAdd: (rec: { name: string; url: string; description: string; tags: string[] }) => Promise<void>
  onClose: () => void
}

export function DiscoverSheet({ open, tools, onAdd, onClose }: DiscoverSheetProps) {
  const [adding, setAdding] = useState<string | null>(null)

  const addedUrls = new Set(tools.map(t => normaliseUrl(t.url)))

  async function handleAdd(rec: typeof RECOMMENDED_TOOLS[number]) {
    setAdding(rec.url)
    await onAdd(rec)
    setAdding(null)
  }

  const unaddedCount = RECOMMENDED_TOOLS.filter(r => !addedUrls.has(normaliseUrl(r.url))).length

  // Group by first tag prefix (category slug)
  const groups: Record<string, typeof RECOMMENDED_TOOLS> = {}
  const labelMap: Record<string, string> = {
    'cat-dev': 'Dev', 'cat-marketing': 'Marketing', 'cat-community': 'Community',
    'cat-events': 'Events', 'cat-uat': 'UAT', 'cat-ai': 'AI',
  }
  for (const rec of RECOMMENDED_TOOLS) {
    const key = rec.tags[0] ?? 'other'
    if (!groups[key]) groups[key] = []
    groups[key].push(rec)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: '52px 0 0 0',
          background: 'rgba(50,60,110,0.18)',
          backdropFilter: 'blur(2px)',
          zIndex: 9,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 220ms ease-out',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 76,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,248,255,0.94) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -10px 40px rgba(50,60,110,0.18), inset 0 1px 0 rgba(255,255,255,0.95)',
        zIndex: 10,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 220ms ease-out',
      }}>
        {/* Drag handle */}
        <div style={{ padding: '8px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div onClick={onClose} style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(50,60,110,0.2)', cursor: 'pointer' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '4px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: -0.2, fontFamily: T.font }}>
              Discover Tools
            </div>
            <div style={{ fontSize: 10, color: T.ink3, marginTop: 2, fontFamily: T.font }}>
              {unaddedCount} recommendation{unaddedCount !== 1 ? 's' : ''} — hit + to add to your cache
            </div>
          </div>
          <IconBtn onClick={onClose} title="Close">
            <Icon d={IconPaths.close} size={12} />
          </IconBtn>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
          {Object.entries(groups).map(([catKey, recs]) => (
            <div key={catKey} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 9.5, fontFamily: T.mono, fontWeight: 600,
                color: T.ink3, letterSpacing: 0.8, textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                {labelMap[catKey] ?? catKey}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {recs.map(rec => {
                  const isAdded  = addedUrls.has(normaliseUrl(rec.url))
                  const isAdding = adding === rec.url
                  const hue      = getCatHue(labelMap[catKey] ?? '')
                  const iconKey  = getCatIconKey(labelMap[catKey] ?? '') as IconKey

                  return (
                    <div
                      key={rec.url}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 10px', borderRadius: 10,
                        background: isAdded ? 'rgba(50,60,110,0.03)' : 'rgba(255,255,255,0.65)',
                        border: `1px solid ${isAdded ? 'rgba(50,60,110,0.06)' : 'rgba(50,60,110,0.09)'}`,
                        opacity: isAdded ? 0.55 : 1,
                      }}
                    >
                      {/* Favicon */}
                      <FaviconTile url={rec.url} hue={hue} iconKey={iconKey} />

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, fontFamily: T.font }}>
                          {rec.name}
                        </div>
                        <div style={{ fontSize: 10, color: T.ink3, fontFamily: T.font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.description}
                        </div>
                      </div>

                      {/* Action */}
                      {isAdded ? (
                        <span style={{ color: T.cyan, display: 'flex', flexShrink: 0 }}>
                          <Icon d={IconPaths.check} size={14} stroke={T.cyan} sw={2} />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAdd(rec)}
                          disabled={!!isAdding}
                          title="Add to cache"
                          style={{
                            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                            background: isAdding ? 'rgba(91,108,255,0.06)' : 'rgba(91,108,255,0.1)',
                            border: '1px solid rgba(91,108,255,0.25)',
                            color: T.indigoDeep, cursor: 'pointer', padding: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: isAdding ? 0.5 : 1,
                          }}
                        >
                          <Icon d={IconPaths.plus} size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function FaviconTile({ url, hue, iconKey }: { url: string; hue: number; iconKey: IconKey }) {
  const [failed, setFailed] = useState(false)
  let domain = ''
  try { domain = new URL(url).hostname } catch { /* ignore */ }
  const src = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : ''

  if (src && !failed) {
    return (
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(50,60,110,0.09)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={src} alt="" width={18} height={18} onError={() => setFailed(true)}
          style={{ display: 'block', objectFit: 'contain', borderRadius: 2 }} />
      </div>
    )
  }
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
      background: `oklch(0.92 0.07 ${hue} / 0.7)`,
      border: `1px solid oklch(0.75 0.13 ${hue} / 0.35)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: `oklch(0.4 0.18 ${hue})`,
    }}>
      <Icon d={IconPaths[iconKey] ?? IconPaths.tools} size={13} />
    </div>
  )
}
