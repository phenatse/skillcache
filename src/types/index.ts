// ─── Data models ─────────────────────────────────────────────────────────────

export interface Tool {
  id: string
  type: 'tool'
  name: string
  url: string
  description: string
  notes: string
  usedAt: string        // job / project context
  tags: string[]        // array of Category ids
  favorite: boolean
  createdAt: string     // ISO string
  updatedAt: string
}

export interface Prompt {
  id: string
  type: 'prompt'
  title: string
  text: string
  llm: string           // e.g. 'Claude', 'ChatGPT'
  tags: string[]        // array of Category ids
  uses: number          // copy-to-clipboard count
  favorite?: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Note {
  id: string
  type: 'note'
  title: string
  body: string
  company: string      // project / brand reference — empty string when absent
  tags: string[]       // array of Category ids
  favorite: boolean
  createdAt: string
  updatedAt: string
}

// ─── Storage shape ─────────────────────────────────────────────────────────────

export interface StorageData {
  tools: Tool[]
  prompts: Prompt[]
  notes: Note[]
  categories: Category[]
}

// ─── UI persistence ────────────────────────────────────────────────────────────

export interface UIState {
  activeTab: Tab
  searchQuery: string
  lastSaved?: string    // ISO string
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export interface StorageUsage {
  used:  number  // bytes
  quota: number  // bytes (102400 for sync)
  pct:   number  // 0–1
}

// ─── Misc ──────────────────────────────────────────────────────────────────────

export type Tab = 'categories' | 'tools' | 'prompts' | 'notes' | 'favorites'
