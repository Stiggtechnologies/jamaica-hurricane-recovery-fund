/*
  # Add Blog Posts and Email Queue Tables

  ## Overview
  Adds blog publishing and email queue management to complete the content automation system.

  ## New Tables

  ### `blog_posts` table
  - Original blog content creation
  - Rich text content with SEO metadata
  - Publication workflow (draft → published → archived)
  - Category and tag system
  - View tracking

  ### `email_queue` table
  - Outgoing email queue management
  - Retry logic support
  - Delivery status tracking
  - Scheduled sending

  ## Security
  All tables have RLS enabled with:
  - Public read access for published blog posts
  - Authenticated admin access for management

  ## Indexes
  Performance indexes on search, status, and timestamp fields
*/

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  author text,
  status text CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at timestamptz,
  category text,
  tags text[],
  featured_image_url text,
  view_count int DEFAULT 0,
  seo_title text,
  seo_description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email queue for sending
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  status text CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
  scheduled_for timestamptz DEFAULT now(),
  sent_at timestamptz,
  error_message text,
  retry_count int DEFAULT 0,
  max_retries int DEFAULT 3,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Public read policy for published blog posts
CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Admin policies for authenticated users
CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage email queue"
  ON email_queue FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
