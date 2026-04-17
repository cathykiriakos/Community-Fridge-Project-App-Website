/**
 * VolunteerDashboard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time volunteer slot availability dashboard.
 *
 * Data source: Supabase `initiatives` + `events` + `event_signups` for the
 * current week.  Falls back to static VOLUNTEER_SLOTS if Supabase is
 * unreachable or returns no data.
 *
 * Props:
 *   previewMode (bool) — if true, shows first 4 activities without day
 *                        headers (used on Home page).
 *   slots (array)      — admin-preview override; skips the Supabase fetch.
 *
 * Sort order: Daily → Monday → Tuesday → Wednesday → Thursday → Friday →
 *             Saturday → Sunday → Other (Mon–Fri spanning slots last).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react'
import { VOLUNTEER_SLOTS } from '../config/site.config'
import { supabase } from '../lib/supabase'

// ─── WEEK HELPERS ──────────────────────────────────────────────────────────────
function getMondayISO(date) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().split('T')[0]
}

function shiftDays(isoStr, n) {
  const d = new Date(isoStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function fmtWeekRange(mondayIso) {
  const opts = { month: 'short', day: 'numeric' }
  const mon = new Date(mondayIso + 'T12:00:00')
  const sun = new Date(shiftDays(mondayIso, 6) + 'T12:00:00')
  return `${mon.toLocaleDateString('en-US', opts)} – ${sun.toLocaleDateString('en-US', opts)}`
}

function fmtDayDate(mondayIso, offset) {
  const d = new Date(shiftDays(mondayIso, offset) + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

// ─── DAY SORT ORDER ────────────────────────────────────────────────────────────
// Daily slots sort to Monday's position so they lead each week view.
const DAY_ORDER = {
  'Daily':     0,
  'Monday':    1,
  'Tuesday':   2,
  'Wednesday': 3,
  'Thursday':  4,
  'Friday':    5,
  'Saturday':  6,
  'Sunday':    7,
  'Mon–Fri':   8,
}

function getDayOrder(day) {
  return DAY_ORDER[day] ?? 9
}

// ─── ICON INFERENCE ────────────────────────────────────────────────────────────
function getIcon(name) {
  const n = (name ?? '').toLowerCase()
  if (n.includes('clean'))                            return '🧹'
  if (n.includes('lunch') || n.includes('sack'))      return '🥪'
  if (n.includes('grocer') || n.includes('shop'))     return '🛒'
  if (n.includes('tovala') || n.includes('recovery')) return '🚗'
  if (n.includes('driv'))                             return '🚐'
  return '🤝'
}

// ─── STATUS LOGIC ─────────────────────────────────────────────────────────────
function getSlotStatus(slot) {
  const pct = slot.optimal > 0 ? slot.filled / slot.optimal : 0
  if (slot.filled >= slot.max)     return 'full'
  if (slot.filled >= slot.optimal) return 'good'
  if (pct >= 0.6)                  return 'warning'
  return 'open'
}

const STATUS_META = {
  full: {
    label: 'Full',
    badgeClass: 'bg-red-100 text-red-700',
    cardClass:  'slot-card-full',
    barClass:   'bg-red-500',
    emoji:      '🔴',
  },
  good: {
    label: 'Filled',
    badgeClass: 'bg-brand-100 text-brand-700',
    cardClass:  'slot-card-good',
    barClass:   'bg-brand-500',
    emoji:      '✅',
  },
  warning: {
    label: 'A Few Spots Left',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    cardClass:  'slot-card-warning',
    barClass:   'bg-yellow-500',
    emoji:      '🟡',
  },
  open: {
    label: 'Needs Volunteers',
    badgeClass: 'bg-brand-100 text-brand-600',
    cardClass:  'slot-card-open',
    barClass:   'bg-brand-400',
    emoji:      '🟢',
  },
}

// ─── FILL BAR ──────────────────────────────────────────────────────────────────
function FillBar({ filled, max, barClass }) {
  const pct = Math.min(max > 0 ? (filled / max) * 100 : 0, 100)
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mt-3">
      <div
        className={`${barClass} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${filled} of ${max} slots filled`}
      />
    </div>
  )
}

// ─── SLOT CARD ─────────────────────────────────────────────────────────────────
function SlotCard({ slot }) {
  const status = getSlotStatus(slot)
  const meta   = STATUS_META[status]
  const open   = slot.max - slot.filled

  return (
    <div className={`slot-card ${meta.cardClass}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">
            {slot.icon}
          </span>
          <h4 className="font-bold text-gray-900 text-base leading-snug truncate">
            {slot.activity}
          </h4>
        </div>
        <span className={`${meta.badgeClass} text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap`}>
          {meta.emoji} {meta.label}
        </span>
      </div>

      {/* Day label — only shown in preview/flat mode */}
      {slot._showDay && (
        <p className="text-xs text-gray-500 font-medium mb-2 ml-9">
          📅 {slot.day}
        </p>
      )}

      {/* Notes */}
      {slot.notes && (
        <p className="text-xs text-gray-600 mb-3 ml-9 leading-relaxed italic">
          {slot.notes}
        </p>
      )}

      {/* Progress */}
      <div className="ml-9">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>{slot.filled} / {slot.optimal} volunteers</span>
          <span className="font-bold text-gray-700">
            {status === 'full'
              ? 'No spots available'
              : `${open} spot${open !== 1 ? 's' : ''} open`}
          </span>
        </div>
        <FillBar filled={slot.filled} max={slot.optimal} barClass={meta.barClass} />
      </div>
    </div>
  )
}

// ─── LEGEND ────────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center text-xs font-medium text-gray-600 mb-8">
      {Object.entries(STATUS_META).map(([key, meta]) => (
        <span key={key} className={`${meta.badgeClass} px-3 py-1.5 rounded-full`}>
          {meta.emoji} {meta.label}
        </span>
      ))}
    </div>
  )
}

// ─── SUMMARY BAR ───────────────────────────────────────────────────────────────
function SummaryBar({ slots }) {
  const full  = slots.filter(s => getSlotStatus(s) === 'full').length
  const open  = slots.filter(s => ['open', 'warning'].includes(getSlotStatus(s))).length
  const total = slots.length

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-8
                    flex flex-wrap gap-6 items-center justify-center md:justify-start">
      <div className="text-center">
        <p className="text-3xl font-extrabold text-brand-600">{total}</p>
        <p className="text-xs text-gray-500 font-medium">Activities</p>
      </div>
      <div className="w-px h-10 bg-brand-200 hidden md:block" />
      <div className="text-center">
        <p className="text-3xl font-extrabold text-green-600">{total - full}</p>
        <p className="text-xs text-gray-500 font-medium">Accepting Volunteers</p>
      </div>
      <div className="w-px h-10 bg-brand-200 hidden md:block" />
      <div className="text-center">
        <p className="text-3xl font-extrabold text-yellow-600">{open}</p>
        <p className="text-xs text-gray-500 font-medium">Urgently Needed</p>
      </div>
      <div className="w-px h-10 bg-brand-200 hidden md:block" />
      <div className="text-center">
        <p className="text-3xl font-extrabold text-red-500">{full}</p>
        <p className="text-xs text-gray-500 font-medium">Fully Staffed</p>
      </div>
    </div>
  )
}

// ─── DAY SECTION HEADER ────────────────────────────────────────────────────────
function DayHeader({ day, dateLabel }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-2">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
        📅 {dateLabel ?? day}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function VolunteerDashboard({ previewMode = false, slots: propSlots }) {
  const [liveSlots, setLiveSlots] = useState(null)   // null = not yet loaded
  const [loading,   setLoading]   = useState(!propSlots)
  const [mondayISO, setMondayISO] = useState(() => getMondayISO(new Date()))

  // Fetch live data from Supabase unless admin is passing propSlots (preview mode)
  useEffect(() => {
    if (propSlots) return   // admin preview: skip fetch
    let cancelled = false

    async function loadLiveData() {
      setLoading(true)
      const monday = getMondayISO(new Date())
      const sunday = shiftDays(monday, 6)
      setMondayISO(monday)

      try {
        // Fetch all active initiatives
        const { data: inits } = await supabase
          .from('initiatives')
          .select('id, name, day_of_week, optimal_seats, max_seats, is_recurring')
          .eq('is_active', true)
        if (cancelled || !inits?.length) { setLoading(false); return }

        const initIds = inits.map(i => i.id)

        // Fetch this week's events
        const { data: events } = await supabase
          .from('events')
          .select('id, initiative_id, event_date')
          .gte('event_date', monday)
          .lte('event_date', sunday)
          .in('initiative_id', initIds)
          .neq('status', 'cancelled')
        if (cancelled) return

        const evtIds = (events ?? []).map(e => e.id)

        // Count active signups per event
        const signupCounts = {}
        if (evtIds.length) {
          const { data: signups } = await supabase
            .from('event_signups')
            .select('event_id')
            .in('event_id', evtIds)
            .eq('status', 'active')
          if (cancelled) return
          ;(signups ?? []).forEach(s => {
            signupCounts[s.event_id] = (signupCounts[s.event_id] ?? 0) + 1
          })
        }

        // Group events by initiative
        const evtsByInit = {}
        ;(events ?? []).forEach(e => {
          if (!evtsByInit[e.initiative_id]) evtsByInit[e.initiative_id] = []
          evtsByInit[e.initiative_id].push(e)
        })

        // Build one slot per initiative (aggregating daily events)
        const built = inits.map(init => {
          const isDaily  = init.day_of_week === 'Daily'
          const initEvts = (evtsByInit[init.id] ?? []).sort((a, b) => a.event_date.localeCompare(b.event_date))
          const filled   = initEvts.reduce((n, e) => n + (signupCounts[e.id] ?? 0), 0)
          const days     = isDaily ? 7 : 1
          return {
            id:       String(init.id),
            activity: init.name,
            day:      init.day_of_week ?? 'Other',
            optimal:  (init.optimal_seats ?? 1) * days,
            max:      (init.max_seats ?? init.optimal_seats ?? 1) * days,
            filled,
            icon:     getIcon(init.name),
            notes:    '',
          }
        })

        if (!cancelled) { setLiveSlots(built); setLoading(false) }
      } catch (_) {
        // Silently fall back to static slots on any error
        if (!cancelled) setLoading(false)
      }
    }

    loadLiveData()
    return () => { cancelled = true }
  }, [propSlots])

  // Decide which slots to display
  const rawSlots = propSlots ?? liveSlots ?? VOLUNTEER_SLOTS

  // Sort chronologically: Daily → Mon → Tue → … → Other
  const sorted = [...rawSlots].sort((a, b) => getDayOrder(a.day) - getDayOrder(b.day))

  // ── Preview mode (Home page): flat list, first 4 cards ──────────────────
  if (previewMode) {
    const preview = sorted.slice(0, 4).map(s => ({ ...s, _showDay: true }))
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {preview.map(slot => <SlotCard key={slot.id} slot={slot} />)}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4 italic">
          📊 Slot availability reflects live volunteer sign-ups this week.
        </p>
      </div>
    )
  }

  // ── Full view (Volunteer page): grouped by day ───────────────────────────
  // Build ordered day groups
  const groupMap = new Map()
  for (const slot of sorted) {
    const key = slot.day
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key).push(slot)
  }
  const groups = [...groupMap.entries()] // already in sorted order

  // Map day name → friendly label with date
  const DAY_TO_OFFSET = {
    Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
    Friday: 4, Saturday: 5, Sunday: 6,
  }

  function dayLabel(day) {
    if (day === 'Daily')   return 'Daily — All Week'
    if (day === 'Mon–Fri') return 'Mon – Fri'
    const offset = DAY_TO_OFFSET[day]
    if (offset !== undefined) return fmtDayDate(mondayISO, offset)
    return day
  }

  return (
    <div>
      {/* Week context header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
          This Week
        </span>
        <span className="text-xs text-gray-500">{fmtWeekRange(mondayISO)}</span>
        {loading && (
          <span className="text-xs text-gray-400 italic ml-auto">Loading live data…</span>
        )}
        {!loading && liveSlots && (
          <span className="text-xs text-green-600 font-semibold ml-auto flex items-center gap-1">
            ● Live
          </span>
        )}
      </div>

      <SummaryBar slots={rawSlots} />
      <Legend />

      {/* Day-grouped activity sections */}
      <div className="space-y-6">
        {groups.map(([day, slots]) => (
          <section key={day}>
            <DayHeader day={day} dateLabel={dayLabel(day)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {slots.map(slot => <SlotCard key={slot.id} slot={slot} />)}
            </div>
          </section>
        ))}

        {groups.length === 0 && !loading && (
          <p className="text-center text-gray-400 text-sm py-10 italic">
            No volunteer activities scheduled this week.
          </p>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8 italic">
        📊 Slot availability reflects live volunteer sign-ups this week.
        Contact Karen to sign up for a volunteer slot.
      </p>
    </div>
  )
}
