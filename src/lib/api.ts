/**
 * api.ts
 * Data access layer — backed by chrome.storage.local, no HTTP requests.
 * Exposes a clean CRUD interface that keeps screens decoupled from storage details.
 * To swap to a REST API later, replace the implementations here without touching any screen.
 */

import type { Tool, Prompt, Category, Note } from '@t/index'
import {
  getAll, initDefaults, getUIState, saveUIState, getStorageUsage,
  saveTool as _saveTool, deleteTool as _deleteTool,
  savePrompt as _savePrompt, deletePrompt as _deletePrompt, incrementPromptUses as _incUses,
  saveNote as _saveNote, deleteNote as _deleteNote,
  saveCategory as _saveCategory, deleteCategory as _deleteCategory,
} from './storage'

export const tools = {
  /** GET /api/tools */
  list: (): Promise<Tool[]>   => getAll().then(d => d.tools),
  /** POST /api/tools (creates or updates depending on whether id is present) */
  save: (data: Partial<Tool> & { name: string }) => _saveTool(data),
  /** DELETE /api/tools/:id */
  remove: (id: string) => _deleteTool(id),
}

export const prompts = {
  /** GET /api/prompts */
  list: (): Promise<Prompt[]> => getAll().then(d => d.prompts),
  /** POST /api/prompts */
  save: (data: Partial<Prompt> & { title: string; text: string }) => _savePrompt(data),
  /** DELETE /api/prompts/:id */
  remove: (id: string) => _deletePrompt(id),
  /** Increment the usage counter when a prompt is copied */
  incrementUses: (id: string) => _incUses(id),
}

export const notes = {
  list: (): Promise<Note[]> => getAll().then(d => d.notes),
  save: (data: Partial<Note> & { title: string; body: string }) => _saveNote(data),
  remove: (id: string) => _deleteNote(id),
}

export const categories = {
  /** GET /api/categories */
  list: (): Promise<Category[]> => getAll().then(d => d.categories),
  /** POST /api/categories */
  save: (data: Partial<Category> & { name: string }) => _saveCategory(data),
  /** DELETE /api/categories/:id — cascades to all tool/prompt tags */
  remove: (id: string) => _deleteCategory(id),
}

export { getAll, initDefaults, getUIState, saveUIState, getStorageUsage }
