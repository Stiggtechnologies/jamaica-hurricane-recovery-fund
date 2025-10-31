import { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, Target, Plus, Settings, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  goal_amount_cents: number;
  current_amount_cents: number;
  status: string;
}

export default function Platform() {
  const [view, setView] = useState<'dashboard' | 'organizations' | 'campaigns' | 'settings'>('dashboard');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: orgsData } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: campaignsData } = await supabase
      .from('organization_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (orgsData) setOrganizations(orgsData);
    if (campaignsData) setCampaigns(campaignsData);

    setLoading(false);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const totalRaised = campaigns.reduce((sum, c) => sum + c.current_amount_cents, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
            Global Relief Platform
          </h1>
          <p className="text-gray-600">
            Empowering organizations worldwide to run relief programs for Jamaica
          </p>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setView('dashboard')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'dashboard'
                ? 'border-jamaican-green text-jamaican-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline-block mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setView('organizations')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'organizations'
                ? 'border-jamaican-green text-jamaican-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-5 h-5 inline-block mr-2" />
            Organizations
          </button>
          <button
            onClick={() => setView('campaigns')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'campaigns'
                ? 'border-jamaican-green text-jamaican-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-5 h-5 inline-block mr-2" />
            Campaigns
          </button>
          <button
            onClick={() => setView('settings')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'settings'
                ? 'border-jamaican-green text-jamaican-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5 inline-block mr-2" />
            Settings
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jamaican-green"></div>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Building2 className="w-8 h-8 text-jamaican-green" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {organizations.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Organizations</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Target className="w-8 h-8 text-jamaican-gold" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {activeCampaigns}
                    </div>
                    <div className="text-sm text-gray-600">Active Campaigns</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(totalRaised)}
                    </div>
                    <div className="text-sm text-gray-600">Total Raised</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {organizations.filter(o => o.is_active).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Organizations</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Platform Overview
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      The Global Relief Platform enables support organizations worldwide to launch
                      and manage relief programs for Jamaica. Each organization gets:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li>✓ Custom branded portal with their logo and colors</li>
                      <li>✓ Campaign management with real-time progress tracking</li>
                      <li>✓ Donor management and automated thank-you emails</li>
                      <li>✓ Beneficiary tracking and impact reporting</li>
                      <li>✓ Program administration and resource allocation</li>
                      <li>✓ Multi-currency support and payment processing</li>
                      <li>✓ Analytics dashboard and financial reporting</li>
                      <li>✓ Team collaboration with role-based permissions</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-jamaican-green to-primary-600 rounded-xl shadow-xl p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">Start Your Organization</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Join the platform and create your relief program in minutes. No technical
                    expertise required.
                  </p>
                  <button className="bg-white text-jamaican-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    <Plus className="w-5 h-5 inline-block mr-2" />
                    Create Organization
                  </button>
                </div>
              </div>
            )}

            {view === 'organizations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
                  <button className="btn-primary">
                    <Plus className="w-5 h-5 inline-block mr-2" />
                    Add Organization
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizations.map((org) => (
                    <div key={org.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-jamaican-green rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          {org.name.charAt(0)}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            org.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {org.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{org.name}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-semibold capitalize">{org.organization_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tier:</span>
                          <span className="font-semibold capitalize">{org.subscription_tier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Joined:</span>
                          <span className="font-semibold">
                            {new Date(org.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="mt-4 w-full btn-secondary text-sm">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'campaigns' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
                  <button className="btn-primary">
                    <Plus className="w-5 h-5 inline-block mr-2" />
                    New Campaign
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Goal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Raised
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.map((campaign) => {
                        const progress = (campaign.current_amount_cents / campaign.goal_amount_cents) * 100;
                        return (
                          <tr key={campaign.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatCurrency(campaign.goal_amount_cents)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-jamaican-green">
                                {formatCurrency(campaign.current_amount_cents)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-jamaican-green h-2 rounded-full"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  campaign.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {campaign.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === 'settings' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Global Relief Platform"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Currency
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent">
                          <option value="USD">USD - US Dollar</option>
                          <option value="JMD">JMD - Jamaican Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Organization Approval
                    </h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto-approve"
                        className="w-4 h-4 text-jamaican-green border-gray-300 rounded focus:ring-jamaican-green"
                      />
                      <label htmlFor="auto-approve" className="ml-2 text-sm text-gray-700">
                        Automatically approve new organizations
                      </label>
                    </div>
                  </div>

                  <div>
                    <button className="btn-primary">Save Settings</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
