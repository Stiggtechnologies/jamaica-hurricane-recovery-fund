import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Donorbox-Signature',
};

interface DonorboxWebhook {
  donation: {
    id: string;
    donor: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      country?: string;
    };
    amount: number;
    currency: string;
    recurring: boolean;
    frequency?: string;
    status: string;
    payment_method: string;
    donation_date: string;
    campaign?: string;
    utm_source?: string;
    utm_campaign?: string;
    referral_code?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const signature = req.headers.get('X-Donorbox-Signature');
    const rawBody = await req.text();
    const payload: DonorboxWebhook = JSON.parse(rawBody);

    // Log incoming webhook
    const { data: webhookLog } = await supabase
      .from('webhooks_in')
      .insert({
        source: 'donorbox',
        event_type: 'donation.created',
        payload: payload,
        signature: signature,
        verified: true, // TODO: Implement signature verification
      })
      .select()
      .single();

    // Upsert donor
    const { data: donor } = await supabase
      .from('donors_crm')
      .upsert(
        {
          email: payload.donation.donor.email,
          first_name: payload.donation.donor.first_name,
          last_name: payload.donation.donor.last_name,
          phone: payload.donation.donor.phone,
          country: payload.donation.donor.country,
          referred_by: payload.donation.referral_code,
          consent_email: true,
          consent_timestamp: new Date().toISOString(),
          consent_source: 'donorbox_donation',
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (!donor) {
      throw new Error('Failed to create/update donor');
    }

    // Create donation record
    const amountCents = Math.round(payload.donation.amount * 100);
    const frequency = payload.donation.recurring
      ? payload.donation.frequency || 'monthly'
      : 'one_time';

    const { data: donation, error: donationError } = await supabase
      .from('donations_enhanced')
      .insert({
        donor_id: donor.id,
        ext_id: `donorbox_${payload.donation.id}`,
        ext_source: 'donorbox',
        amount_cents: amountCents,
        currency: payload.donation.currency,
        frequency: frequency,
        status: payload.donation.status === 'paid' ? 'succeeded' : 'pending',
        method: payload.donation.payment_method,
        campaign: payload.donation.campaign,
        referral_code: payload.donation.referral_code,
        donated_at: payload.donation.donation_date,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (donationError) {
      throw donationError;
    }

    // Track referral if applicable
    if (payload.donation.referral_code && donor) {
      await supabase.from('referrals').insert({
        referrer_code: payload.donation.referral_code,
        referred_email: payload.donation.donor.email,
        referred_donor_id: donor.id,
        converted: true,
        first_donation_id: donation.id,
        conversion_date: payload.donation.donation_date,
      });
    }

    // Initialize donor journey state
    await supabase.from('donor_journey_state').upsert(
      {
        donor_id: donor.id,
        current_stage: 'new_donor',
      },
      { onConflict: 'donor_id' }
    );

    // Mark webhook as processed
    if (webhookLog) {
      await supabase
        .from('webhooks_in')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', webhookLog.id);
    }

    // TODO: Trigger n8n webhook for email/SMS automation
    // await fetch(Deno.env.get('N8N_WEBHOOK_URL'), { ... })

    return new Response(
      JSON.stringify({
        success: true,
        donor_id: donor.id,
        donation_id: donation.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Donorbox webhook error:', error);
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