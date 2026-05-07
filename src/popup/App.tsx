import { useState, useEffect, useMemo } from 'react'
import type { Tool, Prompt, Note, Category, Tab, StorageUsage } from '@t/index'
import { T } from './tokens'
import { Aurora }       from './components/Aurora'
import { Header }       from './components/Header'
import { SearchBar }    from './components/SearchBar'
import { FilterChips }  from './components/FilterChips'
import { TabBar }       from './components/TabBar'
import { ToolsScreen }      from './screens/ToolsScreen'
import { PromptsScreen }    from './screens/PromptsScreen'
import { NotesScreen }      from './screens/NotesScreen'
import { CategoriesScreen } from './screens/CategoriesScreen'
import { FavoritesScreen }  from './screens/FavoritesScreen'
import { AddSheet }         from './screens/AddSheet'
import { DiscoverSheet }    from './screens/DiscoverSheet'
import { searchTools, searchPrompts } from '@lib/search'
import { RECOMMENDED_TOOLS, normaliseUrl } from '@lib/recommendations'
import * as api from '@lib/api'

type ItemType = 'tool' | 'prompt' | 'note'

export default function App() {
  // ── UI state ────────────────────────────────────────────────
  const [tab,          setTab]          = useState<Tab>('categories')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [sheetOpen,    setSheetOpen]    = useState(false)
  const [sheetType,    setSheetType]    = useState<ItemType>('tool')
  const [editItem,     setEditItem]     = useState<Tool | Prompt | Note | null>(null)
  const [discoverOpen, setDiscoverOpen] = useState(false)

  // ── Data state ───────────────────────────────────────────────
  const [tools,      setTools]      = useState<Tool[]>([])
  const [prompts,    setPrompts]    = useState<Prompt[]>([])
  const [notes,      setNotes]      = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [lastSaved,    setLastSaved]    = useState<Date | null>(null)
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null)
  const [loading,      setLoading]      = useState(true)

  // ── Load on mount ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    async function load() {
      await api.initDefaults()
      const [data, ui, usage] = await Promise.all([api.getAll(), api.getUIState(), api.getStorageUsage()])
      if (!mounted) return
      setTools(data.tools)
      setPrompts(data.prompts)
      setNotes(data.notes)
      setCategories(data.categories)
      setStorageUsage(usage)
      if (ui.activeTab)   setTab(ui.activeTab)
      if (ui.searchQuery) setSearchQuery(ui.searchQuery)
      if (ui.lastSaved)   setLastSaved(new Date(ui.lastSaved))
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  // ── Persist active tab + search query ─────────────────────────
  useEffect(() => {
    if (!loading) api.saveUIState({ activeTab: tab, searchQuery })
  }, [tab, searchQuery, loading])

  // ── Refresh after mutations ───────────────────────────────────
  async function refresh() {
    const [data, usage] = await Promise.all([api.getAll(), api.getStorageUsage()])
    setTools(data.tools)
    setPrompts(data.prompts)
    setNotes(data.notes)
    setCategories(data.categories)
    setStorageUsage(usage)
    const ts = new Date()
    setLastSaved(ts)
    api.saveUIState({ lastSaved: ts.toISOString() })
  }

  // ── Derived: filtered lists ───────────────────────────────────
  const filteredTools = useMemo(() => {
    let result = searchTools(tools, searchQuery)
    if (!activeFilter || activeFilter === 'All') return result
    if (activeFilter === 'Favorites') return result.filter(t => t.favorite)
    if (activeFilter === 'Recent')    return [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 15)
    const cat = categories.find(c => c.name === activeFilter)
    return cat ? result.filter(t => t.tags.includes(cat.id)) : result
  }, [tools, searchQuery, activeFilter, categories])

  const filteredPrompts = useMemo(() => {
    let result = searchPrompts(prompts, searchQuery)
    if (!activeFilter || activeFilter === 'All') return result
    const knownLlms = ['Claude', 'ChatGPT', 'GPT', 'Gemini', 'Copilot', 'Perplexity', 'Other']
    if (knownLlms.includes(activeFilter)) return result.filter(p => p.llm === activeFilter)
    const cat = categories.find(c => c.name === activeFilter)
    return cat ? result.filter(p => p.tags.includes(cat.id)) : result
  }, [prompts, searchQuery, activeFilter, categories])

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      n.company.toLowerCase().includes(q)
    )
  }, [notes, searchQuery])

  // ── Filter chip options ───────────────────────────────────────
  const toolFilters   = useMemo(() => ['All', 'Favorites', 'Recent', ...categories.map(c => c.name)], [categories])
  const promptFilters = useMemo(() => {
    const llms = [...new Set(prompts.map(p => p.llm).filter(Boolean))]
    return ['All', ...llms]
  }, [prompts])

  // ── Discover: unAdded recommendations count ───────────────────
  const addedUrls = useMemo(() => new Set(tools.map(t => normaliseUrl(t.url))), [tools])
  const unaddedRecsCount = useMemo(
    () => RECOMMENDED_TOOLS.filter(r => !addedUrls.has(normaliseUrl(r.url))).length,
    [addedUrls]
  )

  // ── Tab switching ─────────────────────────────────────────────
  function handleTabSelect(t: Tab) {
    setTab(t)
    setActiveFilter(null)
    setSearchQuery('')
  }

  // ── AddSheet handlers ─────────────────────────────────────────
  function openAdd(type: ItemType = sheetType) {
    setSheetType(type)
    setEditItem(null)
    setSheetOpen(true)
  }

  function openEdit(item: Tool | Prompt | Note) {
    setSheetType(item.type as ItemType)
    setEditItem(item)
    setSheetOpen(true)
  }

  function closeSheet() {
    setSheetOpen(false)
    setEditItem(null)
  }

  async function handleSave(data: Partial<Tool> | Partial<Prompt> | Partial<Note>) {
    if (sheetType === 'tool') {
      await api.tools.save(data as Partial<Tool> & { name: string })
    } else if (sheetType === 'prompt') {
      await api.prompts.save(data as Partial<Prompt> & { title: string; text: string })
    } else {
      await api.notes.save(data as Partial<Note> & { title: string; body: string })
    }
    await refresh()
  }

  // ── Tool actions ──────────────────────────────────────────────
  async function handleDeleteTool(id: string) {
    await api.tools.remove(id)
    await refresh()
  }

  async function handleToggleFavorite(tool: Tool) {
    await api.tools.save({ ...tool, favorite: !tool.favorite })
    await refresh()
  }

  // ── Prompt actions ────────────────────────────────────────────
  async function handleDeletePrompt(id: string) {
    await api.prompts.remove(id)
    await refresh()
  }

  async function handleCopyPrompt(prompt: Prompt) {
    await navigator.clipboard.writeText(prompt.text)
    await api.prompts.incrementUses(prompt.id)
    await refresh()
  }

  async function handleTogglePromptFavorite(prompt: Prompt) {
    await api.prompts.save({ ...prompt, favorite: !prompt.favorite })
    await refresh()
  }

  // ── Note actions ──────────────────────────────────────────────
  async function handleDeleteNote(id: string) {
    await api.notes.remove(id)
    await refresh()
  }

  async function handleToggleNoteFavorite(note: Note) {
    await api.notes.save({ ...note, favorite: !note.favorite })
    await refresh()
  }

  // ── Category actions ──────────────────────────────────────────
  async function handleDeleteCategory(id: string) {
    await api.categories.remove(id)
    await refresh()
  }

  async function handleSaveCategory(data: { id?: string; name: string }) {
    await api.categories.save(data)
    await refresh()
  }

  // ── Discover: add recommendation ─────────────────────────────
  async function handleAddRecommendation(rec: { name: string; url: string; description: string; tags: string[] }) {
    await api.tools.save({
      name: rec.name, url: rec.url, description: rec.description,
      notes: '', usedAt: '', tags: rec.tags,
    })
    await refresh()
  }

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        width: 380, height: 560,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bg, fontFamily: T.font, color: T.ink3, fontSize: 12,
      }}>
        Loading…
      </div>
    )
  }

  const defaultAddType: ItemType = tab === 'prompts' ? 'prompt' : tab === 'notes' ? 'note' : 'tool'

  const searchPlaceholders: Record<Tab, string> = {
    categories: 'Filter categories…',
    tools:      'Search tools…',
    prompts:    'Search prompts by title or model…',
    notes:      'Search notes…',
    favorites:  'Search favorites…',
  }

  return (
    <div style={{
      width: 380, height: 560,
      position: 'relative',
      background: T.bg,
      fontFamily: T.font,
      color: T.ink,
      display: 'flex',
      flexDirection: 'column',
      isolation: 'isolate',
      overflow: 'hidden',
    }}>
      <Aurora />

      <Header
        totalCount={tools.length + prompts.length + notes.length}
        onAdd={() => openAdd(defaultAddType)}
        lastSaved={lastSaved}
        storageUsage={storageUsage}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={searchPlaceholders[tab]}
      />

      {tab === 'tools' && (
        <FilterChips filters={toolFilters} active={activeFilter} onSelect={setActiveFilter} />
      )}
      {tab === 'prompts' && (
        <FilterChips filters={promptFilters} active={activeFilter} onSelect={setActiveFilter} />
      )}

      <TabBar active={tab} onSelect={handleTabSelect} />

      {/* Scrolling content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 14px', position: 'relative', zIndex: 2 }}>
        {tab === 'tools' && (
          <ToolsScreen
            tools={filteredTools}
            categories={categories}
            onEdit={openEdit}
            onDelete={handleDeleteTool}
            onToggleFavorite={handleToggleFavorite}
            recommendedCount={unaddedRecsCount}
            onOpenDiscover={() => setDiscoverOpen(true)}
          />
        )}
        {tab === 'prompts' && (
          <PromptsScreen
            prompts={filteredPrompts}
            categories={categories}
            onEdit={openEdit}
            onDelete={handleDeletePrompt}
            onCopy={handleCopyPrompt}
            onToggleFavorite={handleTogglePromptFavorite}
          />
        )}
        {tab === 'notes' && (
          <NotesScreen
            notes={filteredNotes}
            categories={categories}
            onEdit={openEdit}
            onDelete={handleDeleteNote}
            onToggleFavorite={handleToggleNoteFavorite}
          />
        )}
        {tab === 'categories' && (
          <CategoriesScreen
            categories={categories}
            tools={tools}
            prompts={prompts}
            notes={notes}
            onDelete={handleDeleteCategory}
            onSave={handleSaveCategory}
          />
        )}
        {tab === 'favorites' && (
          <FavoritesScreen
            tools={tools}
            prompts={prompts}
            notes={notes}
            categories={categories}
            onEditTool={openEdit}
            onDeleteTool={handleDeleteTool}
            onToggleToolFavorite={handleToggleFavorite}
            onEditPrompt={openEdit}
            onDeletePrompt={handleDeletePrompt}
            onCopyPrompt={handleCopyPrompt}
            onTogglePromptFavorite={handleTogglePromptFavorite}
            onEditNote={openEdit}
            onDeleteNote={handleDeleteNote}
            onToggleNoteFavorite={handleToggleNoteFavorite}
          />
        )}
      </div>

      <AddSheet
        open={sheetOpen}
        type={sheetType}
        onTypeChange={setSheetType}
        editItem={editItem}
        categories={categories}
        onSave={handleSave}
        onClose={closeSheet}
      />

      <DiscoverSheet
        open={discoverOpen}
        tools={tools}
        onAdd={handleAddRecommendation}
        onClose={() => setDiscoverOpen(false)}
      />
    </div>
  )
}
