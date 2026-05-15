import { BRAND } from '../config/site.config'

export default function Volunteer() {
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Get Involved
          </span>
          <h1 className="text-white mb-4">Volunteer</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            Join our community of neighbors helping neighbors.
          </p>
        </div>
      </section>

      {/* ── VOLUNTEER CONTACT ───────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="section-container">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-6">
              If you are interested in volunteering, please email us:
            </p>
            <a
              href={`mailto:${BRAND.email}`}
              className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
            >
              {BRAND.email}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
