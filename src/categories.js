/**
 * categories.js
 * Rendering and form handling for Category management.
 * Shows usage counts pulled from tools and prompts arrays.
 */

// ─── List rendering ───────────────────────────────────────────────────────────

/**
 * Renders the categories management view into a container.
 *
 * @param {HTMLElement} container
 * @param {object[]}    categories
 * @param {object[]}    tools      - Needed to compute usage counts
 * @param {object[]}    prompts    - Needed to compute usage counts
 */
export function renderCategoryList(container, categories, tools, prompts) {
  const addFormHtml = renderInlineCategoryForm(null);

  if (categories.length === 0) {
    container.innerHTML = `
      <p class="empty-state">No categories yet.</p>
      ${addFormHtml}
    `;
    return;
  }

  const rows = categories.map(cat => {
    const toolCount   = tools.filter(t  => t.tags.includes(cat.id)).length;
    const promptCount = prompts.filter(p => p.tags.includes(cat.id)).length;
    const usageLabel  = [
      toolCount   ? `${toolCount} tool${toolCount !== 1 ? 's' : ''}`     : '',
      promptCount ? `${promptCount} prompt${promptCount !== 1 ? 's' : ''}` : '',
    ].filter(Boolean).join(', ') || 'unused';

    return `
      <li class="category-item" data-id="${cat.id}">
        <span class="category-item__name">${escapeHtml(cat.name)}</span>
        <span class="category-item__usage">${usageLabel}</span>
        <div class="category-item__actions">
          <button class="btn-icon btn-edit-cat" data-id="${cat.id}" aria-label="Edit category">&#9998;</button>
          <button class="btn-icon btn-delete-cat" data-id="${cat.id}"
                  aria-label="Delete category" ${usageLabel !== 'unused' ? '' : ''}>&#128465;</button>
        </div>
      </li>
    `;
  }).join('');

  container.innerHTML = `
    <ul class="category-list">${rows}</ul>
    ${addFormHtml}
  `;
}

// ─── Inline form for add / edit ───────────────────────────────────────────────

/**
 * Returns the HTML for the category add/edit form.
 * Pass an existing category to pre-populate (edit), or null for add.
 *
 * @param {object|null} category
 * @returns {string}
 */
export function renderInlineCategoryForm(category = null) {
  const isEdit = category !== null;
  return `
    <form id="category-form" class="entry-form entry-form--inline" novalidate>
      <input type="hidden" name="id" value="${escapeHtml(category?.id ?? '')}">
      <input class="form-input" name="name" type="text"
             value="${escapeHtml(category?.name ?? '')}"
             placeholder="Category name" required>
      <button type="submit" class="btn btn-primary">
        ${isEdit ? 'Save' : 'Add Category'}
      </button>
      ${isEdit ? '<button type="button" class="btn btn-secondary" id="category-form-cancel">Cancel</button>' : ''}
      <p class="form-error hidden" id="category-form-error"></p>
    </form>
  `;
}

// ─── Form data extraction ─────────────────────────────────────────────────────

/**
 * Reads form values from the category form.
 *
 * @param {HTMLFormElement} form
 * @returns {{ valid: boolean, data: object, error: string }}
 */
export function extractCategoryFormData(form) {
  const data = {
    id:   form.elements['id'].value || undefined,
    name: form.elements['name'].value.trim(),
  };

  if (!data.name) return { valid: false, data, error: 'Category name is required.' };

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
