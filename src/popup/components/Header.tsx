import type { ReactNode } from 'react'
import type { StorageUsage } from '@t/index'
import { T } from '../tokens'
import { Icon, IconPaths } from '../icons'
import { IconBtn } from './IconBtn'

interface HeaderProps {
  totalCount:    number
  onAdd:         () => void
  lastSaved?:    Date | null
  storageUsage?: StorageUsage | null
  right?:        ReactNode
}

/** Top bar: logo mark, wordmark, item count, action buttons. */
export function Header({ totalCount, onAdd, lastSaved, storageUsage, right }: HeaderProps) {
  const syncLabel    = lastSaved ? `synced ${relativeTime(lastSaved)}` : null
  const storagePct   = storageUsage?.pct ?? 0
  const storageWarn  = storagePct >= 0.8
  const storageFull  = storagePct >= 0.95
  const storageLabel = storageWarn
    ? `· ${Math.round(storagePct * 100)}% sync quota used`
    : null
  return (
    <div style={{
      height: 52, padding: '0 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `1px solid ${T.line}`,
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      position: 'relative', zIndex: 2,
      flexShrink: 0,
    }}>
      {/* Logo + wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LogoMark />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, letterSpacing: -0.2 }}>
            Skill Cache
          </span>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: storageWarn ? (storageFull ? 'oklch(0.58 0.2 25)' : 'oklch(0.6 0.18 55)') : T.ink3, marginTop: 2, letterSpacing: 0.5 }}>
            v1.0 · {totalCount} saved{syncLabel ? ` · ${syncLabel}` : ''}{storageLabel ? ` ${storageLabel}` : ''}
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {right}
        <IconBtn
          title={storageFull ? 'Sync storage is full (95%+ of 100 KB used) — delete some entries to add more' : 'Add new entry'}
          glow={!storageFull}
          onClick={storageFull ? undefined : onAdd}
          style={storageFull ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
        >
          <Icon d={IconPaths.plus} size={14} stroke="#fff" />
        </IconBtn>
      </div>
    </div>
  )
}

function relativeTime(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (mins < 1)   return 'just now'
  if (mins === 1) return '1m ago'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return hrs === 1 ? '1h ago' : `${hrs}h ago`
}

function LogoMark() {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: 6,
      background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.cyan} 100%)`,
      boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 4px 12px ${T.indigoDeep}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {/* Small white angled glyph */}
      <div style={{
        width: 10, height: 10,
        border: '1.5px solid rgba(255,255,255,0.95)',
        borderRight: 'none', borderTop: 'none',
        borderRadius: 1,
        transform: 'rotate(-45deg) translate(1px, -1px)',
      }} />
    </div>
  )
}
