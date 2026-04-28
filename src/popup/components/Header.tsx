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
            v1.2 · {totalCount} saved{syncLabel ? ` · ${syncLabel}` : ''}{storageLabel ? ` ${storageLabel}` : ''}
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width={28} height={28}
      style={{ display: 'block', flexShrink: 0, filter: `drop-shadow(0 3px 8px ${T.indigoDeep}66)` }}
    >
      <defs>
        <linearGradient id="sc-bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#5B6CFF"/>
          <stop offset="100%" stopColor="#1FB3C4"/>
        </linearGradient>
        <linearGradient id="sc-shine" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="white" stopOpacity={0.22}/>
          <stop offset="100%" stopColor="white" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="26" fill="url(#sc-bg)"/>
      <rect width="128" height="70"  rx="26" fill="url(#sc-shine)"/>
      <path
        fillRule="evenodd" fill="rgba(255,255,255,0.20)"
        d="M 60,48 L 61,40 A 30,30 0 0,1 67,40 L 68,48 A 22,22 0 0,1 76,52 L 83,47 A 30,30 0 0,1 87,51 L 82,58 A 22,22 0 0,1 86,66 L 94,67 A 30,30 0 0,1 94,73 L 86,74 A 22,22 0 0,1 82,82 L 87,89 A 30,30 0 0,1 83,93 L 76,88 A 22,22 0 0,1 68,92 L 67,100 A 30,30 0 0,1 61,100 L 60,92 A 22,22 0 0,1 52,88 L 45,93 A 30,30 0 0,1 41,89 L 46,82 A 22,22 0 0,1 42,74 L 34,73 A 30,30 0 0,1 34,67 L 42,66 A 22,22 0 0,1 46,58 L 41,51 A 30,30 0 0,1 45,47 L 52,52 A 22,22 0 0,1 60,48 Z M 74,70 A 10,10 0 1,0 54,70 A 10,10 0 1,0 74,70 Z"
      />
      <path d="M 68,41 L 44,73 L 63,73 L 60,95 L 84,62 L 66,62 Z" fill="white"/>
    </svg>
  )
}
