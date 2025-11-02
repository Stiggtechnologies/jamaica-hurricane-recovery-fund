import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const baseUrl = 'https://jamaicahurricanerecoveryfund.org';
    const currentDate = new Date().toISOString().split('T')[0];

    const staticUrls = [
      { loc: baseUrl, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.8 },
      { loc: `${baseUrl}/impact`, changefreq: 'weekly', priority: 0.9 },
      { loc: `${baseUrl}/donate`, changefreq: 'monthly', priority: 1.0 },
      { loc: `${baseUrl}/get-involved`, changefreq: 'monthly', priority: 0.8 },
      { loc: `${baseUrl}/volunteers`, changefreq: 'weekly', priority: 0.7 },
      { loc: `${baseUrl}/platform`, changefreq: 'weekly', priority: 0.7 },
      { loc: `${baseUrl}/news`, changefreq: 'daily', priority: 0.9 },
      { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.6 },
    ];

    const { data: newsArticles } = await supabase
      .from('aggregated_content')
      .select('url, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(100);

    const dynamicUrls = (newsArticles || []).map((article: any) => ({
      loc: article.url,
      lastmod: article.published_at?.split('T')[0],
      changefreq: 'monthly',
      priority: 0.6,
    }));

    const allUrls = [...staticUrls, ...dynamicUrls];

    const urlEntries = allUrls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : `<lastmod>${currentDate}</lastmod>`}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});
