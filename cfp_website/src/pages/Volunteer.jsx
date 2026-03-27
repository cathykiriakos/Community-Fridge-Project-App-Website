import { Link } from 'react-router-dom'
import VolunteerDashboard from '../components/VolunteerDashboard'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

const VOLUNTEER_ROLES = [
  {
    icon: '🥪',
    title: 'Monday Sack Lunch Crew',
    commitment: 'Every Monday',
    description:
      'Help prepare and distribute sack lunches for neighbors in need. Karen coordinates timing and supplies. Optimal crew is 9 volunteers.',
  },
  {
    icon: '🛒',
    title: 'Grocery Shopper',
    commitment: 'Tue–Fri, flexible',
    description:
      'Shop at 5 partner store locations to keep our fridges stocked. About 3 volunteers per day, flexible scheduling.',
  },
  {
    icon: '🧹',
    title: 'Fridge Cleaner',
    commitment: 'Daily, 30–60 min',
    description:
      'Wipe down, sanitize, and organize one of our fridges across Oak Park and Austin Chicago. ~30 cleaners keep all fridges safe and welcoming every day.',
  },
  {
    icon: '🚗',
    title: 'Delivery Driver',
    commitment: 'Flexible',
    description:
      'Drive donations between fridge locations or from partner businesses. Must have a reliable vehicle.',
  },
  {
    icon: '🤝',
    title: 'Community Outreach',
    commitment: 'Flexible',
    description:
      'Help spread the word about our fridges, recruit donors, and represent the Community Fridge Project at events.',
  },
  {
    icon: '📋',
    title: 'Advisory Team',
    commitment: 'Monthly meeting',
    description:
      'Join our 6-member advisory team to help shape strategy, partnerships, and organizational growth.',
  },
]

export default function Volunteer() {
  const { images } = useContent()
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Get Involved
          </span>
          <h1 className="text-white mb-4">Volunteer Activities</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            From stocking fridges to preparing lunches, there's a role for everyone.
            See what's needed most right now.
          </p>
        </div>
      </section>

      <PageWithSidebar images={images.volunteer}>

      {/* ── LIVE DASHBOARD ──────────────────────────────────────────── */}
      <section className="section-py bg-white" aria-labelledby="dashboard-heading">
        <div className="section-container">
          <div className="text-center mb-10">
            <span className="badge-green mb-4">Current Needs</span>
            <h2 id="dashboard-heading">Volunteer Slot Dashboard</h2>
            <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
              Real-time view of volunteer availability across all activities.
              Green means we need you — red means we're fully staffed.
            </p>
          </div>
          <VolunteerDashboard previewMode={false} />
        </div>
      </section>

      {/* ── ROLE DESCRIPTIONS ───────────────────────────────────────── */}
      <section className="section-py bg-neutral-50" aria-labelledby="roles-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="badge-green mb-4">All Roles</span>
            <h2 id="roles-heading">Ways to Help</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VOLUNTEER_ROLES.map((role, i) => (
              <div key={i} className="card hover:border-brand-200">
                <div className="text-4xl mb-4" role="img" aria-hidden="true">{role.icon}</div>
                <h3 className="text-lg font-bold mb-1 text-gray-900">{role.title}</h3>
                <span className="badge-green text-xs mb-3 inline-block">{role.commitment}</span>
                <p className="text-gray-600 text-sm leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGN UP CTA ─────────────────────────────────────────────── */}
      <section className="section-py bg-brand-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-white mb-4">Ready to Sign Up?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Reach out and Karen will match you to the right role for your schedule.
          </p>
          <Link
            to="/contact"
            className="btn-primary bg-white text-brand-600 hover:bg-brand-50 text-base px-8 py-4"
          >
            Contact Us to Volunteer
          </Link>
        </div>
      </section>

      </PageWithSidebar>
    </>
  )
}
