import { Target, Eye, Award, Shield } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function About() {
  return (
    <>
      <SEOHead
        title="About JHRF - Jamaica Hurricane Recovery Fund"
        description="Learn about our mission to raise $100 million for hurricane relief in Jamaica. Founded by Orville Davis, we're building climate-resilient communities through transparent, community-led recovery efforts."
        url="https://jamaicahurricanerecoveryfund.org/about"
      />
    <div className="bg-white">
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            About JHRF
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            A global movement founded on compassion, transparency, and lasting impact
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold text-gray-900 mb-6">
                Our Founder's Story
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  When the hurricane struck Jamaica, it wasn't just homes that were torn apart — it was the heart of a nation that gave so much to the world.
                </p>
                <p>
                  The Jamaica Hurricane Recovery Fund was founded by <strong>Orville Davis</strong>, a Jamaican-born entrepreneur who has built a successful career in Alberta, Canada. Born and raised in Jamaica and now building businesses and communities across North America, Orville has never forgotten where his strength began.
                </p>
                <p>
                  Having witnessed the devastating impact of hurricanes on his homeland, Orville felt compelled to create a lasting solution that goes beyond immediate relief. With deep roots in Jamaica and a global perspective gained through his work in Canada, Orville envisioned a fund that would not only help communities recover but also build long-term resilience against future climate challenges.
                </p>
                <blockquote className="border-l-4 border-jamaican-gold pl-4 my-6 italic text-gray-800">
                  "Jamaica built my foundation — the strength, courage, and community that shaped who I am. Now, I'm using every skill, connection, and resource I have to help rebuild the foundations of others. I choose action over sympathy, and hope over heartbreak."
                  <footer className="text-jamaican-green font-semibold not-italic mt-2">— Orville Davis</footer>
                </blockquote>
                <p>
                  This is more than a fundraiser. It's a movement of gratitude in action — uniting Jamaicans everywhere, the Caribbean diaspora, and allies around the world who believe that rebuilding homes also rebuilds lives.
                </p>
                <p>
                  Through partnerships with Stigg Security Inc., Omega Group, the Alberta Tech Team, and trusted local organizations, the Fund is focused on immediate relief, long-term recovery, and climate-resilient rebuilding — ensuring that what we restore today will stand strong tomorrow.
                </p>
                <p className="font-semibold text-gray-900">
                  The Jamaica Hurricane Recovery Fund exists to turn compassion into construction, and concern into commitment — because real change begins when people choose to do more than feel. They choose to act.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Community rebuilding"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 p-4 rounded-full">
                  <Target className="text-jamaican-green" size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold ml-4">Our Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To raise US $100 million for comprehensive hurricane relief, recovery, and long-term climate resilience in Jamaica through strategic corporate partnerships, global diaspora engagement, and public donations. We are committed to rebuilding homes, schools, shelters, and community infrastructure while empowering local communities with the resources and knowledge needed to withstand future challenges.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 p-4 rounded-full">
                  <Eye className="text-jamaican-green" size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold ml-4">Our Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                A resilient Jamaica where every community is equipped to recover quickly from natural disasters and thrive in the face of climate change. We envision a future where no Jamaican family is left vulnerable, where rebuilt structures exceed previous standards, and where the global Jamaican diaspora remains connected and engaged in the nation's development and prosperity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              Principles that guide every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-jamaican-gold w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-gray-900" size={36} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Transparency</h3>
              <p className="text-gray-600">
                Every dollar donated is tracked and reported. We maintain open financial records and regular impact reports accessible to all donors.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-jamaican-gold w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-gray-900" size={36} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We hold ourselves to the highest standards of project execution, financial management, and community engagement.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-jamaican-gold w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-gray-900" size={36} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Impact</h3>
              <p className="text-gray-600">
                We focus on measurable, lasting change that transforms lives and strengthens communities for generations to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-jamaican-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Governance & Accountability
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Our commitment to ethical stewardship and responsible fund management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl">
              <h3 className="text-2xl font-heading font-bold mb-4">Financial Oversight</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Independent audits conducted annually</span>
                </li>
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Quarterly financial reports published publicly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Board of directors with diverse expertise</span>
                </li>
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Strict conflict of interest policies</span>
                </li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl">
              <h3 className="text-2xl font-heading font-bold mb-4">Project Management</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Community-led project selection and oversight</span>
                </li>
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Regular site visits and progress monitoring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Beneficiary feedback mechanisms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-jamaican-gold mr-2">✓</span>
                  <span>Impact measurement and evaluation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-heading font-bold text-gray-900 mb-6">
            Strategic Partners
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Working together with trusted organizations to maximize our impact
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">Stigg Security Inc.</div>
              <p className="text-sm text-gray-600">Security & Risk Management</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">Omega Group</div>
              <p className="text-sm text-gray-600">Construction & Development</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">Alberta Tech Team</div>
              <p className="text-sm text-gray-600">Technology & Innovation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
