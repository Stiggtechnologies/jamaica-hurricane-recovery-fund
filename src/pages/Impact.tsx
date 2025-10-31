import { useEffect, useState } from 'react';
import { MapPin, Play, Users, Home, Building2, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  description: string;
  status: string;
  budget: number;
  spent: number;
  beneficiaries: number;
  latitude: number | null;
  longitude: number | null;
}

interface ImpactStory {
  id: string;
  name: string;
  location: string;
  story: string;
  image_url: string | null;
  video_url: string | null;
  featured: boolean;
}

export default function Impact() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
    fetchStories();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setProjects(data);
    }
  };

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('impact_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setStories(data);
    }
  };

  const filteredProjects = selectedType === 'all'
    ? projects
    : projects.filter(p => p.type === selectedType);

  const projectTypes = [
    { id: 'all', label: 'All Projects', icon: TrendingUp },
    { id: 'homes', label: 'Homes', icon: Home },
    { id: 'schools', label: 'Schools', icon: Building2 },
    { id: 'shelters', label: 'Shelters', icon: Users },
  ];

  const totalStats = {
    projects: projects.length,
    beneficiaries: projects.reduce((sum, p) => sum + p.beneficiaries, 0),
    spent: projects.reduce((sum, p) => sum + p.spent, 0),
    completed: projects.filter(p => p.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'planned': return 'Planned';
      default: return status;
    }
  };

  return (
    <div className="bg-white">
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            Our Impact
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Real projects, real people, real change across Jamaica
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-jamaican-green mb-2">
                {totalStats.projects}
              </div>
              <div className="text-gray-600 font-semibold">Active Projects</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-jamaican-green mb-2">
                {totalStats.beneficiaries.toLocaleString()}
              </div>
              <div className="text-gray-600 font-semibold">Lives Impacted</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-jamaican-green mb-2">
                ${(totalStats.spent / 1000000).toFixed(1)}M
              </div>
              <div className="text-gray-600 font-semibold">Funds Deployed</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-jamaican-green mb-2">
                {totalStats.completed}
              </div>
              <div className="text-gray-600 font-semibold">Projects Completed</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Interactive Project Map
            </h2>
            <p className="text-xl text-gray-600">
              Explore our rebuilding efforts across Jamaica
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div
              className="w-full h-[500px] bg-cover bg-center rounded-xl relative"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/335393/pexels-photo-335393.jpeg?auto=compress&cs=tinysrgb&w=1920)',
              }}
            >
              <div className="absolute inset-0 bg-jamaican-green bg-opacity-20 rounded-xl flex items-center justify-center">
                <div className="text-center bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl max-w-md">
                  <MapPin className="mx-auto text-jamaican-green mb-4" size={48} />
                  <h3 className="text-2xl font-heading font-bold mb-2">
                    {projects.length} Projects Across Jamaica
                  </h3>
                  <p className="text-gray-600">
                    From Kingston to Montego Bay, our projects span all 14 parishes
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
              Project Portfolio
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Browse our current and completed rebuilding initiatives
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {projectTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedType === type.id
                        ? 'bg-jamaican-green text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mr-2" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Projects coming soon. Check back for updates!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-jamaican-green flex items-center justify-center">
                    <Building2 className="text-white opacity-50" size={64} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-heading font-bold text-gray-900">
                        {project.name}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin size={16} className="mr-1" />
                      {project.location}
                    </div>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-semibold">${(project.budget / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Beneficiaries:</span>
                        <span className="font-semibold">{project.beneficiaries}</span>
                      </div>
                      {project.status !== 'planned' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{((project.spent / project.budget) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-jamaican-green h-2 rounded-full"
                              style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Stories of Hope
            </h2>
            <p className="text-xl text-gray-600">
              Meet the people whose lives have been transformed
            </p>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Impact stories coming soon. Check back for inspiring updates!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stories.map(story => (
                <div key={story.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {story.image_url && (
                    <div className="h-64 bg-gray-200">
                      <img
                        src={story.image_url}
                        alt={story.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      {story.video_url && (
                        <div className="bg-jamaican-green text-white rounded-full p-2 mr-3">
                          <Play size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-heading font-bold text-gray-900">
                          {story.name}
                        </h3>
                        <p className="text-sm text-gray-600">{story.location}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {story.story}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
