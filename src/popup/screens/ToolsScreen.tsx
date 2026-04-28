import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Tool, Category } from '@t/index'
import { T, getCatHue, getCatIconKey } from '../tokens'
import { Icon, IconPaths, type IconKey } from '../icons'
import { GlassCard } from '../components/GlassCard'
import { TagPill } from '../components/TagPill'

interface ToolsScreenProps {
  tools: Tool[]
  categories: Category[]
  onEdit: (tool: Tool) => void
  onDelete: (id: string) => void
  onToggleFavorite: (tool: Tool) => void
}

export function ToolsScreen({ tools, categories, onEdit, onDelete, onToggleFavorite }: ToolsScreenProps) {
  if (tools.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: T.ink3, padding: '40px 0', fontSize: 12, fontFamily: T.font }}>
        No tools yet — add one with the + button.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tools.map(tool => (
        <ToolCard
          key={tool.id}
          tool={tool}
          categories={categories}
          onEdit={() => onEdit(tool)}
          onDelete={() => onDelete(tool.id)}
          onToggleFavorite={() => onToggleFavorite(tool)}
        />
      ))}
    </div>
  )
}

interface ToolCardProps {
  tool: Tool
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}

function ToolCard({ tool, categories, onEdit, onDelete, onToggleFavorite }: ToolCardProps) {
  const [hovered, setHovered] = useState(false)

  // Primary category for colour (first tag id)
  const primaryCat = categories.find(c => c.id === tool.tags[0])
  const hue = getCatHue(primaryCat?.name ?? '')
  const iconKey = getCatIconKey(primaryCat?.name ?? '') as IconKey

  return (
    <GlassCard>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Category icon tile */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg, oklch(0.92 0.08 ${hue}) 0%, oklch(0.82 0.13 ${hue}) 100%)`,
          border: `1px solid oklch(0.75 0.15 ${hue} / 0.4)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: `oklch(0.4 0.18 ${hue})`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 4px oklch(0.6 0.15 ${hue} / 0.2)`,
        }}>
          <Icon d={IconPaths[iconKey] ?? IconPaths.tools} size={15} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, letterSpacing: -0.1, fontFamily: T.font }}>
              {tool.name}
            </span>
            {tool.favorite && (
              <span style={{ color: 'oklch(0.85 0.13 80)', display: 'flex' }}>
                <Icon d={IconPaths.star} size={9} fill="currentColor" />
              </span>
            )}
          </div>
          <div style={{
            fontSize: 10.5, color: T.ink2, lineHeight: 1.35, fontFamily: T.font,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {tool.description || tool.notes || tool.url || 'No description'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
            {primaryCat && <TagPill hue={hue} mono>{primaryCat.name}</TagPill>}
            {tool.usedAt && (
              <span style={{ fontSize: 9.5, color: T.ink3, fontFamily: T.mono }}>
                @ {tool.usedAt}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, marginTop: 2 }}>
          {/* Launch button */}
          {tool.url && (
            <button
              title="Open URL"
              onClick={() => chrome.tabs.create({ url: tool.url })}
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'rgba(91,108,255,0.1)',
                border: '1px solid rgba(91,108,255,0.25)',
                color: T.indigoDeep, cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon d={IconPaths.arrow} size={12} />
            </button>
          )}
          {/* Hover-reveal edit/delete/favourite */}
          {hovered && (
            <>
              <button
                title="Edit"
                onClick={onEdit}
                style={actionBtnStyle}
              >
                <Icon d={IconPaths.pencil} size={11} />
              </button>
              <button
                title={tool.favorite ? 'Remove from favourites' : 'Add to favourites'}
                onClick={onToggleFavorite}
                style={{ ...actionBtnStyle, color: tool.favorite ? 'oklch(0.7 0.13 80)' : T.ink3 }}
              >
                <Icon d={IconPaths.star} size={11} fill={tool.favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                title="Delete"
                onClick={() => {
                  if (window.confirm(`Delete "${tool.name}"?`)) onDelete()
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
