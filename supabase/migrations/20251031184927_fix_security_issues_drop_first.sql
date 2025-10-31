/*
  # Fix All Security Vulnerabilities - PRODUCTION CRITICAL

  Security issues fixed:
  1. SECURITY DEFINER views → SECURITY INVOKER
  2. Function search path vulnerabilities → SET search_path = ''
*/

-- Drop views first
DROP VIEW IF EXISTS public.v_referral_leaderboard CASCADE;
DROP VIEW IF EXISTS public.v_content_performance CASCADE;
DROP VIEW IF EXISTS public.v_metrics CASCADE;
DROP VIEW IF EXISTS public.v_newsletter_analytics CASCADE;

-- Drop functions first
DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS public.auto_generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS public.update_donor_stats() CASCADE;
DROP FUNCTION IF EXISTS public.track_referral_conversion() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_relevance_score(text, text[]) CASCADE;
DROP FUNCTION IF EXISTS public.auto_calculate_relevance() CASCADE;
DROP FUNCTION IF EXISTS public.generate_slug(text) CASCADE;
DROP FUNCTION IF EXISTS public.auto_generate_slug() CASCADE;
DROP FUNCTION IF EXISTS public.update_campaign_amount() CASCADE;
DROP FUNCTION IF EXISTS public.calc_time_values() CASCADE;
DROP FUNCTION IF EXISTS public.update_vol_totals() CASCADE;
DROP FUNCTION IF EXISTS public.update_position_status() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_time_log_values() CASCADE;
DROP FUNCTION IF EXISTS public.update_volunteer_totals() CASCADE;

-- Recreate views with SECURITY INVOKER
CREATE VIEW public.v_referral_leaderboard
WITH (security_invoker = true)
AS
SELECT d.id AS donor_id, d.email, d.first_name, d.last_name, d.referral_code,
   count(r.id) AS total_referrals,
   count(r.id) FILTER (WHERE r.converted = true) AS converted_referrals,
   COALESCE(sum(de.amount_cents) FILTER (WHERE r.converted = true), 0::numeric) AS total_referred_cents
FROM donors_crm d
  LEFT JOIN referrals r ON d.referral_code = r.referrer_code
  LEFT JOIN donations_enhanced de ON r.first_donation_id = de.id
WHERE d.is_ambassador = true
GROUP BY d.id, d.email, d.first_name, d.last_name, d.referral_code;

CREATE VIEW public.v_content_performance
WITH (security_invoker = true)
AS
SELECT pc.id, pc.title, pc.published_at, pc.view_count, pc.share_count,
    count(DISTINCT sm.id) AS social_posts, sum(sm.engagement_count) AS total_engagement
FROM published_content pc
  LEFT JOIN social_media_posts sm ON sm.content_id = pc.aggregated_content_id
GROUP BY pc.id, pc.title, pc.published_at, pc.view_count, pc.share_count;

CREATE VIEW public.v_metrics
WITH (security_invoker = true)
AS
SELECT ( SELECT COALESCE(sum(amount_cents), 0) FROM donations_enhanced WHERE status = 'succeeded') AS total_raised_cents,
    ( SELECT count(DISTINCT donor_id) FROM donations_enhanced WHERE status = 'succeeded') AS donors_count,
    ( SELECT count(DISTINCT donor_id) FROM donations_enhanced WHERE frequency = 'monthly' AND status = 'succeeded') AS recurring_donors_count,
    ( SELECT COALESCE(avg(amount_cents), 0)::bigint FROM donations_enhanced WHERE status = 'succeeded') AS avg_gift_cents,
    ( SELECT sum(amount_cents) FROM donations_enhanced WHERE frequency = 'monthly' AND status = 'succeeded') AS monthly_recurring_revenue_cents,
    ( SELECT count(*) FROM donations_enhanced WHERE status = 'succeeded') AS total_donations_count,
    ( SELECT count(*) FROM donors_crm WHERE created_at > (now() - interval '30 days')) AS new_donors_30d,
    ( SELECT count(*) FROM donations_enhanced WHERE donated_at > (now() - interval '24 hours') AND status = 'succeeded') AS donations_24h;

CREATE VIEW public.v_newsletter_analytics
WITH (security_invoker = true)
AS
SELECT n.id, n.title, n.sent_at, n.recipient_count,
    count(DISTINCT CASE WHEN ns.status = 'opened' THEN ns.id END) AS opens,
    count(DISTINCT CASE WHEN ns.status = 'clicked' THEN ns.id END) AS clicks,
    round(count(DISTINCT CASE WHEN ns.status = 'opened' THEN ns.id END)::numeric / NULLIF(n.recipient_count, 0)::numeric * 100, 2) AS open_rate,
    round(count(DISTINCT CASE WHEN ns.status = 'clicked' THEN ns.id END)::numeric / NULLIF(count(DISTINCT CASE WHEN ns.status = 'opened' THEN ns.id END), 0)::numeric * 100, 2) AS click_rate
FROM newsletters n
  LEFT JOIN newsletter_sends ns ON n.id = ns.newsletter_id
WHERE n.status = 'sent'
GROUP BY n.id, n.title, n.sent_at, n.recipient_count;

-- Recreate functions with search_path protection
CREATE FUNCTION public.generate_referral_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; result TEXT := ''; i INT;
BEGIN
  FOR i IN 1..8 LOOP result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1); END LOOP;
  RETURN result;
END; $$;

CREATE FUNCTION public.auto_generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN NEW.referral_code := public.generate_referral_code(); END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.update_donor_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'succeeded' THEN
    UPDATE public.donors_crm SET total_donated_cents = COALESCE(total_donated_cents, 0) + NEW.amount_cents,
      donation_count = COALESCE(donation_count, 0) + 1, last_donation_date = NEW.donated_at, updated_at = NOW()
    WHERE email = NEW.donor_email;
    IF NOT FOUND THEN
      INSERT INTO public.donors_crm (email, first_name, last_name, total_donated_cents, donation_count, last_donation_date)
      VALUES (NEW.donor_email, NEW.donor_first_name, NEW.donor_last_name, NEW.amount_cents, 1, NEW.donated_at);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.track_referral_conversion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.referral_code IS NOT NULL THEN
    UPDATE public.referrals SET converted = true, first_donation_id = NEW.id, converted_at = NEW.donated_at
    WHERE referral_code = NEW.referral_code AND converted = false;
  END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.calculate_relevance_score(content_text TEXT, keywords TEXT[])
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE score NUMERIC := 0; keyword TEXT;
BEGIN
  FOREACH keyword IN ARRAY keywords LOOP
    IF content_text ILIKE '%' || keyword || '%' THEN score := score + 1; END IF;
  END LOOP;
  RETURN score;
END; $$;

CREATE FUNCTION public.auto_calculate_relevance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.relevance_score := public.calculate_relevance_score(
    NEW.title || ' ' || COALESCE(NEW.description, ''),
    ARRAY['jamaica', 'hurricane', 'disaster', 'relief', 'recovery', 'rebuild']
  );
  RETURN NEW;
END; $$;

CREATE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END; $$;

CREATE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN NEW.slug := public.generate_slug(NEW.title); END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.update_campaign_amount()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE public.organization_campaigns SET current_amount_cents = current_amount_cents + NEW.amount_cents, updated_at = NOW()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.calc_time_values()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.hours_logged := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
    NEW.total_value_usd := NEW.hours_logged * COALESCE(NEW.hourly_value_usd, 25.00);
  END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.update_vol_totals()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    IF NEW.volunteer_profile_id IS NOT NULL THEN
      UPDATE public.volunteer_profiles SET total_hours_contributed = total_hours_contributed + NEW.hours_logged,
        total_value_contributed_usd = total_value_contributed_usd + NEW.total_value_usd WHERE id = NEW.volunteer_profile_id;
    END IF;
    IF NEW.volunteer_org_id IS NOT NULL THEN
      UPDATE public.volunteer_orgs SET total_hours_contributed = total_hours_contributed + NEW.hours_logged,
        total_value_contributed_usd = total_value_contributed_usd + NEW.total_value_usd WHERE id = NEW.volunteer_org_id;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.update_position_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.organizational_positions SET status = 'filled',
      filled_by = COALESCE(
        (SELECT email FROM public.volunteer_profiles WHERE id = NEW.volunteer_profile_id),
        (SELECT organization_name FROM public.volunteer_orgs WHERE id = NEW.volunteer_org_id)
      ),
      filled_at = NEW.start_date, updated_at = NOW()
    WHERE id = NEW.position_id;
  END IF;
  RETURN NEW;
END; $$;

-- Grant permissions
GRANT SELECT ON public.v_referral_leaderboard TO authenticated, anon;
GRANT SELECT ON public.v_content_performance TO authenticated, anon;
GRANT SELECT ON public.v_metrics TO authenticated, anon;
GRANT SELECT ON public.v_newsletter_analytics TO authenticated;
