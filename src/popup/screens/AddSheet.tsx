import { useState, useEffect } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import type { Tool, Prompt, Note, Category } from '@t/index'
import { T, getLlmHue } from '../tokens'
import { Icon, IconPaths } from '../icons'
import { TagPill } from '../components/TagPill'
import { IconBtn } from '../components/IconBtn'

const LLM_OPTIONS = ['Claude', 'ChatGPT', 'Gemini', 'Copilot', 'Perplexity', 'Other']

type ItemType = 'tool' | 'prompt' | 'note'

interface AddSheetProps {
  open: boolean
  type: ItemType
  onTypeChange: (t: ItemType) => void
  editItem: Tool | Prompt | Note | null
  categories: Category[]
  onSave: (data: Partial<Tool> | Partial<Prompt> | Partial<Note>) => Promise<void>
  onClose: () => void
}

export function AddSheet({ open, type, onTypeChange, editItem, categories, onSave, onClose }: AddSheetProps) {
  const isEdit = editItem !== null

  // ── Tool form state ───────────────────────────────────────────
  const [toolName,   setToolName]   = useState('')
  const [toolUrl,    setToolUrl]    = useState('')
  const [toolDesc,   setToolDesc]   = useState('')
  const [toolUsedAt, setToolUsedAt] = useState('')
  const [toolNotes,  setToolNotes]  = useState('')

  // ── Prompt form state ─────────────────────────────────────────
  const [promptTitle, setPromptTitle] = useState('')
  const [promptLlm,   setPromptLlm]   = useState('')
  const [promptText,  setPromptText]  = useState('')

  // ── Note form state ───────────────────────────────────────────
  const [noteTitle,   setNoteTitle]   = useState('')
  const [noteBody,    setNoteBody]    = useState('')
  const [noteCompany, setNoteCompany] = useState('')

  // ── Shared ────────────────────────────────────────────────────
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  useEffect(() => {
    if (!editItem) { resetForm(); return }
    if (editItem.type === 'tool') {
      const t = editItem as Tool
      setToolName(t.name); setToolUrl(t.url); setToolDesc(t.description)
      setToolUsedAt(t.usedAt); setToolNotes(t.notes)
    } else if (editItem.type === 'prompt') {
      const p = editItem as Prompt
      setPromptTitle(p.title); setPromptLlm(p.llm); setPromptText(p.text)
    } else {
      const n = editItem as Note
      setNoteTitle(n.title); setNoteBody(n.body); setNoteCompany(n.company)
    }
    setSelectedTags(editItem.tags ?? [])
    setError('')
  }, [editItem, open])

  function resetForm() {
    setToolName(''); setToolUrl(''); setToolDesc(''); setToolUsedAt(''); setToolNotes('')
    setPromptTitle(''); setPromptLlm(''); setPromptText('')
    setNoteTitle(''); setNoteBody(''); setNoteCompany('')
    setSelectedTags([]); setError('')
  }

  function toggleTag(id: string) {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (type === 'tool') {
      if (!toolName.trim()) { setError('Name is required.'); return }
      setSaving(true)
      await onSave({
        ...(isEdit ? { id: editItem!.id } : {}),
        name: toolName.trim(), url: toolUrl.trim(),
        description: toolDesc.trim(), usedAt: toolUsedAt.trim(),
        notes: toolNotes.trim(), tags: selectedTags,
      } as Partial<Tool>)
    } else if (type === 'prompt') {
      if (!promptTitle.trim()) { setError('Title is required.'); return }
      if (!promptText.trim())  { setError('Prompt text is required.'); return }
      setSaving(true)
      await onSave({
        ...(isEdit ? { id: editItem!.id } : {}),
        title: promptTitle.trim(), llm: promptLlm,
        text: promptText.trim(), tags: selectedTags,
      } as Partial<Prompt>)
    } else {
      if (!noteTitle.trim()) { setError('Title is required.'); return }
      if (!noteBody.trim())  { setError('Content is required.'); return }
      setSaving(true)
      await onSave({
        ...(isEdit ? { id: editItem!.id } : {}),
        title: noteTitle.trim(), body: noteBody.trim(),
        company: noteCompany.trim(), tags: selectedTags,
      } as Partial<Note>)
    }

    setSaving(false)
    onClose()
  }

  const TYPE_TABS: { id: ItemType; label: string; icon: keyof typeof IconPaths }[] = [
    { id: 'tool',   label: 'Tool',   icon: 'tools'  },
    { id: 'prompt', label: 'Prompt', icon: 'prompt' },
    { id: 'note',   label: 'Note',   icon: 'note'   },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: '52px 0 0 0',
          background: 'rgba(50,60,110,0.18)',
          backdropFilter: 'blur(2px)',
          zIndex: 9,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 220ms ease-out',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 76,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,248,255,0.94) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -10px 40px rgba(50,60,110,0.18), inset 0 1px 0 rgba(255,255,255,0.95)',
        zIndex: 10,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 220ms ease-out',
      }}>
        {/* Drag handle */}
        <div style={{ padding: '8px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div
            onClick={onClose}
            style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(50,60,110,0.2)', cursor: 'pointer' }}
          />
        </div>

        {/* Sheet header */}
        <div style={{ padding: '4px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: -0.2, fontFamily: T.font }}>
              {isEdit ? 'Edit Entry' : 'Add to Cache'}
            </div>
            <div style={{ fontSize: 10, color: T.ink3, marginTop: 2, fontFamily: T.font }}>
              Save a tool, prompt, or note
            </div>
          </div>
          <IconBtn onClick={onClose} title="Close">
            <Icon d={IconPaths.close} size={12} />
          </IconBtn>
        </div>

        {/* Type toggle */}
        {!isEdit && (
          <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              background: 'rgba(50,60,110,0.05)',
              border: `1px solid ${T.line}`, borderRadius: 8, padding: 3,
            }}>
              {TYPE_TABS.map(t => {
                const on = type === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => onTypeChange(t.id)}
                    style={{
                      padding: '7px 0', textAlign: 'center',
                      fontSize: 11, fontWeight: on ? 500 : 400,
                      borderRadius: 6, border: on ? '1px solid rgba(91,108,255,0.2)' : 'none',
                      background: on ? '#fff' : 'transparent',
                      color: on ? T.indigoDeep : T.ink2,
                      boxShadow: on ? '0 2px 6px rgba(50,60,110,0.08)' : 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      fontFamily: T.font,
                    }}
                  >
                    <Icon d={IconPaths[t.icon]} size={11} stroke={on ? T.indigoDeep : T.ink2} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {type === 'tool' && (
            <>
              <Field label="Name" required>
                <input value={toolName} onChange={e => setToolName(e.target.value)}
                  placeholder="e.g. Figma" style={inputStyle} />
              </Field>
              <Field label="URL">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input value={toolUrl} onChange={e => setToolUrl(e.target.value)}
                    placeholder="https://…" style={{ ...inputStyle, paddingRight: 30 }} />
                  <span style={{ position: 'absolute', right: 10, color: T.ink3 }}>
                    <Icon d={IconPaths.link} size={11} />
                  </span>
                </div>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Category">
                  <select
                    value={selectedTags[0] ?? ''}
                    onChange={e => {
                      const v = e.target.value
                      setSelectedTags(v ? [v, ...selectedTags.slice(1).filter(t => t !== v)] : selectedTags.slice(1))
                    }}
                    style={{ ...inputStyle, appearance: 'auto' }}
                  >
                    <option value="">— none —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Project / Used at">
                  <input value={toolUsedAt} onChange={e => setToolUsedAt(e.target.value)}
                    placeholder="e.g. Acme Corp" style={inputStyle} />
                </Field>
              </div>
              <Field label="Description" hint={`${toolDesc.length} / 140`}>
                <textarea value={toolDesc} onChange={e => setToolDesc(e.target.value.slice(0, 140))}
                  placeholder="What does this tool do?" rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </Field>
              <Field label="Notes">
                <textarea value={toolNotes} onChange={e => setToolNotes(e.target.value)}
                  placeholder="Tips, shortcuts, quirks…" rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </Field>
            </>
          )}

          {type === 'prompt' && (
            <>
              <Field label="Title" required>
                <input value={promptTitle} onChange={e => setPromptTitle(e.target.value)}
                  placeholder="e.g. Summarise meeting notes" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="LLM">
                  <select value={promptLlm} onChange={e => setPromptLlm(e.target.value)}
                    style={{ ...inputStyle, appearance: 'auto' }}>
                    <option value="">— select —</option>
                    {LLM_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Category">
                  <select
                    value={selectedTags[0] ?? ''}
                    onChange={e => {
                      const v = e.target.value
                      setSelectedTags(v ? [v] : [])
                    }}
                    style={{ ...inputStyle, appearance: 'auto' }}
                  >
                    <option value="">— none —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Prompt text" required>
                <textarea value={promptText} onChange={e => setPromptText(e.target.value)}
                  placeholder="Write your prompt here…" rows={5}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80, fontFamily: T.mono, fontSize: 11 }} />
              </Field>
            </>
          )}

          {type === 'note' && (
            <>
              <Field label="Title" required>
                <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. Brand voice guidelines" style={inputStyle} />
              </Field>
              <Field label="Content" required>
                <textarea value={noteBody} onChange={e => setNoteBody(e.target.value)}
                  placeholder="Strategies, directions, context…" rows={6}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Company / Reference">
                  <input value={noteCompany} onChange={e => setNoteCompany(e.target.value)}
                    placeholder="e.g. Acme Corp" style={inputStyle} />
                </Field>
                <Field label="Category">
                  <select
                    value={selectedTags[0] ?? ''}
                    onChange={e => {
                      const v = e.target.value
                      setSelectedTags(v ? [v] : [])
                    }}
                    style={{ ...inputStyle, appearance: 'auto' }}
                  >
                    <option value="">— none —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          {/* Additional tag chips */}
          {categories.length > 0 && type !== 'note' && (
            <div>
              <span style={{ fontSize: 10, fontFamily: T.mono, color: T.ink3, letterSpacing: 0.4, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Tags
              </span>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {categories.map(c => {
                  const on = selectedTags.includes(c.id)
                  return (
                    <button key={c.id} type="button" onClick={() => toggleTag(c.id)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                      <TagPill dim={!on} mono>{c.name}</TagPill>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 11, color: 'oklch(0.6 0.18 10)', fontFamily: T.font }}>{error}</p>
          )}

          <div style={{
            display: 'flex', gap: 8, padding: '10px 0 12px',
            borderTop: `1px solid ${T.line}`, marginTop: 'auto',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flexShrink: 0, padding: '10px 14px', borderRadius: 9,
                background: 'rgba(255,255,255,0.7)', border: `1px solid ${T.line}`,
                fontSize: 11.5, color: T.ink2, cursor: 'pointer', fontFamily: T.font,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, padding: '10px 14px', textAlign: 'center', borderRadius: 9,
                background: `linear-gradient(180deg, ${T.indigo} 0%, ${T.indigoDeep} 100%)`,
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: 11.5, fontWeight: 600, color: '#fff', cursor: 'pointer',
                boxShadow: `0 4px 14px ${T.indigoDeep}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                fontFamily: T.font, opacity: saving ? 0.7 : 1,
              }}
            >
              <Icon d={IconPaths.check} size={12} stroke="#fff" sw={2} />
              {isEdit ? 'Update' : 'Save to Cache'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function Field({ label, children, required, hint }: {
  label: string; children: ReactNode; required?: boolean; hint?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: 10, fontFamily: T.mono, color: T.ink3, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {label}{required && <span style={{ color: 'oklch(0.6 0.18 10)', marginLeft: 2 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 9.5, color: T.ink3, fontFamily: T.mono }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.7)',
  border: `1px solid ${T.line}`,
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 11.5,
  fontFamily: T.font,
  color: T.ink,
  outline: 'none',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
}
