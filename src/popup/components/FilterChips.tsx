import { T } from '../tokens'

interface FilterChipsProps {
  filters: string[]
  active: string | null
  onSelect: (f: string | null) => void
}

/** Horizontally scrollable row of filter pills. 'All' clears the active filter. */
export function FilterChips({ filters, active, onSelect }: FilterChipsProps) {
  return (
    <div style={{
      padding: '0 14px 8px',
      display: 'flex', gap: 5,
      overflowX: 'auto',
      position: 'relative', zIndex: 2,
      flexShrink: 0,
    }}>
      {filters.map(f => {
        const on = f === 'All' ? !active : active === f
        return (
          <button
            key={f}
            onClick={() => onSelect(on || f === 'All' ? null : f)}
            style={{
              fontSize: 10,
              padding: '4px 9px',
              borderRadius: 999,
              background: on ? 'rgba(91,108,255,0.12)' : 'rgba(255,255,255,0.6)',
              border:    `1px solid ${on ? 'rgba(91,108,255,0.3)' : T.line}`,
              color:      on ? T.indigoDeep : T.ink2,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontFamily: T.font,
              flexShrink: 0,
              transition: 'all 120ms',
            }}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}
