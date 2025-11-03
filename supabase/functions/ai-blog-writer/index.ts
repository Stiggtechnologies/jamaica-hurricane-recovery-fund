import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface BlogRequest {
  action: 'generate-topics' | 'write-blog' | 'auto-publish';
  topic?: string;
  keywords?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { action, topic, keywords }: BlogRequest = await req.json();

    if (action === 'generate-topics') {
      const topics = await generateBlogTopics(openaiKey);
      return new Response(
        JSON.stringify({ success: true, topics }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'write-blog') {
      if (!topic) {
        throw new Error('Topic is required for write-blog action');
      }

      const blogContent = await writeBlogPost(openaiKey, topic, keywords || []);
      
      const { data: blogPost, error } = await supabase
        .from('blog_posts')
        .insert({
          title: blogContent.title,
          slug: generateSlug(blogContent.title),
          content: blogContent.content,
          excerpt: blogContent.excerpt,
          author: 'JHRF Team',
          status: 'draft',
          category: blogContent.category,
          tags: blogContent.tags,
          seo_title: blogContent.seo_title,
          seo_description: blogContent.seo_description,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, blog_post: blogPost }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'auto-publish') {
      const { data: recentNews } = await supabase
        .from('aggregated_content')
        .select('title, content, keywords')
        .eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('relevance_score', { ascending: false })
        .limit(5);

      const context = recentNews?.map(n => `${n.title}: ${n.content?.substring(0, 200)}`).join('\n') || '';
      
      const topics = await generateBlogTopics(openaiKey, context);
      const selectedTopic = topics[0];

      const blogContent = await writeBlogPost(openaiKey, selectedTopic, []);
      
      const { data: blogPost, error } = await supabase
        .from('blog_posts')
        .insert({
          title: blogContent.title,
          slug: generateSlug(blogContent.title),
          content: blogContent.content,
          excerpt: blogContent.excerpt,
          author: 'JHRF Team',
          status: 'published',
          published_at: new Date().toISOString(),
          category: blogContent.category,
          tags: blogContent.tags,
          seo_title: blogContent.seo_title,
          seo_description: blogContent.seo_description,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, blog_post: blogPost, message: 'Blog published automatically' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Blog Writer error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateBlogTopics(openaiKey: string, context: string = ''): Promise<string[]> {
  const prompt = `You are a content strategist for the Jamaica Hurricane Recovery Fund (JHRF), a nonprofit raising $100 million for hurricane relief and recovery in Jamaica.

${context ? `Recent news and updates:\n${context}\n\n` : ''}Generate 5 compelling blog post topics that would:
1. Engage donors and supporters
2. Highlight recovery efforts and impact
3. Share stories from Jamaica
4. Educate about climate resilience
5. Inspire action and donations

Return only the topics as a JSON array of strings, nothing else.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  const jsonMatch = content.match(/\[.*\]/s);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return JSON.parse(content);
}

async function writeBlogPost(openaiKey: string, topic: string, keywords: string[]) {
  const keywordText = keywords.length > 0 ? `Include these keywords naturally: ${keywords.join(', ')}` : '';
  
  const prompt = `You are a compassionate, engaging content writer for the Jamaica Hurricane Recovery Fund (JHRF).

Write a comprehensive, heartfelt blog post about: "${topic}"

${keywordText}

Guidelines:
- Write in a warm, authentic, human voice
- Tell compelling stories that connect emotionally
- Include specific details and examples
- Make it 1000-1500 words
- Use short paragraphs for readability
- Include a strong call-to-action
- Focus on hope, resilience, and community
- Be culturally sensitive to Jamaican context

Return the response as a JSON object with this exact structure:
{
  "title": "Compelling title (60 chars max)",
  "excerpt": "Brief summary (150 chars max)",
  "content": "Full blog post in HTML format with <p>, <h2>, <h3>, <ul>, <li> tags",
  "category": "One of: Impact Stories, Recovery Updates, Climate Resilience, Community Voices, Donor Spotlight",
  "tags": ["tag1", "tag2", "tag3"],
  "seo_title": "SEO-optimized title (60 chars max)",
  "seo_description": "SEO meta description (155 chars max)"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  const jsonMatch = content.match(/\{[\s\S]*\}/s);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return JSON.parse(content);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}
