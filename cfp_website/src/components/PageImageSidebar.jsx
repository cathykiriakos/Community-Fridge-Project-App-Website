/**
 * PageImageSidebar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Left sidebar gallery for public-facing pages.
 * Shows images uploaded via the Admin → Images panel.
 * Renders nothing if no images are uploaded for this page.
 *
 * Usage:
 *   <PageWithSidebar images={images.home}>
 *     <YourPageContent />
 *   </PageWithSidebar>
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Wrapper that adds the left image sidebar to any page. */
export function PageWithSidebar({ images = [], children }) {
  if (!images || images.length === 0) {
    // No images — render content full-width as normal
    return <>{children}</>
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-0">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className="lg:w-64 xl:w-72 flex-shrink-0 bg-neutral-50 border-b lg:border-b-0 lg:border-r
                   border-gray-200 lg:min-h-screen"
        aria-label="Page photo gallery"
      >
        {/* Sticky inner on desktop */}
        <div className="lg:sticky lg:top-20 p-4 space-y-3 max-h-[50vh] lg:max-h-[calc(100vh-5rem)]
                        overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-3">
            📸 Photos
          </p>
          {images.map((img) => (
            <div
              key={img.id}
              className="rounded-xl overflow-hidden shadow-sm hover:shadow-md
                         transition-shadow duration-200 bg-white"
            >
              <img
                src={img.src}
                alt={img.alt || img.caption || 'Community Fridge Project photo'}
                className="w-full object-cover"
                style={{ maxHeight: '200px' }}
                loading="lazy"
              />
              {img.caption && (
                <p className="text-xs text-gray-500 px-3 py-2 leading-snug">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
