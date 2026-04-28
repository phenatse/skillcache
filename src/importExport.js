/**
 * importExport.js
 * JSON import / export for full data portability.
 *
 * Export: serialises the full data object and triggers a file download.
 * Import: parses a user-selected JSON file, validates its shape,
 *         then either merges with or replaces existing data.
 */

import { getAll, saveAll, generateId } from './storage.js';

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Exports the full data set as a timestamped JSON file download.
 * Opens the browser's native "Save file" dialog via a hidden <a> element.
 */
export async function exportData() {
  const data = await getAll();

  const payload = {
    _version: 1,
    _exportedAt: new Date().toISOString(),
    ...data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a       = document.createElement('a');
  a.href        = url;
  a.download    = `skill-cache-${formatDateForFilename(new Date())}.json`;
  a.click();

  // Clean up the object URL after the download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Import ───────────────────────────────────────────────────────────────────

/**
 * Reads and validates an import file chosen by the user.
 * Resolves with the parsed object on success, rejects with a descriptive Error on failure.
 * Call importMerge or importReplace with the result.
 *
 * @param {File} file - A File object from an <input type="file"> element
 * @returns {Promise<object>}
 */
export function readImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        const error  = validateImport(parsed);
        if (error) {
          reject(new Error(error));
        } else {
          resolve(parsed);
        }
      } catch {
        reject(new Error('File is not valid JSON.'));
      }
    };

    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

/**
 * Merges imported data into existing storage.
 * - New items (by id) are appended.
 * - Existing items (same id) are overwritten by the imported version.
 * - Categories are deduplicated by name (case-insensitive) to avoid duplicates.
 *
 * @param {object} imported - Validated parsed import object
 */
export async function importMerge(imported) {
  const current = await getAll();

  current.tools      = mergeById(current.tools,      imported.tools      ?? []);
  current.prompts    = mergeById(current.prompts,    imported.prompts    ?? []);
  current.categories = mergeCategoriesByName(current.categories, imported.categories ?? []);

  await saveAll(current);
}

/**
 * Replaces all existing data with the imported data.
 * Destructive — existing entries are lost.
 *
 * @param {object} imported - Validated parsed import object
 */
export async function importReplace(imported) {
  await saveAll({
    tools:      imported.tools      ?? [],
    prompts:    imported.prompts    ?? [],
    categories: imported.categories ?? [],
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates the basic shape of a parsed import object.
 * Returns an error string on failure, or null on success.
 */
function validateImport(data) {
  if (typeof data !== 'object' || data === null) return 'Import must be a JSON object.';

  const arrays = ['tools', 'prompts', 'categories'];
  for (const key of arrays) {
    if (data[key] !== undefined && !Array.isArray(data[key])) {
      return `"${key}" must be an array.`;
    }
  }

  // Spot-check a few required fields on the first tool/prompt if present
  const firstTool = (data.tools ?? [])[0];
  if (firstTool && !firstTool.name) return 'Tool entries must have a "name" field.';

  const firstPrompt = (data.prompts ?? [])[0];
  if (firstPrompt && !firstPrompt.title) return 'Prompt entries must have a "title" field.';

  return null;
}

// ─── Merge helpers ────────────────────────────────────────────────────────────

/** Upserts imported items into existing array by id. */
function mergeById(existing, incoming) {
  const map = new Map(existing.map(item => [item.id, item]));

  for (const item of incoming) {
    // Ensure the imported item has an id
    const id = item.id ?? generateId();
    map.set(id, { ...item, id });
  }

  return Array.from(map.values());
}

/**
 * Merges categories, deduplicating by name (case-insensitive).
 * The existing category wins on a name collision.
 */
function mergeCategoriesByName(existing, incoming) {
  const nameMap = new Map(existing.map(c => [c.name.toLowerCase(), c]));

  for (const cat of incoming) {
    const key = (cat.name ?? '').toLowerCase();
    if (!nameMap.has(key)) {
      nameMap.set(key, { ...cat, id: cat.id ?? generateId() });
    }
  }

  return Array.from(nameMap.values());
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDateForFilename(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}
