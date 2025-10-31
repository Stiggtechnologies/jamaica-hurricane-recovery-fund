import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
}

export default function News() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (data && !error) {
      setPosts(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="bg-white">
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            News & Updates
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Stay informed about our progress and impact across Jamaica
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jamaican-green"></div>
              <p className="text-gray-600 mt-4">Loading updates...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-xl p-12 max-w-2xl mx-auto">
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                  Updates Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  We're preparing exciting updates about our projects and impact.
                  Check back soon or subscribe to our newsletter to stay informed.
                </p>
                <button className="btn-primary">
                  Subscribe to Newsletter
                </button>
              </div>
            </div>
          ) : (
            <>
              {posts.slice(0, 1).map((post) => (
                <div key={post.id} className="mb-12">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div
                        className="h-96 bg-cover bg-center"
                        style={{
                          backgroundImage: post.featured_image
                            ? `url(${post.featured_image})`
                            : 'url(https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800)',
                        }}
                      />
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="text-sm font-semibold text-jamaican-green mb-2">
                          FEATURED STORY
                        </div>
                        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                          {post.title}
                        </h2>
                        <div className="flex items-center text-gray-600 text-sm mb-4 space-x-4">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            {formatDate(post.published_at)}
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {getReadingTime(post.content)}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                          {post.excerpt || post.content.substring(0, 200) + '...'}
                        </p>
                        <button className="btn-secondary w-fit">
                          Read Full Story
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.slice(1).map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                  >
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: post.featured_image
                          ? `url(${post.featured_image})`
                          : 'url(https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600)',
                      }}
                    />
                    <div className="p-6">
                      <div className="flex items-center text-gray-600 text-xs mb-3 space-x-3">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(post.published_at)}
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {getReadingTime(post.content)}
                        </div>
                      </div>
                      <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                        {post.title}
                      </h3>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {post.excerpt || post.content.substring(0, 150) + '...'}
                      </p>
                      <button className="text-jamaican-green font-semibold hover:underline text-sm">
                        Read More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              Stay Connected
            </h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter for the latest updates, stories, and ways to get involved
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
