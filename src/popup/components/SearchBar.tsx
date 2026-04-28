import { T } from '../tokens'
import { Icon, IconPaths } from '../icons'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

/** Glass search input with search icon and keyboard shortcut badge. */
export function SearchBar({ value, onChange, placeholder = 'Search tools, prompts, tags…' }: SearchBarProps) {
  return (
    <div style={{ padding: '12px 14px 8px', position: 'relative', zIndex: 2, flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 36, padding: '0 12px',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: 10,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(50,60,110,0.06)',
      }}>
        <span style={{ color: T.ink3, display: 'flex', flexShrink: 0 }}>
          <Icon d={IconPaths.search} size={13} />
        </span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: T.ink,
            fontSize: 12,
            fontFamily: T.font,
          }}
        />
        <span style={{
          fontFamily: T.mono, fontSize: 9, color: T.ink3,
          padding: '2px 5px', borderRadius: 4,
          border: `1px solid ${T.line}`,
          background: 'rgba(255,255,255,0.6)',
          flexShrink: 0,
        }}>
          ⌘K
        </span>
      </div>
    </div>
  )
}
