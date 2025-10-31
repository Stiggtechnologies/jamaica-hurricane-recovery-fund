/*
  # Volunteer Time Tracking and Organizational Chart

  ## Overview
  Comprehensive volunteer management system with time tracking, skill matching,
  and organizational structure. Enables individuals and organizations to donate
  their time and track contributions as valuable support.

  ## New Tables

  ### `organizational_positions` table
  - Foundation positions and roles with vacancy status

  ### `volunteer_profiles` table
  - Enhanced volunteer profiles with skills and time tracking

  ### `volunteer_time_logs` table
  - Time entry tracking with approval workflow

  ## Security
  - Public view of organizational chart
  - Volunteers manage their own profiles and time logs
  - Admins can manage all volunteer data

  ## Indexes
  Performance indexes on key fields
*/

-- Organizational positions and structure
CREATE TABLE IF NOT EXISTS organizational_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  parent_position_id uuid REFERENCES organizational_positions(id) ON DELETE SET NULL,
  level int DEFAULT 1,
  description text,
  responsibilities text[],
  required_skills text[],
  time_commitment_hours_per_week int,
  is_remote boolean DEFAULT true,
  status text CHECK (status IN ('vacant', 'filled', 'closed')) DEFAULT 'vacant',
  priority text CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  filled_by text,
  filled_at timestamptz,
  salary_equivalent_annually numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced volunteer profiles
CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  profile_photo_url text,
  bio text,
  location_city text,
  location_country text,
  skills text[],
  languages text[],
  availability_hours_per_week int,
  total_hours_contributed numeric DEFAULT 0,
  total_value_contributed_usd numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Volunteer organizations
CREATE TABLE IF NOT EXISTS volunteer_orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  organization_type text CHECK (organization_type IN ('corporate', 'ngo', 'university', 'community', 'government')) DEFAULT 'corporate',
  contact_email text NOT NULL,
  contact_phone text,
  website text,
  logo_url text,
  total_hours_contributed numeric DEFAULT 0,
  total_value_contributed_usd numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Volunteer time logs
CREATE TABLE IF NOT EXISTS volunteer_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_profile_id uuid REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
  volunteer_org_id uuid REFERENCES volunteer_orgs(id) ON DELETE CASCADE,
  position_id uuid REFERENCES organizational_positions(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  activity_description text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  hours_logged numeric,
  status text CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
  approved_by text,
  approved_at timestamptz,
  hourly_value_usd numeric DEFAULT 25.00,
  total_value_usd numeric,
  is_remote boolean DEFAULT true,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Volunteer applications
CREATE TABLE IF NOT EXISTS volunteer_position_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id uuid REFERENCES organizational_positions(id) ON DELETE CASCADE NOT NULL,
  volunteer_profile_id uuid REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
  volunteer_org_id uuid REFERENCES volunteer_orgs(id) ON DELETE CASCADE,
  applicant_type text CHECK (applicant_type IN ('individual', 'organization')) NOT NULL,
  cover_letter text,
  status text CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  decision_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_pos_dept ON organizational_positions(department);
CREATE INDEX IF NOT EXISTS idx_org_pos_status ON organizational_positions(status);
CREATE INDEX IF NOT EXISTS idx_vol_profiles_email ON volunteer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_vol_profiles_skills ON volunteer_profiles USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_time_logs_volunteer ON volunteer_time_logs(volunteer_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_status ON volunteer_time_logs(status);
CREATE INDEX IF NOT EXISTS idx_applications_position ON volunteer_position_applications(position_id);

-- Enable RLS
ALTER TABLE organizational_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_position_applications ENABLE ROW LEVEL SECURITY;

-- Public policies
CREATE POLICY "Public can view org chart" ON organizational_positions FOR SELECT USING (true);

-- Volunteer policies
CREATE POLICY "Volunteers view own profile" ON volunteer_profiles FOR SELECT 
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Volunteers update own profile" ON volunteer_profiles FOR UPDATE 
  USING (email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Anyone can register" ON volunteer_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Volunteers view own time logs" ON volunteer_time_logs FOR SELECT 
  USING (volunteer_profile_id IN (SELECT id FROM volunteer_profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));
CREATE POLICY "Volunteers create time logs" ON volunteer_time_logs FOR INSERT 
  WITH CHECK (volunteer_profile_id IN (SELECT id FROM volunteer_profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));
CREATE POLICY "Volunteers update own time logs" ON volunteer_time_logs FOR UPDATE 
  USING (volunteer_profile_id IN (SELECT id FROM volunteer_profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'))
  WITH CHECK (volunteer_profile_id IN (SELECT id FROM volunteer_profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Volunteers view own applications" ON volunteer_position_applications FOR SELECT 
  USING (volunteer_profile_id IN (SELECT id FROM volunteer_profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));
CREATE POLICY "Volunteers create applications" ON volunteer_position_applications FOR INSERT 
  WITH CHECK (volunteer_profile_id IN (SELECT id FROM volunteer_profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Admin policies
CREATE POLICY "Admins manage all" ON organizational_positions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins view volunteers" ON volunteer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage orgs" ON volunteer_orgs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins manage time logs" ON volunteer_time_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins manage applications" ON volunteer_position_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Triggers
CREATE OR REPLACE FUNCTION calc_time_values() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.hours_logged := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
    NEW.total_value_usd := NEW.hours_logged * COALESCE(NEW.hourly_value_usd, 25.00);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calc_time_values BEFORE INSERT OR UPDATE ON volunteer_time_logs
  FOR EACH ROW EXECUTE FUNCTION calc_time_values();

CREATE OR REPLACE FUNCTION update_vol_totals() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    IF NEW.volunteer_profile_id IS NOT NULL THEN
      UPDATE volunteer_profiles SET 
        total_hours_contributed = total_hours_contributed + NEW.hours_logged,
        total_value_contributed_usd = total_value_contributed_usd + NEW.total_value_usd
      WHERE id = NEW.volunteer_profile_id;
    END IF;
    IF NEW.volunteer_org_id IS NOT NULL THEN
      UPDATE volunteer_orgs SET 
        total_hours_contributed = total_hours_contributed + NEW.hours_logged,
        total_value_contributed_usd = total_value_contributed_usd + NEW.total_value_usd
      WHERE id = NEW.volunteer_org_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vol_totals AFTER INSERT OR UPDATE ON volunteer_time_logs
  FOR EACH ROW EXECUTE FUNCTION update_vol_totals();

-- Insert organizational structure
INSERT INTO organizational_positions (title, department, level, description, responsibilities, required_skills, time_commitment_hours_per_week, priority, salary_equivalent_annually) VALUES
  ('Executive Director', 'Executive Leadership', 1, 'Overall leadership and strategic direction of JHRF. Reports to Board of Directors.', ARRAY['Set organizational vision', 'Oversee all operations', 'Build partnerships', 'Fundraising and donor relations', 'Public speaking'], ARRAY['Executive Leadership', 'Strategic Planning', 'Fundraising', 'Public Speaking'], 40, 'critical', 150000),
  ('Chief Operating Officer', 'Executive Leadership', 2, 'Oversee day-to-day operations and program implementation.', ARRAY['Manage efficiency', 'Coordinate departments', 'Budget oversight', 'Process improvement'], ARRAY['Operations Management', 'Project Management', 'Leadership'], 40, 'critical', 120000),
  ('Chief Financial Officer', 'Executive Leadership', 2, 'Manage all financial aspects including budgeting and compliance.', ARRAY['Financial planning', 'Budget management', 'Financial reporting', 'Audit compliance'], ARRAY['Financial Management', 'Accounting', 'Compliance'], 40, 'critical', 110000),
  ('Director of Programs', 'Programs', 2, 'Lead all relief and recovery programs.', ARRAY['Program strategy', 'Team management', 'Partner coordination', 'Impact measurement'], ARRAY['Program Management', 'Community Development', 'Leadership'], 40, 'critical', 100000),
  ('Housing Reconstruction Manager', 'Programs', 3, 'Manage home rebuilding programs and contractor coordination.', ARRAY['Coordinate rebuilding', 'Manage contractors', 'Quality control', 'Beneficiary selection'], ARRAY['Construction Management', 'Project Management'], 35, 'high', 75000),
  ('Infrastructure Program Manager', 'Programs', 3, 'Oversee infrastructure restoration projects.', ARRAY['Infrastructure planning', 'Government coordination', 'Engineering oversight'], ARRAY['Civil Engineering', 'Project Management'], 35, 'high', 75000),
  ('Community Resilience Manager', 'Programs', 3, 'Develop climate adaptation and disaster preparedness programs.', ARRAY['Climate resilience planning', 'Community training', 'Emergency preparedness'], ARRAY['Climate Adaptation', 'Community Development'], 30, 'high', 70000),
  ('Director of Development', 'Fundraising', 2, 'Lead all fundraising efforts and donor relations.', ARRAY['Fundraising strategy', 'Major donor cultivation', 'Grant writing', 'Campaign management'], ARRAY['Fundraising', 'Grant Writing', 'Donor Relations'], 40, 'critical', 95000),
  ('Corporate Partnerships Manager', 'Fundraising', 3, 'Build relationships with corporate donors.', ARRAY['Corporate outreach', 'Sponsorship packages', 'Partnership development'], ARRAY['Corporate Relations', 'Negotiation', 'Sales'], 30, 'high', 70000),
  ('Grant Writer', 'Fundraising', 3, 'Write grant proposals to foundations and agencies.', ARRAY['Grant research', 'Proposal writing', 'Budget development', 'Reporting'], ARRAY['Grant Writing', 'Research', 'Writing'], 25, 'high', 65000),
  ('Director of Communications', 'Communications', 2, 'Develop comprehensive communications strategy.', ARRAY['Communications strategy', 'Media relations', 'Brand management', 'Crisis communications'], ARRAY['Communications Strategy', 'Media Relations', 'Crisis Communications'], 35, 'high', 85000),
  ('Social Media Manager', 'Communications', 3, 'Manage social media channels and engagement.', ARRAY['Social media strategy', 'Content creation', 'Community management', 'Analytics'], ARRAY['Social Media Marketing', 'Content Creation', 'Analytics'], 30, 'medium', 60000),
  ('Content Writer', 'Communications', 3, 'Create compelling content for all channels.', ARRAY['Blog writing', 'Newsletter creation', 'Website content', 'Storytelling'], ARRAY['Writing', 'Storytelling', 'SEO'], 25, 'medium', 55000),
  ('Chief Technology Officer', 'Technology', 2, 'Lead technology strategy and platform development.', ARRAY['Technology strategy', 'Platform architecture', 'Team leadership', 'Security oversight'], ARRAY['Software Architecture', 'Leadership', 'Cybersecurity'], 35, 'high', 110000),
  ('Full Stack Developer', 'Technology', 3, 'Develop and maintain the JHRF platform.', ARRAY['Web application development', 'Database management', 'API development', 'Testing'], ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL'], 30, 'high', 80000),
  ('Data Analyst', 'Technology', 3, 'Analyze data to measure impact and track metrics.', ARRAY['Data analysis', 'Report creation', 'Dashboard development', 'Visualization'], ARRAY['Data Analysis', 'SQL', 'Python', 'Tableau'], 25, 'medium', 70000),
  ('Finance Manager', 'Finance', 3, 'Manage accounting and financial operations.', ARRAY['Bookkeeping', 'Financial reporting', 'Invoice processing', 'Budget tracking'], ARRAY['Accounting', 'QuickBooks', 'Financial Reporting'], 30, 'high', 65000),
  ('Operations Coordinator', 'Operations', 3, 'Coordinate logistics and operational support.', ARRAY['Logistics coordination', 'Vendor management', 'Office management', 'Supply chain'], ARRAY['Operations Management', 'Logistics', 'Vendor Management'], 30, 'medium', 55000),
  ('HR Manager', 'Human Resources', 3, 'Manage volunteer recruitment and training.', ARRAY['Volunteer recruitment', 'Onboarding', 'Training programs', 'Performance management'], ARRAY['HR Management', 'Recruitment', 'Training'], 25, 'medium', 60000),
  ('Legal Counsel', 'Legal', 3, 'Provide legal guidance on contracts and compliance.', ARRAY['Contract review', 'Legal compliance', 'Risk assessment', 'Policy development'], ARRAY['Legal Expertise', 'Contract Law', 'Nonprofit Law'], 20, 'medium', 90000),
  ('Community Liaison', 'Community Relations', 3, 'Build relationships with local communities.', ARRAY['Community outreach', 'Stakeholder engagement', 'Event coordination', 'Partnership building'], ARRAY['Community Engagement', 'Public Relations', 'Event Planning'], 30, 'high', 50000)
ON CONFLICT DO NOTHING;
