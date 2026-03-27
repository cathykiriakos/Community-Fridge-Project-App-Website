import { Link } from 'react-router-dom'
import { MapPin, Users, Calendar, ExternalLink } from 'lucide-react'
import { TEAM } from '../config/site.config'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

export default function About() {
  const { pages, fridges, images } = useContent()

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Who We Are
          </span>
          <h1 className="text-white mb-4">About Us</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            {pages.teamIntro}
          </p>
        </div>
      </section>

      <PageWithSidebar images={images.about}>

      {/* ── OUR STORY ───────────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <span className="badge-green mb-4">Our Story</span>
            <h2 className="mb-6">{pages.ourStoryTitle}</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              {pages.ourStoryBody1}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              {pages.ourStoryBody2}
            </p>
          </div>
        </div>
      </section>

      {/* ── ORGANIZERS ──────────────────────────────────────────────── */}
      <section className="section-py bg-neutral-50" aria-labelledby="team-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="badge-green mb-4">The People</span>
            <h2 id="team-heading">{TEAM.headline}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Founder card — CMS-editable */}
            <div className="card flex gap-5 items-start">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center
                              justify-center flex-shrink-0 text-3xl">
                👤
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-0.5">{pages.founderName}</h3>
                <p className="text-brand-600 text-sm font-semibold mb-3">{pages.founderRole}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{pages.founderBio}</p>
              </div>
            </div>

            {/* Advisory team card */}
            <div className="card flex gap-5 items-start">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center
                              justify-center flex-shrink-0">
                <Users size={28} className="text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                  {TEAM.advisory.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-green text-xs">6 Members</span>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Calendar size={11} /> Monthly Meetings
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {TEAM.advisory.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FRIDGE LOCATIONS ────────────────────────────────────────── */}
      <section className="section-py bg-white" aria-labelledby="locations-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="badge-green mb-4">Find a Fridge</span>
            <h2 id="locations-heading">Our Fridge Network</h2>
            <p className="text-gray-500 mt-3 text-lg">
              {fridges.length} community fridge{fridges.length !== 1 ? 's' : ''} across Oak Park &amp; Austin Chicago — and growing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {fridges.map((loc) => (
              <div key={loc.id} className="card hover:border-brand-200 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center
                                  justify-center flex-shrink-0">
                    <MapPin size={20} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900">{loc.name}</h4>
                    <p className="text-sm text-brand-600 font-medium">{loc.neighborhood}</p>
                    <p className="text-xs text-gray-500 mt-1">{loc.address}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="badge-green text-xs">Open 24/7</span>
                      {loc.mapsUrl && (
                        <a
                          href={loc.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold
                                     flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink size={11} /> Get Directions
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ─────────────────────────────────────────────────── */}
      <section className="bg-brand-600 text-white section-py">
        <div className="section-container text-center">
          <h2 className="text-white mb-4">Be Part of the Team</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Every volunteer hour makes a direct impact. Join our community today.
          </p>
          <Link to="/volunteer" className="btn-primary bg-white text-brand-600 hover:bg-brand-50 text-base px-8 py-4">
            Become a Volunteer
          </Link>
        </div>
      </section>

      </PageWithSidebar>
    </>
  )
}
