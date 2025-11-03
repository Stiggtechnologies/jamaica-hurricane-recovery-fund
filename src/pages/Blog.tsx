import { useEffect, useState } from 'react';
import { Calendar, User, Tag, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  status: string;
  published_at: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  view_count: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const handlePostClick = async (post: BlogPost) => {
    setSelectedPost(post);

    await supabase
      .from('blog_posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', post.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const categories = ['all', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  if (selectedPost) {
    return (
      <>
        <SEOHead
          title={selectedPost.seo_title || selectedPost.title}
          description={selectedPost.seo_description || selectedPost.excerpt}
          url={`https://jamaicahurricanerecoveryfund.org/blog/${selectedPost.slug}`}
        />
        <div className="bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-jamaican-green hover:text-jamaican-yellow font-semibold mb-8 flex items-center gap-2"
            >
              ← Back to all posts
            </button>

            <article>
              {selectedPost.featured_image_url && (
                <img
                  src={selectedPost.featured_image_url}
                  alt={selectedPost.title}
                  className="w-full h-96 object-cover rounded-lg mb-8"
                />
              )}

              <div className="mb-8">
                {selectedPost.category && (
                  <span className="inline-block bg-jamaican-green text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                    {selectedPost.category}
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{selectedPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(selectedPost.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{getReadingTime(selectedPost.content)}</span>
                  </div>
                </div>
              </div>

              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag size={20} className="text-gray-400" />
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 p-8 bg-jamaican-green text-white rounded-lg text-center">
                <h3 className="text-2xl font-heading font-bold mb-4">
                  Make a Difference Today
                </h3>
                <p className="mb-6">
                  Your donation helps rebuild lives and create climate-resilient communities in Jamaica.
                </p>
                <button className="bg-jamaican-yellow text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                  Donate Now
                </button>
              </div>
            </article>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Blog - Jamaica Hurricane Recovery Fund"
        description="Read stories of hope, resilience, and recovery from Jamaica. Learn about our impact, climate resilience efforts, and community voices."
        url="https://jamaicahurricanerecoveryfund.org/blog"
      />
      <div className="bg-white">
        <section
          className="relative h-[400px] bg-cover bg-center flex items-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/261857/pexels-photo-261857.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
              Stories of Hope & Recovery
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Real stories from Jamaica about resilience, rebuilding, and community strength
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-jamaican-green text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jamaican-green"></div>
                <p className="mt-4 text-gray-600">Loading blog posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-jamaican-green to-jamaican-yellow"></div>
                    )}
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-block bg-jamaican-green text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                          {post.category}
                        </span>
                      )}
                      <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3 hover:text-jamaican-green transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{getReadingTime(post.content)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-jamaican-green font-semibold flex items-center gap-2">
                          Read more <ArrowRight size={16} />
                        </span>
                        <span className="text-gray-400 text-sm">{post.view_count} views</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
