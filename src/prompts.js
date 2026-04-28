/**
 * prompts.js
 * Rendering and form handling for Prompt entries.
 * Mirrors the structure of tools.js — no storage calls here.
 */

import { resolveTagNames } from './search.js';

// Common LLM options for the dropdown. User can type a custom value too.
const LLM_OPTIONS = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Perplexity', 'Other'];

// ─── List rendering ───────────────────────────────────────────────────────────

/**
 * Renders a list of prompt cards into a container element.
 *
 * @param {HTMLElement} container
 * @param {object[]}    prompts
 * @param {object[]}    categories
 */
export function renderPromptList(container, prompts, categories) {
  if (prompts.length === 0) {
    container.innerHTML = '<p class="empty-state">No prompts yet. Add one!</p>';
    return;
  }

  container.innerHTML = prompts.map(p => renderPromptCard(p, categories)).join('');
}

/** Returns the HTML string for a single prompt card. */
function renderPromptCard(prompt, categories) {
  const tagNames = resolveTagNames(prompt.tags, categories);
  const tagsHtml = tagNames.map(name => `<span class="tag">${escapeHtml(name)}</span>`).join('');

  return `
    <article class="card card--prompt" data-id="${prompt.id}">
      <div class="card__header">
        <h3 class="card__title">${escapeHtml(prompt.title)}</h3>
        <div class="card__actions">
          <button class="btn-icon btn-copy" data-text="${escapeHtml(prompt.text)}" aria-label="Copy prompt">&#128203;</button>
          <button class="btn-icon btn-edit" data-id="${prompt.id}" aria-label="Edit">&#9998;</button>
          <button class="btn-icon btn-delete" data-id="${prompt.id}" aria-label="Delete">&#128465;</button>
        </div>
      </div>

      ${prompt.llm ? `<p class="card__meta">For: <em>${escapeHtml(prompt.llm)}</em></p>` : ''}

      <pre class="card__prompt-text">${escapeHtml(prompt.text)}</pre>

      ${tagsHtml ? `<div class="card__tags">${tagsHtml}</div>` : ''}
    </article>
  `;
}

// ─── Form rendering ───────────────────────────────────────────────────────────

/**
 * Renders the add/edit form for a prompt into a container.
 *
 * @param {HTMLElement} container
 * @param {object[]}    categories
 * @param {object|null} prompt      - Existing prompt for edit, or null for new
 */
export function renderPromptForm(container, categories, prompt = null) {
  const isEdit = prompt !== null;
  const v = field => escapeHtml(prompt?.[field] ?? '');

  // Build <option> elements for the LLM dropdown
  const llmOptions = LLM_OPTIONS.map(llm => {
    const selected = prompt?.llm === llm ? 'selected' : '';
    return `<option value="${llm}" ${selected}>${llm}</option>`;
  }).join('');

  const categoryCheckboxes = categories.map(cat => {
    const checked = prompt?.tags?.includes(cat.id) ? 'checked' : '';
    return `
      <label class="checkbox-label">
        <input type="checkbox" name="tags" value="${cat.id}" ${checked}>
        ${escapeHtml(cat.name)}
      </label>
    `;
  }).join('');

  container.innerHTML = `
    <form id="prompt-form" class="entry-form" novalidate>
      <input type="hidden" name="id" value="${v('id')}">

      <label class="form-label" for="prompt-title">Title <span class="required">*</span></label>
      <input class="form-input" id="prompt-title" name="title" type="text"
             value="${v('title')}" required placeholder="e.g. Summarise meeting notes">

      <label class="form-label" for="prompt-llm">LLM</label>
      <select class="form-input form-select" id="prompt-llm" name="llm">
        <option value="">— select —</option>
        ${llmOptions}
      </select>

      <label class="form-label" for="prompt-text">Prompt text <span class="required">*</span></label>
      <textarea class="form-input form-textarea form-textarea--large" id="prompt-text"
                name="text" required placeholder="Write your prompt here...">${v('text')}</textarea>

      <fieldset class="form-fieldset">
        <legend class="form-label">Categories</legend>
        <div class="checkbox-group">
          ${categoryCheckboxes}
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          ${isEdit ? 'Update Prompt' : 'Add Prompt'}
        </button>
        <button type="button" class="btn btn-secondary" id="form-cancel">Cancel</button>
      </div>

      <p class="form-error hidden" id="prompt-form-error"></p>
    </form>
  `;
}

// ─── Form data extraction ─────────────────────────────────────────────────────

/**
 * Reads form values from the prompt form and returns a plain object.
 *
 * @param {HTMLFormElement} form
 * @returns {{ valid: boolean, data: object, error: string }}
 */
export function extractPromptFormData(form) {
  const data = {
    id:    form.elements['id'].value || undefined,
    title: form.elements['title'].value.trim(),
    llm:   form.elements['llm'].value,
    text:  form.elements['text'].value.trim(),
    tags:  [...form.querySelectorAll('input[name="tags"]:checked')].map(cb => cb.value),
  };

  if (!data.title) return { valid: false, data, error: 'Title is required.' };
  if (!data.text)  return { valid: false, data, error: 'Prompt text is required.' };

  return { valid: true, data, error: '' };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
