/**
 * tools.js
 * Rendering and form handling for Tool entries.
 * Functions return HTML strings or wire up DOM events — no storage calls here.
 * Storage is handled by popup.js which calls these after await-ing storage ops.
 */

import { resolveTagNames } from './search.js';

// ─── List rendering ───────────────────────────────────────────────────────────

/**
 * Renders a list of tool cards into a container element.
 *
 * @param {HTMLElement} container
 * @param {object[]}    tools
 * @param {object[]}    categories
 */
export function renderToolList(container, tools, categories) {
  if (tools.length === 0) {
    container.innerHTML = '<p class="empty-state">No tools yet. Add one!</p>';
    return;
  }

  container.innerHTML = tools.map(tool => renderToolCard(tool, categories)).join('');
}

/** Returns the HTML string for a single tool card. */
function renderToolCard(tool, categories) {
  const tagNames = resolveTagNames(tool.tags, categories);
  const tagsHtml = tagNames.map(name => `<span class="tag">${escapeHtml(name)}</span>`).join('');

  return `
    <article class="card card--tool" data-id="${tool.id}">
      <div class="card__header">
        <h3 class="card__title">
          <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(tool.name)}
          </a>
        </h3>
        <div class="card__actions">
          <button class="btn-icon btn-edit" data-id="${tool.id}" aria-label="Edit">&#9998;</button>
          <button class="btn-icon btn-delete" data-id="${tool.id}" aria-label="Delete">&#128465;</button>
        </div>
      </div>

      ${tool.description ? `<p class="card__description">${escapeHtml(tool.description)}</p>` : ''}
      ${tool.usedAt     ? `<p class="card__meta">Used at: <em>${escapeHtml(tool.usedAt)}</em></p>` : ''}
      ${tool.notes      ? `<p class="card__notes">${escapeHtml(tool.notes)}</p>` : ''}

      ${tagsHtml ? `<div class="card__tags">${tagsHtml}</div>` : ''}
    </article>
  `;
}

// ─── Form rendering ───────────────────────────────────────────────────────────

/**
 * Renders the add/edit form for a tool into a container.
 * Pass an existing tool object to pre-populate (edit mode), or null for add mode.
 *
 * @param {HTMLElement} container
 * @param {object[]}    categories
 * @param {object|null} tool        - Existing tool for edit, or null for new
 */
export function renderToolForm(container, categories, tool = null) {
  const isEdit = tool !== null;
  const v = field => escapeHtml(tool?.[field] ?? '');

  const categoryCheckboxes = categories.map(cat => {
    const checked = tool?.tags?.includes(cat.id) ? 'checked' : '';
    return `
      <label class="checkbox-label">
        <input type="checkbox" name="tags" value="${cat.id}" ${checked}>
        ${escapeHtml(cat.name)}
      </label>
    `;
  }).join('');

  container.innerHTML = `
    <form id="tool-form" class="entry-form" novalidate>
      <input type="hidden" name="id" value="${v('id')}">

      <label class="form-label" for="tool-name">Name <span class="required">*</span></label>
      <input class="form-input" id="tool-name" name="name" type="text"
             value="${v('name')}" required placeholder="e.g. Figma">

      <label class="form-label" for="tool-url">URL</label>
      <input class="form-input" id="tool-url" name="url" type="url"
             value="${v('url')}" placeholder="https://...">

      <label class="form-label" for="tool-description">Description</label>
      <textarea class="form-input form-textarea" id="tool-description"
                name="description" placeholder="What does this tool do?">${v('description')}</textarea>

      <label class="form-label" for="tool-usedAt">Used at (job / project)</label>
      <input class="form-input" id="tool-usedAt" name="usedAt" type="text"
             value="${v('usedAt')}" placeholder="e.g. Acme Corp, Side Project">

      <label class="form-label" for="tool-notes">Personal notes</label>
      <textarea class="form-input form-textarea" id="tool-notes"
                name="notes" placeholder="Tips, shortcuts, quirks...">${v('notes')}</textarea>

      <fieldset class="form-fieldset">
        <legend class="form-label">Categories</legend>
        <div class="checkbox-group">
          ${categoryCheckboxes}
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          ${isEdit ? 'Update Tool' : 'Add Tool'}
        </button>
        <button type="button" class="btn btn-secondary" id="form-cancel">Cancel</button>
      </div>

      <p class="form-error hidden" id="tool-form-error"></p>
    </form>
  `;
}

// ─── Form data extraction ─────────────────────────────────────────────────────

/**
 * Reads form values from the tool form and returns a plain object.
 * Does NOT call storage — caller is responsible for saving.
 *
 * @param {HTMLFormElement} form
 * @returns {{ valid: boolean, data: object, error: string }}
 */
export function extractToolFormData(form) {
  const data = {
    id:          form.elements['id'].value || undefined,
    name:        form.elements['name'].value.trim(),
    url:         form.elements['url'].value.trim(),
    description: form.elements['description'].value.trim(),
    usedAt:      form.elements['usedAt'].value.trim(),
    notes:       form.elements['notes'].value.trim(),
    tags:        [...form.querySelectorAll('input[name="tags"]:checked')].map(cb => cb.value),
  };

  if (!data.name) {
    return { valid: false, data, error: 'Name is required.' };
  }

  return { valid: true, data, error: '' };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Escapes HTML special characters to prevent XSS in rendered strings. */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
