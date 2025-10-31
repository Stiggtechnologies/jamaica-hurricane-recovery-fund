import { useState, useEffect } from 'react';
import { Clock, Award, Users, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Position {
  id: string;
  title: string;
  department: string;
  level: number;
  description: string;
  responsibilities: string[];
  required_skills: string[];
  time_commitment_hours_per_week: number;
  status: string;
  priority: string;
  salary_equivalent_annually: number;
}

interface TimeLog {
  id: string;
  activity_type: string;
  activity_description: string;
  start_time: string;
  end_time: string | null;
  hours_logged: number;
  total_value_usd: number;
  status: string;
}

export default function Volunteers() {
  const [view, setView] = useState<'portal' | 'org-chart' | 'time-logs'>('org-chart');
  const [positions, setPositions] = useState<Position[]>([]);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('organizational_positions')
      .select('*')
      .order('level', { ascending: true })
      .order('department', { ascending: true });

    if (data) setPositions(data);
    setLoading(false);
  };

  const departments = [...new Set(positions.map(p => p.department))];
  const positionsByDept = departments.reduce((acc, dept) => {
    acc[dept] = positions.filter(p => p.department === dept);
    return acc;
  }, {} as Record<string, Position[]>);

  const toggleDept = (dept: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept);
    } else {
      newExpanded.add(dept);
    }
    setExpandedDepts(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPositions = positions.length;
  const vacantPositions = positions.filter(p => p.status === 'vacant').length;
  const criticalPositions = positions.filter(p => p.priority === 'critical' && p.status === 'vacant').length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
            Volunteer Portal
          </h1>
          <p className="text-gray-600">
            Join our team and donate your time to help Jamaica recover and rebuild stronger
          </p>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setView('org-chart')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'org-chart'
                ? 'border-jamaican-green text-jamaican-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            Organizational Chart
          </button>
          <button
            onClick={() => setView('portal')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'portal'
                ? 'border-jamaican-green text-jamaican-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-5 h-5 inline-block mr-2" />
            My Portal
          </button>
          <button
            onClick={() => setView('time-logs')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'time-logs'
                ? 'border-jamaican-green text-jamaican-green'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-5 h-5 inline-block mr-2" />
            Time Tracking
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jamaican-green"></div>
          </div>
        ) : (
          <>
            {view === 'org-chart' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <Briefcase className="w-8 h-8 text-jamaican-green mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{totalPositions}</div>
                    <div className="text-sm text-gray-600">Total Positions</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <Users className="w-8 h-8 text-jamaican-gold mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{vacantPositions}</div>
                    <div className="text-sm text-gray-600">Open Positions</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <Award className="w-8 h-8 text-red-500 mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{criticalPositions}</div>
                    <div className="text-sm text-gray-600">Critical Vacancies</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-jamaican-green to-primary-600 rounded-xl shadow-xl p-8 text-white mb-8">
                  <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Whether you can contribute 5 hours a week or 40, your skills and time make a
                    real difference. Browse open positions below and apply to help Jamaica recover.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm opacity-90">
                    <div>✓ Flexible remote and on-site opportunities</div>
                    <div>✓ Skill-based matching to your expertise</div>
                    <div>✓ Track your impact with hour valuation</div>
                    <div>✓ Recognition and certificates for contributions</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <button
                        onClick={() => toggleDept(dept)}
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="text-xl font-bold text-gray-900">{dept}</div>
                          <div className="ml-4 px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                            {positionsByDept[dept].length} positions
                          </div>
                          {positionsByDept[dept].some(p => p.status === 'vacant' && p.priority === 'critical') && (
                            <div className="ml-2 px-3 py-1 bg-red-100 rounded-full text-sm font-semibold text-red-800">
                              {positionsByDept[dept].filter(p => p.status === 'vacant' && p.priority === 'critical').length} critical
                            </div>
                          )}
                        </div>
                        {expandedDepts.has(dept) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedDepts.has(dept) && (
                        <div className="border-t border-gray-200 p-6 space-y-4">
                          {positionsByDept[dept].map((position) => (
                            <div
                              key={position.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => setSelectedPosition(position)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">{position.title}</h3>
                                  <p className="text-sm text-gray-600">Level {position.level} • {position.time_commitment_hours_per_week} hrs/week</p>
                                </div>
                                <div className="flex space-x-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    position.status === 'vacant'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {position.status}
                                  </span>
                                  {position.priority === 'critical' && position.status === 'vacant' && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                      Critical
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-700 mb-3">{position.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {position.required_skills?.slice(0, 3).map((skill, i) => (
                                  <span key={i} className="px-2 py-1 bg-primary-50 text-jamaican-green rounded text-xs font-semibold">
                                    {skill}
                                  </span>
                                ))}
                                {position.required_skills?.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                                    +{position.required_skills.length - 3} more
                                  </span>
                                )}
                              </div>
                              <div className="mt-3 text-sm text-gray-600">
                                Value: {formatCurrency(position.salary_equivalent_annually)}/year equivalent
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'portal' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Dashboard</h2>
                <div className="space-y-6">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sign in to access your volunteer portal
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Track your hours, view your impact, and manage your volunteer assignments
                    </p>
                    <button className="btn-primary">Create Volunteer Profile</button>
                  </div>
                </div>
              </div>
            )}

            {view === 'time-logs' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
                  <button className="btn-primary">
                    <Clock className="w-5 h-5 inline-block mr-2" />
                    Log Time
                  </button>
                </div>
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start tracking your volunteer hours
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Log your time contributions and see the monetary value of your volunteer work
                    ($25/hour standard valuation)
                  </p>
                  <button className="btn-secondary">Sign In to Continue</button>
                </div>
              </div>
            )}
          </>
        )}

        {selectedPosition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedPosition.title}</h2>
                  <p className="text-gray-600">{selectedPosition.department}</p>
                </div>
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedPosition.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {selectedPosition.responsibilities?.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPosition.required_skills?.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-50 text-jamaican-green rounded-lg font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Time Commitment</div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedPosition.time_commitment_hours_per_week} hrs/week
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Value Equivalent</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedPosition.salary_equivalent_annually)}/year
                    </div>
                  </div>
                </div>

                <button className="w-full btn-primary text-lg">Apply for This Position</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
