import { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('contact_submissions').insert([formData]);

    if (!error) {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white">
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            We're here to answer your questions and hear your ideas
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Email Us</h3>
              <p className="text-gray-600 text-sm mb-4">
                Send us a message anytime
              </p>
              <a
                href="mailto:info@jamaicahurricanefund.org"
                className="text-jamaican-green font-semibold hover:underline"
              >
                info@jamaicahurricanefund.org
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Canada Office</h3>
              <p className="text-gray-600 text-sm">
                Alberta, Canada
                <br />
                <span className="text-xs text-gray-500">Full address available upon request</span>
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Jamaica Office</h3>
              <p className="text-gray-600 text-sm">
                Kingston, Jamaica
                <br />
                <span className="text-xs text-gray-500">Full address available upon request</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Have a question, suggestion, or want to learn more about our work?
                Fill out the form and we'll get back to you as soon as possible.
              </p>

              {submitted ? (
                <div className="bg-primary-50 rounded-xl p-8 text-center">
                  <CheckCircle className="mx-auto text-jamaican-green mb-4" size={64} />
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Message Received!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for reaching out. We'll respond within 24-48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send size={20} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-gradient-to-br from-jamaican-green to-primary-600 rounded-2xl p-8 lg:p-12 text-white">
              <h3 className="text-3xl font-heading font-bold mb-6">
                Get in Touch
              </h3>
              <p className="mb-8 opacity-90 leading-relaxed">
                Whether you're a potential donor, volunteer, partner organization, or community member,
                we welcome your questions and feedback. Together, we can make a lasting difference
                in Jamaica's recovery and resilience.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-lg">General Inquiries</h4>
                  <p className="text-sm opacity-90">
                    For general questions about our mission, projects, or how to get involved
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Media & Press</h4>
                  <p className="text-sm opacity-90">
                    Journalists and media representatives can request interviews, press releases,
                    and high-resolution images
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Partnership Opportunities</h4>
                  <p className="text-sm opacity-90">
                    Corporate sponsors and organizations interested in collaboration should reach out
                    to discuss partnership opportunities
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Office Hours</h4>
                  <p className="text-sm opacity-90">
                    Monday - Friday: 9:00 AM - 5:00 PM (AST)
                    <br />
                    We aim to respond to all inquiries within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-heading font-bold text-lg mb-2">
                How can I track my donation?
              </h3>
              <p className="text-gray-600 text-sm">
                All donors receive email receipts and can access our transparency reports
                showing exactly how funds are allocated.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-heading font-bold text-lg mb-2">
                Are donations tax-deductible?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, JHRF is a registered charitable organization. You'll receive a tax receipt
                for all eligible donations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-heading font-bold text-lg mb-2">
                Can I volunteer remotely?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! We have many remote volunteer opportunities in areas like
                fundraising, communications, and technical support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-heading font-bold text-lg mb-2">
                How do you ensure accountability?
              </h3>
              <p className="text-gray-600 text-sm">
                We conduct regular audits, publish quarterly financial reports, and maintain
                community oversight of all projects.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
