import type { ReactNode } from 'react'
import { T } from '../tokens'

interface TagPillProps {
  children: ReactNode
  hue?: number      // oklch hue angle
  mono?: boolean    // use monospace font + uppercase
  dim?: boolean     // muted variant (no colour tint)
}

/** Coloured rounded pill used for category and LLM tags. */
export function TagPill({ children, hue = 280, mono = false, dim = false }: TagPillProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 7px',
      height: 18,
      fontFamily: mono ? T.mono : T.font,
      fontSize: 9.5,
      fontWeight: 500,
      letterSpacing: mono ? 0.4 : 0.2,
      textTransform: mono ? 'uppercase' : 'none',
      color:      dim ? T.ink2 : `oklch(0.45 0.18 ${hue})`,
      background: dim ? 'rgba(255,255,255,0.5)' : `oklch(0.85 0.1 ${hue} / 0.55)`,
      border:     `1px solid ${dim ? T.line : `oklch(0.65 0.18 ${hue} / 0.35)`}`,
      borderRadius: 999,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {children}
    </span>
  )
}
