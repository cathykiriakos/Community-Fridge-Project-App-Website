import { useState } from 'react'
import { Mail, MessageSquare, Clock, CheckCircle, Facebook } from 'lucide-react'
import { BRAND } from '../config/site.config'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

export default function Contact() {
  const { pages, images } = useContent()

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: '', type: 'general',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Static shell: logs form data. Wire to email service (e.g. EmailJS, Formspree) later.
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Contact form submission:', form)
    setSubmitted(true)
  }

  const INQUIRY_TYPES = [
    { value: 'general',    label: 'General Question' },
    { value: 'volunteer',  label: 'Volunteer Sign-Up' },
    { value: 'donation',   label: 'Donation / Drop-Off' },
    { value: 'fridge',     label: 'Report a Fridge Issue' },
    { value: 'partner',    label: 'Partnership / Media' },
    { value: 'other',      label: 'Other' },
  ]

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Reach Out
          </span>
          <h1 className="text-white mb-4">{pages.contactHeadline}</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            {pages.contactIntro}
          </p>
        </div>
      </section>

      <PageWithSidebar images={images.contact}>

      {/* ── CONTACT GRID ────────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Sidebar info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-brand-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Email Us</h3>
                </div>
                <a
                  href={`mailto:${pages.contactEmail}`}
                  className="text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors"
                >
                  {pages.contactEmail}
                </a>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-brand-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Response Time</h3>
                </div>
                <p className="text-gray-600 text-sm">{pages.contactResponse}</p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <MessageSquare size={20} className="text-brand-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Urgent Fridge Issue?</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  If a fridge needs immediate attention (power outage, spoiled food, vandalism),
                  select "Report a Fridge Issue" in the form and we'll prioritize it.
                </p>
              </div>

              {BRAND.socialMedia.facebook && (
                <div className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                      <Facebook size={20} className="text-brand-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Follow Us</h3>
                  </div>
                  <a
                    href={BRAND.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors"
                  >
                    Community Fridge Project on Facebook
                  </a>
                </div>
              )}
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card text-center py-16">
                  <CheckCircle size={56} className="text-brand-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We'll get back to you within 2 business days.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '', type: 'general' }) }}
                    className="btn-secondary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card space-y-6" noValidate>
                  <h2 className="text-2xl font-bold text-gray-900">Send a Message</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="form-label">Full Name *</label>
                      <input
                        id="name" name="name" type="text" required
                        value={form.name} onChange={handleChange}
                        placeholder="Your name"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">Email Address *</label>
                      <input
                        id="email" name="email" type="email" required
                        value={form.email} onChange={handleChange}
                        placeholder="your@email.com"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="type" className="form-label">Type of Inquiry</label>
                    <select
                      id="type" name="type"
                      value={form.type} onChange={handleChange}
                      className="form-input"
                    >
                      {INQUIRY_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="form-label">Subject *</label>
                    <input
                      id="subject" name="subject" type="text" required
                      value={form.subject} onChange={handleChange}
                      placeholder="Brief subject"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="form-label">Message *</label>
                    <textarea
                      id="message" name="message" required rows={6}
                      value={form.message} onChange={handleChange}
                      placeholder="Tell us more..."
                      className="form-input resize-none"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-base py-4">
                    <Mail size={18} />
                    Send Message
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    * To wire this form to email delivery, connect an email service (e.g. Formspree, EmailJS) in Contact.jsx.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      </PageWithSidebar>
    </>
  )
}
