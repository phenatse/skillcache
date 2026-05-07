import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Note, Category } from '@t/index'
import { T, getCatHue } from '../tokens'
import { Icon, IconPaths } from '../icons'
import { GlassCard } from '../components/GlassCard'
import { TagPill } from '../components/TagPill'

interface NotesScreenProps {
  notes: Note[]
  categories: Category[]
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onToggleFavorite: (note: Note) => void
}

export function NotesScreen({ notes, categories, onEdit, onDelete, onToggleFavorite }: NotesScreenProps) {
  if (notes.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: T.ink3, padding: '40px 0', fontSize: 12, fontFamily: T.font }}>
        No notes yet — add strategies, briefs, or directions with the + button.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          categories={categories}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note.id)}
          onToggleFavorite={() => onToggleFavorite(note)}
        />
      ))}
    </div>
  )
}

interface NoteCardProps {
  note: Note
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}

function NoteCard({ note, categories, onEdit, onDelete, onToggleFavorite }: NoteCardProps) {
  const [hovered, setHovered] = useState(false)

  const primaryCat = categories.find(c => c.id === note.tags[0])
  const hue = getCatHue(primaryCat?.name ?? '')

  return (
    <GlassCard>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Note icon tile */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg, oklch(0.94 0.04 ${hue}) 0%, oklch(0.86 0.09 ${hue}) 100%)`,
          border: `1px solid oklch(0.75 0.13 ${hue} / 0.35)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: `oklch(0.4 0.18 ${hue})`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        }}>
          <Icon d={IconPaths.note} size={14} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, letterSpacing: -0.1, fontFamily: T.font }}>
              {note.title}
            </span>
            {note.favorite && (
              <span style={{ color: 'oklch(0.85 0.13 80)', display: 'flex' }}>
                <Icon d={IconPaths.star} size={9} fill="currentColor" />
              </span>
            )}
          </div>
          <div style={{
            fontSize: 10.5, color: T.ink2, lineHeight: 1.4, fontFamily: T.font,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginBottom: 7,
          }}>
            {note.body || 'No content'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            {primaryCat && <TagPill hue={hue} mono>{primaryCat.name}</TagPill>}
            {note.company && (
              <span style={{ fontSize: 9.5, color: T.ink3, fontFamily: T.mono }}>
                @ {note.company}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, marginTop: 2 }}>
          {hovered && (
            <>
              <button title="Edit" onClick={onEdit} style={actionBtnStyle}>
                <Icon d={IconPaths.pencil} size={11} />
              </button>
              <button
                title={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={onToggleFavorite}
                style={{ ...actionBtnStyle, color: note.favorite ? 'oklch(0.7 0.13 80)' : T.ink3 }}
              >
                <Icon d={IconPaths.star} size={11} fill={note.favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                title="Delete"
                onClick={() => { if (window.confirm(`Delete "${note.title}"?`)) onDelete() }}
                style={{ ...actionBtnStyle, color: 'oklch(0.6 0.18 10)' }}
              >
                <Icon d={IconPaths.trash} size={11} />
              </button>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

const actionBtnStyle: CSSProperties = {
  width: 26, height: 26, borderRadius: 7,
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(50,60,110,0.09)',
  color: 'rgba(80,88,120,0.48)',
  cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
