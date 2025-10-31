import { useState, useEffect } from 'react';
import { Lock, Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'news' | 'stories' | 'projects' | 'progress'>('news');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user && !error) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-jamaican-green text-white p-4 rounded-full">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-heading font-bold text-center mb-2">
            Admin Login
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Access the CMS to manage content
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Authentication is configured and ready. Create an admin account
              through Supabase dashboard to access the CMS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              JHRF Admin CMS
            </h1>
            <button
              onClick={() => {
                supabase.auth.signOut();
                setIsAuthenticated(false);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'news', label: 'News Posts' },
              { id: 'stories', label: 'Impact Stories' },
              { id: 'projects', label: 'Projects' },
              { id: 'progress', label: 'Donation Progress' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-jamaican-green text-jamaican-green'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'news' && <NewsManager />}
            {activeTab === 'stories' && <StoriesManager />}
            {activeTab === 'projects' && <ProjectsManager />}
            {activeTab === 'progress' && <ProgressManager />}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsManager() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold">News Posts</h2>
        <button className="btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          No news posts yet. Create your first post to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600">{post.published ? 'Published' : 'Draft'}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-jamaican-green hover:bg-primary-50 rounded">
                  <Edit size={18} />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoriesManager() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold">Impact Stories</h2>
        <button className="btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Story
        </button>
      </div>
      <div className="text-center py-12 text-gray-600">
        Manage impact stories and testimonials from communities.
      </div>
    </div>
  );
}

function ProjectsManager() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold">Projects</h2>
        <button className="btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Project
        </button>
      </div>
      <div className="text-center py-12 text-gray-600">
        Track and manage rebuilding projects across Jamaica.
      </div>
    </div>
  );
}

function ProgressManager() {
  const [progress, setProgress] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    current_amount: 0,
    donor_count: 0,
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const { data } = await supabase
      .from('donation_progress')
      .select('*')
      .maybeSingle();
    if (data) {
      setProgress(data);
      setFormData({
        current_amount: data.current_amount,
        donor_count: data.donor_count,
      });
    }
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('donation_progress')
      .update(formData)
      .eq('id', progress.id);

    if (!error) {
      await fetchProgress();
      setEditing(false);
    }
  };

  if (!progress) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold">Donation Progress</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-outline flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Edit
          </button>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Goal Amount
            </label>
            <div className="text-2xl font-bold text-gray-900">
              ${progress.goal_amount.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Amount
            </label>
            {editing ? (
              <input
                type="number"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="text-2xl font-bold text-jamaican-green">
                ${progress.current_amount.toLocaleString()}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Donor Count
            </label>
            {editing ? (
              <input
                type="number"
                value={formData.donor_count}
                onChange={(e) => setFormData({ ...formData, donor_count: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {progress.donor_count.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleUpdate}
              className="btn-primary flex items-center"
            >
              <Save size={20} className="mr-2" />
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  current_amount: progress.current_amount,
                  donor_count: progress.donor_count,
                });
              }}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
