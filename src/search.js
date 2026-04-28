/**
 * search.js
 * Pure search and filter utilities — no DOM, no storage.
 * All functions accept arrays and return filtered arrays.
 */

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Lowercases and trims a string for comparison. Handles null/undefined. */
function norm(str) {
  return (str ?? '').toLowerCase().trim();
}

/** Returns true if any value in arr includes the query string. */
function anyIncludes(arr, query) {
  return (arr ?? []).some(v => norm(v).includes(query));
}

// ─── Item matchers ────────────────────────────────────────────────────────────

function toolMatches(tool, query) {
  const q = norm(query);
  return (
    norm(tool.name).includes(q) ||
    norm(tool.url).includes(q) ||
    norm(tool.description).includes(q) ||
    norm(tool.notes).includes(q) ||
    norm(tool.usedAt).includes(q) ||
    anyIncludes(tool.tags, q)
  );
}

function promptMatches(prompt, query) {
  const q = norm(query);
  return (
    norm(prompt.title).includes(q) ||
    norm(prompt.text).includes(q) ||
    norm(prompt.llm).includes(q) ||
    anyIncludes(prompt.tags, q)
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Filters tools by a free-text query. Returns all tools if query is empty. */
export function searchTools(tools, query) {
  if (!query?.trim()) return tools;
  return tools.filter(t => toolMatches(t, query));
}

/** Filters prompts by a free-text query. Returns all prompts if query is empty. */
export function searchPrompts(prompts, query) {
  if (!query?.trim()) return prompts;
  return prompts.filter(p => promptMatches(p, query));
}

/**
 * Filters tools or prompts by a category id.
 * Pass null / '' to skip filtering.
 */
export function filterByCategory(items, categoryId) {
  if (!categoryId) return items;
  return items.filter(item => (item.tags ?? []).includes(categoryId));
}

/**
 * Resolves an array of category ids to their display names.
 * Unknown ids are passed through as-is (defensive fallback).
 */
export function resolveTagNames(tagIds, categories) {
  return (tagIds ?? []).map(id => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  });
}
