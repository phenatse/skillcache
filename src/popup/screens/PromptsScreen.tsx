import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Prompt, Category } from '@t/index'
import { T, getCatHue, getLlmHue } from '../tokens'
import { Icon, IconPaths } from '../icons'
import { GlassCard } from '../components/GlassCard'
import { TagPill } from '../components/TagPill'

interface PromptsScreenProps {
  prompts: Prompt[]
  categories: Category[]
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onCopy: (prompt: Prompt) => void
}

export function PromptsScreen({ prompts, categories, onEdit, onDelete, onCopy }: PromptsScreenProps) {
  if (prompts.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: T.ink3, padding: '40px 0', fontSize: 12, fontFamily: T.font }}>
        No prompts yet — add one with the + button.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {prompts.map(prompt => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          categories={categories}
          onEdit={() => onEdit(prompt)}
          onDelete={() => onDelete(prompt.id)}
          onCopy={() => onCopy(prompt)}
        />
      ))}
    </div>
  )
}

interface PromptCardProps {
  prompt: Prompt
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
  onCopy: () => void
}

function PromptCard({ prompt, categories, onEdit, onDelete, onCopy }: PromptCardProps) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const llmHue = getLlmHue(prompt.llm)
  const primaryCat = categories.find(c => c.id === prompt.tags[0])
  const catHue = getCatHue(primaryCat?.name ?? '')

  function handleCopy() {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <GlassCard>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* LLM icon tile */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg, oklch(0.94 0.04 ${llmHue}) 0%, oklch(0.86 0.09 ${llmHue}) 100%)`,
          border: `1px solid oklch(0.75 0.13 ${llmHue} / 0.35)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: `oklch(0.4 0.18 ${llmHue})`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        }}>
          <Icon d={IconPaths.prompt} size={14} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, letterSpacing: -0.1, marginBottom: 4, fontFamily: T.font }}>
            {prompt.title}
          </div>
          <div style={{
            fontSize: 10, fontFamily: T.mono, color: T.ink3, lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 7,
          }}>
            {prompt.text}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {prompt.llm && <TagPill hue={llmHue} mono>{prompt.llm}</TagPill>}
            {primaryCat && <TagPill hue={catHue} mono>{primaryCat.name}</TagPill>}
            <span style={{
              marginLeft: 'auto', fontSize: 9.5, fontFamily: T.mono, color: T.ink3,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Icon d={IconPaths.flame} size={9} />
              {prompt.uses}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, marginTop: 2 }}>
          {/* Copy button (always visible) */}
          <button
            title="Copy prompt"
            onClick={handleCopy}
            style={{
              width: 26, height: 26, borderRadius: 7,
              background: copied ? 'rgba(31,179,196,0.12)' : 'rgba(91,108,255,0.1)',
              border: `1px solid ${copied ? 'rgba(31,179,196,0.3)' : 'rgba(91,108,255,0.25)'}`,
              color: copied ? T.cyan : T.indigoDeep,
              cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon d={copied ? IconPaths.check : IconPaths.copy} size={12} />
          </button>
          {/* Hover-reveal edit/delete */}
          {hovered && (
            <>
              <button title="Edit" onClick={onEdit} style={actionBtnStyle}>
                <Icon d={IconPaths.pencil} size={11} />
              </button>
              <button
                title="Delete"
                onClick={() => {
                  if (window.confirm(`Delete "${prompt.title}"?`)) onDelete()
                }}
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
