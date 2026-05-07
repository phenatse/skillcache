import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { Category, Tool, Prompt, Note } from '@t/index'
import { T, getCatHue, getCatIconKey } from '../tokens'
import { Icon, IconPaths, type IconKey } from '../icons'

interface CategoriesScreenProps {
  categories: Category[]
  tools: Tool[]
  prompts: Prompt[]
  notes: Note[]
  onDelete: (id: string) => void
  onSave: (data: { id?: string; name: string }) => void
}

export function CategoriesScreen({ categories, tools, prompts, notes, onDelete, onSave }: CategoriesScreenProps) {
  const [newName,      setNewName]      = useState('')
  const [editId,       setEditId]       = useState<string | null>(null)
  const [editName,     setEditName]     = useState('')
  const [selectedCat,  setSelectedCat]  = useState<Category | null>(null)

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    onSave({ name: newName.trim() })
    setNewName('')
  }

  function handleEdit(e: FormEvent) {
    e.preventDefault()
    if (!editId || !editName.trim()) return
    onSave({ id: editId, name: editName.trim() })
    setEditId(null)
    setEditName('')
  }

  // ── Detail view ───────────────────────────────────────────────
  if (selectedCat) {
    const catTools   = tools.filter(t   => t.tags.includes(selectedCat.id))
    const catPrompts = prompts.filter(p  => p.tags.includes(selectedCat.id))
    const catNotes   = notes.filter(n   => n.tags.includes(selectedCat.id))
    const hue        = getCatHue(selectedCat.name)

    return (
      <div>
        {/* Back button */}
        <button
          onClick={() => setSelectedCat(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 500, color: T.indigoDeep,
            fontFamily: T.font, padding: '0 0 10px 0',
          }}
        >
          <Icon d={IconPaths.chevron} size={12} stroke={T.indigoDeep}
            style={{ transform: 'rotate(180deg)' }} />
          All categories
        </button>

        {/* Category heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `oklch(0.85 0.12 ${hue} / 0.7)`,
            border: `1px solid oklch(0.7 0.15 ${hue} / 0.5)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: `oklch(0.35 0.2 ${hue})`,
          }}>
            <Icon d={IconPaths[getCatIconKey(selectedCat.name) as IconKey] ?? IconPaths.hash} size={13} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: -0.2, fontFamily: T.font }}>
              {selectedCat.name}
            </div>
            <div style={{ fontSize: 9.5, fontFamily: T.mono, color: T.ink3, letterSpacing: 0.3 }}>
              {catTools.length} tools · {catPrompts.length} prompts · {catNotes.length} notes
            </div>
          </div>
        </div>

        {catTools.length === 0 && catPrompts.length === 0 && catNotes.length === 0 && (
          <p style={{ textAlign: 'center', color: T.ink3, padding: '30px 0', fontSize: 12, fontFamily: T.font }}>
            No items tagged with this category yet.
          </p>
        )}

        {catTools.length > 0 && (
          <Section label="Tools">
            {catTools.map(t => (
              <DetailRow key={t.id} icon="tools" primary={t.name} secondary={t.description || t.url} hue={hue} />
            ))}
          </Section>
        )}
        {catPrompts.length > 0 && (
          <Section label="Prompts">
            {catPrompts.map(p => (
              <DetailRow key={p.id} icon="prompt" primary={p.title} secondary={p.text} hue={hue} />
            ))}
          </Section>
        )}
        {catNotes.length > 0 && (
          <Section label="Notes">
            {catNotes.map(n => (
              <DetailRow key={n.id} icon="note" primary={n.title} secondary={n.company ? `@ ${n.company}` : n.body} hue={hue} />
            ))}
          </Section>
        )}
      </div>
    )
  }

  // ── Grid view ─────────────────────────────────────────────────
  const totalItems = tools.length + prompts.length + notes.length

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10,
      }}>
        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.ink3, letterSpacing: 0.5 }}>
          {categories.length} CATEGORIES · {totalItems} ITEMS
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {categories.map(cat => {
          const count = tools.filter(t => t.tags.includes(cat.id)).length
                      + prompts.filter(p => p.tags.includes(cat.id)).length
                      + notes.filter(n => n.tags.includes(cat.id)).length
          const hue     = getCatHue(cat.name)
          const iconKey = getCatIconKey(cat.name) as IconKey

          if (editId === cat.id) {
            return (
              <form
                key={cat.id}
                onSubmit={handleEdit}
                style={{
                  height: 110, borderRadius: 12,
                  border: `1.5px solid ${T.indigo}55`,
                  background: 'rgba(255,255,255,0.7)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'stretch', justifyContent: 'center',
                  padding: '0 10px', gap: 8,
                }}
              >
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{
                    border: `1px solid ${T.line}`, borderRadius: 6,
                    padding: '5px 8px', fontSize: 11, fontFamily: T.font, outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="submit" style={saveBtnStyle}>Save</button>
                  <button type="button" onClick={() => setEditId(null)} style={cancelBtnStyle}>Cancel</button>
                </div>
              </form>
            )
          }

          return (
            <CatTile
              key={cat.id}
              name={cat.name}
              count={count}
              hue={hue}
              iconKey={iconKey}
              hot={count > 0}
              onClick={() => setSelectedCat(cat)}
              onEdit={() => { setEditId(cat.id); setEditName(cat.name) }}
              onDelete={() => {
                if (window.confirm(`Delete "${cat.name}"? This removes the tag from all entries.`)) {
                  onDelete(cat.id)
                }
              }}
            />
          )
        })}

        {/* Add new tile */}
        <form
          onSubmit={handleAdd}
          style={{
            height: 110, borderRadius: 12,
            border: `1.5px dashed ${T.lineStrong}`,
            background: 'rgba(255,255,255,0.4)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'stretch', justifyContent: 'center',
            padding: '0 10px', gap: 8,
          }}
        >
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New category…"
            style={{
              border: `1px solid ${T.line}`, borderRadius: 6,
              padding: '5px 8px', fontSize: 11, fontFamily: T.font,
              outline: 'none', background: 'rgba(255,255,255,0.8)',
            }}
          />
          <button type="submit" style={saveBtnStyle}>+ Add</button>
        </form>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 9.5, fontFamily: T.mono, fontWeight: 600,
        color: T.ink3, letterSpacing: 0.8, textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  )
}

function DetailRow({ icon, primary, secondary, hue }: {
  icon: keyof typeof IconPaths
  primary: string
  secondary: string
  hue: number
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 10px', borderRadius: 8,
      background: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(50,60,110,0.07)',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: `oklch(0.92 0.07 ${hue} / 0.7)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: `oklch(0.4 0.18 ${hue})`,
      }}>
        <Icon d={IconPaths[icon]} size={11} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: T.ink, fontFamily: T.font, marginBottom: 1 }}>
          {primary}
        </div>
        <div style={{
          fontSize: 10, color: T.ink3, fontFamily: T.font,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {secondary}
        </div>
      </div>
    </div>
  )
}

interface CatTileProps {
  name: string; count: number; hue: number; iconKey: IconKey
  hot: boolean; onClick: () => void; onEdit: () => void; onDelete: () => void
}

function CatTile({ name, count, hue, iconKey, hot, onClick, onEdit, onDelete }: CatTileProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', height: 110, padding: 12, borderRadius: 12, cursor: 'pointer',
        background: `linear-gradient(155deg, oklch(0.95 0.05 ${hue}) 0%, rgba(255,255,255,0.5) 70%)`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid oklch(0.75 0.13 ${hue} / 0.3)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 16px -6px oklch(0.6 0.15 ${hue} / 0.25)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        overflow: 'hidden',
        transition: 'transform 120ms',
        transform: hovered ? 'translateY(-1px)' : '',
      }}
    >
      <div style={{
        position: 'absolute', width: 90, height: 90, top: -25, right: -25,
        background: `radial-gradient(circle, oklch(0.78 0.18 ${hue} / 0.5) 0%, transparent 70%)`,
        filter: 'blur(12px)', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: `oklch(0.85 0.12 ${hue} / 0.7)`,
          border: `1px solid oklch(0.7 0.15 ${hue} / 0.5)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: `oklch(0.35 0.2 ${hue})`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
        }}>
          <Icon d={IconPaths[iconKey] ?? IconPaths.hash} size={14} />
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {hot && (
            <div style={{
              width: 6, height: 6, borderRadius: 999,
              background: 'rgb(31,179,196)',
              boxShadow: '0 0 8px rgb(31,179,196)',
            }} />
          )}
          {hovered && (
            <div style={{ display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
              <button onClick={onEdit} style={tileActionStyle} title="Edit">
                <Icon d={IconPaths.pencil} size={10} />
              </button>
              <button onClick={onDelete} style={{ ...tileActionStyle, color: 'oklch(0.6 0.18 10)' }} title="Delete">
                <Icon d={IconPaths.trash} size={10} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, letterSpacing: -0.1, marginBottom: 2, fontFamily: T.font }}>
          {name}
        </div>
        <div style={{ fontSize: 10, fontFamily: T.mono, color: `oklch(0.45 0.18 ${hue})`, letterSpacing: 0.3 }}>
          {count} ITEMS
        </div>
      </div>
    </div>
  )
}

const saveBtnStyle: CSSProperties = {
  padding: '5px 10px', borderRadius: 6, border: 'none',
  background: 'rgba(91,108,255,0.12)', color: T.indigoDeep,
  fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: T.font,
}

const cancelBtnStyle: CSSProperties = {
  padding: '5px 8px', borderRadius: 6,
  border: '1px solid rgba(50,60,110,0.09)', background: 'rgba(255,255,255,0.7)',
  color: T.ink2, fontSize: 11, cursor: 'pointer', fontFamily: T.font,
}

const tileActionStyle: CSSProperties = {
  width: 22, height: 22, borderRadius: 5,
  background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(50,60,110,0.09)',
  color: 'rgba(80,88,120,0.6)', cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
