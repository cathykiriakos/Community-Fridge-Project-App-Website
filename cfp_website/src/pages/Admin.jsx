/**
 * Admin.jsx — Community Fridge Project CMS Portal
 * ─────────────────────────────────────────────────────────────────────────────
 * Full CMS portal: all page narratives, fridge CRUD, slots, news & events.
 *
 * Tabs: Dashboard · News & Events · Volunteer Slots · Fridge Locations · Page Content
 *
 * Data flow: localStorage → useContent() hook → all public pages (real-time)
 * ⚠️  Supabase upgrade path: replace localStorage reads/writes with Supabase calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LogIn, LogOut, Newspaper, Users, FileText, BarChart2,
  Plus, Trash2, Edit3, Eye, EyeOff, Save, CheckCircle,
  AlertTriangle, ArrowLeft, Settings, MapPin, RefreshCw,
  ExternalLink, Image, Upload, GripVertical,
} from 'lucide-react'
import {
  ADMIN_CONFIG, VOLUNTEER_SLOTS, DEFAULT_NEWS, FRIDGE_LOCATIONS,
} from '../config/site.config'
import { DEFAULT_PAGES, DEFAULT_IMAGES } from '../hooks/useContent'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function loadContent() {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG.contentKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Back-fill any keys missing from older saves
      return {
        news:    parsed.news    ?? [...DEFAULT_NEWS],
        slots:   parsed.slots   ?? VOLUNTEER_SLOTS.map(s => ({ ...s })),
        fridges: parsed.fridges ?? FRIDGE_LOCATIONS.map(f => ({ ...f })),
        pages:   { ...DEFAULT_PAGES, ...(parsed.pages ?? {}) },
        images:  { ...DEFAULT_IMAGES, ...(parsed.images ?? {}) },
      }
    }
  } catch (_) {}
  return {
    news:    [...DEFAULT_NEWS],
    slots:   VOLUNTEER_SLOTS.map(s => ({ ...s })),
    fridges: FRIDGE_LOCATIONS.map(f => ({ ...f })),
    pages:   { ...DEFAULT_PAGES },
    images:  { ...DEFAULT_IMAGES },
  }
}

function saveContent(content) {
  localStorage.setItem(ADMIN_CONFIG.contentKey, JSON.stringify(content))
  // Notify all tabs / useContent() hooks
  window.dispatchEvent(new CustomEvent('cfp-content-updated'))
}

function generateId() {
  return Date.now() + Math.random().toString(36).slice(2)
}

// ─── HAND-DRAWN HEART (admin sidebar) ─────────────────────────────────────────
function SidebarHeart() {
  return (
    <svg width="22" height="21" viewBox="0 0 40 38" fill="none" aria-hidden="true">
      <path
        d="M20 35 C19 34 14 30 10 26 C6 22 2 18 2 13 C2 8 5.5 4 11 4
           C14 4 17 5.5 20 9 C23 5.5 26 4 29 4 C34.5 4 38 8 38 13
           C38 18 34 22 30 26 C26 30 21 34 20 35Z"
        fill="white" stroke="white" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.9"
      />
    </svg>
  )
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_CONFIG.password) {
      sessionStorage.setItem(ADMIN_CONFIG.sessionKey, '1')
      onLogin()
    } else {
      setErr(true)
      setPw('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-800
                    flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center
                          mx-auto mb-4 shadow-md">
            <SidebarHeart />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Community Fridge Project</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-pw" className="form-label">Password</label>
            <input
              id="admin-pw" type="password" autoFocus required
              value={pw} onChange={e => { setPw(e.target.value); setErr(false) }}
              placeholder="Enter admin password"
              className={`form-input ${err ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {err && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle size={13} /> Incorrect password. Please try again.
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3.5">
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to website
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── NAV SIDEBAR ──────────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard',         icon: BarChart2 },
  { id: 'news',      label: 'News & Events',     icon: Newspaper },
  { id: 'slots',     label: 'Volunteer Slots',   icon: Users },
  { id: 'fridges',   label: 'Fridge Locations',  icon: MapPin },
  { id: 'images',    label: 'Page Images',        icon: Image },
  { id: 'pages',     label: 'Page Content',      icon: FileText },
]

function AdminNav({ activeTab, onTab, onLogout }) {
  return (
    <aside className="w-full md:w-64 bg-gray-900 text-gray-300 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <SidebarHeart />
          </div>
          <div className="leading-none">
            <p className="text-white font-bold text-sm">CFP Admin</p>
            <p className="text-gray-500 text-xs">Content Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {ADMIN_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold
                          transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full md:w-64 p-4 border-t border-gray-800 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-sm
                     py-2 px-4 rounded-lg hover:bg-gray-800 transition-all"
        >
          <ArrowLeft size={14} /> View Website
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm
                     py-2 px-4 rounded-lg hover:bg-gray-800 transition-all"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({ content, onTab }) {
  const published = content.news.filter(a => a.published).length
  const events    = content.news.filter(a => a.type === 'event').length
  const slotsOpen = content.slots.filter(s => s.filled < s.optimal).length

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Published Articles', value: published,            icon: '📰', tab: 'news' },
          { label: 'Upcoming Events',    value: events,               icon: '📅', tab: 'news' },
          { label: 'Fridge Locations',   value: content.fridges.length, icon: '🧊', tab: 'fridges' },
          { label: 'Slots Needing Help', value: slotsOpen,            icon: '🚨', tab: 'slots' },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={() => onTab(stat.tab)}
            className="card text-center hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-3xl mb-2" role="img" aria-hidden="true">{stat.icon}</div>
            <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
        <h3 className="font-bold text-brand-800 mb-3 flex items-center gap-2">
          <Settings size={16} /> Quick Guide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-brand-700">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">📰</span>
            <span><strong>News &amp; Events</strong> — Post announcements and upcoming events visible on the News page.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">👥</span>
            <span><strong>Volunteer Slots</strong> — Update filled counts. Numbers appear live on the Volunteer Dashboard.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">🧊</span>
            <span><strong>Fridge Locations</strong> — Add, edit, or remove community fridges. Google Maps links included.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">📝</span>
            <span><strong>Page Content</strong> — Edit every narrative block: Home, About, Donate, and Contact pages.</span>
          </div>
        </div>
        <p className="text-xs text-brand-600 mt-3 border-t border-brand-200 pt-3">
          All changes save automatically and update the live website in real-time.
        </p>
      </div>
    </div>
  )
}

// ─── NEWS TAB ─────────────────────────────────────────────────────────────────
const BLANK_ARTICLE = {
  id: null, type: 'news', title: '', date: '', excerpt: '',
  body: '', author: 'Karen', published: false,
}

function NewsTab({ content, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(BLANK_ARTICLE)

  const openNew  = () => { setForm({ ...BLANK_ARTICLE, date: new Date().toISOString().split('T')[0] }); setEditing('new') }
  const openEdit = (article) => { setForm({ ...article }); setEditing(article.id) }
  const closeForm = () => { setEditing(null); setForm(BLANK_ARTICLE) }

  const handleSave = () => {
    let updated
    if (editing === 'new') {
      updated = [...content.news, { ...form, id: generateId() }]
    } else {
      updated = content.news.map(a => a.id === form.id ? { ...form } : a)
    }
    onChange({ ...content, news: updated })
    closeForm()
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this article permanently?')) return
    onChange({ ...content, news: content.news.filter(a => a.id !== id) })
  }

  const togglePublish = (id) => {
    onChange({
      ...content,
      news: content.news.map(a => a.id === id ? { ...a, published: !a.published } : a),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">News &amp; Events</h2>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> New Post
        </button>
      </div>

      {editing !== null && (
        <div className="card mb-8 border-brand-300 bg-brand-50/30">
          <h3 className="font-bold text-lg mb-4 text-gray-900">
            {editing === 'new' ? 'Create New Post' : 'Edit Post'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Type</label>
              <select value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="form-input">
                <option value="news">News Article</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="form-input" />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Title *</label>
            <input type="text" value={form.title} placeholder="Article title..."
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="form-input" />
          </div>
          <div className="mb-4">
            <label className="form-label">Excerpt (shown on News page)</label>
            <textarea rows={2} value={form.excerpt} placeholder="Short summary..."
              onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
              className="form-input resize-none" />
          </div>
          <div className="mb-4">
            <label className="form-label">Full Body</label>
            <textarea rows={5} value={form.body} placeholder="Full article text..."
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              className="form-input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Author</label>
              <input type="text" value={form.author}
                onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                className="form-input" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published}
                  onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500" />
                <span className="text-sm font-semibold text-gray-700">Publish immediately</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={!form.title}
              className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
              <Save size={14} /> Save Post
            </button>
            <button onClick={closeForm} className="btn-secondary text-sm px-5 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {content.news.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">No posts yet. Create your first one!</p>
        )}
        {content.news.map(article => (
          <div key={article.id}
               className={`flex items-center justify-between p-4 rounded-xl border
                           ${article.published ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
            <div className="min-w-0 flex-1 mr-4">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${article.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}`}>
                  {article.type === 'event' ? '📅 Event' : '📰 News'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                  ${article.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {article.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="font-semibold text-gray-900 truncate text-sm">{article.title || 'Untitled'}</p>
              <p className="text-xs text-gray-400">{article.date} · {article.author}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => togglePublish(article.id)}
                      title={article.published ? 'Unpublish' : 'Publish'}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                {article.published ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => openEdit(article)} title="Edit"
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Edit3 size={16} />
              </button>
              <button onClick={() => handleDelete(article.id)} title="Delete"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── VOLUNTEER SLOTS TAB ──────────────────────────────────────────────────────
function SlotsTab({ content, onChange }) {
  const updateFilled = (id, val) => {
    onChange({
      ...content,
      slots: content.slots.map(s =>
        s.id === id ? { ...s, filled: Math.max(0, Math.min(parseInt(val) || 0, s.max)) } : s
      ),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Volunteer Slots</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Update the <strong>filled</strong> count as volunteers sign up.
        Changes save automatically and update the live Volunteer Dashboard in real-time.
      </p>
      <div className="space-y-3">
        {content.slots.map(slot => {
          const pct = slot.filled / slot.optimal
          const status = slot.filled >= slot.max ? 'full' : pct >= 0.6 ? 'warn' : 'open'
          return (
            <div key={slot.id}
                 className={`flex items-center gap-4 p-4 rounded-xl border
                   ${status === 'full' ? 'border-red-200 bg-red-50'
                     : status === 'warn' ? 'border-yellow-200 bg-yellow-50'
                     : 'border-brand-200 bg-brand-50'}`}>
              <span className="text-2xl flex-shrink-0">{slot.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{slot.activity}</p>
                <p className="text-xs text-gray-500">{slot.day}</p>
                {slot.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{slot.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Filled:</label>
                <input
                  type="number" min={0} max={slot.max}
                  value={slot.filled}
                  onChange={e => updateFilled(slot.id, e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm
                             font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">/ {slot.optimal} optimal</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── FRIDGE LOCATIONS TAB ─────────────────────────────────────────────────────
const BLANK_FRIDGE = { id: null, name: '', neighborhood: '', address: '', mapsUrl: '' }

function FridgesTab({ content, onChange }) {
  const [editing, setEditing] = useState(null)   // null | 'new' | fridge.id
  const [form, setForm]       = useState(BLANK_FRIDGE)

  const openNew  = () => { setForm({ ...BLANK_FRIDGE }); setEditing('new') }
  const openEdit = (fridge) => { setForm({ ...fridge }); setEditing(fridge.id) }
  const closeForm = () => { setEditing(null); setForm(BLANK_FRIDGE) }

  const handleSave = () => {
    let updated
    if (editing === 'new') {
      const nextId = Math.max(0, ...content.fridges.map(f => Number(f.id) || 0)) + 1
      updated = [...content.fridges, { ...form, id: nextId }]
    } else {
      updated = content.fridges.map(f => f.id === form.id ? { ...form } : f)
    }
    onChange({ ...content, fridges: updated })
    closeForm()
  }

  const handleDelete = (id) => {
    if (!window.confirm('Remove this fridge location?')) return
    onChange({ ...content, fridges: content.fridges.filter(f => f.id !== id) })
  }

  const handleReset = () => {
    if (!window.confirm('Reset all fridge locations back to the original defaults?')) return
    onChange({ ...content, fridges: FRIDGE_LOCATIONS.map(f => ({ ...f })) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Fridge Locations</h2>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="btn-secondary text-sm px-3 py-2 flex items-center gap-1.5">
            <RefreshCw size={13} /> Reset Defaults
          </button>
          <button onClick={openNew} className="btn-primary text-sm px-4 py-2">
            <Plus size={15} /> Add Fridge
          </button>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        {content.fridges.length} active location{content.fridges.length !== 1 ? 's' : ''}.
        Changes appear live on the About and Donate pages.
      </p>

      {/* Add / Edit form */}
      {editing !== null && (
        <div className="card mb-8 border-brand-300 bg-brand-50/30">
          <h3 className="font-bold text-lg mb-4 text-gray-900">
            {editing === 'new' ? 'Add New Fridge Location' : 'Edit Fridge Location'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Location Name *</label>
              <input type="text" value={form.name} placeholder="e.g. Grace Episcopal Church"
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Neighborhood / City</label>
              <input type="text" value={form.neighborhood} placeholder="e.g. Oak Park, IL"
                onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))}
                className="form-input" />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Street Address</label>
            <input type="text" value={form.address} placeholder="e.g. 924 Lake Street, Oak Park, IL"
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className="form-input" />
          </div>
          <div className="mb-5">
            <label className="form-label">Google Maps URL</label>
            <input type="url" value={form.mapsUrl}
              placeholder="https://maps.google.com/?q=..."
              onChange={e => setForm(p => ({ ...p, mapsUrl: e.target.value }))}
              className="form-input" />
            <p className="text-xs text-gray-400 mt-1">
              Tip: search the address on Google Maps, then copy the URL from your browser.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={!form.name}
              className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
              <Save size={14} /> Save Location
            </button>
            <button onClick={closeForm} className="btn-secondary text-sm px-5 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fridge list */}
      <div className="space-y-3">
        {content.fridges.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">No fridge locations yet. Add your first one!</p>
        )}
        {content.fridges.map(fridge => (
          <div key={fridge.id}
               className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-200 transition-all">
            <div className="flex items-start gap-3 min-w-0 flex-1 mr-4">
              <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={17} className="text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{fridge.name}</p>
                <p className="text-xs text-brand-600 font-medium">{fridge.neighborhood}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{fridge.address}</p>
                {fridge.mapsUrl && (
                  <a href={fridge.mapsUrl} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-0.5 w-fit">
                    <ExternalLink size={10} /> Get Directions
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(fridge)} title="Edit"
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Edit3 size={16} />
              </button>
              <button onClick={() => handleDelete(fridge.id)} title="Delete"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE IMAGES TAB ──────────────────────────────────────────────────────────
const PAGE_KEYS = [
  { key: 'home',      label: '🏠 Home' },
  { key: 'about',     label: '👥 About Us' },
  { key: 'volunteer', label: '🤝 Volunteer' },
  { key: 'donate',    label: '💚 Donate' },
  { key: 'news',      label: '📰 News & Events' },
  { key: 'contact',   label: '✉️ Contact' },
]

function ImagesTab({ content, onChange }) {
  const [activeKey, setActiveKey] = useState('home')
  const [dragIdx, setDragIdx]     = useState(null)

  const pageImages = content.images?.[activeKey] ?? []

  const updateImages = (key, imgs) => {
    onChange({ ...content, images: { ...(content.images ?? {}), [key]: imgs } })
  }

  // Upload: read files as base64 and append
  const handleUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const newImg = {
          id:      Date.now() + Math.random().toString(36).slice(2),
          src:     ev.target.result,
          caption: '',
          alt:     file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        }
        // Use functional update to batch multiple files correctly
        onChange(prev => {
          const existing = prev.images?.[activeKey] ?? []
          return {
            ...prev,
            images: { ...(prev.images ?? {}), [activeKey]: [...existing, newImg] }
          }
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleDelete = (id) => {
    updateImages(activeKey, pageImages.filter(img => img.id !== id))
  }

  const updateCaption = (id, caption) => {
    updateImages(activeKey, pageImages.map(img => img.id === id ? { ...img, caption } : img))
  }

  // Drag-and-drop reorder
  const handleDragStart = (idx) => setDragIdx(idx)
  const handleDragOver  = (e, idx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const reordered = [...pageImages]
    const [moved]   = reordered.splice(dragIdx, 1)
    reordered.splice(idx, 0, moved)
    updateImages(activeKey, reordered)
    setDragIdx(idx)
  }
  const handleDragEnd = () => setDragIdx(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Page Images</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Upload photos for each page. They appear in a <strong>left sidebar</strong> on the
        public page. Drag cards to reorder. Changes go live immediately.
      </p>

      {/* Page selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PAGE_KEYS.map(p => (
          <button
            key={p.key}
            onClick={() => setActiveKey(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeKey === p.key
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
            {(content.images?.[p.key]?.length ?? 0) > 0 && (
              <span className="ml-1.5 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">
                {content.images[p.key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Upload button */}
      <label className="flex items-center gap-2 btn-primary text-sm px-5 py-2.5 cursor-pointer w-fit mb-6">
        <Upload size={15} />
        Upload Photos to {PAGE_KEYS.find(p => p.key === activeKey)?.label}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleUpload}
        />
      </label>

      {/* Image grid — draggable */}
      {pageImages.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
          <Image size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No images yet for this page.</p>
          <p className="text-xs mt-1">Click "Upload Photos" above to add some.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageImages.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`card p-0 overflow-hidden cursor-grab active:cursor-grabbing
                          transition-all select-none
                          ${dragIdx === idx ? 'opacity-50 scale-95 ring-2 ring-brand-400' : ''}`}
            >
              {/* Drag handle bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                <GripVertical size={14} className="text-gray-300" />
                <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Image */}
              <div className="relative bg-gray-100" style={{ paddingBottom: '66.67%' }}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Caption input */}
              <div className="p-3">
                <input
                  type="text"
                  value={img.caption}
                  onChange={e => updateCaption(img.id, e.target.value)}
                  placeholder="Add a caption (optional)..."
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5
                             focus:outline-none focus:ring-2 focus:ring-brand-400"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PAGE CONTENT TAB ─────────────────────────────────────────────────────────
function PagesTab({ content, onChange }) {
  const pages = content.pages
  const update = (key, val) => onChange({ ...content, pages: { ...pages, [key]: val } })

  // Helper: labeled text input
  const Field = ({ label, k, type = 'input', rows = 3, placeholder = '' }) => (
    <div>
      <label className="form-label">{label}</label>
      {type === 'input'
        ? <input type="text" value={pages[k] ?? ''} onChange={e => update(k, e.target.value)}
            placeholder={placeholder} className="form-input" />
        : <textarea rows={rows} value={pages[k] ?? ''} onChange={e => update(k, e.target.value)}
            placeholder={placeholder} className="form-input resize-none" />
      }
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Page Content</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Edit every text block across the website. Changes save automatically and go live instantly.
      </p>

      <div className="space-y-6">

        {/* ── HOME PAGE ──────────────────────────────────────────────── */}
        <details className="card" open>
          <summary className="font-bold text-gray-900 cursor-pointer select-none flex items-center gap-2 text-base">
            🏠 Home Page
          </summary>
          <div className="mt-5 space-y-4">
            <Field label="Hero Headline" k="heroHeadline" placeholder="Neighbors Feeding Neighbors" />
            <Field label="Hero Subheadline" k="heroSub" placeholder="Free, fresh food — available to anyone, anytime." />
            <div>
              <label className="form-label text-xs text-gray-400 mb-2 block">Impact Stats — these appear as the 4 numbers on the homepage.</label>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stat 1 Number" k="stat0" placeholder="5" />
                <Field label="Stat 1 Label" k="stat0Label" placeholder="Community Fridges" />
                <Field label="Stat 2 Number" k="stat1" placeholder="100+" />
                <Field label="Stat 2 Label" k="stat1Label" placeholder="Active Volunteers" />
                <Field label="Stat 3 Number" k="stat2" placeholder="1,000+" />
                <Field label="Stat 3 Label" k="stat2Label" placeholder="Meals Served Monthly" />
                <Field label="Stat 4 Number" k="stat3" placeholder="0" />
                <Field label="Stat 4 Label" k="stat3Label" placeholder="Cost to Take Food" />
              </div>
            </div>
          </div>
        </details>

        {/* ── MISSION STATEMENT ──────────────────────────────────────── */}
        <details className="card" open>
          <summary className="font-bold text-gray-900 cursor-pointer select-none flex items-center gap-2 text-base">
            🌱 Mission Statement
          </summary>
          <div className="mt-5 space-y-4">
            <Field label="Mission Section Title" k="missionTitle" placeholder="Our Mission" />
            <Field label="Mission Body Text" k="missionBody" type="textarea" rows={5}
              placeholder="The Community Fridge Project believes that no one should go hungry..." />
          </div>
        </details>

        {/* ── ABOUT PAGE ─────────────────────────────────────────────── */}
        <details className="card">
          <summary className="font-bold text-gray-900 cursor-pointer select-none flex items-center gap-2 text-base">
            👥 About Us Page
          </summary>
          <div className="mt-5 space-y-4">
            <Field label="Page Intro (below 'Who We Are' banner)" k="teamIntro" type="textarea" rows={3} />
            <Field label="Our Story — Section Title" k="ourStoryTitle" placeholder="How It Started" />
            <Field label="Our Story — Paragraph 1" k="ourStoryBody1" type="textarea" rows={4} />
            <Field label="Our Story — Paragraph 2" k="ourStoryBody2" type="textarea" rows={4} />
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Founder / Lead Organizer Card</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Founder Name" k="founderName" placeholder="Karen" />
                <Field label="Founder Role" k="founderRole" placeholder="Founder & Lead Organizer" />
              </div>
              <Field label="Founder Bio" k="founderBio" type="textarea" rows={4} />
            </div>
          </div>
        </details>

        {/* ── DONATE PAGE ────────────────────────────────────────────── */}
        <details className="card">
          <summary className="font-bold text-gray-900 cursor-pointer select-none flex items-center gap-2 text-base">
            💚 Donate Page
          </summary>
          <div className="mt-5 space-y-4">
            <Field label="Page Headline" k="donateHeadline" placeholder="Support the Community Fridge Project" />
            <Field label="Intro Paragraph" k="donateIntro" type="textarea" rows={4} />
            <Field label="Food Drop-Off Note" k="dropoffNote" type="textarea" rows={2}
              placeholder="Drop off at any of our 5 fridge locations..." />
          </div>
        </details>

        {/* ── CONTACT PAGE ───────────────────────────────────────────── */}
        <details className="card">
          <summary className="font-bold text-gray-900 cursor-pointer select-none flex items-center gap-2 text-base">
            ✉️ Contact Page
          </summary>
          <div className="mt-5 space-y-4">
            <Field label="Page Headline" k="contactHeadline" placeholder="Get in Touch" />
            <Field label="Intro Paragraph" k="contactIntro" type="textarea" rows={3} />
            <Field label="Email Address" k="contactEmail" placeholder="communityfridgeproject@gmail.com" />
            <Field label="Response Time Note" k="contactResponse"
              placeholder="We typically respond within 2 business days." />
          </div>
        </details>

      </div>
    </div>
  )
}

// ─── ADMIN PORTAL (main export) ───────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed]   = useState(
    () => !!sessionStorage.getItem(ADMIN_CONFIG.sessionKey)
  )
  const [activeTab, setTab]   = useState('dashboard')
  const [content, setContent] = useState(loadContent)
  const [saveBanner, setBanner] = useState(false)

  // Auto-save + broadcast to useContent() hooks on every content change
  useEffect(() => {
    saveContent(content)
    setBanner(true)
    const t = setTimeout(() => setBanner(false), 1800)
    return () => clearTimeout(t)
  }, [content])

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_CONFIG.sessionKey)
    setAuthed(false)
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Sidebar */}
      <AdminNav activeTab={activeTab} onTab={setTab} onLogout={handleLogout} />

      {/* Content area */}
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-auto">
        {/* Auto-save banner */}
        {saveBanner && (
          <div className="fixed top-4 right-4 z-50 bg-brand-600 text-white text-sm
                          px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle size={14} /> Changes saved
          </div>
        )}

        {activeTab === 'dashboard' && <DashboardTab content={content} onTab={setTab} />}
        {activeTab === 'news'      && <NewsTab      content={content} onChange={setContent} />}
        {activeTab === 'slots'     && <SlotsTab     content={content} onChange={setContent} />}
        {activeTab === 'fridges'   && <FridgesTab   content={content} onChange={setContent} />}
        {activeTab === 'images'    && <ImagesTab    content={content} onChange={setContent} />}
        {activeTab === 'pages'     && <PagesTab     content={content} onChange={setContent} />}
      </main>
    </div>
  )
}
