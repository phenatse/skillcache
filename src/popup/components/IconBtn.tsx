import type { ReactNode } from 'react'
import { T } from '../tokens'

interface IconBtnProps {
  children: ReactNode
  onClick?: () => void
  glow?: boolean      // indigo gradient variant (primary CTA)
  size?: number
  radius?: number
  title?: string
}

/** Small icon button — plain glass or indigo-gradient (glow=true). */
export function IconBtn({ children, onClick, glow = false, size = 28, radius = 8, title }: IconBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: size, height: size,
        borderRadius: radius,
        border: `1px solid ${glow ? 'rgba(255,255,255,0.3)' : T.line}`,
        background: glow
          ? `linear-gradient(135deg, ${T.indigo}, ${T.indigoDeep})`
          : 'rgba(255,255,255,0.7)',
        color:  glow ? '#fff' : T.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, flexShrink: 0,
        boxShadow: glow
          ? `0 4px 12px ${T.indigoDeep}55, inset 0 1px 0 rgba(255,255,255,0.3)`
          : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(50,60,110,0.06)',
        transition: 'opacity 120ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
    >
      {children}
    </button>
  )
}
