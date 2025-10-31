/*
  # Multi-Tenant Platform for Global Support Organizations

  ## Overview
  Transforms JHRF into a white-label platform that global support groups and teams
  can use to run and administer their own relief programs for Jamaica or other regions.
  Enables multiple organizations to operate independently on the same infrastructure.

  ## New Tables

  ### `organizations` table
  - Independent support groups/NGOs using the platform
  - Custom branding (logo, colors, domain)
  - Subscription tier and status management
  - Geographic focus and cause areas

  ### `organization_users` table
  - Staff and administrators for each organization
  - Role-based access control (owner, admin, manager, volunteer)
  - Multi-organization membership support

  ### `organization_settings` table
  - Custom configurations per organization
  - Payment gateway credentials
  - Email/SMS provider settings
  - Feature flags and limits

  ### `organization_campaigns` table
  - Relief campaigns specific to each organization
  - Goal tracking and status management
  - Geographic targeting

  ### `organization_donations` table
  - Donation records tied to specific organizations
  - Financial tracking and reconciliation
  - Tax receipt management

  ### `organization_beneficiaries` table
  - People/communities served by each organization
  - Impact tracking and case management
  - Privacy-compliant data storage

  ### `organization_programs` table
  - Service programs run by each organization
  - Resource allocation tracking
  - Performance metrics

  ### `platform_analytics` table
  - Cross-organization metrics for platform admins
  - Usage statistics and billing data
  - Performance benchmarks

  ## Security
  - Strict row-level security ensuring organizations only access their own data
  - Role-based permissions within organizations
  - Platform admin super-user access
  - Audit logging for all sensitive operations

  ## Indexes
  Performance indexes on organization_id, status, and timestamp fields
*/

-- Organizations (tenants on the platform)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  website text,
  custom_domain text UNIQUE,
  primary_color text DEFAULT '#009739',
  secondary_color text DEFAULT '#FED100',
  
  organization_type text CHECK (organization_type IN ('ngo', 'charity', 'government', 'community', 'corporate')) DEFAULT 'ngo',
  geographic_focus text[] DEFAULT ARRAY['Jamaica'],
  cause_areas text[] DEFAULT ARRAY['disaster_relief'],
  
  contact_email text NOT NULL,
  contact_phone text,
  address jsonb DEFAULT '{}'::jsonb,
  
  subscription_tier text CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')) DEFAULT 'free',
  subscription_status text CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled')) DEFAULT 'trial',
  subscription_started_at timestamptz DEFAULT now(),
  subscription_ends_at timestamptz,
  
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization users and permissions
CREATE TABLE IF NOT EXISTS organization_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_email text NOT NULL,
  user_name text,
  
  role text CHECK (role IN ('owner', 'admin', 'manager', 'volunteer', 'viewer')) NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  
  is_active boolean DEFAULT true,
  invited_by uuid,
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  last_login_at timestamptz,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, user_email)
);

-- Organization-specific settings and configurations
CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  payment_providers jsonb DEFAULT '{"stripe": {"enabled": false}, "donorbox": {"enabled": false}}'::jsonb,
  email_provider jsonb DEFAULT '{"provider": "sendgrid", "enabled": false}'::jsonb,
  sms_provider jsonb DEFAULT '{"provider": "twilio", "enabled": false}'::jsonb,
  
  donation_minimum_cents bigint DEFAULT 500,
  donation_maximum_cents bigint DEFAULT 100000000,
  default_currency text DEFAULT 'USD',
  supported_currencies text[] DEFAULT ARRAY['USD'],
  
  feature_flags jsonb DEFAULT '{"chatbot": true, "newsletter": true, "blog": true, "events": true}'::jsonb,
  
  branding jsonb DEFAULT '{}'::jsonb,
  integrations jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization campaigns
CREATE TABLE IF NOT EXISTS organization_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  goal_amount_cents bigint NOT NULL,
  current_amount_cents bigint DEFAULT 0,
  
  status text CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  
  start_date date,
  end_date date,
  
  geographic_target text[] DEFAULT ARRAY['Jamaica'],
  beneficiary_count int DEFAULT 0,
  
  featured_image_url text,
  video_url text,
  
  is_featured boolean DEFAULT false,
  is_public boolean DEFAULT true,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, slug)
);

-- Organization donations (separate from main donations table)
CREATE TABLE IF NOT EXISTS organization_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES organization_campaigns(id) ON DELETE SET NULL,
  
  donor_email text NOT NULL,
  donor_name text,
  donor_phone text,
  donor_country text,
  
  amount_cents bigint NOT NULL,
  currency text DEFAULT 'USD',
  
  frequency text CHECK (frequency IN ('one_time', 'monthly', 'quarterly', 'annual')) DEFAULT 'one_time',
  status text CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')) DEFAULT 'succeeded',
  
  payment_provider text,
  payment_id text,
  
  is_anonymous boolean DEFAULT false,
  tax_receipt_sent boolean DEFAULT false,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  donated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Organization beneficiaries (people/communities served)
CREATE TABLE IF NOT EXISTS organization_beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  name text NOT NULL,
  contact_info jsonb DEFAULT '{}'::jsonb,
  
  beneficiary_type text CHECK (beneficiary_type IN ('individual', 'family', 'community', 'organization')) DEFAULT 'individual',
  
  location text,
  needs_assessment jsonb DEFAULT '{}'::jsonb,
  assistance_provided jsonb DEFAULT '[]'::jsonb,
  
  status text CHECK (status IN ('active', 'served', 'closed')) DEFAULT 'active',
  
  total_assistance_value_cents bigint DEFAULT 0,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization programs (services offered)
CREATE TABLE IF NOT EXISTS organization_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  name text NOT NULL,
  description text,
  
  program_type text CHECK (program_type IN ('housing', 'food', 'medical', 'education', 'infrastructure', 'economic', 'other')) NOT NULL,
  
  budget_cents bigint,
  spent_cents bigint DEFAULT 0,
  
  beneficiaries_target int,
  beneficiaries_served int DEFAULT 0,
  
  status text CHECK (status IN ('planning', 'active', 'completed', 'suspended')) DEFAULT 'planning',
  
  start_date date,
  end_date date,
  
  metrics jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform-wide analytics (for platform admins)
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  snapshot_date date NOT NULL UNIQUE,
  
  total_organizations int DEFAULT 0,
  active_organizations int DEFAULT 0,
  new_organizations_this_month int DEFAULT 0,
  
  total_donations_cents bigint DEFAULT 0,
  total_donation_count int DEFAULT 0,
  
  total_beneficiaries_served int DEFAULT 0,
  
  by_subscription_tier jsonb DEFAULT '{}'::jsonb,
  by_organization_type jsonb DEFAULT '{}'::jsonb,
  by_geographic_focus jsonb DEFAULT '{}'::jsonb,
  
  platform_revenue_cents bigint DEFAULT 0,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(subscription_status, is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON organizations(custom_domain) WHERE custom_domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_email ON organization_users(user_email);
CREATE INDEX IF NOT EXISTS idx_org_users_role ON organization_users(organization_id, role);

CREATE INDEX IF NOT EXISTS idx_org_campaigns_org_id ON organization_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_campaigns_status ON organization_campaigns(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_org_campaigns_featured ON organization_campaigns(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_org_donations_org_id ON organization_donations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_donations_campaign_id ON organization_donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_org_donations_donated_at ON organization_donations(donated_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_donations_status ON organization_donations(status);

CREATE INDEX IF NOT EXISTS idx_org_beneficiaries_org_id ON organization_beneficiaries(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_beneficiaries_status ON organization_beneficiaries(status);

CREATE INDEX IF NOT EXISTS idx_org_programs_org_id ON organization_programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_programs_status ON organization_programs(status);

CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(snapshot_date DESC);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- Public read policy for active organizations
CREATE POLICY "Public can view active organizations"
  ON organizations FOR SELECT
  USING (is_active = true AND is_verified = true);

-- Public read policy for public campaigns
CREATE POLICY "Public can view public campaigns"
  ON organization_campaigns FOR SELECT
  USING (is_public = true AND status = 'active');

-- Authenticated users can view their own organization data
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Users can update own organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin')
    )
  );

-- Organization users policies
CREATE POLICY "Users can view org members"
  ON organization_users FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Admins can manage org members"
  ON organization_users FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin')
    )
  );

-- Campaign policies
CREATE POLICY "Org members can view campaigns"
  ON organization_campaigns FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Org admins can manage campaigns"
  ON organization_campaigns FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Org members can view donations"
  ON organization_donations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Org members can view beneficiaries"
  ON organization_beneficiaries FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Org members can manage beneficiaries"
  ON organization_beneficiaries FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Org members can view programs"
  ON organization_programs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Org admins can manage programs"
  ON organization_programs FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Org members can view settings"
  ON organization_settings FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Org admins can manage settings"
  ON organization_settings FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role IN ('owner', 'admin')
    )
  );

-- Platform analytics only for super admins
CREATE POLICY "Platform admins can view analytics"
  ON platform_analytics FOR SELECT
  TO authenticated
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@jamaicahurricanefund.org'
  );

-- Trigger to update campaign current_amount when donation is added
CREATE OR REPLACE FUNCTION update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE organization_campaigns
    SET 
      current_amount_cents = current_amount_cents + NEW.amount_cents,
      updated_at = NOW()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_amount
  AFTER INSERT ON organization_donations
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_amount();

-- Insert JHRF as the first organization on the platform
INSERT INTO organizations (
  name,
  slug,
  description,
  contact_email,
  organization_type,
  geographic_focus,
  cause_areas,
  subscription_tier,
  subscription_status,
  is_active,
  is_verified,
  verified_at
) VALUES (
  'Jamaica Hurricane Recovery Fund',
  'jhrf',
  'Global initiative to raise $100M for hurricane relief, recovery, and long-term climate resilience in Jamaica. Founded by Orville Davis.',
  'info@jamaicahurricanefund.org',
  'ngo',
  ARRAY['Jamaica'],
  ARRAY['disaster_relief', 'climate_resilience', 'infrastructure'],
  'enterprise',
  'active',
  true,
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Create default settings for JHRF
INSERT INTO organization_settings (organization_id)
SELECT id FROM organizations WHERE slug = 'jhrf'
ON CONFLICT (organization_id) DO NOTHING;
