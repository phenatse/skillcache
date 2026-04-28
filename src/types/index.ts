// ─── Data models ──────────────────────────────────────────────────────────────

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

// ─── Storage shape ─────────────────────────────────────────────────────────────

export interface StorageData {
  tools: Tool[]
  prompts: Prompt[]
  categories: Category[]
}

// ─── UI persistence ────────────────────────────────────────────────────────────

export interface UIState {
  activeTab: Tab
  searchQuery: string
  lastSaved?: string    // ISO string
}

// ─── Misc ──────────────────────────────────────────────────────────────────────

export type Tab = 'categories' | 'tools' | 'prompts' | 'favorites'
