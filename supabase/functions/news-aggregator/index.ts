import { createClient } from 'npm:@supabase/supabase-js@2';
import * as cheerio from 'npm:cheerio@1.0.0-rc.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'scrape';

    if (action === 'scrape') {
      return await scrapeNews(supabase);
    } else if (action === 'sources') {
      return await getNewsSources(supabase);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('News aggregator error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getNewsSources(supabase: any) {
  const { data, error } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, sources: data }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

async function scrapeNews(supabase: any) {
  const { data: sources, error: sourcesError } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true)
    .eq('source_type', 'rss');

  if (sourcesError) throw sourcesError;

  const results = {
    total_sources: sources.length,
    items_found: 0,
    items_added: 0,
    items_updated: 0,
    errors: [] as string[],
  };

  for (const source of sources) {
    try {
      const items = await fetchRSSFeed(source.url);
      results.items_found += items.length;

      for (const item of items) {
        try {
          const { data: existing } = await supabase
            .from('aggregated_content')
            .select('id')
            .eq('url', item.url)
            .single();

          if (existing) {
            results.items_updated++;
            continue;
          }

          const { error: insertError } = await supabase
            .from('aggregated_content')
            .insert({
              source_id: source.id,
              title: item.title,
              description: item.description,
              content: item.content,
              url: item.url,
              author: item.author,
              published_date: item.published_date,
              image_url: item.image_url,
              content_type: 'article',
              keywords: extractKeywords(item.title + ' ' + item.description),
              status: 'pending',
            });

          if (!insertError) {
            results.items_added++;
          }
        } catch (itemError) {
          console.error('Error processing item:', itemError);
        }
      }

      await supabase
        .from('news_sources')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', source.id);
    } catch (sourceError) {
      console.error(`Error scraping ${source.name}:`, sourceError);
      results.errors.push(`${source.name}: ${sourceError.message}`);
    }
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

async function fetchRSSFeed(url: string): Promise<any[]> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'JHRF News Aggregator/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  const items: any[] = [];

  $('item, entry').each((_, elem) => {
    const $elem = $(elem);
    
    const title = $elem.find('title').first().text().trim();
    const link = $elem.find('link').first().attr('href') || $elem.find('link').first().text().trim();
    const description = $elem.find('description, summary').first().text().trim();
    const content = $elem.find('content\\:encoded, content').first().text().trim() || description;
    const author = $elem.find('author, dc\\:creator').first().text().trim();
    const pubDate = $elem.find('pubDate, published, updated').first().text().trim();
    const imageUrl = $elem.find('media\\:content, enclosure[type^="image"]').first().attr('url') || 
                     $elem.find('image url').first().text().trim();

    if (title && link) {
      items.push({
        title: cleanText(title),
        url: link,
        description: cleanText(description),
        content: cleanText(content),
        author: author || null,
        published_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        image_url: imageUrl || null,
      });
    }
  });

  return items;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractKeywords(text: string): string[] {
  const keywords = [
    'hurricane', 'jamaica', 'recovery', 'relief', 'disaster',
    'rebuild', 'climate', 'resilience', 'aid', 'support',
    'storm', 'damage', 'emergency', 'shelter', 'community',
    'donation', 'volunteer', 'restoration', 'flood', 'wind',
  ];

  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword));
}