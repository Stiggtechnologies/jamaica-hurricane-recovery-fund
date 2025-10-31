import { useState } from 'react';
import { Heart, Users, Briefcase, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function GetInvolved() {
  const [activeTab, setActiveTab] = useState<'volunteer' | 'partner'>('volunteer');
  const [volunteerForm, setVolunteerForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    skills: '',
    availability: '',
    message: '',
  });
  const [partnerForm, setPartnerForm] = useState({
    organization_name: '',
    contact_name: '',
    email: '',
    phone: '',
    organization_type: '',
    inquiry_type: '',
    message: '',
  });
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('volunteers').insert([volunteerForm]);

    if (!error) {
      setVolunteerSubmitted(true);
      setVolunteerForm({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        skills: '',
        availability: '',
        message: '',
      });
      setTimeout(() => setVolunteerSubmitted(false), 5000);
    }

    setIsSubmitting(false);
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('partnership_inquiries').insert([partnerForm]);

    if (!error) {
      setPartnerSubmitted(true);
      setPartnerForm({
        organization_name: '',
        contact_name: '',
        email: '',
        phone: '',
        organization_type: '',
        inquiry_type: '',
        message: '',
      });
      setTimeout(() => setPartnerSubmitted(false), 5000);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white">
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            Get Involved
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Join our global community making a difference in Jamaica
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Ways to Contribute
            </h2>
            <p className="text-xl text-gray-600">
              Every skill, every connection, every effort matters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl shadow-lg">
              <div className="bg-jamaican-green text-white w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">Donate</h3>
              <p className="text-gray-700 mb-6">
                Make a financial contribution to directly fund rebuilding projects and support families in need.
              </p>
              <button className="btn-primary w-full">
                Donate Now
              </button>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl shadow-lg">
              <div className="bg-jamaican-green text-white w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">Volunteer</h3>
              <p className="text-gray-700 mb-6">
                Share your skills and time to support our operations, projects, or community outreach programs.
              </p>
              <button
                onClick={() => {
                  setActiveTab('volunteer');
                  document.getElementById('forms')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-outline w-full"
              >
                Apply Now
              </button>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl shadow-lg">
              <div className="bg-jamaican-green text-white w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Briefcase size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">Partner</h3>
              <p className="text-gray-700 mb-6">
                Collaborate with us as a corporate sponsor, nonprofit, or government entity to amplify our impact.
              </p>
              <button
                onClick={() => {
                  setActiveTab('partner');
                  document.getElementById('forms')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-outline w-full"
              >
                Inquire
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="forms" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`flex-1 py-4 px-6 font-heading font-semibold transition-all ${
                  activeTab === 'volunteer'
                    ? 'bg-jamaican-green text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Volunteer Application
              </button>
              <button
                onClick={() => setActiveTab('partner')}
                className={`flex-1 py-4 px-6 font-heading font-semibold transition-all ${
                  activeTab === 'partner'
                    ? 'bg-jamaican-green text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Partnership Inquiry
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'volunteer' && (
                <div>
                  {volunteerSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="mx-auto text-jamaican-green mb-4" size={64} />
                      <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                        Thank You!
                      </h3>
                      <p className="text-gray-600">
                        Your volunteer application has been received. We'll be in touch soon!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleVolunteerSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={volunteerForm.full_name}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, full_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={volunteerForm.email}
                            onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={volunteerForm.phone}
                            onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Location *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="City, Country"
                          value={volunteerForm.location}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, location: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Skills & Expertise *
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="e.g., Project management, construction, fundraising, graphic design..."
                          value={volunteerForm.skills}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, skills: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Availability *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., 5 hours per week, weekends only..."
                          value={volunteerForm.availability}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, availability: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Additional Information
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Tell us why you want to volunteer and any other relevant information..."
                          value={volunteerForm.message}
                          onChange={(e) => setVolunteerForm({ ...volunteerForm, message: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'partner' && (
                <div>
                  {partnerSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="mx-auto text-jamaican-green mb-4" size={64} />
                      <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                        Thank You!
                      </h3>
                      <p className="text-gray-600">
                        Your partnership inquiry has been received. Our team will contact you shortly!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePartnerSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={partnerForm.organization_name}
                          onChange={(e) => setPartnerForm({ ...partnerForm, organization_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={partnerForm.contact_name}
                            onChange={(e) => setPartnerForm({ ...partnerForm, contact_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={partnerForm.email}
                            onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={partnerForm.phone}
                          onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Organization Type *
                          </label>
                          <select
                            required
                            value={partnerForm.organization_type}
                            onChange={(e) => setPartnerForm({ ...partnerForm, organization_type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                          >
                            <option value="">Select type</option>
                            <option value="corporate">Corporate</option>
                            <option value="nonprofit">Nonprofit</option>
                            <option value="government">Government</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Inquiry Type *
                          </label>
                          <select
                            required
                            value={partnerForm.inquiry_type}
                            onChange={(e) => setPartnerForm({ ...partnerForm, inquiry_type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                          >
                            <option value="">Select type</option>
                            <option value="sponsorship">Sponsorship</option>
                            <option value="volunteer">Corporate Volunteering</option>
                            <option value="in-kind">In-Kind Donation</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Tell us about your organization and how you'd like to partner with us..."
                          value={partnerForm.message}
                          onChange={(e) => setPartnerForm({ ...partnerForm, message: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-jamaican-green to-primary-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Join the Global Movement
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you're in Kingston or Toronto, London or New York, you can be part of Jamaica's recovery story.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-jamaican-gold hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-lg transition-all duration-300">
                Share on Social Media
              </button>
              <button className="bg-white hover:bg-gray-100 text-jamaican-green font-bold px-8 py-4 rounded-lg transition-all duration-300">
                Download Press Kit
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
