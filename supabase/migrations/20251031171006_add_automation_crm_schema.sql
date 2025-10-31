/*
  # Add Automation and CRM Schema for JHRF

  ## Overview
  Enhances the existing JHRF database with comprehensive CRM, automation tracking,
  referral system, corporate matching, and event logging capabilities to support
  n8n/Make workflow automations.

  ## New Tables
  
  ### Enhanced `donors` table
  Replaces volunteer-only tracking with full donor CRM
  - Personal information and preferences
  - Referral codes (for ambassadors)
  - Consent and communication preferences
  
  ### `donations_enhanced` table
  - Links to donors
  - External IDs from Donorbox/Stripe
  - Detailed payment tracking
  - Status and frequency management
  
  ### `corporate_matches` table
  - Company matching pledges
  - Tracking matched amounts
  - Status workflow
  
  ### `pledges` table
  - Future donation commitments
  - Corporate and individual pledges
  
  ### `referrals` table
  - Ambassador referral tracking
  - Conversion tracking
  - Leaderboard data
  
  ### `email_events` table
  - Email delivery tracking
  - Opens, clicks, bounces
  - Template performance
  
  ### `sms_events` table
  - SMS delivery tracking
  - Twilio integration logging
  
  ### `webhooks_in` table
  - Webhook payload logging
  - Audit trail for all incoming events
  
  ### `etl_runs` table
  - Automation execution tracking
  - Workflow run logging
  
  ### `kpi_snapshots` table
  - Daily/weekly KPI captures
  - Historical metrics
  
  ### `donor_journey_state` table
  - Track where each donor is in email journey
  - Prevent duplicate sends
  
  ## Views
  
  ### `v_metrics`
  Real-time aggregated metrics for API
  
  ### `v_referral_leaderboard`
  Top ambassadors by conversions
  
  ## Security
  
  All tables have RLS enabled with appropriate policies for:
  - Public webhook ingestion
  - Authenticated admin access
  - Read-only API access for metrics
  
  ## Indexes
  
  Performance indexes on frequently queried fields
*/

-- Drop existing volunteer-focused donors if exists, we'll recreate enhanced
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS pledges CASCADE;
DROP TABLE IF EXISTS corporate_matches CASCADE;
DROP TABLE IF EXISTS email_events CASCADE;
DROP TABLE IF EXISTS sms_events CASCADE;
DROP TABLE IF EXISTS webhooks_in CASCADE;
DROP TABLE IF EXISTS etl_runs CASCADE;
DROP TABLE IF EXISTS kpi_snapshots CASCADE;
DROP TABLE IF EXISTS donor_journey_state CASCADE;
DROP TABLE IF EXISTS donations_enhanced CASCADE;

-- Enhanced donors table (CRM core)
CREATE TABLE IF NOT EXISTS donors_crm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  country text,
  referral_code text UNIQUE,
  referred_by text,
  total_donated_cents bigint DEFAULT 0,
  donation_count int DEFAULT 0,
  first_donation_at timestamptz,
  last_donation_at timestamptz,
  is_monthly_donor boolean DEFAULT false,
  is_ambassador boolean DEFAULT false,
  consent_email boolean DEFAULT true,
  consent_sms boolean DEFAULT false,
  consent_timestamp timestamptz,
  consent_source text,
  tags jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Donations enhanced table
CREATE TABLE IF NOT EXISTS donations_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES donors_crm(id) ON DELETE SET NULL,
  ext_id text UNIQUE NOT NULL,
  ext_source text NOT NULL,
  amount_cents bigint NOT NULL,
  currency text DEFAULT 'USD',
  frequency text CHECK (frequency IN ('one_time','monthly','quarterly','annual')) DEFAULT 'one_time',
  status text CHECK (status IN ('succeeded','pending','failed','refunded','disputed','cancelled')) DEFAULT 'succeeded',
  method text,
  campaign text,
  referral_code text,
  corporate_match_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  donated_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Corporate matching programs
CREATE TABLE IF NOT EXISTS corporate_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  contact_name text,
  contact_email text,
  pledge_cents bigint NOT NULL,
  matched_cents bigint DEFAULT 0,
  match_ratio numeric DEFAULT 1.0,
  status text CHECK (status IN ('pledged','active','fulfilled','closed')) DEFAULT 'pledged',
  start_date date,
  end_date date,
  employee_code_prefix text UNIQUE,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Future pledges
CREATE TABLE IF NOT EXISTS pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES donors_crm(id) ON DELETE CASCADE,
  company text,
  pledge_cents bigint NOT NULL,
  paid_cents bigint DEFAULT 0,
  status text CHECK (status IN ('pledged','partial','fulfilled','cancelled')) DEFAULT 'pledged',
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_code text NOT NULL,
  referrer_donor_id uuid REFERENCES donors_crm(id) ON DELETE SET NULL,
  referred_email text NOT NULL,
  referred_donor_id uuid REFERENCES donors_crm(id) ON DELETE SET NULL,
  converted boolean DEFAULT false,
  first_donation_id uuid,
  conversion_date timestamptz,
  reward_issued boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Email event tracking
CREATE TABLE IF NOT EXISTS email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES donors_crm(id) ON DELETE CASCADE,
  email text,
  template text NOT NULL,
  event_type text CHECK (event_type IN ('sent','delivered','opened','clicked','bounced','complained','unsubscribed')) NOT NULL,
  provider text,
  provider_id text,
  link_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- SMS event tracking
CREATE TABLE IF NOT EXISTS sms_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES donors_crm(id) ON DELETE CASCADE,
  phone text NOT NULL,
  body text NOT NULL,
  direction text CHECK (direction IN ('outbound','inbound')) DEFAULT 'outbound',
  status text,
  provider text DEFAULT 'twilio',
  provider_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Webhook ingestion log
CREATE TABLE IF NOT EXISTS webhooks_in (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_type text,
  payload jsonb NOT NULL,
  signature text,
  verified boolean DEFAULT false,
  processed boolean DEFAULT false,
  error text,
  received_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- ETL and workflow execution tracking
CREATE TABLE IF NOT EXISTS etl_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text NOT NULL,
  workflow_type text,
  status text CHECK (status IN ('running','success','failed','cancelled')) DEFAULT 'running',
  records_processed int DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- KPI snapshots for historical tracking
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL UNIQUE,
  total_raised_cents bigint NOT NULL DEFAULT 0,
  donors_count int NOT NULL DEFAULT 0,
  recurring_donors_count int NOT NULL DEFAULT 0,
  avg_gift_cents bigint NOT NULL DEFAULT 0,
  monthly_recurring_revenue_cents bigint NOT NULL DEFAULT 0,
  donations_count int NOT NULL DEFAULT 0,
  new_donors_count int NOT NULL DEFAULT 0,
  retention_rate numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Donor journey state tracking
CREATE TABLE IF NOT EXISTS donor_journey_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES donors_crm(id) ON DELETE CASCADE UNIQUE,
  current_stage text,
  thank_you_sent_at timestamptz,
  day7_impact_sent_at timestamptz,
  day14_upgrade_sent_at timestamptz,
  day30_transparency_sent_at timestamptz,
  month11_renewal_sent_at timestamptz,
  last_email_sent_at timestamptz,
  opted_out boolean DEFAULT false,
  opted_out_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for corporate matches
ALTER TABLE donations_enhanced 
ADD CONSTRAINT fk_corporate_match 
FOREIGN KEY (corporate_match_id) 
REFERENCES corporate_matches(id) 
ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donors_crm_email ON donors_crm(email);
CREATE INDEX IF NOT EXISTS idx_donors_crm_referral_code ON donors_crm(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donors_crm_referred_by ON donors_crm(referred_by) WHERE referred_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_enhanced_donor_id ON donations_enhanced(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_enhanced_ext_id ON donations_enhanced(ext_id);
CREATE INDEX IF NOT EXISTS idx_donations_enhanced_status ON donations_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_donations_enhanced_donated_at ON donations_enhanced(donated_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_enhanced_frequency ON donations_enhanced(frequency);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_code ON referrals(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referrals_converted ON referrals(converted) WHERE converted = true;

CREATE INDEX IF NOT EXISTS idx_email_events_donor_id ON email_events(donor_id);
CREATE INDEX IF NOT EXISTS idx_email_events_template ON email_events(template);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);

CREATE INDEX IF NOT EXISTS idx_sms_events_donor_id ON sms_events(donor_id);
CREATE INDEX IF NOT EXISTS idx_sms_events_phone ON sms_events(phone);

CREATE INDEX IF NOT EXISTS idx_webhooks_source ON webhooks_in(source);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhooks_in(processed) WHERE processed = false;

CREATE INDEX IF NOT EXISTS idx_etl_runs_workflow ON etl_runs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_etl_runs_status ON etl_runs(status);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_date ON kpi_snapshots(snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_journey_state_donor ON donor_journey_state(donor_id);

-- Create real-time metrics view
CREATE OR REPLACE VIEW v_metrics AS
SELECT
  (SELECT COALESCE(SUM(amount_cents), 0) FROM donations_enhanced WHERE status = 'succeeded') as total_raised_cents,
  (SELECT COUNT(DISTINCT donor_id) FROM donations_enhanced WHERE status = 'succeeded') as donors_count,
  (SELECT COUNT(DISTINCT donor_id) FROM donations_enhanced WHERE frequency = 'monthly' AND status = 'succeeded') as recurring_donors_count,
  (SELECT COALESCE(AVG(amount_cents), 0)::bigint FROM donations_enhanced WHERE status = 'succeeded') as avg_gift_cents,
  (SELECT SUM(amount_cents) FROM donations_enhanced WHERE frequency = 'monthly' AND status = 'succeeded') as monthly_recurring_revenue_cents,
  (SELECT COUNT(*) FROM donations_enhanced WHERE status = 'succeeded') as total_donations_count,
  (SELECT COUNT(*) FROM donors_crm WHERE created_at > NOW() - INTERVAL '30 days') as new_donors_30d,
  (SELECT COUNT(*) FROM donations_enhanced WHERE donated_at > NOW() - INTERVAL '24 hours' AND status = 'succeeded') as donations_24h;

-- Create referral leaderboard view
CREATE OR REPLACE VIEW v_referral_leaderboard AS
SELECT
  d.id as donor_id,
  d.email,
  d.first_name,
  d.last_name,
  d.referral_code,
  COUNT(r.id) as total_referrals,
  COUNT(r.id) FILTER (WHERE r.converted = true) as converted_referrals,
  COALESCE(SUM(de.amount_cents) FILTER (WHERE r.converted = true), 0) as total_referred_cents
FROM donors_crm d
LEFT JOIN referrals r ON d.referral_code = r.referrer_code
LEFT JOIN donations_enhanced de ON r.first_donation_id = de.id
WHERE d.is_ambassador = true
GROUP BY d.id, d.email, d.first_name, d.last_name, d.referral_code
ORDER BY converted_referrals DESC, total_referrals DESC;

-- Enable Row Level Security
ALTER TABLE donors_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_journey_state ENABLE ROW LEVEL SECURITY;

-- Public read policies for metrics
CREATE POLICY "Public can view metrics"
  ON donations_enhanced FOR SELECT
  USING (status = 'succeeded');

CREATE POLICY "Public can view donor counts"
  ON donors_crm FOR SELECT
  USING (true);

CREATE POLICY "Public can view referral leaderboard"
  ON referrals FOR SELECT
  USING (converted = true);

-- Webhook ingestion policy (public insert)
CREATE POLICY "Anyone can insert webhooks"
  ON webhooks_in FOR INSERT
  WITH CHECK (true);

-- Admin policies (authenticated users)
CREATE POLICY "Authenticated users can manage donors"
  ON donors_crm FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage donations"
  ON donations_enhanced FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage corporate matches"
  ON corporate_matches FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage pledges"
  ON pledges FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage referrals"
  ON referrals FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view email events"
  ON email_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view sms events"
  ON sms_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view webhooks"
  ON webhooks_in FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view etl runs"
  ON etl_runs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view kpi snapshots"
  ON kpi_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage journey state"
  ON donor_journey_state FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role policies for automation inserts
CREATE POLICY "Service role can insert email events"
  ON email_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can insert sms events"
  ON sms_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can insert etl runs"
  ON etl_runs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can insert kpi snapshots"
  ON kpi_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code for ambassadors
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_ambassador = true AND NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_referral_code
  BEFORE INSERT OR UPDATE ON donors_crm
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- Function to update donor stats when donation is added
CREATE OR REPLACE FUNCTION update_donor_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.donor_id IS NOT NULL THEN
    UPDATE donors_crm
    SET 
      total_donated_cents = COALESCE(total_donated_cents, 0) + NEW.amount_cents,
      donation_count = COALESCE(donation_count, 0) + 1,
      last_donation_at = NEW.donated_at,
      first_donation_at = COALESCE(first_donation_at, NEW.donated_at),
      is_monthly_donor = CASE WHEN NEW.frequency = 'monthly' THEN true ELSE is_monthly_donor END,
      updated_at = NOW()
    WHERE id = NEW.donor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_donor_stats
  AFTER INSERT OR UPDATE ON donations_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION update_donor_stats();

-- Function to track referral conversions
CREATE OR REPLACE FUNCTION track_referral_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.referral_code IS NOT NULL THEN
    UPDATE referrals
    SET 
      converted = true,
      first_donation_id = NEW.id,
      conversion_date = NEW.donated_at,
      referred_donor_id = NEW.donor_id
    WHERE referrer_code = NEW.referral_code
      AND referred_donor_id = NEW.donor_id
      AND converted = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_referral_conversion
  AFTER INSERT ON donations_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION track_referral_conversion();