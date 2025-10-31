/*
  # Content Aggregation & AI System Schema

  ## Overview
  Adds tables and functions for:
  - News article aggregation and curation
  - AI chatbot knowledge base
  - Newsletter management
  - Content moderation and fact-checking
  - Social media posting automation

  ## New Tables
  
  ### `news_sources`
  RSS feeds and news sources to monitor
  
  ### `aggregated_content`
  Scraped articles, videos, news items
  
  ### `content_queue`
  Content pending review/approval
  
  ### `published_content`
  Approved and published content
  
  ### `chatbot_knowledge`
  AI chatbot training data and FAQs
  
  ### `chatbot_conversations`
  User conversation history
  
  ### `newsletters`
  Newsletter campaigns and sends
  
  ### `newsletter_subscribers`
  Newsletter subscription management
  
  ### `social_media_posts`
  Scheduled and posted social content
  
  ## Security
  All tables have RLS with appropriate policies
*/

-- News sources to monitor
CREATE TABLE IF NOT EXISTS news_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type text CHECK (source_type IN ('rss', 'api', 'twitter', 'youtube', 'website')) NOT NULL,
  url text NOT NULL,
  category text,
  credibility_score numeric DEFAULT 80 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  last_checked_at timestamptz,
  check_frequency_minutes int DEFAULT 60,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Aggregated content from various sources
CREATE TABLE IF NOT EXISTS aggregated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES news_sources(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  content text,
  url text UNIQUE NOT NULL,
  author text,
  published_date timestamptz,
  image_url text,
  video_url text,
  content_type text CHECK (content_type IN ('article', 'video', 'social', 'report', 'press_release')) NOT NULL,
  relevance_score numeric DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  keywords text[],
  is_verified boolean DEFAULT false,
  verification_notes text,
  status text CHECK (status IN ('pending', 'approved', 'rejected', 'published')) DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Content queue for review
CREATE TABLE IF NOT EXISTS content_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES aggregated_content(id) ON DELETE CASCADE,
  priority int DEFAULT 50,
  suggested_action text CHECK (suggested_action IN ('publish', 'share', 'newsletter', 'ignore')),
  ai_summary text,
  ai_confidence numeric,
  assigned_to uuid,
  due_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Published content (approved items)
CREATE TABLE IF NOT EXISTS published_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregated_content_id uuid REFERENCES aggregated_content(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  author text DEFAULT 'JHRF Editorial Team',
  published_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  view_count int DEFAULT 0,
  share_count int DEFAULT 0,
  tags text[],
  categories text[],
  is_featured boolean DEFAULT false,
  seo_title text,
  seo_description text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Chatbot knowledge base
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  keywords text[],
  context text,
  confidence_threshold numeric DEFAULT 0.7,
  usage_count int DEFAULT 0,
  last_used_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chatbot conversation history
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_message text NOT NULL,
  bot_response text NOT NULL,
  matched_knowledge_id uuid REFERENCES chatbot_knowledge(id) ON DELETE SET NULL,
  confidence_score numeric,
  user_feedback text CHECK (user_feedback IN ('helpful', 'not_helpful', 'neutral')),
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Newsletter campaigns
CREATE TABLE IF NOT EXISTS newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_line text NOT NULL,
  preview_text text,
  html_content text NOT NULL,
  plain_text_content text,
  content_items uuid[],
  status text CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')) DEFAULT 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipient_count int DEFAULT 0,
  opened_count int DEFAULT 0,
  clicked_count int DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  status text CHECK (status IN ('active', 'unsubscribed', 'bounced')) DEFAULT 'active',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  preferences jsonb DEFAULT '{"frequency": "weekly", "topics": ["all"]}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Newsletter delivery tracking
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id uuid REFERENCES newsletters(id) ON DELETE CASCADE,
  subscriber_id uuid REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'bounced', 'failed')) DEFAULT 'pending',
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounce_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(newsletter_id, subscriber_id)
);

-- Social media posts
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES aggregated_content(id) ON DELETE SET NULL,
  platform text CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin')) NOT NULL,
  post_text text NOT NULL,
  media_urls text[],
  hashtags text[],
  status text CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')) DEFAULT 'draft',
  scheduled_for timestamptz,
  posted_at timestamptz,
  post_url text,
  engagement_count int DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_sources_active ON news_sources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_news_sources_next_check ON news_sources(last_checked_at, check_frequency_minutes) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_aggregated_content_status ON aggregated_content(status);
CREATE INDEX IF NOT EXISTS idx_aggregated_content_relevance ON aggregated_content(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_aggregated_content_published_date ON aggregated_content(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_aggregated_content_url ON aggregated_content(url);

CREATE INDEX IF NOT EXISTS idx_content_queue_priority ON content_queue(priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_content_queue_assigned ON content_queue(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_published_content_slug ON published_content(slug);
CREATE INDEX IF NOT EXISTS idx_published_content_published_at ON published_content(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_published_content_featured ON published_content(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_keywords ON chatbot_knowledge USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_active ON chatbot_knowledge(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_scheduled ON newsletters(scheduled_for) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_media_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_media_posts(platform, status);

-- Enable Row Level Security
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public can view published content"
  ON published_content FOR SELECT
  USING (published_at <= NOW());

CREATE POLICY "Public can view active chatbot knowledge"
  ON chatbot_knowledge FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active news sources"
  ON news_sources FOR SELECT
  USING (is_active = true);

-- Newsletter subscription policies
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Subscribers can view own subscription"
  ON newsletter_subscribers FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Subscribers can update own subscription"
  ON newsletter_subscribers FOR UPDATE
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Chatbot conversation policies
CREATE POLICY "Anyone can create chatbot conversations"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own conversations"
  ON chatbot_conversations FOR SELECT
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id');

-- Admin policies
CREATE POLICY "Authenticated users can manage news sources"
  ON news_sources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage aggregated content"
  ON aggregated_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage content queue"
  ON content_queue FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage published content"
  ON published_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage chatbot knowledge"
  ON chatbot_knowledge FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all chatbot conversations"
  ON chatbot_conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage newsletters"
  ON newsletters FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all newsletter subscribers"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view newsletter sends"
  ON newsletter_sends FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage social media posts"
  ON social_media_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to calculate content relevance score
CREATE OR REPLACE FUNCTION calculate_relevance_score(
  p_title text,
  p_description text,
  p_content text
)
RETURNS numeric AS $$
DECLARE
  score numeric := 0;
  keywords text[] := ARRAY['hurricane', 'jamaica', 'recovery', 'relief', 'disaster', 'rebuild', 'climate', 'resilience', 'aid', 'support'];
  keyword text;
BEGIN
  -- Check title (weight: 40)
  FOREACH keyword IN ARRAY keywords LOOP
    IF LOWER(p_title) LIKE '%' || keyword || '%' THEN
      score := score + 4;
    END IF;
  END LOOP;
  
  -- Check description (weight: 30)
  IF p_description IS NOT NULL THEN
    FOREACH keyword IN ARRAY keywords LOOP
      IF LOWER(p_description) LIKE '%' || keyword || '%' THEN
        score := score + 3;
      END IF;
    END LOOP;
  END IF;
  
  -- Check content (weight: 30)
  IF p_content IS NOT NULL THEN
    FOREACH keyword IN ARRAY keywords LOOP
      IF LOWER(p_content) LIKE '%' || keyword || '%' THEN
        score := score + 3;
      END IF;
    END LOOP;
  END IF;
  
  -- Cap at 100
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate relevance on insert
CREATE OR REPLACE FUNCTION auto_calculate_relevance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.relevance_score := calculate_relevance_score(NEW.title, NEW.description, NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_relevance
  BEFORE INSERT ON aggregated_content
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_relevance();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(p_title text)
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  slug := LOWER(TRIM(p_title));
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');
  slug := REGEXP_REPLACE(slug, '^-|-$', '', 'g');
  slug := SUBSTRING(slug, 1, 100);
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    -- Make unique if needed
    WHILE EXISTS (SELECT 1 FROM published_content WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::text, 1, 8);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_slug
  BEFORE INSERT OR UPDATE ON published_content
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- View for newsletter analytics
CREATE OR REPLACE VIEW v_newsletter_analytics AS
SELECT
  n.id,
  n.title,
  n.sent_at,
  n.recipient_count,
  COUNT(DISTINCT CASE WHEN ns.status = 'opened' THEN ns.id END) as opens,
  COUNT(DISTINCT CASE WHEN ns.status = 'clicked' THEN ns.id END) as clicks,
  ROUND(
    COUNT(DISTINCT CASE WHEN ns.status = 'opened' THEN ns.id END)::numeric / 
    NULLIF(n.recipient_count, 0) * 100, 
    2
  ) as open_rate,
  ROUND(
    COUNT(DISTINCT CASE WHEN ns.status = 'clicked' THEN ns.id END)::numeric / 
    NULLIF(COUNT(DISTINCT CASE WHEN ns.status = 'opened' THEN ns.id END), 0) * 100, 
    2
  ) as click_rate
FROM newsletters n
LEFT JOIN newsletter_sends ns ON n.id = ns.newsletter_id
WHERE n.status = 'sent'
GROUP BY n.id, n.title, n.sent_at, n.recipient_count;

-- View for content performance
CREATE OR REPLACE VIEW v_content_performance AS
SELECT
  pc.id,
  pc.title,
  pc.published_at,
  pc.view_count,
  pc.share_count,
  COUNT(DISTINCT sm.id) as social_posts,
  SUM(sm.engagement_count) as total_engagement
FROM published_content pc
LEFT JOIN social_media_posts sm ON sm.content_id = pc.aggregated_content_id
GROUP BY pc.id, pc.title, pc.published_at, pc.view_count, pc.share_count
ORDER BY pc.published_at DESC;

-- Insert default news sources
INSERT INTO news_sources (name, source_type, url, category, credibility_score) VALUES
  ('Jamaica Observer', 'rss', 'http://www.jamaicaobserver.com/rss/news', 'news', 90),
  ('Jamaica Gleaner', 'rss', 'http://jamaica-gleaner.com/feed/rss.xml', 'news', 90),
  ('Loop Jamaica', 'rss', 'https://jamaica.loopnews.com/rss', 'news', 85),
  ('National Hurricane Center', 'rss', 'https://www.nhc.noaa.gov/index.xml', 'weather', 95),
  ('ReliefWeb Jamaica', 'rss', 'https://reliefweb.int/updates/rss.xml?country=116', 'relief', 90),
  ('UN News - Disasters', 'rss', 'https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml', 'global', 95)
ON CONFLICT DO NOTHING;

-- Insert default chatbot knowledge
INSERT INTO chatbot_knowledge (question, answer, category, keywords) VALUES
  ('What is JHRF?', 'JHRF (Jamaica Hurricane Recovery Fund) is a $100 million global initiative founded by Orville Davis to support hurricane relief, recovery, and long-term climate resilience in Jamaica. We rebuild homes, restore schools, construct emergency shelters, and strengthen communities.', 'about', ARRAY['jhrf', 'what', 'about', 'who']),
  
  ('How can I donate?', 'You can donate through our website at jamaicahurricanefund.org/donate. We accept one-time and monthly donations via credit card, bank transfer, and mobile payments. All donations are tax-deductible and 100% transparent.', 'donate', ARRAY['donate', 'how', 'give', 'contribute']),
  
  ('Where does my money go?', 'Every dollar is tracked transparently. Your donation supports: home rebuilding (40%), school restoration (30%), emergency shelters (20%), and community resilience programs (10%). We publish quarterly financial reports and maintain 100% transparency.', 'transparency', ARRAY['money', 'transparency', 'funds', 'where']),
  
  ('Can I volunteer?', 'Yes! We welcome volunteers with skills in construction, project management, fundraising, communications, and more. Visit jamaicahurricanefund.org/get-involved to apply. We have both on-ground opportunities in Jamaica and remote positions globally.', 'volunteer', ARRAY['volunteer', 'help', 'get involved']),
  
  ('What hurricanes have affected Jamaica?', 'Jamaica has been impacted by numerous hurricanes including Hurricane Gilbert (1988), Ivan (2004), Dean (2007), Sandy (2012), and Matthew (2016). Climate change is increasing hurricane intensity and frequency, making resilience crucial.', 'hurricanes', ARRAY['hurricane', 'storms', 'which', 'history']),
  
  ('How can corporations partner with us?', 'Corporations can partner through matching gift programs, employee volunteer initiatives, in-kind donations, or sponsorships. Contact partnerships@jamaicahurricanefund.org to discuss custom partnership opportunities that align with your CSR goals.', 'corporate', ARRAY['corporate', 'business', 'partner', 'company']),
  
  ('Is JHRF legitimate?', 'Yes, JHRF is a registered charitable organization founded by Orville Davis in partnership with Stigg Security Inc., Omega Group, and Alberta Tech Team. We maintain complete financial transparency, undergo independent audits, and publish quarterly impact reports. All donations are tax-deductible.', 'trust', ARRAY['legitimate', 'trust', 'verified', 'real', 'scam']),
  
  ('What is the $100 million goal for?', 'Our $100 million goal funds comprehensive recovery: rebuilding 5,000+ homes, restoring 100+ schools, constructing 50+ emergency shelters, and implementing climate resilience programs in all 14 Jamaican parishes. This creates lasting change beyond immediate relief.', 'goal', ARRAY['goal', 'million', '100', 'target']),
  
  ('Who is Orville Davis?', 'Orville Davis is a Jamaican-born entrepreneur based in Alberta, Canada, and the founder of JHRF. Having witnessed hurricane devastation firsthand, he created this fund to give back to his homeland and build long-term resilience. His quote: "Jamaica gave me my foundation. Now, it''s time to help rebuild foundations for others."', 'founder', ARRAY['orville', 'davis', 'founder', 'who']),
  
  ('How do I track the impact of my donation?', 'All donors receive thank-you receipts immediately, Day 7 impact updates, Day 30 transparency reports, and quarterly project updates. You can also visit our Impact page to see real-time progress on projects across Jamaica. We maintain 100% transparency.', 'impact', ARRAY['track', 'impact', 'results', 'progress'])
ON CONFLICT DO NOTHING;