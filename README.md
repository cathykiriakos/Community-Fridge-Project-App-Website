# Community Fridge Project — Full Stack Documentation

A dual-application platform for the Community Fridge Project serving Oak Park, IL and Austin, Chicago, IL. The repository contains two independent but connected applications that share the same Supabase database.

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Architecture Overview](#architecture-overview)
3. [Supabase Database](#supabase-database)
4. [Public Website (`cfp_website`)](#public-website-cfp_website)
   - [Tech Stack](#website-tech-stack)
   - [Pages](#website-pages)
   - [Admin CMS Portal](#admin-cms-portal)
   - [Content System](#content-system-how-edits-propagate)
   - [Supabase Integration](#website-supabase-integration)
   - [Local Development](#website-local-development)
   - [Deployment (Netlify)](#deployment-netlify)
5. [Admin App (`cfp_app`)](#admin-app-cfp_app)
   - [Tech Stack](#admin-app-tech-stack)
   - [Pages](#admin-app-pages)
   - [Data Layer](#data-layer)
   - [Local Development](#admin-app-local-development)
6. [Common Edits & How-Tos](#common-edits--how-tos)
7. [Troubleshooting](#troubleshooting)

---

## Repository Structure

```
Community-Fridge-Project-App-Website-1/
│
├── cfp_website/                  # Public React website (Netlify)
│   ├── src/
│   │   ├── config/
│   │   │   └── site.config.js   # ★ Single source of truth for all content
│   │   ├── lib/
│   │   │   └── supabase.js      # Supabase JS client (anon key)
│   │   ├── hooks/
│   │   │   └── useContent.js    # Merges config defaults + admin CMS + live DB
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Volunteer.jsx
│   │   │   ├── Donate.jsx
│   │   │   ├── News.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Admin.jsx        # Password-protected CMS portal
│   │   │   └── NotFound.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Persistent header + footer wrapper
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── VolunteerDashboard.jsx  # Slot availability cards
│   │   │   └── PageImageSidebar.jsx   # Per-page image sidebar
│   │   ├── App.jsx              # React Router route definitions
│   │   └── main.jsx             # Vite entry point
│   ├── public/
│   │   └── images/
│   │       └── cfp-banner.png   # Hero banner image
│   ├── package.json
│   └── vite.config.js
│
├── cfp_app/                      # Internal Streamlit admin app
│   ├── app.py                   # ★ Main dashboard entry point
│   ├── utils.py                 # All database access functions
│   ├── config.py                # App settings and label maps
│   ├── supabase_client.py       # Supabase Python client (service role)
│   ├── requirements.txt
│   ├── pages/
│   │   ├── 1_👥_Manage_Volunteers.py
│   │   ├── 2_📅_Events.py
│   │   └── 3_💰_Donor_CRM.py
│   └── .streamlit/
│       └── secrets.toml         # ★ Secret keys — never commit (gitignored)
│
├── netlify.toml                  # Netlify build config
├── .gitignore
└── README.md
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Supabase (PostgreSQL)               │
│           Project: jpjmfxxjwoklcbrsrpqk              │
│   10 tables + vw_event_capacity view + RLS policies  │
└───────────────────┬─────────────────┬───────────────┘
                    │                 │
          anon key  │                 │  service role key
        (read-only) │                 │  (full CRUD)
                    ▼                 ▼
        ┌──────────────────┐  ┌──────────────────────┐
        │  cfp_website     │  │  cfp_app             │
        │  React / Vite    │  │  Streamlit (Python)  │
        │  Netlify hosted  │  │  Run locally         │
        │  Public website  │  │  Internal admin      │
        └──────────────────┘  └──────────────────────┘
```

**Key principle:**
- The **public website** uses the **anon key** and can only read data (enforced by Row Level Security).
- The **admin app** uses the **service role key** which bypasses RLS and has full read/write access to all tables.
- Both apps point to the same Supabase project.

---

## Supabase Database

**Project URL:** `https://jpjmfxxjwoklcbrsrpqk.supabase.co`

### Tables

| Table | Purpose |
|---|---|
| `volunteers` | Volunteer roster — name, email, phone, active status, join date |
| `volunteer_tags` | Many-to-many: volunteer ↔ skill tags (e.g. `sack_lunch`, `delivery`) |
| `fridges` | Fridge locations — name, address, city, active status |
| `initiatives` | Recurring activity templates — type, day of week, seat counts, fridge |
| `events` | Individual event instances — date, status, links to an initiative |
| `event_signups` | Volunteer ↔ event sign-ups — skill role, confirmed status |
| `donors` | Donor CRM — name, org, type, contact dates |
| `outreach_log` | Log of admin outreach to volunteers for specific events |
| `food_recovery_contacts` | Partner orgs donating food (e.g. Tovala) |
| `school_contacts` | School contacts for food drives |

### View

| View | Purpose |
|---|---|
| `vw_event_capacity` | Joins events + initiatives + fridges + signup counts. Used by the dashboard to show fill rates without requiring the caller to have access to `event_signups` directly. |

`vw_event_capacity` returns: `event_id`, `event_date`, `status`, `initiative_name`, `initiative_type`, `optimal_seats`, `max_seats`, `seats_filled`, `seats_needed`, `fill_pct`, `fridge_name`, `fridge_address`

### Row Level Security

RLS is enabled on all 10 tables. Policies:

| Role | Tables | Access |
|---|---|---|
| `anon` | `fridges`, `volunteer_tags`, `initiatives`, `events`, `volunteers`, `donors` | SELECT only |
| `anon` | `event_signups`, `outreach_log`, `food_recovery_contacts`, `school_contacts` | No access |
| `authenticated` | All 10 tables | Full CRUD |
| Service role | All tables | Bypasses RLS entirely |

The `vw_event_capacity` view has `security_invoker = off`, meaning it runs as the view owner and can safely join `event_signups` without anon needing direct access to that table.

### Skill Tag Values

The following tag keys are used across both apps. They must match the `CHECK` constraint in the `volunteer_tags` table:

| Key | Display Label |
|---|---|
| `sack_lunch` | 🥪 Sack Lunch |
| `delivery` | 🚗 Delivery |
| `cleaning` | 🧹 Cleaning |
| `shopping` | 🛒 Shopping |
| `tovala_recovery` | ♻️ Tovala Recovery |
| `stocking` | 📦 Stocking |
| `advisory` | 🤝 Advisory Team |

To add a new skill tag: (1) add it to `SKILL_TAGS` in `cfp_app/config.py`, (2) add it to `SKILL_TAGS` in `cfp_website/src/config/site.config.js`, (3) update the `CHECK` constraint in Supabase via the SQL Editor.

---

## Public Website (`cfp_website`)

### Website Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Database | Supabase JS client v2 |
| Hosting | Netlify (auto-deploy on push to `main`) |

### Website Pages

All public pages share the persistent `Layout` component (header + footer). The Admin page has its own full-screen layout.

#### `/` — Home

- Hero banner image (`/images/cfp-banner.png`) with a green CTA strip
- **Impact stats bar** — 4 stats pulled live from Supabase on page load:
  - Stat 0: Active fridge count
  - Stat 1: Active volunteer count
  - Stat 2: Active donor count
  - Stat 3: Always `0` (Cost to Take Food)
- Mission statement section
- "How It Works" 3-step cards
- **Volunteer Dashboard preview** — shows the 4 most urgently needed slots, sorted by fill status
- Get Involved CTA grid

#### `/about` — About Us

- Team intro and "How It Started" story (2 paragraphs)
- Founder card (Karen)
- Advisory team summary
- Per-page image sidebar

#### `/volunteer` — Volunteer

- Gradient hero header
- **Full Volunteer Slot Dashboard** — all slots, sorted by urgency, with fill bars and status badges
- Role description cards (6 hardcoded roles)
- Sign-up CTA linking to `/contact`

#### `/donate` — Donate

- Donation headline and intro
- Monetary donation option cards (4 tiers: $10, $25, $50, $100)
- Food donation accepted items list
- Drop-off note and payment link (configurable in `site.config.js`)

#### `/news` — News & Events

- Grid of news/event cards, sorted by date descending
- Each card shows type badge, title, date, excerpt, and author
- Published/unpublished toggle controlled by admin

#### `/contact` — Contact

- Headline, intro, email address, response time
- All fields editable via the Admin CMS

#### `/admin` — Admin CMS Portal

Password-protected. See [Admin CMS Portal](#admin-cms-portal) below.

#### `/404` — Not Found

Catch-all route with a link back to home.

---

### Admin CMS Portal

**URL:** `/admin`
**Password:** Set in `site.config.js` → `ADMIN_CONFIG.password` (default: `cfp-admin-2026`)

The admin portal is a full single-page CMS that writes changes to `localStorage`. Changes propagate to all public pages in real time via the `useContent()` hook.

#### Admin Tabs

**Dashboard**
- Summary cards: total volunteers, total donors, active fridges, published posts
- Quick-access links to each admin section

**News & Events**
- Create, edit, delete news posts and events
- Toggle published/unpublished per post
- Fields: type (news/event), title, date, excerpt, body, author
- Preview links to the live `/news` page

**Volunteer Slots**
- Edit the `filled` / `optimal` / `max` seat counts for each activity slot
- Changes update the Volunteer Dashboard on the public site immediately
- Add new slots or delete existing ones
- Drag to reorder (GripVertical handle)

**Fridge Locations**
- Add, edit, delete fridge location cards
- Fields: name, neighborhood, address, Google Maps URL
- Changes update any page that renders fridge info

**Page Content**
- Edit all narrative text across every page:
  - Home: hero headline, hero subheadline, mission title, mission body, all 4 impact stat values and labels
  - About: team intro, story paragraphs (×2), founder name/role/bio
  - Donate: headline, intro, drop-off note
  - Contact: headline, intro, email, response time
- Upload per-page sidebar images (stored as base64 in localStorage)
- Live preview: changes reflect on public pages without page refresh

#### Changing the Admin Password

Open `cfp_website/src/config/site.config.js` and update:

```js
export const ADMIN_CONFIG = {
  password: 'your-new-password-here',
  ...
}
```

Rebuild and redeploy. The password is checked client-side only — do not store sensitive data behind this portal.

---

### Content System — How Edits Propagate

```
site.config.js (static defaults)
        ↓
useContent() hook
        ↓  on mount: fetches live Supabase counts → overwrites stat0/stat1/stat2
        ↓  merges localStorage admin overrides on top
        ↓
All public pages read from useContent()
        ↓
Admin saves → localStorage → window event → useContent() re-reads → pages update
```

**Priority order (lowest → highest):**
1. `site.config.js` static defaults
2. Live Supabase counts (impact stats only)
3. Admin CMS overrides stored in `localStorage`

This means:
- Every piece of text has a safe default in `site.config.js`
- Impact stat numbers are always live from the database
- Anything the admin edits in the CMS portal overrides both

---

### Website Supabase Integration

**File:** `cfp_website/src/lib/supabase.js`

Uses the **anon (public) key**. This key is visible in the browser — that is intentional and safe because Supabase Row Level Security ensures anon can only read the permitted tables and cannot write anything.

**`getImpactStats()`** in `site.config.js`:
- Fires 3 parallel `HEAD` requests (no rows returned, just counts)
- Queries `fridges`, `volunteers`, `donors` filtered by `is_active = true`
- Called once on mount in `useContent()`, result stored in `liveStats` state
- Silently falls back to static config values on network failure

---

### Website Local Development

**Prerequisites:** Node.js 18+

```bash
cd cfp_website
npm install          # first time only — also installs @supabase/supabase-js
npm run dev          # starts Vite dev server at http://localhost:5173
```

**Build for production:**
```bash
npm run build        # outputs to cfp_website/dist/
npm run preview      # preview the production build locally
```

**Key config files:**
- `vite.config.js` — Vite build settings
- `tailwind.config.js` — Tailwind theme (brand green: `#3BAA35`)
- `cfp_website/src/config/site.config.js` — all content defaults

---

### Deployment (Netlify)

Configured in `netlify.toml`:

```toml
[build]
  base    = "cfp_website"   # Netlify runs commands from here
  command = "npm run build"
  publish = "dist"          # Netlify serves this folder
```

**How to deploy:**
1. Push any commit to the `main` branch on GitHub
2. Netlify detects the push and runs `npm install && npm run build` automatically
3. The new build goes live in ~1–2 minutes

**React Router SPA routing:** A `_redirects` file in `cfp_website/public/` tells Netlify to serve `index.html` for all routes so client-side navigation works correctly.

---

## Admin App (`cfp_app`)

### Admin App Tech Stack

| Layer | Technology |
|---|---|
| Framework | Streamlit |
| Language | Python 3.11+ |
| Database | Supabase Python client v2 |
| Styling | Custom CSS injected via `st.markdown` |

### Admin App Pages

The app uses Streamlit's multipage structure. Pages are auto-discovered from the `pages/` folder.

#### Main Dashboard (`app.py`)

**Sidebar:**
- Live warning badge showing how many upcoming events still need volunteers
- Today's date
- Navigation links to all pages

**Action Bar:**
- **Generate This Week's Events** — creates event rows for all active recurring initiatives for the next 14 days. Safe to run multiple times (idempotent — duplicates are ignored).
- **Find Gaps & Outreach** — opens the gap analysis panel below

**This Week at a Glance (metrics row):**
- Events This Week / Fully Staffed / Events with Gaps / Open Seats / Volunteers Scheduled

**Upcoming Events (event cards):**
- Grouped by date
- Each card shows: initiative name, type, fridge, seats filled/optimal, status pill (Full / N needed)
- **View button** — expands an inline panel showing the signed-up volunteers for that event with a quick-add form

**Gap Analysis Panel** (shown after clicking "Find Gaps & Outreach"):
- Lists every event below its optimal seat count
- For each gap, shows volunteers who have the matching skill tag and are not yet signed up
- **Flag button** — logs an outreach record in `outreach_log` marking that the admin contacted this volunteer

**Volunteer Roster Snapshot:**
- Skill breakdown metrics (count per skill tag)
- Expandable full roster table

---

#### Page 1 — Manage Volunteers (`1_👥_Manage_Volunteers.py`)

Three tabs:

**Roster tab:**
- Toggle to show/hide inactive volunteers
- Filter by one or more skill tags
- Full data table: Name, Phone, Email, Skills, Status, Joined

**Add Volunteer tab:**
- Form fields: Full Name (required), Phone, Email, Admin Notes
- Skill tag checkboxes (two-column layout)
- On submit: inserts into `volunteers` table, then inserts skill rows into `volunteer_tags`

**Edit Volunteer tab:**
- Search by name to filter the volunteer list
- Select a volunteer from the dropdown
- Pre-filled form with current values
- Saves updated info and replaces all skill tags (delete + re-insert)
- Checkbox to mark volunteer inactive (soft deactivation — record kept in database)

---

#### Page 2 — Events (`2_📅_Events.py`)

Four tabs:

**Upcoming Events tab:**
- Slider to control look-ahead window (3–30 days)
- Color-coded data table: Date, Event, Type, Filled, Optimal, Needed, Fill %, Fridge, Status

**Manage Sign-Ups tab:**
- Select any upcoming event from a dropdown
- Shows current sign-ups for that event (name, phone, skill role, confirmed status)
- **Add a Volunteer form** — select volunteer + role, creates `event_signups` row (upsert, safe to repeat)
- **Remove a Volunteer form** — sets sign-up status to `cancelled` (soft delete)

**Generate Events tab:**
- Slider to set generation window (7–28 days)
- Button triggers `generate_weekly_events()` which iterates all active recurring initiatives and inserts event rows for matching weekdays
- Shows the current list of active recurring initiatives

**Add One-Off Event tab:**
- For special events not on the regular weekly schedule
- Select an existing initiative as the template
- Pick a date and add optional notes
- Inserts directly into `events` table

---

#### Page 3 — Donor CRM (`3_💰_Donor_CRM.py`)

Four tabs:

**Donor List tab:**
- Search by name or organization
- Filter by donor type
- Full table view
- **Log a Contact form** — stamps `last_contact = today` and optionally adds notes

**Add Donor tab:**
- Fields: Name (required), Email, Organization, Phone, Donor Type (required), Notes
- Donor types: Individual, Corporate, School, Faith Organization, Government, Other

**Food Recovery tab:**
- Cards for each food recovery partner (org name, contact, pickup day, location, reallocation notes)
- Expandable form to add a new food recovery contact

**School Contacts tab:**
- Table of school contacts for food drives (school name, contact, email, phone, last drive date)
- Expandable form to add a new school contact

---

### Data Layer

**`cfp_app/utils.py`** — all database functions. Every function returns a `pd.DataFrame` (for tables) or a Python primitive. No SQL is written outside this file.

Key functions:

| Function | What it does |
|---|---|
| `get_all_volunteers(active_only)` | Fetches volunteers with skill tags joined as a comma-separated string |
| `add_volunteer(name, email, phone, tags, notes)` | Inserts volunteer + tags, returns new id |
| `update_volunteer(id, ...)` | Updates volunteer fields, replaces all tags |
| `get_volunteer_tags(volunteer_id)` | Returns list of tag key strings |
| `get_all_fridges(active_only)` | Returns fridge locations |
| `get_all_initiatives(active_only)` | Returns initiatives with fridge name joined |
| `get_upcoming_events(days_ahead)` | Queries `vw_event_capacity` for events in window |
| `get_unfilled_events(days_ahead)` | Filters `get_upcoming_events` to seats_needed > 0 |
| `get_event_volunteers(event_id)` | Returns signups for one event with volunteer info joined |
| `signup_volunteer_for_event(event_id, vol_id, skill)` | Upserts a signup row |
| `cancel_signup(event_id, vol_id)` | Sets signup status to `cancelled` |
| `generate_weekly_events(days_ahead)` | Creates event rows for all recurring initiatives |
| `log_outreach(event_id, vol_id, method, ...)` | Inserts an outreach log row |
| `get_all_donors()` | Returns active donors |
| `add_donor(...)` | Inserts a donor row |
| `update_donor_contact(donor_id, notes)` | Stamps last_contact + optionally updates notes |
| `get_food_recovery_contacts()` | Returns active food recovery orgs |
| `get_school_contacts()` | Returns active school contacts |
| `get_fill_color(fill_pct)` | Maps a percentage to a hex color string |
| `skill_labels(skills_csv)` | Converts `"cleaning,delivery"` → `"🧹 Cleaning  🚗 Delivery"` |
| `volunteer_select_options()` | Returns `{display_label: id}` dict for Streamlit selectboxes |

**`cfp_app/supabase_client.py`** — creates the Supabase client. Resolves the key in this order:
1. `SUPABASE_SERVICE_KEY` from `.streamlit/secrets.toml`
2. `SUPABASE_SERVICE_KEY` from environment variables
3. Anon key fallback (writes will be blocked by RLS)

**`cfp_app/config.py`** — all non-secret configuration:
- `SKILL_TAGS`, `INITIATIVE_TYPES`, `DONOR_TYPES` — display label maps
- `UPCOMING_DAYS_WINDOW` — default dashboard look-ahead (days)
- `LOW_FILL_THRESHOLD`, `CRIT_FILL_THRESHOLD` — fill rate color thresholds
- `STATUS_COLORS` — hex colors for fill indicators

---

### Admin App Local Development

**Prerequisites:** Python 3.11+

```bash
cd cfp_app
pip install -r requirements.txt   # installs streamlit, supabase, pandas
streamlit run app.py              # opens at http://localhost:8501
```

**Setting up secrets (required for writes to work):**

Create `cfp_app/.streamlit/secrets.toml` (already gitignored):

```toml
SUPABASE_SERVICE_KEY = "your-service-role-key-here"
```

Find the service role key at: Supabase Dashboard → Project Settings → API → `service_role` → Reveal.

**Restarting:** Stop with `Ctrl+C` and re-run `streamlit run app.py`. Streamlit hot-reloads most Python changes automatically, but changes to `secrets.toml` or new package installs require a full restart.

---

## Common Edits & How-Tos

### Change any text on the public website

1. Open `cfp_website/src/config/site.config.js`
2. Find the relevant section (they are clearly labelled with comments)
3. Edit the string value
4. Push to `main` — Netlify rebuilds automatically

Or use the Admin CMS at `/admin` to change text without touching code.

### Add a new fridge location

**Option A — Admin CMS (no code):**
1. Go to `/admin` → Fridge Locations tab
2. Click "Add Fridge" and fill in the form

**Option B — Code:**
Add an entry to `FRIDGE_LOCATIONS` in `cfp_website/src/config/site.config.js`.

**Option C — Database:**
Insert a row into the `fridges` table via the Supabase SQL Editor or the Streamlit app (once a fridge form is added).

### Add a new volunteer skill tag

1. Add the key/label pair to `SKILL_TAGS` in `cfp_app/config.py`
2. Add the same pair to `SKILL_TAGS` in `cfp_website/src/config/site.config.js`
3. Update the `CHECK` constraint in Supabase. In the SQL Editor:
```sql
ALTER TABLE volunteer_tags DROP CONSTRAINT volunteer_tags_tag_check;
ALTER TABLE volunteer_tags ADD CONSTRAINT volunteer_tags_tag_check
  CHECK (tag IN ('sack_lunch','delivery','cleaning','shopping',
                 'tovala_recovery','stocking','advisory','your_new_tag'));
```

### Add a new page to the website

1. Create `cfp_website/src/pages/YourPage.jsx`
2. Add the route to `cfp_website/src/App.jsx`:
```jsx
<Route path="your-path" element={<YourPage />} />
```
3. Add a nav link to `NAV_LINKS` in `site.config.js`:
```js
{ label: 'Your Page', path: '/your-path' }
```

### Add a new Streamlit page to the admin app

Create a file in `cfp_app/pages/` following the naming convention:
```
4_🆕_Your_Page_Name.py
```
Streamlit auto-discovers it and adds it to the sidebar. The number prefix controls sort order.

### Update the impact stats on the home page

The stat values (volunteer count, donor count, fridge count) are fetched live from Supabase — they update automatically as you add records.

The stat **labels** can be changed in `site.config.js`:
```js
impactStats: [
  { value: '5',  label: 'Community Fridges' },    // stat0
  { value: '0',  label: 'Active Volunteers' },    // stat1
  { value: '0',  label: 'Donors & Supporters' },  // stat2
  { value: '0',  label: 'Cost to Take Food' },    // stat3
]
```
Or override them temporarily via the Admin CMS → Page Content tab.

### Change the Supabase project

Update both of these files with the new project URL and keys:
- `cfp_website/src/lib/supabase.js` — anon key
- `cfp_app/supabase_client.py` — URL (service key stays in secrets.toml)

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'supabase'`

The Python supabase package is not installed. Run:
```bash
cd cfp_app
pip install supabase
```

### Streamlit writes are blocked / `permission denied for table`

The service role key is not configured. Create or check `cfp_app/.streamlit/secrets.toml`:
```toml
SUPABASE_SERVICE_KEY = "your-service-role-key-here"
```
Then restart Streamlit.

### `Could not find the table 'public.vw_event_capacity' in the schema cache`

The view does not exist in your Supabase project. Run this in the Supabase SQL Editor:

```sql
CREATE OR REPLACE VIEW public.vw_event_capacity
WITH (security_invoker = off) AS
SELECT
    e.id AS event_id, e.event_date, e.status,
    i.name AS initiative_name, i.initiative_type,
    i.optimal_seats, i.max_seats,
    COUNT(es.id) FILTER (WHERE es.status IS DISTINCT FROM 'cancelled') AS seats_filled,
    GREATEST(i.optimal_seats - COUNT(es.id) FILTER (WHERE es.status IS DISTINCT FROM 'cancelled'), 0) AS seats_needed,
    ROUND(COUNT(es.id) FILTER (WHERE es.status IS DISTINCT FROM 'cancelled')::numeric / NULLIF(i.optimal_seats,0) * 100, 1) AS fill_pct,
    f.name AS fridge_name, f.address AS fridge_address
FROM public.events e
JOIN public.initiatives i ON i.id = e.initiative_id
LEFT JOIN public.fridges f ON f.id = i.fridge_id
LEFT JOIN public.event_signups es ON es.event_id = e.id
GROUP BY e.id, e.event_date, e.status, i.name, i.initiative_type,
         i.optimal_seats, i.max_seats, f.name, f.address;

GRANT SELECT ON public.vw_event_capacity TO anon;
GRANT SELECT ON public.vw_event_capacity TO authenticated;
```

### Impact stats show `0` or hardcoded values on the website

Possible causes:
1. The tables are empty — add data via the Streamlit admin app
2. RLS is blocking anon reads — verify policies exist in Supabase Dashboard → Authentication → Policies
3. The Supabase URL or anon key in `cfp_website/src/lib/supabase.js` is wrong
4. A network error silently fell back to defaults — check the browser console for Supabase errors

### Admin CMS changes not showing on the public site

The CMS stores data in `localStorage`, which is browser and domain specific.
- Changes made in one browser will not appear in another browser or incognito window on the same device
- Changes will not appear on Netlify (different origin)

This is by design for the current architecture. To make CMS changes global, the admin portal would need to be upgraded to write to Supabase instead of localStorage (noted as a future upgrade path in `Admin.jsx`).

### Netlify build fails

Check the build log in the Netlify dashboard. Common causes:
- Missing `npm install` step — `netlify.toml` uses `npm run build` which assumes packages are installed; Netlify runs `npm install` automatically before the build command
- ESLint errors — the build runs `vite build` which does not lint, but check `npm run lint` locally
- Import errors from a new file that doesn't exist yet

### `@supabase/supabase-js` not found (website build error)

Run inside `cfp_website/`:
```bash
npm install @supabase/supabase-js
```
Then commit the updated `package.json` and `package-lock.json`.

### Volunteer slot counts on the website are out of date

The Volunteer Dashboard on the website reads from `VOLUNTEER_SLOTS` in `site.config.js` (static) or from admin CMS overrides in localStorage. It does **not** yet pull live from Supabase. To update the displayed counts:
1. Go to `/admin` → Volunteer Slots tab and update the `filled` number, or
2. Edit `VOLUNTEER_SLOTS` directly in `site.config.js` and redeploy

To connect the dashboard to live Supabase data, replace the `VOLUNTEER_SLOTS` import in `VolunteerDashboard.jsx` with a `useEffect` that queries the `events` and `initiatives` tables.
