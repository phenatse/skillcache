import type { Tool, Prompt, Note, Category } from '@t/index'
import { T } from '../tokens'
import { ToolsScreen } from './ToolsScreen'
import { PromptsScreen } from './PromptsScreen'
import { NotesScreen } from './NotesScreen'

interface FavoritesScreenProps {
  tools: Tool[]
  prompts: Prompt[]
  notes: Note[]
  categories: Category[]
  onEditTool: (tool: Tool) => void
  onDeleteTool: (id: string) => void
  onToggleToolFavorite: (tool: Tool) => void
  onEditPrompt: (prompt: Prompt) => void
  onDeletePrompt: (id: string) => void
  onCopyPrompt: (prompt: Prompt) => void
  onTogglePromptFavorite: (prompt: Prompt) => void
  onEditNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  onToggleNoteFavorite: (note: Note) => void
}

export function FavoritesScreen({
  tools, prompts, notes, categories,
  onEditTool, onDeleteTool, onToggleToolFavorite,
  onEditPrompt, onDeletePrompt, onCopyPrompt, onTogglePromptFavorite,
  onEditNote, onDeleteNote, onToggleNoteFavorite,
}: FavoritesScreenProps) {
  const favTools   = tools.filter(t => t.favorite)
  const favPrompts = prompts.filter(p => p.favorite)
  const favNotes   = notes.filter(n => n.favorite)

  if (favTools.length === 0 && favPrompts.length === 0 && favNotes.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: T.ink3, padding: '40px 0', fontSize: 12, fontFamily: T.font }}>
        No favorites yet — star a tool, prompt, or note to see it here.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {favTools.length > 0 && (
        <section>
          <SectionLabel>Tools</SectionLabel>
          <ToolsScreen
            tools={favTools}
            categories={categories}
            onEdit={onEditTool}
            onDelete={onDeleteTool}
            onToggleFavorite={onToggleToolFavorite}
          />
        </section>
      )}
      {favPrompts.length > 0 && (
        <section>
          <SectionLabel>Prompts</SectionLabel>
          <PromptsScreen
            prompts={favPrompts}
            categories={categories}
            onEdit={onEditPrompt}
            onDelete={onDeletePrompt}
            onCopy={onCopyPrompt}
            onToggleFavorite={onTogglePromptFavorite}
          />
        </section>
      )}
      {favNotes.length > 0 && (
        <section>
          <SectionLabel>Notes</SectionLabel>
          <NotesScreen
            notes={favNotes}
            categories={categories}
            onEdit={onEditNote}
            onDelete={onDeleteNote}
            onToggleFavorite={onToggleNoteFavorite}
          />
        </section>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 9.5, fontFamily: 'var(--font-mono, monospace)', fontWeight: 600,
      color: T.ink3, letterSpacing: 0.8, textTransform: 'uppercase',
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}
