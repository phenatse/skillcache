import type { Tab } from '@t/index'
import { T } from '../tokens'
import { Icon, IconPaths } from '../icons'

interface TabBarProps {
  active: Tab
  onSelect: (tab: Tab) => void
  lastSaved: Date | null
}

const TABS: { id: Tab; label: string; icon: keyof typeof IconPaths }[] = [
  { id: 'categories', label: 'Categories', icon: 'cat'    },
  { id: 'tools',      label: 'Tools',      icon: 'tools'  },
  { id: 'prompts',    label: 'Prompts',    icon: 'prompt' },
  { id: 'favorites',  label: 'Favorites',  icon: 'star'   },
]

/** Tab bar — sits between search/filter area and the scrolling content. */
export function TabBar({ active, onSelect, lastSaved }: TabBarProps) {
  const syncLabel = lastSaved ? `SYNCED · ${relativeTime(lastSaved)}` : 'NEVER SAVED'

  return (
    <div style={{
      height: 40, padding: '0 14px',
      borderTop: `1px solid ${T.line}`,
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', zIndex: 2,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {TABS.map(tab => {
          const on = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 10px', borderRadius: 7,
                fontSize: 11, fontWeight: 500,
                color:      on ? T.indigoDeep : T.ink2,
                background: on ? 'rgba(91,108,255,0.1)' : 'transparent',
                border:    `1px solid ${on ? 'rgba(91,108,255,0.2)' : 'transparent'}`,
                cursor: 'pointer', fontFamily: T.font,
                transition: 'all 120ms',
              }}
            >
              <Icon d={IconPaths[tab.icon]} size={12} stroke={on ? T.indigoDeep : T.ink2} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.ink3, letterSpacing: 0.4 }}>
        {syncLabel}
      </span>
    </div>
  )
}

function relativeTime(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (mins < 1)  return 'just now'
  if (mins === 1) return '1m'
  if (mins < 60)  return `${mins}m`
  const hrs = Math.floor(mins / 60)
  return hrs === 1 ? '1h' : `${hrs}h`
}
