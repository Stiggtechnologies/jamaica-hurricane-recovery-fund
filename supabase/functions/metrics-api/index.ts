import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Route handling
    if (path.endsWith('/summary') || path.endsWith('/metrics-api')) {
      return await handleSummary(supabase);
    } else if (path.includes('/recent-donations')) {
      return await handleRecentDonations(supabase, url);
    } else if (path.includes('/kpi')) {
      return await handleKPI(supabase, url);
    } else if (path.includes('/leaderboard')) {
      return await handleLeaderboard(supabase, url);
    } else if (path.includes('/progress')) {
      return await handleProgress(supabase);
    } else {
      return new Response(
        JSON.stringify({
          error: 'Not found',
          endpoints: [
            '/summary - Get overall metrics',
            '/recent-donations?limit=25 - Get recent donations',
            '/kpi?date=YYYY-MM-DD - Get KPI snapshot',
            '/leaderboard?limit=10 - Get referral leaderboard',
            '/progress - Get campaign progress for progress bar',
          ],
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Metrics API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleSummary(supabase: any) {
  const { data, error } = await supabase.from('v_metrics').select('*').single();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        total_raised_cents: data.total_raised_cents || 0,
        total_raised_usd: ((data.total_raised_cents || 0) / 100).toFixed(2),
        donors_count: data.donors_count || 0,
        recurring_donors_count: data.recurring_donors_count || 0,
        avg_gift_cents: data.avg_gift_cents || 0,
        avg_gift_usd: ((data.avg_gift_cents || 0) / 100).toFixed(2),
        monthly_recurring_revenue_cents: data.monthly_recurring_revenue_cents || 0,
        monthly_recurring_revenue_usd: (
          (data.monthly_recurring_revenue_cents || 0) / 100
        ).toFixed(2),
        total_donations_count: data.total_donations_count || 0,
        new_donors_30d: data.new_donors_30d || 0,
        donations_24h: data.donations_24h || 0,
        goal_cents: 10000000000, // $100M goal
        goal_usd: '100000000',
        progress_percentage:
          ((data.total_raised_cents || 0) / 10000000000) * 100,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}

async function handleRecentDonations(supabase: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '25');

  const { data, error } = await supabase
    .from('donations_enhanced')
    .select(
      `
      id,
      amount_cents,
      currency,
      frequency,
      donated_at,
      donors_crm (
        first_name,
        last_name,
        country
      )
    `
    )
    .eq('status', 'succeeded')
    .order('donated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const sanitized = data.map((d: any) => ({
    id: d.id,
    amount_usd: (d.amount_cents / 100).toFixed(2),
    currency: d.currency,
    frequency: d.frequency,
    donor_name:
      d.donors_crm?.first_name
        ? `${d.donors_crm.first_name} ${d.donors_crm.last_name?.[0] || ''}.`
        : 'Anonymous',
    country: d.donors_crm?.country || null,
    donated_at: d.donated_at,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      data: sanitized,
      count: sanitized.length,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}

async function handleKPI(supabase: any, url: URL) {
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('kpi_snapshots')
    .select('*')
    .eq('snapshot_date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (!data) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No KPI snapshot found for this date',
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...data,
        total_raised_usd: (data.total_raised_cents / 100).toFixed(2),
        avg_gift_usd: (data.avg_gift_cents / 100).toFixed(2),
        monthly_recurring_revenue_usd: (
          data.monthly_recurring_revenue_cents / 100
        ).toFixed(2),
      },
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600',
      },
    }
  );
}

async function handleLeaderboard(supabase: any, url: URL) {
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const { data, error } = await supabase
    .from('v_referral_leaderboard')
    .select('*')
    .limit(limit);

  if (error) throw error;

  const sanitized = data.map((d: any, index: number) => ({
    rank: index + 1,
    name: d.first_name
      ? `${d.first_name} ${d.last_name?.[0] || ''}.`
      : 'Anonymous Ambassador',
    referral_code: d.referral_code,
    total_referrals: d.total_referrals,
    converted_referrals: d.converted_referrals,
    total_referred_usd: (d.total_referred_cents / 100).toFixed(2),
  }));

  return new Response(
    JSON.stringify({
      success: true,
      data: sanitized,
      count: sanitized.length,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300',
      },
    }
  );
}

async function handleProgress(supabase: any) {
  // Optimized query specifically for progress bar
  const { data: metrics } = await supabase.from('v_metrics').select('*').single();
  
  const { data: progress } = await supabase
    .from('donation_progress')
    .select('*')
    .single();

  const totalRaised = metrics?.total_raised_cents || progress?.current_amount || 0;
  const goal = progress?.goal_amount || 10000000000; // $100M
  const donorCount = metrics?.donors_count || progress?.donor_count || 0;

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        current_amount: totalRaised,
        goal_amount: goal,
        donor_count: donorCount,
        percentage: ((totalRaised / goal) * 100).toFixed(2),
        formatted: {
          current: `$${(totalRaised / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          goal: `$${(goal / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        },
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}