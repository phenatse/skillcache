// Design tokens — single source of truth for all visual values.

export const T = {
  bg:          '#f4f3fb',
  bg2:         '#e8e6f4',
  ink:         'rgba(20, 22, 40, 0.92)',
  ink2:        'rgba(50, 56, 90, 0.68)',
  ink3:        'rgba(80, 88, 120, 0.48)',
  line:        'rgba(50, 60, 110, 0.09)',
  lineStrong:  'rgba(50, 60, 110, 0.18)',
  glass:       'rgba(255, 255, 255, 0.55)',
  glassHi:     'rgba(255, 255, 255, 0.78)',
  indigo:      '#5B6CFF',
  indigoDeep:  '#4452E6',
  cyan:        '#1FB3C4',
  font:        '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono:        '"JetBrains Mono", ui-monospace, monospace',
} as const

// oklch hue for each default category
export const CAT_HUES: Record<string, number> = {
  UAT:       280,
  Events:     25,
  Marketing: 340,
  Community: 160,
  Dev:       220,
  AI:         55,
}

// oklch hue for each LLM
export const LLM_HUES: Record<string, number> = {
  Claude:     25,
  ChatGPT:   150,
  GPT:       150,
  Gemini:    220,
  Copilot:   200,
  Perplexity:260,
  Other:     280,
}

// Icon key per default category (maps to IconPaths in icons.tsx)
export const CAT_ICON_KEYS: Record<string, string> = {
  UAT:       'check',
  Events:    'ticket',
  Marketing: 'mega',
  Community: 'users',
  Dev:       'code',
  AI:        'bolt',
}

/** Returns a stable oklch hue for any category name. */
export function getCatHue(name: string): number {
  if (CAT_HUES[name] !== undefined) return CAT_HUES[name]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}

/** Returns the icon key for a category name. Falls back to 'hash'. */
export function getCatIconKey(name: string): string {
  return CAT_ICON_KEYS[name] ?? 'hash'
}

/** Returns a stable oklch hue for an LLM name. */
export function getLlmHue(llm: string): number {
  return LLM_HUES[llm] ?? 200
}
