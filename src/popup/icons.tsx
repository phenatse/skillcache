import type { CSSProperties, ReactNode } from 'react'

interface IconProps {
  d: ReactNode
  size?: number
  stroke?: string
  fill?: string
  sw?: number
  style?: CSSProperties
}

export function Icon({ d, size = 14, stroke = 'currentColor', fill = 'none', sw = 1.5, style }: IconProps) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
  )
}

// Lucide-style icon paths as JSX elements
export const IconPaths = {
  search:  <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  plus:    <><path d="M12 5v14M5 12h14"/></>,
  arrow:   <><path d="M7 17 17 7M9 7h8v8"/></>,
  tools:   <><path d="M14.7 6.3a4 4 0 0 1 5 5l-9.4 9.4-5 1 1-5z"/><path d="m13 8 3 3"/></>,
  prompt:  <><path d="M4 6h16M4 12h10M4 18h7"/><circle cx="19" cy="17" r="2.5"/></>,
  cat:     <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  spark:   <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></>,
  link:    <><path d="M10 13a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1"/><path d="M14 11a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"/></>,
  close:   <><path d="M6 6l12 12M18 6 6 18"/></>,
  check:   <><path d="m5 12 5 5L20 7"/></>,
  chevron: <><path d="m9 6 6 6-6 6"/></>,
  star:    <><path d="m12 3 2.6 6 6.4.5-4.9 4.2 1.5 6.3L12 16.8 6.4 20l1.5-6.3L3 9.5 9.4 9z"/></>,
  flame:   <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-.5 2 .5 3 1.5 3 0-3 0-6 1.5-9z"/></>,
  hash:    <><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></>,
  mega:    <><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8a5 5 0 0 1 0 8"/></>,
  users:   <><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5 6"/></>,
  code:    <><path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/></>,
  ticket:  <><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 7v10"/></>,
  note:    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></>,
  copy:    <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  pencil:  <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></>,
  trash:   <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>,
} as const

export type IconKey = keyof typeof IconPaths
