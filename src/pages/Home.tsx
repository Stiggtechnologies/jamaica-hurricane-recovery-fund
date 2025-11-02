import { useEffect, useState } from 'react';
import { Heart, Users, Home as HomeIcon, Building2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';

interface DonationProgress {
  goal_amount: number;
  current_amount: number;
  donor_count: number;
}

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [progress, setProgress] = useState<DonationProgress>({
    goal_amount: 100000000,
    current_amount: 0,
    donor_count: 0,
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from('donation_progress')
      .select('*')
      .maybeSingle();

    if (data && !error) {
      setProgress(data);
    }
  };

  const progressPercentage = (progress.current_amount / progress.goal_amount) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <SEOHead
        title="Jamaica Hurricane Recovery Fund - Rebuilding Stronger Together"
        description="Join us in raising $100 million for hurricane relief and recovery in Jamaica. Support immediate relief, long-term recovery, and climate-resilient rebuilding."
        url="https://jamaicahurricanerecoveryfund.org"
      />
      <StructuredData type="Organization" />
      <StructuredData type="WebSite" />
      <StructuredData type="DonateAction" />
    <div className="bg-white">
      <section
        className="relative h-[600px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=1920&q=80)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6 animate-fade-in">
            Rebuilding Stronger. Together.
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
            Help Jamaica recover, rebuild, and rise stronger after natural disasters.
            Every donation brings hope to families and communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('donate')}
              className="btn-primary text-lg px-8 py-4"
            >
              Donate Now
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                Campaign Progress
              </h2>
              <p className="text-gray-600">Together, we're making a difference</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-gray-600">Raised: {formatCurrency(progress.current_amount)}</span>
                <span className="text-jamaican-green">Goal: {formatCurrency(progress.goal_amount)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-jamaican-green to-primary-400 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                >
                  {progressPercentage > 10 && (
                    <span className="text-white text-xs font-bold">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-jamaican-green mb-2">
                  {progress.donor_count.toLocaleString()}
                </div>
                <div className="text-gray-600">Generous Donors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-jamaican-green mb-2">
                  {formatCurrency(progress.goal_amount)}
                </div>
                <div className="text-gray-600">Campaign Goal</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-jamaican-green mb-2">
                  {formatCurrency(progress.goal_amount - progress.current_amount)}
                </div>
                <div className="text-gray-600">Remaining to Goal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Our Impact Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your donations directly support critical recovery efforts across Jamaica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <HomeIcon className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Home Rebuilding</h3>
              <p className="text-gray-600">
                Reconstructing damaged homes to provide safe shelter for families
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Building2 className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Schools & Education</h3>
              <p className="text-gray-600">
                Restoring educational facilities and resources for children
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Emergency Shelters</h3>
              <p className="text-gray-600">
                Providing immediate shelter and supplies to displaced families
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Community Support</h3>
              <p className="text-gray-600">
                Supporting local communities with resources and resilience programs
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-jamaican-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">
            One Home. One Hope. Help Jamaica Rise.
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of donors worldwide in supporting Jamaica's recovery.
            Every contribution, no matter the size, makes a meaningful impact.
          </p>
          <button
            onClick={() => onNavigate('donate')}
            className="bg-jamaican-gold hover:bg-yellow-500 text-gray-900 font-bold px-10 py-4 rounded-lg text-lg transition-all duration-300 shadow-xl hover:shadow-2xl inline-flex items-center"
          >
            Make a Difference Today
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-jamaican-green mb-2">100%</div>
              <div className="text-gray-600 font-semibold">Transparent Operations</div>
              <p className="text-sm text-gray-500 mt-2">
                Every dollar tracked and reported
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-jamaican-green mb-2">50+</div>
              <div className="text-gray-600 font-semibold">Partner Organizations</div>
              <p className="text-sm text-gray-500 mt-2">
                Working together for maximum impact
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-jamaican-green mb-2">Global</div>
              <div className="text-gray-600 font-semibold">Diaspora Network</div>
              <p className="text-sm text-gray-500 mt-2">
                Jamaicans worldwide united in support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
