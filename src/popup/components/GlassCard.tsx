import type { CSSProperties, ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
}

/** Frosted-glass card — base building block for tool and prompt entries. */
export function GlassCard({ children, onClick, style }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '12px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: 12,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 0 rgba(50,60,110,0.04), 0 6px 20px -6px rgba(50,60,110,0.12)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        ...style,
      }}
      onMouseEnter={e => {
        if (!onClick) return
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-1px)'
        el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 0 rgba(50,60,110,0.06), 0 10px 24px -6px rgba(50,60,110,0.16)'
      }}
      onMouseLeave={e => {
        if (!onClick) return
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {children}
    </div>
  )
}
