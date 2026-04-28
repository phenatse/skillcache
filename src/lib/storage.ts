/**
 * storage.ts
 * Chrome local storage CRUD. All exports are async Promises.
 * This is the only file that touches chrome.storage.local directly.
 */

import type { Tool, Prompt, Category, StorageData, UIState } from '@t/index'

const DATA_KEY = 'skillCache'
const UI_KEY   = 'skillCacheUI'

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

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

// ─── Core ─────────────────────────────────────────────────────────────────────

export async function getAll(): Promise<StorageData> {
  const result = await chrome.storage.local.get(DATA_KEY)
  return result[DATA_KEY] ?? { tools: [], prompts: [], categories: [] }
}

export async function saveAll(data: StorageData): Promise<void> {
  await chrome.storage.local.set({ [DATA_KEY]: data })
}

/** Seeds default categories + starter tools on first install. Safe to call on every load. */
export async function initDefaults(): Promise<void> {
  const data = await getAll()
  if (data.categories.length === 0) {
    data.categories = DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: now() }))
    data.tools = DEFAULT_TOOLS.map(t => ({
      ...t,
      id:        generateId(),
      type:      'tool' as const,
      favorite:  false,
      createdAt: now(),
      updatedAt: now(),
    }))
    await saveAll(data)
  }
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function saveTool(toolData: Partial<Tool> & { name: string }): Promise<Tool[]> {
  const data = await getAll()
  const idx  = data.tools.findIndex(t => t.id === toolData.id)

  if (idx >= 0) {
    data.tools[idx] = { ...data.tools[idx], ...toolData, updatedAt: now() }
  } else {
    data.tools.push({
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
    })
  }

  await saveAll(data)
  return data.tools
}

export async function deleteTool(id: string): Promise<void> {
  const data = await getAll()
  data.tools = data.tools.filter(t => t.id !== id)
  await saveAll(data)
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export async function savePrompt(
  promptData: Partial<Prompt> & { title: string; text: string },
): Promise<Prompt[]> {
  const data = await getAll()
  const idx  = data.prompts.findIndex(p => p.id === promptData.id)

  if (idx >= 0) {
    data.prompts[idx] = { ...data.prompts[idx], ...promptData, updatedAt: now() }
  } else {
    data.prompts.push({
      id:        generateId(),
      type:      'prompt',
      title:     promptData.title,
      text:      promptData.text,
      llm:       promptData.llm   ?? '',
      tags:      promptData.tags  ?? [],
      uses:      promptData.uses  ?? 0,
      createdAt: now(),
      updatedAt: now(),
    })
  }

  await saveAll(data)
  return data.prompts
}

export async function deletePrompt(id: string): Promise<void> {
  const data = await getAll()
  data.prompts = data.prompts.filter(p => p.id !== id)
  await saveAll(data)
}

export async function incrementPromptUses(id: string): Promise<void> {
  const data   = await getAll()
  const prompt = data.prompts.find(p => p.id === id)
  if (prompt) {
    prompt.uses = (prompt.uses ?? 0) + 1
    await saveAll(data)
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function saveCategory(
  catData: Partial<Category> & { name: string },
): Promise<Category[]> {
  const data = await getAll()
  const idx  = data.categories.findIndex(c => c.id === catData.id)

  if (idx >= 0) {
    data.categories[idx] = { ...data.categories[idx], ...catData }
  } else {
    data.categories.push({ id: generateId(), name: catData.name, createdAt: now() })
  }

  await saveAll(data)
  return data.categories
}

export async function deleteCategory(id: string): Promise<void> {
  const data = await getAll()
  data.categories = data.categories.filter(c => c.id !== id)
  // Cascade — remove the id from every entry's tag list
  data.tools   = data.tools.map(t   => ({ ...t, tags: t.tags.filter(tag => tag !== id) }))
  data.prompts = data.prompts.map(p => ({ ...p, tags: p.tags.filter(tag => tag !== id) }))
  await saveAll(data)
}

// ─── UI state persistence ─────────────────────────────────────────────────────

export async function getUIState(): Promise<Partial<UIState>> {
  const result = await chrome.storage.local.get(UI_KEY)
  return result[UI_KEY] ?? {}
}

export async function saveUIState(state: Partial<UIState>): Promise<void> {
  const current = await getUIState()
  await chrome.storage.local.set({ [UI_KEY]: { ...current, ...state } })
}
