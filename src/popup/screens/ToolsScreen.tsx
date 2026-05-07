import { useState } from 'react'
import type { CSSProperties, SyntheticEvent } from 'react'
import type { Tool, Category } from '@t/index'
import { T, getCatHue, getCatIconKey } from '../tokens'
import { Icon, IconPaths, type IconKey } from '../icons'
import { GlassCard } from '../components/GlassCard'
import { TagPill } from '../components/TagPill'

interface ToolsScreenProps {
  tools: Tool[]
  categories: Category[]
  onEdit: (tool: Tool) => void
  onDelete: (id: string) => void
  onToggleFavorite: (tool: Tool) => void
  recommendedCount?: number
  onOpenDiscover?: () => void
}

export function ToolsScreen({ tools, categories, onEdit, onDelete, onToggleFavorite, recommendedCount = 0, onOpenDiscover }: ToolsScreenProps) {
  if (tools.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', gap: 12 }}>
        <p style={{ textAlign: 'center', color: T.ink3, fontSize: 12, fontFamily: T.font, margin: 0 }}>
          No tools yet — add one with the + button.
        </p>
        {recommendedCount > 0 && onOpenDiscover && (
          <DiscoverPill count={recommendedCount} onClick={onOpenDiscover} />
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {recommendedCount > 0 && onOpenDiscover && (
        <DiscoverPill count={recommendedCount} onClick={onOpenDiscover} />
      )}
      {tools.map(tool => (
        <ToolCard
          key={tool.id}
          tool={tool}
          categories={categories}
          onEdit={() => onEdit(tool)}
          onDelete={() => onDelete(tool.id)}
          onToggleFavorite={() => onToggleFavorite(tool)}
        />
      ))}
    </div>
  )
}

interface ToolCardProps {
  tool: Tool
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return ''
  }
}

function ToolCard({ tool, categories, onEdit, onDelete, onToggleFavorite }: ToolCardProps) {
  const [hovered,    setHovered]    = useState(false)
  const [imgFailed,  setImgFailed]  = useState(false)

  // Primary category for colour (first tag id)
  const primaryCat = categories.find(c => c.id === tool.tags[0])
  const hue     = getCatHue(primaryCat?.name ?? '')
  const iconKey = getCatIconKey(primaryCat?.name ?? '') as IconKey

  const faviconSrc  = tool.url ? getFaviconUrl(tool.url) : ''
  const showFavicon = faviconSrc && !imgFailed

  function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
    // Google returns a 1×1 grey pixel for unknown domains — treat tiny images as failures
    const img = e.currentTarget
    if (img.naturalWidth <= 16 && img.naturalHeight <= 16) setImgFailed(true)
    else if (img.naturalWidth === 0) setImgFailed(true)
  }

  return (
    <GlassCard>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Favicon tile — falls back to category icon */}
        {showFavicon ? (
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(50,60,110,0.09)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.06)',
          }}>
            <img
              src={faviconSrc}
              alt=""
              width={20} height={20}
              onLoad={handleImgError}
              onError={() => setImgFailed(true)}
              style={{ display: 'block', objectFit: 'contain', borderRadius: 3 }}
            />
          </div>
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, oklch(0.92 0.08 ${hue}) 0%, oklch(0.82 0.13 ${hue}) 100%)`,
            border: `1px solid oklch(0.75 0.15 ${hue} / 0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: `oklch(0.4 0.18 ${hue})`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 4px oklch(0.6 0.15 ${hue} / 0.2)`,
          }}>
            <Icon d={IconPaths[iconKey] ?? IconPaths.tools} size={15} />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, letterSpacing: -0.1, fontFamily: T.font }}>
              {tool.name}
            </span>
            {tool.favorite && (
              <span style={{ color: 'oklch(0.85 0.13 80)', display: 'flex' }}>
                <Icon d={IconPaths.star} size={9} fill="currentColor" />
              </span>
            )}
          </div>
          <div style={{
            fontSize: 10.5, color: T.ink2, lineHeight: 1.35, fontFamily: T.font,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {tool.description || tool.notes || tool.url || 'No description'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
            {primaryCat && <TagPill hue={hue} mono>{primaryCat.name}</TagPill>}
            {tool.usedAt && (
              <span style={{ fontSize: 9.5, color: T.ink3, fontFamily: T.mono }}>
                @ {tool.usedAt}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, marginTop: 2 }}>
          {/* Launch button */}
          {tool.url && (
            <button
              title="Open URL"
              onClick={() => chrome.tabs.create({ url: tool.url })}
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'rgba(91,108,255,0.1)',
                border: '1px solid rgba(91,108,255,0.25)',
                color: T.indigoDeep, cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon d={IconPaths.arrow} size={12} />
            </button>
          )}
          {/* Hover-reveal edit/delete/favourite */}
          {hovered && (
            <>
              <button
                title="Edit"
                onClick={onEdit}
                style={actionBtnStyle}
              >
                <Icon d={IconPaths.pencil} size={11} />
              </button>
              <button
                title={tool.favorite ? 'Remove from favourites' : 'Add to favourites'}
                onClick={onToggleFavorite}
                style={{ ...actionBtnStyle, color: tool.favorite ? 'oklch(0.7 0.13 80)' : T.ink3 }}
              >
                <Icon d={IconPaths.star} size={11} fill={tool.favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                title="Delete"
                onClick={() => {
                  if (window.confirm(`Delete "${tool.name}"?`)) onDelete()
                }}
                style={{ ...actionBtnStyle, color: 'oklch(0.6 0.18 10)' }}
              >
                <Icon d={IconPaths.trash} size={11} />
              </button>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

function DiscoverPill({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 8, width: '100%',
        background: 'rgba(91,108,255,0.07)',
        border: '1px solid rgba(91,108,255,0.18)',
        color: T.indigoDeep, cursor: 'pointer',
        fontSize: 11, fontWeight: 500, fontFamily: T.font,
        transition: 'background 120ms',
      }}
    >
      <Icon d={IconPaths.spark} size={12} stroke={T.indigoDeep} />
      Browse {count} recommended tool{count !== 1 ? 's' : ''}
      <span style={{ marginLeft: 'auto', opacity: 0.5 }}>→</span>
    </button>
  )
}

const actionBtnStyle: CSSProperties = {
  width: 26, height: 26, borderRadius: 7,
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(50,60,110,0.09)',
  color: 'rgba(80,88,120,0.48)',
  cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
