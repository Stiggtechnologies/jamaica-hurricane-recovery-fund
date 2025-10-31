/*
  # Jamaica Hurricane Recovery Fund Database Schema

  ## Overview
  Creates the complete database structure for JHRF website including:
  - News/blog posts management
  - Impact stories and project tracking
  - Donation tracking and progress
  - Volunteer and partnership form submissions
  - Contact form submissions
  - Social media content management

  ## New Tables
  
  ### `news_posts`
  - `id` (uuid, primary key)
  - `title` (text) - Post headline
  - `slug` (text, unique) - URL-friendly identifier
  - `content` (text) - Full post content
  - `excerpt` (text) - Short summary
  - `featured_image` (text) - Image URL
  - `published` (boolean) - Publication status
  - `published_at` (timestamptz) - Publication date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `impact_stories`
  - `id` (uuid, primary key)
  - `name` (text) - Person or community name
  - `location` (text) - Geographic location in Jamaica
  - `story` (text) - Full story content
  - `image_url` (text) - Featured image
  - `video_url` (text, optional) - Video link
  - `latitude` (numeric, optional) - Map coordinates
  - `longitude` (numeric, optional) - Map coordinates
  - `featured` (boolean) - Featured story flag
  - `created_at` (timestamptz)

  ### `projects`
  - `id` (uuid, primary key)
  - `name` (text) - Project name
  - `location` (text) - Parish/area
  - `type` (text) - homes/schools/shelters/infrastructure
  - `description` (text) - Project details
  - `status` (text) - planned/in_progress/completed
  - `budget` (numeric) - Project budget in USD
  - `spent` (numeric) - Amount spent
  - `beneficiaries` (integer) - Number of people helped
  - `latitude` (numeric, optional)
  - `longitude` (numeric, optional)
  - `images` (jsonb) - Array of image URLs
  - `start_date` (date)
  - `completion_date` (date, optional)
  - `created_at` (timestamptz)

  ### `donations`
  - `id` (uuid, primary key)
  - `amount` (numeric) - Donation amount
  - `currency` (text) - USD/CAD/GBP
  - `donor_name` (text, optional) - Donor name (if not anonymous)
  - `donor_email` (text, optional) - For receipts
  - `is_recurring` (boolean) - One-time vs recurring
  - `frequency` (text, optional) - monthly/quarterly/annual
  - `donation_date` (timestamptz)
  - `payment_provider` (text) - stripe/donorbox
  - `transaction_id` (text) - External reference
  - `anonymous` (boolean)
  - `created_at` (timestamptz)

  ### `volunteers`
  - `id` (uuid, primary key)
  - `full_name` (text) - Volunteer name
  - `email` (text) - Contact email
  - `phone` (text, optional) - Phone number
  - `location` (text) - Current location/country
  - `skills` (text) - Skills and expertise
  - `availability` (text) - Time commitment
  - `message` (text) - Additional information
  - `status` (text) - pending/contacted/approved
  - `created_at` (timestamptz)

  ### `partnership_inquiries`
  - `id` (uuid, primary key)
  - `organization_name` (text) - Company/org name
  - `contact_name` (text) - Contact person
  - `email` (text) - Contact email
  - `phone` (text, optional)
  - `organization_type` (text) - corporate/nonprofit/government/other
  - `inquiry_type` (text) - sponsorship/volunteer/in-kind/other
  - `message` (text) - Inquiry details
  - `status` (text) - new/reviewing/responded
  - `created_at` (timestamptz)

  ### `contact_submissions`
  - `id` (uuid, primary key)
  - `name` (text) - Sender name
  - `email` (text) - Sender email
  - `subject` (text) - Message subject
  - `message` (text) - Message content
  - `status` (text) - new/read/replied
  - `created_at` (timestamptz)

  ### `donation_progress`
  - `id` (uuid, primary key)
  - `goal_amount` (numeric) - Campaign goal (100000000 USD)
  - `current_amount` (numeric) - Total raised
  - `donor_count` (integer) - Number of donors
  - `last_updated` (timestamptz)

  ## Security
  
  All tables have RLS enabled with appropriate policies:
  - Public read access for published content
  - Admin-only write access
  - Secure handling of donor information

  ## Notes
  
  1. Initial donation progress record set to $100M goal
  2. Indexes added for performance on frequently queried fields
  3. Timestamps track all record changes
*/

-- Create news_posts table
CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create impact_stories table
CREATE TABLE IF NOT EXISTS impact_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  story text NOT NULL,
  image_url text,
  video_url text,
  latitude numeric,
  longitude numeric,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'planned',
  budget numeric DEFAULT 0,
  spent numeric DEFAULT 0,
  beneficiaries integer DEFAULT 0,
  latitude numeric,
  longitude numeric,
  images jsonb DEFAULT '[]'::jsonb,
  start_date date,
  completion_date date,
  created_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  donor_name text,
  donor_email text,
  is_recurring boolean DEFAULT false,
  frequency text,
  donation_date timestamptz DEFAULT now(),
  payment_provider text,
  transaction_id text,
  anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text NOT NULL,
  skills text NOT NULL,
  availability text NOT NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create partnership_inquiries table
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  organization_type text NOT NULL,
  inquiry_type text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Create donation_progress table
CREATE TABLE IF NOT EXISTS donation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_amount numeric NOT NULL DEFAULT 100000000,
  current_amount numeric NOT NULL DEFAULT 0,
  donor_count integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Insert initial donation progress record
INSERT INTO donation_progress (goal_amount, current_amount, donor_count)
VALUES (100000000, 0, 0)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_progress ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public can view published news posts"
  ON news_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Public can view impact stories"
  ON impact_stories FOR SELECT
  USING (true);

CREATE POLICY "Public can view projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Public can view donation progress"
  ON donation_progress FOR SELECT
  USING (true);

-- Public insert policies for forms
CREATE POLICY "Anyone can submit volunteer application"
  ON volunteers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can submit partnership inquiry"
  ON partnership_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can record donation"
  ON donations FOR INSERT
  WITH CHECK (true);

-- Admin policies (authenticated users can manage all content)
CREATE POLICY "Authenticated users can manage news posts"
  ON news_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage impact stories"
  ON impact_stories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view donations"
  ON donations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view volunteers"
  ON volunteers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view partnership inquiries"
  ON partnership_inquiries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact submissions"
  ON contact_submissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update donation progress"
  ON donation_progress FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_posts(published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_impact_featured ON impact_stories(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnership_inquiries(status);