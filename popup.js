/**
 * popup.js
 * Main entry point for the Skill Cache popup.
 *
 * Responsibilities:
 *  - Initialise storage and seed defaults on first run
 *  - Manage view switching via the bottom nav
 *  - Wire up the search bar
 *  - Delegate rendering to view modules (tools, prompts, categories)
 *  - Handle form submissions and delete confirmations
 *  - Hook up import / export buttons
 *
 * Architecture note:
 *  View modules return HTML strings or mutate a given container — they never
 *  touch storage. All storage calls live here, keeping data flow unidirectional:
 *  storage → popup.js → view module → DOM.
 */

import {
  initDefaults,
  getAll,
  saveTool, deleteTool,
  savePrompt, deletePrompt,
  saveCategory, deleteCategory,
} from './src/storage.js';

import { searchTools, searchPrompts } from './src/search.js';

import { renderToolList, renderToolForm, extractToolFormData }       from './src/tools.js';
import { renderPromptList, renderPromptForm, extractPromptFormData } from './src/prompts.js';
import {
  renderCategoryList,
  renderInlineCategoryForm,
  extractCategoryFormData,
} from './src/categories.js';

import { exportData, readImportFile, importMerge, importReplace } from './src/importExport.js';

// ─── State ────────────────────────────────────────────────────────────────────

// The current view id — one of: 'tools' | 'prompts' | 'categories' | 'add'
let currentView = 'tools';

// Cached data — refreshed on every view render to stay in sync with storage
let state = { tools: [], prompts: [], categories: [] };

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const searchInput   = document.getElementById('search-input');
const mainContent   = document.getElementById('main-content');
const navButtons    = document.querySelectorAll('.nav-btn');
const importFileInput = document.getElementById('import-file-input');

// ─── Initialisation ───────────────────────────────────────────────────────────

async function init() {
  await initDefaults();
  await refreshState();
  renderView(currentView);
  bindNav();
  bindSearch();
  bindImportExport();
}

/** Pulls fresh data from storage into the local state cache. */
async function refreshState() {
  state = await getAll();
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function bindNav() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });
}

async function switchView(view) {
  currentView = view;

  // Clear search when changing views
  searchInput.value = '';

  navButtons.forEach(btn => {
    btn.classList.toggle('nav-btn--active', btn.dataset.view === view);
  });

  await refreshState();
  renderView(view);
}

// ─── View rendering ───────────────────────────────────────────────────────────

/** Dispatches to the correct render function for the active view. */
function renderView(view, query = '') {
  switch (view) {
    case 'tools':      return renderToolsView(query);
    case 'prompts':    return renderPromptsView(query);
    case 'categories': return renderCategoriesView();
    case 'add':        return renderAddView();
  }
}

function renderToolsView(query = '') {
  const filtered = searchTools(state.tools, query);
  renderToolList(mainContent, filtered, state.categories);
  bindToolCardEvents();
}

function renderPromptsView(query = '') {
  const filtered = searchPrompts(state.prompts, query);
  renderPromptList(mainContent, filtered, state.categories);
  bindPromptCardEvents();
}

function renderCategoriesView() {
  renderCategoryList(mainContent, state.categories, state.tools, state.prompts);
  bindCategoryEvents();
}

/** The "Add New" view — lets the user pick tool or prompt before showing a form. */
function renderAddView() {
  mainContent.innerHTML = `
    <div class="add-picker">
      <h2 class="add-picker__title">What would you like to add?</h2>
      <div class="add-picker__options">
        <button class="btn btn-primary" id="pick-tool">Add Tool</button>
        <button class="btn btn-primary" id="pick-prompt">Add Prompt</button>
      </div>
    </div>
  `;

  document.getElementById('pick-tool').addEventListener('click', () => {
    renderToolForm(mainContent, state.categories, null);
    bindToolFormEvents(null);
  });

  document.getElementById('pick-prompt').addEventListener('click', () => {
    renderPromptForm(mainContent, state.categories, null);
    bindPromptFormEvents(null);
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

function bindSearch() {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    // Only search on views that support it
    if (currentView === 'tools' || currentView === 'prompts') {
      renderView(currentView, q);
    }
  });
}

// ─── Tool events ──────────────────────────────────────────────────────────────

function bindToolCardEvents() {
  mainContent.addEventListener('click', handleToolCardClick);
}

async function handleToolCardClick(e) {
  const editBtn   = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');

  if (editBtn) {
    const tool = state.tools.find(t => t.id === editBtn.dataset.id);
    if (tool) {
      renderToolForm(mainContent, state.categories, tool);
      bindToolFormEvents(tool);
    }
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm('Delete this tool?')) {
      await deleteTool(id);
      await refreshState();
      renderToolsView(searchInput.value);
    }
  }

  // Remove listener to avoid stacking on re-renders
  mainContent.removeEventListener('click', handleToolCardClick);
}

function bindToolFormEvents(existingTool) {
  const form = document.getElementById('tool-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const { valid, data, error } = extractToolFormData(form);

    if (!valid) {
      showFormError('tool-form-error', error);
      return;
    }

    await saveTool(data);
    await refreshState();
    switchView('tools');
  });

  document.getElementById('form-cancel')?.addEventListener('click', () => {
    switchView(existingTool ? 'tools' : 'add');
  });
}

// ─── Prompt events ────────────────────────────────────────────────────────────

function bindPromptCardEvents() {
  mainContent.addEventListener('click', handlePromptCardClick);
}

async function handlePromptCardClick(e) {
  const copyBtn   = e.target.closest('.btn-copy');
  const editBtn   = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');

  if (copyBtn) {
    await navigator.clipboard.writeText(copyBtn.dataset.text ?? '');
    // Brief visual feedback
    copyBtn.textContent = '✓';
    setTimeout(() => { copyBtn.innerHTML = '&#128203;'; }, 1200);
  }

  if (editBtn) {
    const prompt = state.prompts.find(p => p.id === editBtn.dataset.id);
    if (prompt) {
      renderPromptForm(mainContent, state.categories, prompt);
      bindPromptFormEvents(prompt);
    }
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm('Delete this prompt?')) {
      await deletePrompt(id);
      await refreshState();
      renderPromptsView(searchInput.value);
    }
  }

  mainContent.removeEventListener('click', handlePromptCardClick);
}

function bindPromptFormEvents(existingPrompt) {
  const form = document.getElementById('prompt-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const { valid, data, error } = extractPromptFormData(form);

    if (!valid) {
      showFormError('prompt-form-error', error);
      return;
    }

    await savePrompt(data);
    await refreshState();
    switchView('prompts');
  });

  document.getElementById('form-cancel')?.addEventListener('click', () => {
    switchView(existingPrompt ? 'prompts' : 'add');
  });
}

// ─── Category events ──────────────────────────────────────────────────────────

function bindCategoryEvents() {
  // Add form submission
  const addForm = document.getElementById('category-form');
  addForm?.addEventListener('submit', handleCategoryFormSubmit);

  // Edit / delete buttons on existing category items
  mainContent.addEventListener('click', handleCategoryListClick);
}

async function handleCategoryListClick(e) {
  const editBtn   = e.target.closest('.btn-edit-cat');
  const deleteBtn = e.target.closest('.btn-delete-cat');

  if (editBtn) {
    const cat = state.categories.find(c => c.id === editBtn.dataset.id);
    if (cat) {
      // Replace the add form area at the bottom with an edit form
      const formContainer = document.getElementById('category-form')?.parentElement;
      if (formContainer) {
        formContainer.innerHTML = renderInlineCategoryForm(cat);
        document.getElementById('category-form').addEventListener('submit', handleCategoryFormSubmit);
        document.getElementById('category-form-cancel')?.addEventListener('click', renderCategoriesView);
      }
    }
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const cat = state.categories.find(c => c.id === id);
    if (confirm(`Delete category "${cat?.name ?? ''}"? It will be removed from all entries.`)) {
      await deleteCategory(id);
      await refreshState();
      renderCategoriesView();
    }
  }
}

async function handleCategoryFormSubmit(e) {
  e.preventDefault();
  const { valid, data, error } = extractCategoryFormData(e.target);

  if (!valid) {
    showFormError('category-form-error', error);
    return;
  }

  await saveCategory(data);
  await refreshState();
  renderCategoriesView();
}

// ─── Import / export ──────────────────────────────────────────────────────────

function bindImportExport() {
  document.getElementById('btn-export')?.addEventListener('click', async () => {
    await exportData();
  });

  document.getElementById('btn-import')?.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput?.addEventListener('change', async () => {
    const file = importFileInput.files[0];
    if (!file) return;

    try {
      const parsed = await readImportFile(file);

      const choice = confirm(
        'How would you like to import?\n\nOK = Merge (keep existing + add new)\nCancel = Replace (overwrite everything)'
      );

      if (choice) {
        await importMerge(parsed);
      } else {
        if (confirm('This will delete all your current data. Are you sure?')) {
          await importReplace(parsed);
        } else {
          return;
        }
      }

      await refreshState();
      renderView(currentView);
      alert('Import successful!');
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }

    // Reset so the same file can be re-selected
    importFileInput.value = '';
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function showFormError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
