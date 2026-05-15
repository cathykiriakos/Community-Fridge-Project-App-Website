import { Heart } from 'lucide-react'
import { DONATE } from '../config/site.config'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

export default function Donate() {
  const { pages, images } = useContent()

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Make a Difference
          </span>
          <h1 className="text-white mb-4">{pages.donateHeadline}</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            {pages.donateIntro}
          </p>
        </div>
      </section>

      <PageWithSidebar images={images.donate}>

      {/* ── DONATE SECTION ──────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">

            <div className="bg-brand-50 border-2 border-brand-300 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <a
                  href="https://www.communityofcongregations.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/coc-logo.png"
                    alt="Community of Congregations"
                    className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </a>
              </div>
              <p className="text-brand-800 font-bold text-lg mb-2">
                Donate through the Community of Congregations
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Community of Congregations is a 501(c)(3) nonprofit organization.
                Your donation is tax-deductible.
              </p>
              <a
                href="https://www.communityofcongregations.org/give/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
              >
                <Heart size={18} />
                Donate Now
              </a>
            </div>

          </div>
        </div>
      </section>

      </PageWithSidebar>
    </>
  )
}
