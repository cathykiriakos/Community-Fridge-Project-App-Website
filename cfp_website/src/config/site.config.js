/**
 * site.config.js — Community Fridge Project
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE EDIT POINT for all site-wide configurable content.
 * All values here are defaults — the Admin CMS can override any of them via
 * localStorage. Edit here to change baseline content across the whole site.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { supabase } from '../lib/supabase'

/**
 * Fetch live impact counts from Supabase.
 * Uses head:true so only the count is returned — no row data transferred.
 *
 * Returns:
 *   { fridges: number, volunteers: number, donors: number }
 *   Any field is null if the query fails (callers should fall back to defaults).
 */
export async function getImpactStats() {
  const [
    { count: fridges },
    { count: volunteers },
    { count: donors },
  ] = await Promise.all([
    supabase.from('fridges').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('donors').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])
  return {
    fridges:    fridges    ?? null,
    volunteers: volunteers ?? null,
    donors:     donors     ?? null,
  }
}

// ─── BRAND ──────────────────────────────────────────────────────────────────
export const BRAND = {
  name: 'Community Fridge Project',
  tagline: 'Free Food for All Neighbors',
  domain: 'communityfridgeproject.org',
  url: 'https://communityfridgeproject.org',
  email: 'hello@communityfridgeproject.org',
  phone: '',
  location: 'Oak Park, IL & Austin Neighborhood, Chicago, IL',
  socialMedia: {
    instagram: '',
    facebook: '',
    twitter: '',
  },
  primaryColor: '#3BAA35',
}

// ─── NAVIGATION ─────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home',       path: '/' },
  { label: 'About Us',   path: '/about' },
  { label: 'Volunteer',  path: '/volunteer' },
  { label: 'Donate',     path: '/donate' },
  { label: 'News',       path: '/news' },
  { label: 'Contact',    path: '/contact' },
]

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
export const HOME = {
  hero: {
    headline: 'Neighbors Feeding Neighbors',
    subheadline: 'Free, fresh food — available to anyone, anytime.',
    ctaLabel: 'Get Involved',
    ctaPath: '/volunteer',
  },
  mission: {
    title: 'Our Mission',
    body: `The Community Fridge Project believes that no one should go hungry. We maintain a network
      of free community refrigerators across the Oak Park Illinois and Austin Chicago Communities,
      where anyone can take what they need — No cost, No ID, no questions asked.
      Our fridges are stocked by volunteers, donors, and neighbors who believe in the power of mutual aid.`,
  },
  impactStats: [
    { value: '5',     label: 'Community Fridges' },
    { value: '100+',  label: 'Active Volunteers' },
    { value: '0',      label: 'Donors & Supporters' },
    { value: '0',     label: 'Cost to Take Food' },
  ],
  overview: {
    title: 'How It Works',
    steps: [
      {
        icon: '🥦',
        title: 'Donate Food',
        description: 'Drop off fresh produce, packaged goods, or prepared meals at any fridge location.',
      },
      {
        icon: '🙌',
        title: 'Volunteer',
        description: 'Help stock fridges, prepare sack lunches, or drive donations between locations.',
      },
      {
        icon: '🍱',
        title: 'Take What You Need',
        description: 'Our fridges are open 24/7 — take what you need, leave what you can. No cost, no ID, no questions asked.',
      },
    ],
  },
}

// ─── FRIDGE LOCATIONS ────────────────────────────────────────────────────────
// Each fridge has a Google Maps URL for easy navigation.
// Add or remove fridges here, or manage them via the Admin portal.
export const FRIDGE_LOCATIONS = [
  {
    id: 1,
    name: 'Grace Episcopal Church',
    neighborhood: 'Oak Park, IL',
    address: '924 Lake Street, Oak Park, IL',
    mapsUrl: 'https://maps.google.com/?q=924+Lake+Street,+Oak+Park,+IL',
  },
  {
    id: 2,
    name: 'Edwin Gale House',
    neighborhood: 'Oak Park, IL',
    address: '124 N Kenilworth Ave, Oak Park, IL',
    mapsUrl: 'https://maps.google.com/?q=124+N+Kenilworth+Ave,+Oak+Park,+IL',
  },
  {
    id: 3,
    name: 'Boulevard Presbyterian Church',
    neighborhood: 'Oak Park, IL',
    address: '607 Harvard St, Oak Park, IL',
    mapsUrl: 'https://maps.google.com/?q=607+Harvard+St,+Oak+Park,+IL',
  },
  {
    id: 4,
    name: 'A House in Austin',
    neighborhood: 'Austin, Chicago, IL',
    address: 'Austin Neighborhood, Chicago, IL',
    mapsUrl: 'https://maps.google.com/?q=Austin+Neighborhood,+Chicago,+IL',
  },
  {
    id: 5,
    name: 'United Lutheran Church',
    neighborhood: 'Oak Park, IL',
    address: '409 Greenfield St, Oak Park, IL',
    mapsUrl: 'https://maps.google.com/?q=409+Greenfield+St,+Oak+Park,+IL',
  },
]

// ─── VOLUNTEER SLOTS ─────────────────────────────────────────────────────────
export const VOLUNTEER_SLOTS = [
  {
    id: 'monday-sack-lunch',
    activity: 'Monday Sack Lunch',
    day: 'Monday',
    optimal: 9,
    max: 11,
    filled: 7,
    icon: '🥪',
    notes: 'Prep and distribute sack lunches. Karen coordinates.',
  },
  {
    id: 'tuesday-shopping',
    activity: 'Tuesday Grocery Run',
    day: 'Tuesday',
    optimal: 3,
    max: 4,
    filled: 2,
    icon: '🛒',
    notes: 'Shop at 5 partner locations to stock fridges.',
  },
  {
    id: 'wednesday-shopping',
    activity: 'Wednesday Grocery Run',
    day: 'Wednesday',
    optimal: 3,
    max: 4,
    filled: 3,
    icon: '🛒',
    notes: '',
  },
  {
    id: 'thursday-shopping',
    activity: 'Thursday Grocery Run',
    day: 'Thursday',
    optimal: 3,
    max: 4,
    filled: 1,
    icon: '🛒',
    notes: '',
  },
  {
    id: 'friday-shopping',
    activity: 'Friday Grocery Run',
    day: 'Friday',
    optimal: 3,
    max: 4,
    filled: 3,
    icon: '🛒',
    notes: '',
  },
  {
    id: 'daily-cleaning',
    activity: 'Fridge Cleaning',
    day: 'Daily',
    optimal: 30,
    max: 35,
    filled: 22,
    icon: '🧹',
    notes: '5 fridges across Oak Park & Austin Chicago — daily wipe-downs and safety checks.',
  },
  {
    id: 'thursday-tovala',
    activity: 'Tovala Food Recovery',
    day: 'Thursday',
    optimal: 4,
    max: 6,
    filled: 3,
    icon: '🚗',
    notes: 'Thursdays 9:00 AM – 1:00 PM. Driver required.',
  },
  {
    id: 'delivery-driving',
    activity: 'Delivery Driving',
    day: 'Mon–Fri',
    optimal: 3,
    max: 5,
    filled: 3,
    icon: '🚐',
    notes: 'Jen, Jules & Mary on regular routes. More drivers always welcome.',
  },
]

// ─── TEAM / ABOUT US ─────────────────────────────────────────────────────────
export const TEAM = {
  headline: 'Meet Our Community',
  intro: `The Community Fridge Project is powered by dedicated volunteers and organizers
    in Oak Park and the Austin neighborhood of Chicago who believe access to food is a basic human right.
    We are neighbors helping neighbors.`,
  ourStory: {
    title: 'How It Started',
    body1: `The Community Fridge Project began with a simple belief: no one in our community should go
      hungry when food is available. What started as a single refrigerator on a neighborhood corner
      has grown into a network of five community fridges serving both Oak Park, IL and the Austin
      neighborhood of Chicago.`,
    body2: `We operate on the principles of mutual aid — neighbors helping neighbors, with no
      hierarchy, no gatekeeping, and no judgment. Our fridges are open to everyone,
      always free, and stocked daily by community members just like you.`,
  },
  organizers: [
    {
      name: 'Karen',
      role: 'Founder & Lead Organizer',
      bio: 'Karen founded the Community Fridge Project with a single refrigerator and a big vision. She coordinates day-to-day operations, volunteer scheduling, and partnerships across Oak Park and Chicago\'s Austin neighborhood.',
    },
  ],
  advisory: {
    title: 'Advisory Team',
    description: '6-member advisory team meets monthly to guide strategy, community partnerships, and organizational growth.',
  },
}

// ─── NEWS & EVENTS (seed data) ───────────────────────────────────────────────
export const DEFAULT_NEWS = [
  {
    id: 1,
    type: 'news',
    title: 'Welcome to the Community Fridge Project Website!',
    date: '2026-03-27',
    excerpt: 'We\'re thrilled to launch our new website serving Oak Park, IL and the Austin neighborhood of Chicago. Stay tuned for updates on volunteer opportunities, new fridge locations, and ways to get involved.',
    body: 'Full article coming soon.',
    author: 'Karen',
    published: true,
  },
  {
    id: 2,
    type: 'event',
    title: 'Monthly Advisory Meeting',
    date: '2026-04-15',
    excerpt: 'Join our monthly advisory team meeting to discuss expansion plans and community outreach across Oak Park and Austin Chicago.',
    body: 'Details to be announced.',
    author: 'Karen',
    published: true,
  },
]

// ─── DONATE PAGE ─────────────────────────────────────────────────────────────
export const DONATE = {
  headline: 'Support the Community Fridge Project',
  intro: `Every dollar and every food donation makes a direct impact in Oak Park and Chicago's Austin
    neighborhood. Your contribution helps us stock fridges, expand our network, and keep food
    accessible to every neighbor who needs it.`,
  monetaryOptions: [
    { amount: 10,  label: '$10',  description: 'Stocks a fridge shelf for one day' },
    { amount: 25,  label: '$25',  description: 'Covers a week of cleaning supplies' },
    { amount: 50,  label: '$50',  description: 'Funds a full grocery run' },
    { amount: 100, label: '$100', description: 'Sponsors a fridge for a month' },
  ],
  foodItems: [
    'Fresh produce (fruits and vegetables)',
    'Non-perishable canned goods',
    'Bread and baked goods',
    'Dairy products (within date)',
    'Prepared meals (sealed and labeled with date)',
    'Baby food and formula',
  ],
  dropoffNote: 'Drop off at any of our 5 fridge locations in Oak Park, IL or Austin Chicago — no appointment needed.',
  paymentLink: 'https://www.paypal.com/donate?token=euPabnhIunjsHTQN3OEVT9Ju3Y8R9a983s_JNk1Kh5fIXsM-ztDIFpoKJh3dPRkLJKwwsHSMZiLbDJg-&fbclid=IwT01FWARMxgdleHRuA2FlbQIxMABzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR62gFMaufPNay1eusdHdHVkN6q0WX3xE8hWTPreyVn09cExNDZBKl2pI3zceg_aem_jePk0i92M0YAXVPDXRiWDw',
}

// ─── CONTACT PAGE ────────────────────────────────────────────────────────────
export const CONTACT = {
  headline: 'Get in Touch',
  intro: 'Have a question, want to partner with us, or need to report a fridge issue in Oak Park or Austin Chicago? We\'d love to hear from you.',
  email: BRAND.email,
  responseTime: 'We typically respond within 2 business days.',
}

// ─── ADMIN CONFIG ────────────────────────────────────────────────────────────
export const ADMIN_CONFIG = {
  password: 'cfp-admin-2026',
  sessionKey: 'cfp_admin_session',
  contentKey: 'cfp_admin_content',
}
