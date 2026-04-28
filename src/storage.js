/**
 * storage.js
 * Single source of truth for all Chrome local storage reads and writes.
 * All public functions are async and return Promises.
 *
 * Data shape stored under STORAGE_KEY:
 * {
 *   tools:      Tool[],
 *   prompts:    Prompt[],
 *   categories: Category[],
 * }
 *
 * Tool:     { id, type:'tool', name, url, description, tags[], notes, usedAt, createdAt, updatedAt }
 * Prompt:   { id, type:'prompt', title, text, llm, tags[], createdAt, updatedAt }
 * Category: { id, name, createdAt }
 */

const STORAGE_KEY = 'skillCache';

const DEFAULT_CATEGORIES = [
  { id: 'cat-uat',       name: 'UAT'       },
  { id: 'cat-events',    name: 'Events'    },
  { id: 'cat-marketing', name: 'Marketing' },
  { id: 'cat-community', name: 'Community' },
  { id: 'cat-dev',       name: 'Dev'       },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

// ─── Core read / write ────────────────────────────────────────────────────────

/** Returns the full data object. Safe to call before initDefaults. */
export async function getAll() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? { tools: [], prompts: [], categories: [] };
}

/** Overwrites the full data object. */
export async function saveAll(data) {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

/**
 * Seeds default categories on first install.
 * Call once at popup load — safe to call on every load (no-ops if data exists).
 */
export async function initDefaults() {
  const data = await getAll();
  if (data.categories.length === 0) {
    data.categories = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      createdAt: now(),
    }));
    await saveAll(data);
  }
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function getTools() {
  const data = await getAll();
  return data.tools;
}

/**
 * Upserts a tool.
 * Pass a full tool object (with id) to update, or omit id to create.
 * Returns the updated tools array.
 */
export async function saveTool(toolData) {
  const data = await getAll();
  const idx = data.tools.findIndex(t => t.id === toolData.id);

  if (idx >= 0) {
    data.tools[idx] = { ...data.tools[idx], ...toolData, updatedAt: now() };
  } else {
    data.tools.push({
      ...toolData,
      id: generateId(),
      type: 'tool',
      tags: toolData.tags ?? [],
      createdAt: now(),
      updatedAt: now(),
    });
  }

  await saveAll(data);
  return data.tools;
}

/** Removes a tool by id. No-ops silently if id not found. */
export async function deleteTool(id) {
  const data = await getAll();
  data.tools = data.tools.filter(t => t.id !== id);
  await saveAll(data);
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export async function getPrompts() {
  const data = await getAll();
  return data.prompts;
}

/**
 * Upserts a prompt.
 * Returns the updated prompts array.
 */
export async function savePrompt(promptData) {
  const data = await getAll();
  const idx = data.prompts.findIndex(p => p.id === promptData.id);

  if (idx >= 0) {
    data.prompts[idx] = { ...data.prompts[idx], ...promptData, updatedAt: now() };
  } else {
    data.prompts.push({
      ...promptData,
      id: generateId(),
      type: 'prompt',
      tags: promptData.tags ?? [],
      createdAt: now(),
      updatedAt: now(),
    });
  }

  await saveAll(data);
  return data.prompts;
}

/** Removes a prompt by id. */
export async function deletePrompt(id) {
  const data = await getAll();
  data.prompts = data.prompts.filter(p => p.id !== id);
  await saveAll(data);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const data = await getAll();
  return data.categories;
}

/**
 * Upserts a category.
 * Returns the updated categories array.
 */
export async function saveCategory(categoryData) {
  const data = await getAll();
  const idx = data.categories.findIndex(c => c.id === categoryData.id);

  if (idx >= 0) {
    data.categories[idx] = { ...data.categories[idx], ...categoryData };
  } else {
    data.categories.push({
      ...categoryData,
      id: generateId(),
      createdAt: now(),
    });
  }

  await saveAll(data);
  return data.categories;
}

/**
 * Deletes a category and removes its id from every tool/prompt tag list.
 * This keeps data consistent without orphaned tag references.
 */
export async function deleteCategory(id) {
  const data = await getAll();
  data.categories = data.categories.filter(c => c.id !== id);
  data.tools   = data.tools.map(t => ({ ...t, tags: t.tags.filter(tag => tag !== id) }));
  data.prompts = data.prompts.map(p => ({ ...p, tags: p.tags.filter(tag => tag !== id) }));
  await saveAll(data);
}
