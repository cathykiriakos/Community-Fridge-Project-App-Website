import { useState } from 'react'
import { Calendar, User } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function NewsCard({ article }) {
  return (
    <article className="card hover:border-brand-200 flex flex-col" aria-label={article.title}>
      <div className="mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full
          ${article.type === 'event'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-brand-100 text-brand-700'}`}>
          {article.type === 'event' ? '📅 Event' : '📰 News'}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-3 text-gray-900 leading-snug">
        {article.title}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
        {article.excerpt}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(article.date)}
        </span>
        {article.author && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {article.author}
          </span>
        )}
      </div>
    </article>
  )
}

export default function News() {
  const { news: allArticles, images } = useContent()
  const [activeFilter, setActiveFilter] = useState('all')

  const articles = allArticles.filter(a => a.published)
  const filtered  = activeFilter === 'all' ? articles : articles.filter(a => a.type === activeFilter)
  const events    = articles.filter(a => a.type === 'event')
  const newsOnly  = articles.filter(a => a.type === 'news')

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Stay Updated
          </span>
          <h1 className="text-white mb-4">News &amp; Events</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            Latest updates, announcements, and upcoming events from the Community Fridge Project
            in Oak Park, IL and the Austin neighborhood of Chicago.
          </p>
        </div>
      </section>

      {/* ── FILTER TABS ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 sticky top-[64px] md:top-[80px] z-40">
        <div className="section-container py-4">
          <div className="flex gap-3">
            {[
              { key: 'all',   label: `All (${articles.length})` },
              { key: 'news',  label: `News (${newsOnly.length})` },
              { key: 'event', label: `Events (${events.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeFilter === tab.key
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <PageWithSidebar images={images.news}>

      {/* ── ARTICLE FEED ────────────────────────────────────────────── */}
      <section className="section-py bg-neutral-50">
        <div className="section-container">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl mb-4 block" role="img" aria-hidden="true">📭</span>
              <h3 className="text-xl font-bold text-gray-500">
                No {activeFilter === 'all' ? 'posts' : activeFilter + 's'} yet
              </h3>
              <p className="text-gray-400 mt-2">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      </PageWithSidebar>
    </>
  )
}
