/**
 * storage.ts — chrome.storage.sync backend
 *
 * Stores each entity under its own key to stay within the 8 KB per-item limit
 * while sharing the 102,400-byte (100 KB) total sync quota across devices.
 *
 * Key schema:
 *   sc_t_{id}  → Tool
 *   sc_p_{id}  → Prompt
 *   sc_c_{id}  → Category
 *   sc_ui      → UIState
 *
 * One-time migration: on first load, if sync is empty but chrome.storage.local
 * has the old single-key format, we copy it over and clear local.
 */

import type { Tool, Prompt, Category, StorageData, UIState } from '@t/index'

const T_PREFIX = 'sc_t_'
const P_PREFIX = 'sc_p_'
const C_PREFIX = 'sc_c_'
const UI_KEY   = 'sc_ui'

// Legacy keys from the old chrome.storage.local format
const LEGACY_DATA_KEY = 'skillCache'
const LEGACY_UI_KEY   = 'skillCacheUI'

const DEFAULT_CATEGORIES: Omit<Category, 'createdAt'>[] = [
  { id: 'cat-uat',       name: 'UAT'       },
  { id: 'cat-events',    name: 'Events'    },
  { id: 'cat-marketing', name: 'Marketing' },
  { id: 'cat-community', name: 'Community' },
  { id: 'cat-dev',       name: 'Dev'       },
  { id: 'cat-ai',        name: 'AI'        },
]

type SeedTool = Omit<Tool, 'id' | 'type' | 'favorite' | 'createdAt' | 'updatedAt'>

const DEFAULT_TOOLS: SeedTool[] = [
  // Dev
  { name: 'GitHub',      url: 'https://github.com',        description: 'Code hosting, PRs, CI/CD',                  notes: '', usedAt: '', tags: ['cat-dev'] },
  { name: 'Vercel',      url: 'https://vercel.com',        description: 'Deploy frontends in seconds',                notes: '', usedAt: '', tags: ['cat-dev'] },
  { name: 'Postman',     url: 'https://postman.com',       description: 'API testing and collections',                notes: '', usedAt: '', tags: ['cat-dev'] },
  { name: 'Railway',     url: 'https://railway.app',       description: 'Backend + DB hosting',                      notes: '', usedAt: '', tags: ['cat-dev'] },
  { name: 'Supabase',    url: 'https://supabase.com',      description: 'Postgres + auth + storage as a service',     notes: '', usedAt: '', tags: ['cat-dev'] },
  { name: 'CodeSandbox', url: 'https://codesandbox.io',    description: 'Browser-based dev environments',             notes: '', usedAt: '', tags: ['cat-dev'] },
  { name: 'Warp',        url: 'https://warp.dev',          description: 'AI-native terminal',                         notes: '', usedAt: '', tags: ['cat-dev'] },
  { name: 'Cursor',      url: 'https://cursor.com',        description: 'AI code editor',                             notes: '', usedAt: '', tags: ['cat-dev'] },
  // Marketing
  { name: 'Canva',       url: 'https://canva.com',         description: 'Drag-and-drop design tool',                  notes: '', usedAt: '', tags: ['cat-marketing'] },
  { name: 'Beehiiv',     url: 'https://beehiiv.com',       description: 'Newsletter platform',                        notes: '', usedAt: '', tags: ['cat-marketing'] },
  { name: 'Buffer',      url: 'https://buffer.com',        description: 'Social media scheduling',                    notes: '', usedAt: '', tags: ['cat-marketing'] },
  { name: 'Mailchimp',   url: 'https://mailchimp.com',     description: 'Email marketing & automation',               notes: '', usedAt: '', tags: ['cat-marketing'] },
  { name: 'Typefully',   url: 'https://typefully.com',     description: 'Twitter/X thread composer',                  notes: '', usedAt: '', tags: ['cat-marketing'] },
  { name: 'Loom',        url: 'https://loom.com',          description: 'Async video messaging',                      notes: '', usedAt: '', tags: ['cat-marketing'] },
  // Community
  { name: 'Discord',     url: 'https://discord.com',       description: 'Community chat and servers',                 notes: '', usedAt: '', tags: ['cat-community'] },
  { name: 'Slack',       url: 'https://slack.com',         description: 'Team messaging',                             notes: '', usedAt: '', tags: ['cat-community'] },
  { name: 'Circle',      url: 'https://circle.so',         description: 'Community platform for creators',            notes: '', usedAt: '', tags: ['cat-community'] },
  { name: 'Notion',      url: 'https://notion.so',         description: 'Docs, wikis, and project boards',            notes: '', usedAt: '', tags: ['cat-community'] },
  { name: 'Luma',        url: 'https://lu.ma',             description: 'Event hosting + RSVP',                       notes: '', usedAt: '', tags: ['cat-community', 'cat-events'] },
  // Events
  { name: 'Eventbrite',  url: 'https://eventbrite.com',    description: 'Large-scale event management',               notes: '', usedAt: '', tags: ['cat-events'] },
  { name: 'Zoom',        url: 'https://zoom.us',           description: 'Video conferencing',                         notes: '', usedAt: '', tags: ['cat-events'] },
  { name: 'Streamyard',  url: 'https://streamyard.com',    description: 'Live streaming studio',                      notes: '', usedAt: '', tags: ['cat-events'] },
  { name: 'Cal.com',     url: 'https://cal.com',           description: 'Open-source scheduling',                     notes: '', usedAt: '', tags: ['cat-events'] },
  // UAT
  { name: 'Maze',        url: 'https://maze.co',           description: 'Rapid usability testing',                    notes: '', usedAt: '', tags: ['cat-uat'] },
  { name: 'UserTesting', url: 'https://usertesting.com',   description: 'Video feedback from real users',              notes: '', usedAt: '', tags: ['cat-uat'] },
  { name: 'Hotjar',      url: 'https://hotjar.com',        description: 'Heatmaps and session recordings',             notes: '', usedAt: '', tags: ['cat-uat'] },
  { name: 'Lyssna',      url: 'https://lyssna.com',        description: 'Design and copy testing',                    notes: '', usedAt: '', tags: ['cat-uat'] },
  { name: 'ScreenRec',   url: 'https://screenrec.com',     description: 'Quick screen recording',                     notes: '', usedAt: '', tags: ['cat-uat'] },
  // AI
  { name: 'Claude',      url: 'https://claude.ai',         description: "Anthropic's AI assistant",                   notes: '', usedAt: '', tags: ['cat-ai'] },
  { name: 'ChatGPT',     url: 'https://chatgpt.com',       description: "OpenAI's AI assistant",                      notes: '', usedAt: '', tags: ['cat-ai'] },
  { name: 'Perplexity',  url: 'https://perplexity.ai',     description: 'AI-powered search',                          notes: '', usedAt: '', tags: ['cat-ai'] },
  { name: 'v0',          url: 'https://v0.dev',            description: 'AI UI generator by Vercel',                  notes: '', usedAt: '', tags: ['cat-ai', 'cat-dev'] },
  { name: 'Runway',      url: 'https://runwayml.com',      description: 'AI video generation',                        notes: '', usedAt: '', tags: ['cat-ai'] },
]

// ─── Key helpers ──────────────────────────────────────────────────────────────

function toolKey(id: string)   { return `${T_PREFIX}${id}` }
function promptKey(id: string) { return `${P_PREFIX}${id}` }
function catKey(id: string)    { return `${C_PREFIX}${id}` }

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

// ─── Core read ────────────────────────────────────────────────────────────────

export async function getAll(): Promise<StorageData> {
  const all = await chrome.storage.sync.get(null)
  const tools      = Object.entries(all).filter(([k]) => k.startsWith(T_PREFIX)).map(([, v]) => v as Tool)
  const prompts    = Object.entries(all).filter(([k]) => k.startsWith(P_PREFIX)).map(([, v]) => v as Prompt)
  const categories = Object.entries(all).filter(([k]) => k.startsWith(C_PREFIX)).map(([, v]) => v as Category)
  return { tools, prompts, categories }
}

// Writes (or overwrites) every entity in data. Also removes sync keys for
// entities no longer present. Used only for seeding and cascade deletes.
async function saveAll(data: StorageData): Promise<void> {
  const all = await chrome.storage.sync.get(null)

  const toRemove: string[] = Object.keys(all).filter(k => {
    if (k.startsWith(T_PREFIX)) return !data.tools.find(t => toolKey(t.id) === k)
    if (k.startsWith(P_PREFIX)) return !data.prompts.find(p => promptKey(p.id) === k)
    if (k.startsWith(C_PREFIX)) return !data.categories.find(c => catKey(c.id) === k)
    return false
  })

  const toSet: Record<string, unknown> = {}
  data.tools.forEach(t      => { toSet[toolKey(t.id)]   = t })
  data.prompts.forEach(p    => { toSet[promptKey(p.id)] = p })
  data.categories.forEach(c => { toSet[catKey(c.id)]    = c })

  if (toRemove.length)            await chrome.storage.sync.remove(toRemove)
  if (Object.keys(toSet).length)  await chrome.storage.sync.set(toSet)
}

// ─── Init / migration ─────────────────────────────────────────────────────────

/** On first load: migrate from old local format if present, otherwise seed defaults. */
export async function initDefaults(): Promise<void> {
  const syncAll   = await chrome.storage.sync.get(null)
  const hasSyncData = Object.keys(syncAll).some(k => k.startsWith(C_PREFIX))
  if (hasSyncData) return

  // Try to migrate data from the old chrome.storage.local format
  const local = await chrome.storage.local.get([LEGACY_DATA_KEY, LEGACY_UI_KEY])
  const legacyData = local[LEGACY_DATA_KEY] as StorageData | undefined

  if (legacyData?.categories?.length) {
    await saveAll(legacyData)
    if (local[LEGACY_UI_KEY]) {
      await chrome.storage.sync.set({ [UI_KEY]: local[LEGACY_UI_KEY] })
    }
    await chrome.storage.local.remove([LEGACY_DATA_KEY, LEGACY_UI_KEY])
    return
  }

  // Fresh install — seed defaults
  const seeded: StorageData = {
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: now() })),
    tools: DEFAULT_TOOLS.map(t => ({
      ...t,
      id:        generateId(),
      type:      'tool' as const,
      favorite:  false,
      createdAt: now(),
      updatedAt: now(),
    })),
    prompts: [],
  }
  await saveAll(seeded)
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function saveTool(toolData: Partial<Tool> & { name: string }): Promise<Tool[]> {
  let tool: Tool

  if (toolData.id) {
    const existing = await chrome.storage.sync.get(toolKey(toolData.id))
    const current  = (existing[toolKey(toolData.id)] ?? {}) as Partial<Tool>
    tool = { ...current, ...toolData, updatedAt: now() } as Tool
  } else {
    tool = {
      id:          generateId(),
      type:        'tool',
      name:        toolData.name,
      url:         toolData.url         ?? '',
      description: toolData.description ?? '',
      notes:       toolData.notes       ?? '',
      usedAt:      toolData.usedAt      ?? '',
      tags:        toolData.tags        ?? [],
      favorite:    toolData.favorite    ?? false,
      createdAt:   now(),
      updatedAt:   now(),
    }
  }

  await chrome.storage.sync.set({ [toolKey(tool.id)]: tool })
  const data = await getAll()
  return data.tools
}

export async function deleteTool(id: string): Promise<void> {
  await chrome.storage.sync.remove(toolKey(id))
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export async function savePrompt(
  promptData: Partial<Prompt> & { title: string; text: string },
): Promise<Prompt[]> {
  let prompt: Prompt

  if (promptData.id) {
    const existing = await chrome.storage.sync.get(promptKey(promptData.id))
    const current  = (existing[promptKey(promptData.id)] ?? {}) as Partial<Prompt>
    prompt = { ...current, ...promptData, updatedAt: now() } as Prompt
  } else {
    prompt = {
      id:        generateId(),
      type:      'prompt',
      title:     promptData.title,
      text:      promptData.text,
      llm:       promptData.llm      ?? '',
      tags:      promptData.tags     ?? [],
      uses:      promptData.uses     ?? 0,
      favorite:  promptData.favorite ?? false,
      createdAt: now(),
      updatedAt: now(),
    }
  }

  await chrome.storage.sync.set({ [promptKey(prompt.id)]: prompt })
  const data = await getAll()
  return data.prompts
}

export async function deletePrompt(id: string): Promise<void> {
  await chrome.storage.sync.remove(promptKey(id))
}

export async function incrementPromptUses(id: string): Promise<void> {
  const existing = await chrome.storage.sync.get(promptKey(id))
  const prompt   = existing[promptKey(id)] as Prompt | undefined
  if (prompt) {
    prompt.uses = (prompt.uses ?? 0) + 1
    await chrome.storage.sync.set({ [promptKey(id)]: prompt })
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function saveCategory(
  catData: Partial<Category> & { name: string },
): Promise<Category[]> {
  let cat: Category

  if (catData.id) {
    const existing = await chrome.storage.sync.get(catKey(catData.id))
    const current  = (existing[catKey(catData.id)] ?? {}) as Partial<Category>
    cat = { ...current, ...catData } as Category
  } else {
    cat = { id: generateId(), name: catData.name, createdAt: now() }
  }

  await chrome.storage.sync.set({ [catKey(cat.id)]: cat })
  const data = await getAll()
  return data.categories
}

export async function deleteCategory(id: string): Promise<void> {
  // Remove the category key
  await chrome.storage.sync.remove(catKey(id))

  // Cascade: strip this category id from all tools and prompts that reference it
  const data = await getAll()
  const affectedTools   = data.tools.filter(t => t.tags.includes(id))
  const affectedPrompts = data.prompts.filter(p => p.tags.includes(id))

  const updates: Record<string, unknown> = {}
  affectedTools.forEach(t => {
    updates[toolKey(t.id)]   = { ...t, tags: t.tags.filter(tag => tag !== id) }
  })
  affectedPrompts.forEach(p => {
    updates[promptKey(p.id)] = { ...p, tags: p.tags.filter(tag => tag !== id) }
  })

  if (Object.keys(updates).length) await chrome.storage.sync.set(updates)
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export async function getUIState(): Promise<Partial<UIState>> {
  const result = await chrome.storage.sync.get(UI_KEY)
  return result[UI_KEY] ?? {}
}

export async function saveUIState(state: Partial<UIState>): Promise<void> {
  const current = await getUIState()
  await chrome.storage.sync.set({ [UI_KEY]: { ...current, ...state } })
}

// ─── Storage usage ────────────────────────────────────────────────────────────

export async function getStorageUsage(): Promise<{ used: number; quota: number; pct: number }> {
  const used  = await chrome.storage.sync.getBytesInUse(null)
  const quota = chrome.storage.sync.QUOTA_BYTES  // 102400
  return { used, quota, pct: used / quota }
}
