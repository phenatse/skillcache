import { useState, useEffect, useMemo } from 'react'
import type { Tool, Prompt, Category, Tab } from '@t/index'
import { T } from './tokens'
import { Aurora }       from './components/Aurora'
import { Header }       from './components/Header'
import { SearchBar }    from './components/SearchBar'
import { FilterChips }  from './components/FilterChips'
import { TabBar }       from './components/TabBar'
import { ToolsScreen }      from './screens/ToolsScreen'
import { PromptsScreen }    from './screens/PromptsScreen'
import { CategoriesScreen } from './screens/CategoriesScreen'
import { FavoritesScreen }  from './screens/FavoritesScreen'
import { AddSheet }         from './screens/AddSheet'
import { searchTools, searchPrompts } from '@lib/search'
import * as api from '@lib/api'

export default function App() {
  // ── UI state ────────────────────────────────────────────────
  const [tab,          setTab]          = useState<Tab>('categories')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [sheetOpen,    setSheetOpen]    = useState(false)
  const [sheetType,    setSheetType]    = useState<'tool' | 'prompt'>('tool')
  const [editItem,     setEditItem]     = useState<Tool | Prompt | null>(null)

  // ── Data state ───────────────────────────────────────────────
  const [tools,      setTools]      = useState<Tool[]>([])
  const [prompts,    setPrompts]    = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [lastSaved,  setLastSaved]  = useState<Date | null>(null)
  const [loading,    setLoading]    = useState(true)

  // ── Load on mount ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    async function load() {
      await api.initDefaults()
      const [data, ui] = await Promise.all([api.getAll(), api.getUIState()])
      if (!mounted) return
      setTools(data.tools)
      setPrompts(data.prompts)
      setCategories(data.categories)
      if (ui.activeTab)    setTab(ui.activeTab)
      if (ui.searchQuery)  setSearchQuery(ui.searchQuery)
      if (ui.lastSaved)    setLastSaved(new Date(ui.lastSaved))
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
    const data = await api.getAll()
    setTools(data.tools)
    setPrompts(data.prompts)
    setCategories(data.categories)
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

  // ── Filter chip options ───────────────────────────────────────
  const toolFilters   = useMemo(() => ['All', 'Favorites', 'Recent', ...categories.map(c => c.name)], [categories])
  const promptFilters = useMemo(() => {
    const llms = [...new Set(prompts.map(p => p.llm).filter(Boolean))]
    return ['All', ...llms]
  }, [prompts])

  // ── Tab switching (clears filter) ─────────────────────────────
  function handleTabSelect(t: Tab) {
    setTab(t)
    setActiveFilter(null)
    setSearchQuery('')
  }

  // ── AddSheet handlers ─────────────────────────────────────────
  function openAdd(type: 'tool' | 'prompt' = sheetType) {
    setSheetType(type)
    setEditItem(null)
    setSheetOpen(true)
  }

  function openEdit(item: Tool | Prompt) {
    setSheetType(item.type)
    setEditItem(item)
    setSheetOpen(true)
  }

  function closeSheet() {
    setSheetOpen(false)
    setEditItem(null)
  }

  async function handleSave(data: Partial<Tool> | Partial<Prompt>) {
    if (sheetType === 'tool') {
      await api.tools.save(data as Partial<Tool> & { name: string })
    } else {
      await api.prompts.save(data as Partial<Prompt> & { title: string; text: string })
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

  async function handleTogglePromptFavorite(prompt: Prompt) {
    await api.prompts.save({ ...prompt, favorite: !prompt.favorite })
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

  // ── Category actions ──────────────────────────────────────────
  async function handleDeleteCategory(id: string) {
    await api.categories.remove(id)
    await refresh()
  }

  async function handleSaveCategory(data: { id?: string; name: string }) {
    await api.categories.save(data)
    await refresh()
  }

  function handleFilterByCategory(catName: string) {
    setTab('tools')
    setActiveFilter(catName)
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

  const searchPlaceholders: Record<Tab, string> = {
    categories: 'Filter categories…',
    tools:      'Search tools, prompts, tags…',
    prompts:    'Search prompts by title or model…',
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
        totalCount={tools.length + prompts.length}
        onAdd={() => openAdd(tab === 'prompts' ? 'prompt' : 'tool')}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={searchPlaceholders[tab]}
      />

      {/* Filter chips — only on tools and prompts tabs */}
      {tab === 'tools' && (
        <FilterChips
          filters={toolFilters}
          active={activeFilter}
          onSelect={setActiveFilter}
        />
      )}
      {tab === 'prompts' && (
        <FilterChips
          filters={promptFilters}
          active={activeFilter}
          onSelect={setActiveFilter}
        />
      )}

      <TabBar active={tab} onSelect={handleTabSelect} lastSaved={lastSaved} />

      {/* Scrolling content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 14px', position: 'relative', zIndex: 2 }}>
        {tab === 'tools' && (
          <ToolsScreen
            tools={filteredTools}
            categories={categories}
            onEdit={openEdit}
            onDelete={handleDeleteTool}
            onToggleFavorite={handleToggleFavorite}
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
        {tab === 'categories' && (
          <CategoriesScreen
            categories={categories}
            tools={tools}
            prompts={prompts}
            onFilter={handleFilterByCategory}
            onDelete={handleDeleteCategory}
            onSave={handleSaveCategory}
          />
        )}
        {tab === 'favorites' && (
          <FavoritesScreen
            tools={tools}
            prompts={prompts}
            categories={categories}
            onEditTool={openEdit}
            onDeleteTool={handleDeleteTool}
            onToggleToolFavorite={handleToggleFavorite}
            onEditPrompt={openEdit}
            onDeletePrompt={handleDeletePrompt}
            onCopyPrompt={handleCopyPrompt}
            onTogglePromptFavorite={handleTogglePromptFavorite}
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
    </div>
  )
}
