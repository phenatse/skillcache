/**
 * search.ts
 * Pure search and filter utilities — no DOM, no storage.
 */

import type { Tool, Prompt, Category } from '@t/index'

function norm(str: string | undefined | null): string {
  return (str ?? '').toLowerCase().trim()
}

function anyIncludes(arr: string[] | undefined, query: string): boolean {
  return (arr ?? []).some(v => norm(v).includes(query))
}

function toolMatches(tool: Tool, query: string): boolean {
  const q = norm(query)
  return (
    norm(tool.name).includes(q)        ||
    norm(tool.url).includes(q)         ||
    norm(tool.description).includes(q) ||
    norm(tool.notes).includes(q)       ||
    norm(tool.usedAt).includes(q)      ||
    anyIncludes(tool.tags, q)
  )
}

function promptMatches(prompt: Prompt, query: string): boolean {
  const q = norm(query)
  return (
    norm(prompt.title).includes(q) ||
    norm(prompt.text).includes(q)  ||
    norm(prompt.llm).includes(q)   ||
    anyIncludes(prompt.tags, q)
  )
}

export function searchTools(tools: Tool[], query: string): Tool[] {
  if (!query?.trim()) return tools
  return tools.filter(t => toolMatches(t, query))
}

export function searchPrompts(prompts: Prompt[], query: string): Prompt[] {
  if (!query?.trim()) return prompts
  return prompts.filter(p => promptMatches(p, query))
}

export function filterByCategory(
  items: (Tool | Prompt)[],
  categoryId: string,
): (Tool | Prompt)[] {
  if (!categoryId) return items
  return items.filter(item => item.tags.includes(categoryId))
}

export function resolveTagNames(tagIds: string[], categories: Category[]): string[] {
  return tagIds.map(id => categories.find(c => c.id === id)?.name ?? id)
}
