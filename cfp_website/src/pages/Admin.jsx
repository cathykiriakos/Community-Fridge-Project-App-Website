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
  LogIn, LogOut, Newspaper, Users, FileText, BarChart2, Heart,
  Plus, Trash2, Edit3, Eye, EyeOff, Save, CheckCircle,
  AlertTriangle, ArrowLeft, Settings, MapPin, RefreshCw,
  ExternalLink, Image, Upload, GripVertical,
  Mail, Phone, Search, Copy, Download, Filter,
  Calendar, Check,
} from 'lucide-react'
import {
  ADMIN_CONFIG, VOLUNTEER_SLOTS, DEFAULT_NEWS, FRIDGE_LOCATIONS, COMMUNITY_PARTNERS,
} from '../config/site.config'
import { DEFAULT_PAGES, DEFAULT_IMAGES } from '../hooks/useContent'
import { supabase } from '../lib/supabase'

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
        pages:    { ...DEFAULT_PAGES, ...(parsed.pages ?? {}) },
        images:   { ...DEFAULT_IMAGES, ...(parsed.images ?? {}) },
        partners: parsed.partners ?? [...COMMUNITY_PARTNERS],
      }
    }
  } catch (_) {}
  return {
    news:     [...DEFAULT_NEWS],
    slots:    VOLUNTEER_SLOTS.map(s => ({ ...s })),
    fridges:  FRIDGE_LOCATIONS.map(f => ({ ...f })),
    pages:    { ...DEFAULT_PAGES },
    images:   { ...DEFAULT_IMAGES },
    partners: [...COMMUNITY_PARTNERS],
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

// ─── SCHEDULING HELPERS ───────────────────────────────────────────────────────
// Day-of-week → offset from Monday (0 = Mon, 6 = Sun)
const DAY_TO_OFFSET = {
  Monday: 0, Tuesday: 1, Wednesday: 2,
  Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6,
}

// Shift an ISO date string by n days (uses noon to avoid DST edge cases)
function shiftDays(isoStr, n) {
  const d = new Date(isoStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// Format a week range label: "Apr 14 – Apr 20"
function fmtWeekRange(mondayIso) {
  const opts = { month: 'short', day: 'numeric' }
  const mon = new Date(mondayIso + 'T12:00:00')
  const sun = new Date(shiftDays(mondayIso, 6) + 'T12:00:00')
  return `${mon.toLocaleDateString('en-US', opts)} – ${sun.toLocaleDateString('en-US', opts)}`
}

// Return the ISO date string for the Monday of the week containing `date`
function getMondayISO(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().split('T')[0]
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
  { id: 'members',   label: 'Members',           icon: Users },
  { id: 'lists',     label: 'Contact Lists',     icon: Mail },
  { id: 'schedule',  label: 'Scheduling',        icon: Calendar },
  { id: 'news',      label: 'News & Events',     icon: Newspaper },
  { id: 'slots',     label: 'Volunteer Slots',   icon: Filter },
  { id: 'fridges',   label: 'Fridge Locations',  icon: MapPin },
  { id: 'images',    label: 'Page Images',        icon: Image },
  { id: 'pages',     label: 'Page Content',      icon: FileText },
  { id: 'partners',  label: 'Community Partners', icon: Heart },
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
  const [memberCount, setMemberCount] = useState('—')

  useEffect(() => {
    supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .then(({ count }) => setMemberCount(count ?? 0))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Published Articles', value: published,   icon: '📰', tab: 'news' },
          { label: 'Upcoming Events',    value: events,      icon: '📅', tab: 'news' },
          { label: 'Active Members',     value: memberCount, icon: '👥', tab: 'members' },
          { label: 'Slots Needing Help', value: slotsOpen,   icon: '🚨', tab: 'schedule' },
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
            <span className="mt-0.5 flex-shrink-0">👥</span>
            <span><strong>Members</strong> — Add, edit, or remove members. Update roles and skill tags. Syncs to Supabase.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">📅</span>
            <span><strong>Scheduling</strong> — Drag volunteers into weekly activity slots. Toggle confirmed status and get outreach prompts for unconfirmed volunteers.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">📋</span>
            <span><strong>Contact Lists</strong> — Filter members and copy a ready-to-paste email or phone list, or export CSV.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">📰</span>
            <span><strong>News &amp; Events</strong> — Post announcements and upcoming events visible on the News page.</span>
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

// ─── MEMBER MANAGEMENT CONSTANTS ─────────────────────────────────────────────
const VOLUNTEER_ROLES = {
  volunteer:    '🙋 Volunteer',
  coordinator:  '📋 Coordinator',
  driver:       '🚗 Driver',
  captain:      '⭐ Site Captain',
  advisory:     '🤝 Advisory',
  donor_liaison:'💚 Donor Liaison',
}

const ALL_SKILL_TAGS = {
  sack_lunch:      '🥪 Sack Lunch',
  delivery:        '🚗 Delivery',
  cleaning:        '🧹 Cleaning',
  shopping:        '🛒 Shopping',
  tovala_recovery: '♻️ Tovala Recovery',
  stocking:        '📦 Stocking',
  advisory:        '🤝 Advisory',
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

// ─── MEMBERS TAB ─────────────────────────────────────────────────────────────
const BLANK_MEMBER = {
  name: '', email: '', phone: '', role: 'volunteer', is_active: true, notes: '', tags: [],
}

function MembersTab() {
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [editing,    setEditing]    = useState(null)  // null | 'new' | id
  const [form,       setForm]       = useState(BLANK_MEMBER)
  const [search,     setSearch]     = useState('')
  const [saving,     setSaving]     = useState(false)
  const [banner,     setBanner]     = useState('')

  const fetchMembers = async () => {
    setLoading(true); setError(null)
    const { data, error: err } = await supabase
      .from('vw_volunteer_skills').select('*').order('name')
    if (err) { setError(err.message); setLoading(false); return }
    setMembers(data ?? [])
    setLoading(false)
  }
  useEffect(() => { fetchMembers() }, [])

  const flash = (msg) => { setBanner(msg); setTimeout(() => setBanner(''), 2200) }

  const openNew  = () => { setForm({ ...BLANK_MEMBER, tags: [] }); setEditing('new') }
  const openEdit = (m) => {
    setForm({
      id:        m.id,
      name:      m.name      ?? '',
      email:     m.email     ?? '',
      phone:     m.phone     ?? '',
      role:      m.role      ?? 'volunteer',
      is_active: m.is_active ?? true,
      notes:     m.notes     ?? '',
      tags:      m.skills ? m.skills.split(',').filter(Boolean) : [],
    })
    setEditing(m.id)
  }
  const closeForm = () => { setEditing(null); setForm(BLANK_MEMBER) }

  const toggleTag = (tag) =>
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = {
      name:       form.name.trim(),
      email:      form.email.trim()  || null,
      phone:      form.phone.trim()  || null,
      role:       form.role,
      is_active:  form.is_active,
      notes:      form.notes.trim()  || null,
      updated_at: new Date().toISOString(),
    }
    let volunteerId = form.id

    if (editing === 'new') {
      const { data, error: err } = await supabase
        .from('volunteers').insert(payload).select('id').single()
      if (err) { flash('Error: ' + err.message); setSaving(false); return }
      volunteerId = data.id
    } else {
      const { error: err } = await supabase
        .from('volunteers').update(payload).eq('id', form.id)
      if (err) { flash('Error: ' + err.message); setSaving(false); return }
    }

    // Sync tags: wipe then re-insert
    await supabase.from('volunteer_tags').delete().eq('volunteer_id', volunteerId)
    if (form.tags.length > 0) {
      const { error: tagErr } = await supabase
        .from('volunteer_tags')
        .insert(form.tags.map(tag => ({ volunteer_id: volunteerId, tag })))
      if (tagErr) flash('Saved — tag sync error: ' + tagErr.message)
    }

    await fetchMembers()
    closeForm()
    flash(editing === 'new' ? 'Member added!' : 'Member updated!')
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return
    const { error: err } = await supabase.from('volunteers').delete().eq('id', id)
    if (err) { flash('Error: ' + err.message); return }
    await fetchMembers()
    flash('Member removed.')
  }

  const filtered = members.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.name?.toLowerCase().includes(q)  ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(q)               ||
      m.role?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {banner && (
        <div className={`fixed top-4 right-4 z-50 text-white text-sm px-4 py-2 rounded-lg shadow-lg
                         flex items-center gap-2
                         ${banner.startsWith('Error') ? 'bg-red-500' : 'bg-brand-600'}`}>
          <CheckCircle size={14} /> {banner}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Members</h2>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* Add / Edit form */}
      {editing !== null && (
        <div className="card mb-8 border-brand-300 bg-brand-50/30">
          <h3 className="font-bold text-lg mb-5 text-gray-900">
            {editing === 'new' ? 'Add New Member' : 'Edit Member'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input type="text" value={form.name} placeholder="Jane Smith"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="form-input">
                {Object.entries(VOLUNTEER_ROLES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={form.email} placeholder="jane@example.com"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input type="tel" value={form.phone} placeholder="+1 555 000 0000"
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="form-input" />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Notes</label>
            <textarea rows={2} value={form.notes} placeholder="Optional notes about this member…"
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="form-input resize-none" />
          </div>

          {/* Skill tags */}
          <div className="mb-4">
            <label className="form-label">Skill Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(ALL_SKILL_TAGS).map(([k, v]) => (
                <button key={k} type="button" onClick={() => toggleTag(k)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${form.tags.includes(k)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-brand-400'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="mb-5">
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 accent-brand-500" />
              <span className="text-sm font-semibold text-gray-700">Active member</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={!form.name.trim() || saving}
              className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
              <Save size={14} /> {saving ? 'Saving…' : 'Save Member'}
            </button>
            <button onClick={closeForm} className="btn-secondary text-sm px-5 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or role…"
          className="form-input pl-9" />
      </div>

      {/* Member list */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-10">Loading members…</p>
      ) : error ? (
        <p className="text-red-500 text-sm text-center py-10">Error: {error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">
          {members.length === 0 ? 'No members yet. Add your first one!' : 'No members match your search.'}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-1">
            {filtered.length} member{filtered.length !== 1 ? 's' : ''}
            {search ? ' matched' : ''}
          </p>
          {filtered.map(m => {
            const tags = m.skills ? m.skills.split(',').filter(Boolean) : []
            return (
              <div key={m.id}
                   className={`flex items-center justify-between p-4 rounded-xl border transition-all
                     ${m.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="min-w-0 flex-1 mr-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                      {VOLUNTEER_ROLES[m.role] ?? m.role ?? 'Volunteer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-1.5 flex-wrap">
                    {m.email && <span className="flex items-center gap-1"><Mail size={11} />{m.email}</span>}
                    {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map(t => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {ALL_SKILL_TAGS[t] ?? t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(m)} title="Edit"
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(m.id, m.name)} title="Delete"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── LISTS TAB ────────────────────────────────────────────────────────────────
function ListsTab() {
  const [members,     setMembers]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filterRole,  setFilterRole]  = useState('all')
  const [filterTag,   setFilterTag]   = useState('all')
  const [filterActive,setFilterActive]= useState('active')
  const [listType,    setListType]    = useState('email')
  const [copied,      setCopied]      = useState(false)

  useEffect(() => {
    supabase.from('vw_volunteer_skills').select('*').order('name')
      .then(({ data }) => { setMembers(data ?? []); setLoading(false) })
  }, [])

  const filtered = members.filter(m => {
    if (filterActive === 'active'   && !m.is_active) return false
    if (filterActive === 'inactive' &&  m.is_active) return false
    if (filterRole !== 'all' && m.role !== filterRole) return false
    if (filterTag  !== 'all') {
      const tags = m.skills ? m.skills.split(',') : []
      if (!tags.includes(filterTag)) return false
    }
    return true
  })

  const emailList = filtered.filter(m => m.email).map(m => m.email).join(', ')
  const phoneList = filtered.filter(m => m.phone).map(m => m.phone).join('\n')
  const activeList = listType === 'email' ? emailList : phoneList

  const handleCopy = () => {
    if (!activeList) return
    navigator.clipboard.writeText(activeList)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleCSV = () => {
    const header = 'Name,Email,Phone,Role,Tags,Active\n'
    const rows = filtered.map(m => [
      `"${(m.name   ?? '').replace(/"/g, '""')}"`,
      `"${(m.email  ?? '').replace(/"/g, '""')}"`,
      `"${(m.phone  ?? '').replace(/"/g, '""')}"`,
      `"${(m.role   ?? '').replace(/"/g, '""')}"`,
      `"${(m.skills ?? '').replace(/"/g, '""')}"`,
      m.is_active ? 'Yes' : 'No',
    ].join(',')).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `cfp_members_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const emailCount = filtered.filter(m => m.email).length
  const phoneCount = filtered.filter(m => m.phone).length

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Contact Lists</h2>
      <p className="text-gray-500 text-sm mb-6">
        Filter your members, then copy a ready-to-paste email or phone list — or export the full set as CSV.
      </p>

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <Filter size={14} /> Filters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label text-xs">Status</label>
            <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="form-input">
              <option value="all">All members</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
          <div>
            <label className="form-label text-xs">Role</label>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="form-input">
              <option value="all">All roles</option>
              {Object.entries(VOLUNTEER_ROLES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label text-xs">Skill Tag</label>
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="form-input">
              <option value="all">All tags</option>
              {Object.entries(ALL_SKILL_TAGS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-10 text-center">Loading members…</p>
      ) : (
        <>
          {/* Summary row */}
          <p className="text-sm text-gray-500 mb-4">
            <strong className="text-gray-900">{filtered.length}</strong>{' '}
            member{filtered.length !== 1 ? 's' : ''} matched
            {' · '}
            <span className="text-brand-600 font-medium">{emailCount} email{emailCount !== 1 ? 's' : ''}</span>
            {' · '}
            <span className="text-brand-600 font-medium">{phoneCount} phone{phoneCount !== 1 ? 's' : ''}</span>
          </p>

          {/* Toggle + action buttons */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setListType('email')}
                className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all
                  ${listType === 'email' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Mail size={14} /> Email List
              </button>
              <button onClick={() => setListType('phone')}
                className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all
                  ${listType === 'phone' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Phone size={14} /> Phone / Text List
              </button>
            </div>
            <button onClick={handleCopy} disabled={!activeList}
              className="btn-primary text-sm px-4 py-2 disabled:opacity-40">
              {copied
                ? <><CheckCircle size={14} /> Copied!</>
                : <><Copy size={14} /> Copy List</>}
            </button>
            <button onClick={handleCSV} disabled={filtered.length === 0}
              className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">
              <Download size={14} /> Download CSV
            </button>
          </div>

          {/* Preview textarea */}
          <textarea
            readOnly rows={6}
            value={activeList || (listType === 'email'
              ? 'No email addresses for the current filter.'
              : 'No phone numbers for the current filter.')}
            className="form-input font-mono text-xs resize-y text-gray-700 bg-gray-50 w-full mb-6"
          />

          {/* Matched member list */}
          {filtered.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Matched Members</h3>
              <div className="space-y-1.5">
                {filtered.map(m => {
                  const tags = m.skills ? m.skills.split(',').filter(Boolean) : []
                  return (
                    <div key={m.id}
                         className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white text-sm">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-900">{m.name}</span>
                        <span className="ml-2 text-xs text-brand-600 font-medium">
                          {VOLUNTEER_ROLES[m.role] ?? m.role}
                        </span>
                        {tags.length > 0 && (
                          <span className="ml-2 text-xs text-gray-400">
                            {tags.map(t => ALL_SKILL_TAGS[t] ?? t).join(' · ')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-right flex-shrink-0 ml-3 font-mono">
                        {listType === 'email' ? (m.email || '—') : (m.phone || '—')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
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

// ─── SCHEDULING TAB ───────────────────────────────────────────────────────────
function SchedulingTab() {
  const [weekStr,      setWeekStr]      = useState(() => getMondayISO(new Date()))
  const [volunteers,   setVolunteers]   = useState([])
  const [panels,       setPanels]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filterTag,    setFilterTag]    = useState('all')
  const [refreshKey,   setRefreshKey]   = useState(0)
  const [banner,       setBanner]       = useState('')
  const [pendingDelete, setPendingDelete] = useState(null) // { initiativeId, eventIds, label }
  const [addOpen,      setAddOpen]      = useState(false)
  const [addForm,      setAddForm]      = useState({
    name: '', date: '', dayOfWeek: '', optimalSeats: '2', maxSeats: '4',
    isRecurring: false, isDaily: false,
  })
  const [addBusy, setAddBusy] = useState(false)

  const weekEndStr = shiftDays(weekStr, 6)
  const flash = msg => { setBanner(msg); setTimeout(() => setBanner(''), 2500) }

  const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // ── Load volunteers + initiatives + auto-created events ──────────────────
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)

      // Load ALL active initiatives (not just recurring — manually-added ones need to show too)
      const [{ data: vols }, { data: inits }] = await Promise.all([
        supabase.from('vw_volunteer_skills').select('*').eq('is_active', true).order('name'),
        supabase.from('initiatives').select('*').eq('is_active', true).order('id'),
      ])
      if (cancelled) return
      setVolunteers(vols ?? [])
      if (!inits?.length) { setLoading(false); return }

      const initIds = inits.map(i => i.id)

      // Fetch events already in this week (excluding cancelled)
      const { data: existingEvts } = await supabase
        .from('events')
        .select('id, initiative_id, event_date, status')
        .gte('event_date', weekStr)
        .lte('event_date', weekEndStr)
        .in('initiative_id', initIds)
        .neq('status', 'cancelled')
      if (cancelled) return

      // Group events by initiative_id → array
      const evtsByInit = {}
      ;(existingEvts ?? []).forEach(e => {
        if (!evtsByInit[e.initiative_id]) evtsByInit[e.initiative_id] = []
        evtsByInit[e.initiative_id].push(e)
      })

      // Auto-create missing events for recurring initiatives
      const toCreate = []
      for (const init of inits) {
        if (!init.is_recurring) continue
        if (init.day_of_week === 'Daily') {
          // Daily → create one event per day of the week
          for (let d = 0; d < 7; d++) {
            const date = shiftDays(weekStr, d)
            if (!(evtsByInit[init.id] ?? []).some(e => e.event_date === date))
              toCreate.push({ initiative_id: init.id, event_date: date, status: 'open' })
          }
        } else {
          // Regular → one event per week on the configured day (default Monday if unset)
          const offset = DAY_TO_OFFSET[init.day_of_week] ?? 0
          const date   = shiftDays(weekStr, offset)
          if (!(evtsByInit[init.id] ?? []).some(e => e.event_date === date))
            toCreate.push({ initiative_id: init.id, event_date: date, status: 'open' })
        }
      }

      if (toCreate.length) {
        const { data: created } = await supabase
          .from('events').insert(toCreate).select('id, initiative_id, event_date, status')
        if (cancelled) return
        ;(created ?? []).forEach(e => {
          if (!evtsByInit[e.initiative_id]) evtsByInit[e.initiative_id] = []
          evtsByInit[e.initiative_id].push(e)
        })
      }

      // Fetch all signups for this week's events
      const allEvtIds = Object.values(evtsByInit).flat().map(e => e.id)
      const signupsByEvt = {}
      if (allEvtIds.length) {
        const { data: signups } = await supabase
          .from('event_signups')
          .select(`id, event_id, volunteer_id, confirmed, status, skill_tag,
                   volunteer:volunteers(id, name, email, phone)`)
          .in('event_id', allEvtIds)
          .eq('status', 'active')
        if (cancelled) return
        ;(signups ?? []).forEach(s => {
          if (!signupsByEvt[s.event_id]) signupsByEvt[s.event_id] = []
          signupsByEvt[s.event_id].push(s)
        })
      }

      // Build panels
      const built = inits.map(init => {
        const isDaily = init.day_of_week === 'Daily'
        const evts    = (evtsByInit[init.id] ?? []).sort((a, b) => a.event_date.localeCompare(b.event_date))
        if (isDaily) {
          return {
            initiative: init,
            type: 'daily',
            slots: Array.from({ length: 7 }, (_, d) => {
              const date = shiftDays(weekStr, d)
              const evt  = evts.find(e => e.event_date === date) ?? null
              return { d, date, event: evt, signups: evt ? (signupsByEvt[evt.id] ?? []) : [] }
            }),
          }
        }
        const evt = evts[0] ?? null
        return { initiative: init, type: 'regular', event: evt, signups: evt ? (signupsByEvt[evt.id] ?? []) : [] }
      })

      if (!cancelled) { setPanels(built); setLoading(false) }
    }

    load()
    return () => { cancelled = true }
  }, [weekStr, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutations ─────────────────────────────────────────────────────────────

  // Assign volunteer to a regular panel (auto-creates event if missing)
  const handleAssign = async (initiativeId, volunteerId, { eventId, fallbackDate } = {}) => {
    const panel = panels.find(p => p.initiative.id === initiativeId && p.type === 'regular')
    if (!panel) return
    if ((panel.signups ?? []).some(s => s.volunteer_id === volunteerId)) {
      flash('Volunteer is already assigned to this activity.'); return
    }
    const maxSeats = panel.initiative.max_seats ?? panel.initiative.optimal_seats
    if ((panel.signups ?? []).length >= maxSeats) {
      flash('This activity is already at maximum capacity.'); return
    }

    let eid = eventId
    let createdEvent = null

    // Auto-create event if it doesn't exist yet
    if (!eid) {
      const date = fallbackDate ?? shiftDays(weekStr, DAY_TO_OFFSET[panel.initiative.day_of_week] ?? 0)
      const { data: newEvt, error: evtErr } = await supabase
        .from('events')
        .insert({ initiative_id: initiativeId, event_date: date, status: 'open' })
        .select('id, initiative_id, event_date, status')
        .single()
      if (evtErr) { flash('Error creating event: ' + evtErr.message); return }
      eid = newEvt.id
      createdEvent = newEvt
    }

    const { data, error } = await supabase
      .from('event_signups')
      .insert({ event_id: eid, volunteer_id: volunteerId, status: 'active', confirmed: false })
      .select(`id, event_id, volunteer_id, confirmed, status, skill_tag,
               volunteer:volunteers(id, name, email, phone)`)
      .single()
    if (error) { flash('Error assigning volunteer: ' + error.message); return }

    const volName = volunteers.find(v => v.id === volunteerId)?.name ?? 'Volunteer'
    setPanels(prev => prev.map(p => {
      if (p.initiative.id !== initiativeId || p.type !== 'regular') return p
      return { ...p, event: createdEvent ?? p.event, signups: [...(p.signups ?? []), data] }
    }))
    flash(`${volName} assigned!`)
  }

  // Assign volunteer to a daily panel slot
  const handleAssignDailySlot = async (initiativeId, slotIdx, volunteerId, eventId) => {
    const panel = panels.find(p => p.initiative.id === initiativeId && p.type === 'daily')
    if (!panel) return
    const slot = panel.slots[slotIdx]
    if (slot.signups.some(s => s.volunteer_id === volunteerId)) {
      flash('Already assigned to this day.'); return
    }
    const maxSeats = panel.initiative.max_seats ?? panel.initiative.optimal_seats
    if (slot.signups.length >= maxSeats) {
      flash('Slot is at maximum capacity.'); return
    }
    const { data, error } = await supabase
      .from('event_signups')
      .insert({ event_id: eventId, volunteer_id: volunteerId, status: 'active', confirmed: false })
      .select(`id, event_id, volunteer_id, confirmed, status, skill_tag,
               volunteer:volunteers(id, name, email, phone)`)
      .single()
    if (error) { flash('Error assigning: ' + error.message); return }
    const volName = volunteers.find(v => v.id === volunteerId)?.name ?? 'Volunteer'
    setPanels(prev => prev.map(p => {
      if (p.initiative.id !== initiativeId || p.type !== 'daily') return p
      return { ...p, slots: p.slots.map((s, i) => i === slotIdx ? { ...s, signups: [...s.signups, data] } : s) }
    }))
    flash(`${volName} assigned!`)
  }

  const handleRemove = async (initiativeId, signupId, volName, slotIdx) => {
    const { error } = await supabase.from('event_signups').delete().eq('id', signupId)
    if (error) { flash('Error removing: ' + error.message); return }
    setPanels(prev => prev.map(p => {
      if (p.initiative.id !== initiativeId) return p
      if (p.type === 'daily' && slotIdx !== undefined)
        return { ...p, slots: p.slots.map((s, i) => i === slotIdx ? { ...s, signups: s.signups.filter(sg => sg.id !== signupId) } : s) }
      return { ...p, signups: (p.signups ?? []).filter(s => s.id !== signupId) }
    }))
    flash(`${volName} removed.`)
  }

  const handleToggleConfirm = async (initiativeId, signup, slotIdx) => {
    const next = !signup.confirmed
    const { error } = await supabase.from('event_signups').update({ confirmed: next }).eq('id', signup.id)
    if (error) { flash('Error updating confirmation: ' + error.message); return }
    setPanels(prev => prev.map(p => {
      if (p.initiative.id !== initiativeId) return p
      if (p.type === 'daily' && slotIdx !== undefined)
        return { ...p, slots: p.slots.map((s, i) => i === slotIdx ? { ...s, signups: s.signups.map(sg => sg.id === signup.id ? { ...sg, confirmed: next } : sg) } : s) }
      return { ...p, signups: p.signups.map(s => s.id === signup.id ? { ...s, confirmed: next } : s) }
    }))
  }

  // Update (or create) the event date for a regular panel
  const handleChangeDate = async (initiativeId, eventId, newDate) => {
    if (!eventId) {
      const { data: newEvt, error } = await supabase
        .from('events').insert({ initiative_id: initiativeId, event_date: newDate, status: 'open' })
        .select('id, initiative_id, event_date, status').single()
      if (error) { flash('Error creating event: ' + error.message); return }
      setPanels(prev => prev.map(p =>
        p.initiative.id === initiativeId && p.type === 'regular'
          ? { ...p, event: newEvt, signups: [] }
          : p
      ))
      flash('Event created for selected date!')
      return
    }
    const { error } = await supabase.from('events').update({ event_date: newDate }).eq('id', eventId)
    if (error) { flash('Error updating date: ' + error.message); return }
    setPanels(prev => prev.map(p =>
      p.initiative.id === initiativeId && p.type === 'regular' && p.event?.id === eventId
        ? { ...p, event: { ...p.event, event_date: newDate } }
        : p
    ))
    flash('Date updated!')
  }

  // Confirm: deactivate initiative + delete this week's events
  const confirmDeletePanel = async () => {
    if (!pendingDelete) return
    const { initiativeId, eventIds } = pendingDelete
    for (const eid of (eventIds ?? [])) {
      await supabase.from('event_signups').delete().eq('event_id', eid)
      await supabase.from('events').delete().eq('id', eid)
    }
    await supabase.from('initiatives').update({ is_active: false }).eq('id', initiativeId)
    setPanels(prev => prev.filter(p => p.initiative.id !== initiativeId))
    setPendingDelete(null)
    flash('Event removed from schedule.')
  }

  // Add a brand-new initiative + first event
  const handleAddEvent = async () => {
    if (!addForm.name.trim() || !addForm.date) return
    setAddBusy(true)
    const dow = addForm.isDaily ? 'Daily' : (addForm.dayOfWeek || null)
    const { data: newInit, error: initErr } = await supabase
      .from('initiatives')
      .insert({
        name: addForm.name.trim(),
        is_active: true,
        is_recurring: addForm.isRecurring,
        day_of_week: dow,
        optimal_seats: parseInt(addForm.optimalSeats) || 2,
        max_seats: parseInt(addForm.maxSeats) || 4,
      })
      .select().single()
    if (initErr) { flash('Error: ' + initErr.message); setAddBusy(false); return }

    const { data: newEvt, error: evtErr } = await supabase
      .from('events')
      .insert({ initiative_id: newInit.id, event_date: addForm.date, status: 'open' })
      .select('id, initiative_id, event_date, status').single()
    if (evtErr) { flash('Error: ' + evtErr.message); setAddBusy(false); return }

    setPanels(prev => [...prev, { initiative: newInit, type: 'regular', event: newEvt, signups: [] }])
    setAddOpen(false)
    setAddForm({ name: '', date: '', dayOfWeek: '', optimalSeats: '2', maxSeats: '4', isRecurring: false, isDaily: false })
    setAddBusy(false)
    flash(`"${newInit.name}" added!`)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredVols = filterTag === 'all'
    ? volunteers
    : volunteers.filter(v => (v.skills ?? '').split(',').includes(filterTag))

  const totalAssigned = panels.reduce((n, p) => {
    if (p.type === 'daily') return n + p.slots.reduce((nn, s) => nn + s.signups.length, 0)
    return n + (p.signups?.length ?? 0)
  }, 0)
  const totalConfirmed = panels.reduce((n, p) => {
    if (p.type === 'daily') return n + p.slots.reduce((nn, s) => nn + s.signups.filter(sg => sg.confirmed).length, 0)
    return n + (p.signups ?? []).filter(s => s.confirmed).length
  }, 0)
  const slotsNeeded = panels.reduce((n, p) => {
    if (p.type === 'daily') return n + p.slots.reduce((nn, s) => nn + Math.max(0, p.initiative.optimal_seats - s.signups.length), 0)
    return n + Math.max(0, p.initiative.optimal_seats - (p.signups?.length ?? 0))
  }, 0)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Toast banner */}
      {banner && (
        <div className={`fixed top-4 right-4 z-50 text-white text-sm px-4 py-2 rounded-lg
                         shadow-lg flex items-center gap-2
                         ${banner.startsWith('Error') ? 'bg-red-500' : 'bg-brand-600'}`}>
          <CheckCircle size={14} /> {banner}
        </div>
      )}

      {/* ── Delete confirmation modal ────────────────────────────────── */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Remove from Schedule?</h3>
            <p className="text-sm text-gray-700 mb-1">
              <strong>{pendingDelete.label}</strong> will be removed from the schedule.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              This deletes this week's event(s) and deactivates the initiative so it won't
              reappear in future weeks. All volunteer assignments for this event will be removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPendingDelete(null)}
                className="btn-secondary text-sm px-4 py-2">No, Keep It</button>
              <button onClick={confirmDeletePanel}
                className="text-sm px-4 py-2 rounded-lg bg-red-600 text-white font-semibold
                           hover:bg-red-700 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Volunteer Scheduling</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setAddOpen(v => !v)}
            className="btn-primary text-sm px-3 py-2 flex items-center gap-1.5">
            <Plus size={14} /> Add Event
          </button>
          <button onClick={() => setRefreshKey(k => k + 1)}
            className="btn-secondary text-sm px-3 py-2 flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        Drag a volunteer from the roster into an activity slot. Use the date picker on each
        panel to adjust the event date. Click the circle on a chip to toggle confirmed status.
      </p>

      {/* ── Add Event form ───────────────────────────────────────────── */}
      {addOpen && (
        <div className="mb-6 p-5 rounded-xl border-2 border-brand-300 bg-brand-50/40">
          <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-brand-600" /> New Scheduled Event
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Event Name *</label>
              <input type="text" value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. West Side Fridge Cleaning"
                className="form-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Date *</label>
              <input type="date" value={addForm.date}
                onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))}
                className="form-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Optimal Seats</label>
              <input type="number" min="1" max="20" value={addForm.optimalSeats}
                onChange={e => setAddForm(f => ({ ...f, optimalSeats: e.target.value }))}
                className="form-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Max Seats</label>
              <input type="number" min="1" max="20" value={addForm.maxSeats}
                onChange={e => setAddForm(f => ({ ...f, maxSeats: e.target.value }))}
                className="form-input text-sm w-full" />
            </div>
            <div className="col-span-2 flex items-center gap-4 flex-wrap pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input type="checkbox" checked={addForm.isRecurring}
                  onChange={e => setAddForm(f => ({ ...f, isRecurring: e.target.checked, isDaily: e.target.checked ? f.isDaily : false }))}
                  className="rounded" />
                Recurring (repeat weekly)
              </label>
              {addForm.isRecurring && (
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input type="checkbox" checked={addForm.isDaily}
                    onChange={e => setAddForm(f => ({ ...f, isDaily: e.target.checked }))}
                    className="rounded" />
                  Daily (all 7 days)
                </label>
              )}
              {addForm.isRecurring && !addForm.isDaily && (
                <select value={addForm.dayOfWeek}
                  onChange={e => setAddForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                  className="form-input text-sm py-1.5">
                  <option value="">Select recurring day…</option>
                  {Object.keys(DAY_TO_OFFSET).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAddOpen(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            <button onClick={handleAddEvent}
              disabled={addBusy || !addForm.name.trim() || !addForm.date}
              className="btn-primary text-sm px-4 py-2 disabled:opacity-50 flex items-center gap-1.5">
              {addBusy ? 'Adding…' : <><Plus size={13} /> Add Event</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Week navigation ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => setWeekStr(s => shiftDays(s, -7))}
          className="btn-secondary text-sm px-3 py-2">← Prev</button>
        <span className="font-bold text-gray-800 text-sm min-w-[210px] text-center px-2">
          Week of {fmtWeekRange(weekStr)}
        </span>
        <button onClick={() => setWeekStr(s => shiftDays(s, 7))}
          className="btn-secondary text-sm px-3 py-2">Next →</button>
        <button onClick={() => setWeekStr(getMondayISO(new Date()))}
          className="btn-secondary text-sm px-3 py-2 ml-1">This Week</button>

        {/* Summary pills */}
        {!loading && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <span className="text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-semibold">
              {totalAssigned} assigned
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
              {totalConfirmed} confirmed
            </span>
            {slotsNeeded > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-semibold">
                {slotsNeeded} slots needed
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-20">Loading schedule…</p>
      ) : (
        <div className="flex gap-6 items-start">

          {/* ══ Left: volunteer roster ════════════════════════════════ */}
          <div className="w-52 flex-shrink-0 sticky top-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Roster</p>
              <span className="text-xs text-gray-400 font-mono tabular-nums">
                {filteredVols.length}/{volunteers.length}
              </span>
            </div>
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
              className="form-input text-xs py-1.5 mb-3">
              <option value="all">All skills</option>
              {Object.entries(ALL_SKILL_TAGS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-0.5">
              {filteredVols.map(v => {
                const tags = (v.skills ?? '').split(',').filter(Boolean)
                return (
                  <div key={v.id}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('volunteerId', String(v.id))
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="p-2.5 rounded-lg border border-gray-200 bg-white
                               cursor-grab active:cursor-grabbing
                               hover:border-brand-400 hover:shadow-sm
                               transition-all select-none"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{v.name}</p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags.slice(0, 2).map(t => (
                          <span key={t}
                            className="text-xs bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full leading-none">
                            {ALL_SKILL_TAGS[t]?.replace(/^\S+\s/, '') ?? t}
                          </span>
                        ))}
                        {tags.length > 2 && <span className="text-xs text-gray-400">+{tags.length - 2}</span>}
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredVols.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No volunteers match this filter.</p>
              )}
            </div>
          </div>

          {/* ══ Right: activity panels ════════════════════════════════ */}
          <div className="flex-1 space-y-4 min-w-0">
            {panels.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-10">
                No activities found. Click <strong>Add Event</strong> to create one.
              </p>
            )}

            {panels.map(panel => {
              const { initiative: init } = panel

              /* ── Daily panel (compact 7-day grid) ─────────────────── */
              if (panel.type === 'daily') {
                const allSignups  = panel.slots.flatMap(s => s.signups)
                const allConfirmed = allSignups.filter(s => s.confirmed)
                const totalFilled  = allSignups.length
                const totalOptimal = init.optimal_seats * 7
                const pct = totalOptimal > 0 ? totalFilled / totalOptimal : 0
                const sc = pct >= 1
                  ? { border: 'border-green-300',  bg: 'bg-green-50/40',  hdr: 'bg-green-100/70',  badge: 'bg-green-200 text-green-800',   label: 'Filled' }
                  : pct >= 0.5
                  ? { border: 'border-yellow-300', bg: 'bg-yellow-50/40', hdr: 'bg-yellow-100/70', badge: 'bg-yellow-200 text-yellow-800', label: 'Partial' }
                  : { border: 'border-red-200',    bg: 'bg-red-50/30',    hdr: 'bg-red-100/60',    badge: 'bg-red-200 text-red-800',       label: 'Needs Volunteers' }
                const allEventIds = panel.slots.map(s => s.event?.id).filter(Boolean)

                return (
                  <div key={init.id} className={`rounded-xl border-2 transition-colors ${sc.border} ${sc.bg}`}>
                    {/* Header */}
                    <div className={`px-4 py-3 rounded-t-xl flex items-center justify-between gap-3 ${sc.hdr}`}>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight">{init.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Daily · {totalFilled}/{totalOptimal} filled · {allConfirmed.length} confirmed
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.badge}`}>
                          {sc.label}
                        </span>
                        {/* Delete X */}
                        <button
                          onClick={() => setPendingDelete({ initiativeId: init.id, eventIds: allEventIds, label: init.name })}
                          title="Remove from schedule"
                          className="w-6 h-6 flex items-center justify-center rounded-full
                                     bg-white/70 text-gray-400 hover:bg-red-50 hover:text-red-500
                                     transition-colors font-bold text-base leading-none flex-shrink-0">
                          ×
                        </button>
                      </div>
                    </div>

                    {/* 7-day grid */}
                    <div className="p-3 grid grid-cols-7 gap-2">
                      {panel.slots.map((slot, slotIdx) => {
                        const slotMax  = init.max_seats ?? init.optimal_seats
                        const slotFull = slot.signups.length >= slotMax
                        return (
                          <div key={slot.d}
                            className={`rounded-lg border p-1.5 min-h-[90px] flex flex-col gap-1
                                        ${slotFull ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white/70'}`}>
                            <p className="text-xs font-bold text-gray-600 text-center">{SHORT_DAYS[slot.d]}</p>
                            <p className="text-xs text-gray-400 text-center leading-none mb-0.5">
                              {new Date(slot.date + 'T12:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                            </p>
                            {/* Volunteer chips */}
                            {slot.signups.map(s => (
                              <div key={s.id}
                                className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full text-xs border
                                            ${s.confirmed ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}>
                                <button
                                  onClick={() => handleToggleConfirm(init.id, s, slotIdx)}
                                  className={`w-3 h-3 rounded-full border flex-shrink-0 flex items-center justify-center transition-all
                                              ${s.confirmed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-brand-500 bg-white'}`}>
                                  {s.confirmed && <Check size={7} strokeWidth={3} />}
                                </button>
                                <span className="truncate max-w-[38px] text-xs leading-none">
                                  {s.volunteer?.name?.split(' ')[0] ?? '?'}
                                </span>
                                <button
                                  onClick={() => handleRemove(init.id, s.id, s.volunteer?.name ?? 'Volunteer', slotIdx)}
                                  className="ml-auto text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                                  <Trash2 size={8} />
                                </button>
                              </div>
                            ))}
                            {/* Drop zone */}
                            {!slotFull && slot.event && (
                              <div
                                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
                                onDragEnter={e => { e.preventDefault(); e.currentTarget.classList.add('border-brand-400', 'bg-brand-50') }}
                                onDragLeave={e => { e.currentTarget.classList.remove('border-brand-400', 'bg-brand-50') }}
                                onDrop={e => {
                                  e.currentTarget.classList.remove('border-brand-400', 'bg-brand-50')
                                  const vid = parseInt(e.dataTransfer.getData('volunteerId'), 10)
                                  if (vid) handleAssignDailySlot(init.id, slotIdx, vid, slot.event.id)
                                }}
                                className="mt-auto text-center text-xs border border-dashed border-gray-300
                                           text-gray-400 rounded py-1 transition-all cursor-copy select-none">
                                + Drop
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              /* ── Regular panel ─────────────────────────────────────── */
              const { event, signups } = panel
              const filled    = signups?.length ?? 0
              const optimal   = init.optimal_seats
              const maxSeats  = init.max_seats ?? optimal
              const pct       = optimal > 0 ? filled / optimal : 0
              const isFull    = filled >= maxSeats
              const confirmed  = (signups ?? []).filter(s => s.confirmed)
              const unconfirmed = (signups ?? []).filter(s => !s.confirmed)

              const sc = isFull
                ? { border: 'border-green-300',  bg: 'bg-green-50/40',  hdr: 'bg-green-100/70',  badge: 'bg-green-200 text-green-800',   label: 'Filled' }
                : pct >= 0.6
                ? { border: 'border-yellow-300', bg: 'bg-yellow-50/40', hdr: 'bg-yellow-100/70', badge: 'bg-yellow-200 text-yellow-800', label: 'Almost Full' }
                : { border: 'border-red-200',    bg: 'bg-red-50/30',    hdr: 'bg-red-100/60',    badge: 'bg-red-200 text-red-800',       label: 'Needs Volunteers' }

              // Default date: calculated from day_of_week; falls back to weekStr (Monday)
              const defaultDate = shiftDays(weekStr, DAY_TO_OFFSET[init.day_of_week] ?? 0)
              const panelDate   = event?.event_date ?? defaultDate

              return (
                <div key={init.id}
                  className={`rounded-xl border-2 transition-colors ${sc.border} ${sc.bg}`}>

                  {/* Panel header */}
                  <div className={`px-4 py-3 rounded-t-xl flex items-start justify-between gap-3 ${sc.hdr}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm leading-tight">{init.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Date picker */}
                        <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                          <Calendar size={11} className="flex-shrink-0" />
                          <input
                            type="date"
                            value={panelDate}
                            onChange={e => handleChangeDate(init.id, event?.id ?? null, e.target.value)}
                            className="text-xs border-0 bg-transparent text-gray-600
                                       focus:outline-none focus:ring-1 focus:ring-brand-400
                                       rounded px-0.5 cursor-pointer"
                          />
                        </label>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{filled}/{optimal} optimal · max {maxSeats}</span>
                        {confirmed.length > 0 && (
                          <span className="text-green-700 font-semibold text-xs flex items-center gap-1">
                            <Check size={10} /> {confirmed.length} confirmed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                      {unconfirmed.length > 0 && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                          {unconfirmed.length} unconfirmed
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.badge}`}>
                        {sc.label}
                      </span>
                      {/* Delete X */}
                      <button
                        onClick={() => setPendingDelete({
                          initiativeId: init.id,
                          eventIds: event ? [event.id] : [],
                          label: init.name,
                        })}
                        title="Remove from schedule"
                        className="w-6 h-6 flex items-center justify-center rounded-full
                                   bg-white/70 text-gray-400 hover:bg-red-50 hover:text-red-500
                                   transition-colors font-bold text-base leading-none flex-shrink-0">
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Slots body */}
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 min-h-[44px] items-start">
                      {/* Assigned volunteer chips */}
                      {(signups ?? []).map(s => (
                        <div key={s.id}
                          className={`inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full
                                      text-xs font-semibold border transition-all ${
                            s.confirmed
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-white border-gray-300 text-gray-700'
                          }`}>
                          {/* Confirmation toggle */}
                          <button
                            onClick={() => handleToggleConfirm(init.id, s)}
                            title={s.confirmed ? 'Mark as not confirmed' : 'Mark as confirmed'}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                        flex-shrink-0 transition-all ${
                              s.confirmed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-brand-500 bg-white'
                            }`}>
                            {s.confirmed && <Check size={9} strokeWidth={3} />}
                          </button>
                          <span className="truncate max-w-[110px]">{s.volunteer?.name ?? 'Unknown'}</span>
                          {s.volunteer?.phone && (
                            <a href={`tel:${s.volunteer.phone}`} onClick={e => e.stopPropagation()}
                              title={`Call ${s.volunteer.name}`}
                              className="text-gray-400 hover:text-brand-600 transition-colors flex-shrink-0">
                              <Phone size={10} />
                            </a>
                          )}
                          {s.volunteer?.email && (
                            <a href={`mailto:${s.volunteer.email}`} onClick={e => e.stopPropagation()}
                              title={`Email ${s.volunteer.name}`}
                              className="text-gray-400 hover:text-brand-600 transition-colors flex-shrink-0">
                              <Mail size={10} />
                            </a>
                          )}
                          <button
                            onClick={() => handleRemove(init.id, s.id, s.volunteer?.name ?? 'Volunteer')}
                            title="Remove from slot"
                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 ml-0.5">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}

                      {/* Drop zone — always shown when not full; auto-creates event if needed */}
                      {!isFull && (
                        <div
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
                          onDragEnter={e => {
                            e.preventDefault()
                            e.currentTarget.classList.add('border-brand-400', 'bg-brand-50', 'text-brand-600')
                          }}
                          onDragLeave={e => {
                            e.currentTarget.classList.remove('border-brand-400', 'bg-brand-50', 'text-brand-600')
                          }}
                          onDrop={e => {
                            e.currentTarget.classList.remove('border-brand-400', 'bg-brand-50', 'text-brand-600')
                            const vid = parseInt(e.dataTransfer.getData('volunteerId'), 10)
                            if (vid) handleAssign(init.id, vid, { eventId: event?.id, fallbackDate: panelDate })
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                     text-xs border-2 border-dashed border-gray-300 text-gray-400
                                     transition-all cursor-copy select-none">
                          <Plus size={11} /> Drop volunteer here
                        </div>
                      )}
                    </div>

                    {/* Outreach section — unconfirmed volunteers */}
                    {unconfirmed.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Outreach needed — {unconfirmed.length} volunteer{unconfirmed.length !== 1 ? 's' : ''} not yet confirmed
                        </p>
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                          {unconfirmed.map(s => (
                            <div key={s.id} className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-gray-800">{s.volunteer?.name}</span>
                              {s.volunteer?.phone && (
                                <a href={`tel:${s.volunteer.phone}`}
                                  className="inline-flex items-center gap-1 bg-amber-200 text-amber-900
                                             px-2 py-0.5 rounded-full hover:bg-amber-300 transition-colors">
                                  <Phone size={10} /> {s.volunteer.phone}
                                </a>
                              )}
                              {s.volunteer?.email && (
                                <a href={`mailto:${s.volunteer.email}`}
                                  className="inline-flex items-center gap-1 bg-amber-200 text-amber-900
                                             px-2 py-0.5 rounded-full hover:bg-amber-300 transition-colors">
                                  <Mail size={10} /> Email
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      )}
    </div>
  )
}

// ─── COMMUNITY PARTNERS TAB ───────────────────────────────────────────────────
function PartnersTab({ content, onChange }) {
  const [newName, setNewName] = useState('')
  const partners = content.partners ?? []

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    onChange({ ...content, partners: [...partners, trimmed] })
    setNewName('')
  }

  const handleDelete = (i) => {
    onChange({ ...content, partners: partners.filter((_, idx) => idx !== i) })
  }

  const handleMoveUp = (i) => {
    if (i === 0) return
    const next = [...partners]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    onChange({ ...content, partners: next })
  }

  const handleMoveDown = (i) => {
    if (i === partners.length - 1) return
    const next = [...partners]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    onChange({ ...content, partners: next })
  }

  const handleReset = () => {
    if (!window.confirm('Reset partners to the original defaults?')) return
    onChange({ ...content, partners: [...COMMUNITY_PARTNERS] })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Community Partners</h2>
        <button onClick={handleReset}
          className="btn-secondary text-sm px-3 py-2 flex items-center gap-1.5">
          <RefreshCw size={13} /> Reset Defaults
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Partners appear prominently on the Home page. Changes save automatically.
      </p>

      {/* Add new partner */}
      <div className="card mb-6 border-brand-300 bg-brand-50/30">
        <h3 className="font-bold text-base mb-3 text-gray-900">Add Partner</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Acme Community Bakery"
            className="form-input flex-1"
          />
          <button onClick={handleAdd} disabled={!newName.trim()}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50 flex-shrink-0">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Partner list */}
      <div className="space-y-2">
        {partners.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">
            No partners yet. Add one above!
          </p>
        )}
        {partners.map((name, i) => (
          <div key={i}
               className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
            <Heart size={16} className="text-brand-400 flex-shrink-0" />
            <span className="flex-1 text-sm font-semibold text-gray-800">{name}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => handleMoveUp(i)} disabled={i === 0} title="Move up"
                      className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50
                                 disabled:opacity-30 transition-all text-xs">
                ▲
              </button>
              <button onClick={() => handleMoveDown(i)} disabled={i === partners.length - 1}
                      title="Move down"
                      className="p-1.5 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50
                                 disabled:opacity-30 transition-all text-xs">
                ▼
              </button>
              <button onClick={() => handleDelete(i)} title="Remove"
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50
                                 transition-all">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {partners.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-right">
          {partners.length} partner{partners.length !== 1 ? 's' : ''} listed
        </p>
      )}
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
        {activeTab === 'members'   && <MembersTab />}
        {activeTab === 'lists'     && <ListsTab />}
        {activeTab === 'schedule'  && <SchedulingTab />}
        {activeTab === 'news'      && <NewsTab      content={content} onChange={setContent} />}
        {activeTab === 'slots'     && <SlotsTab     content={content} onChange={setContent} />}
        {activeTab === 'fridges'   && <FridgesTab   content={content} onChange={setContent} />}
        {activeTab === 'images'    && <ImagesTab    content={content} onChange={setContent} />}
        {activeTab === 'pages'     && <PagesTab     content={content} onChange={setContent} />}
        {activeTab === 'partners'  && <PartnersTab  content={content} onChange={setContent} />}
      </main>
    </div>
  )
}
