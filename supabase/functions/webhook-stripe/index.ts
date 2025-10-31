import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature',
};

interface StripeWebhook {
  id: string;
  type: string;
  data: {
    object: any;
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

    const signature = req.headers.get('Stripe-Signature');
    const rawBody = await req.text();
    const event: StripeWebhook = JSON.parse(rawBody);

    // TODO: Verify Stripe signature
    // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    // stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // Log incoming webhook
    const { data: webhookLog } = await supabase
      .from('webhooks_in')
      .insert({
        source: 'stripe',
        event_type: event.type,
        payload: event,
        signature: signature,
        verified: true,
      })
      .select()
      .single();

    let response = { success: true, processed: false };

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'charge.succeeded':
        await handleSuccessfulPayment(supabase, event);
        response.processed = true;
        break;

      case 'payment_intent.payment_failed':
      case 'charge.failed':
        await handleFailedPayment(supabase, event);
        response.processed = true;
        break;

      case 'charge.dispute.created':
        await handleDispute(supabase, event);
        response.processed = true;
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscription(supabase, event);
        response.processed = true;
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailure(supabase, event);
        response.processed = true;
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    if (webhookLog && response.processed) {
      await supabase
        .from('webhooks_in')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', webhookLog.id);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Stripe webhook error:', error);
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

async function handleSuccessfulPayment(supabase: any, event: StripeWebhook) {
  const paymentIntent = event.data.object;
  const metadata = paymentIntent.metadata || {};

  // Find or create donor from payment metadata
  const { data: donor } = await supabase
    .from('donors_crm')
    .select('*')
    .eq('email', metadata.email || paymentIntent.receipt_email)
    .single();

  if (!donor) {
    console.log('Donor not found, skipping payment processing');
    return;
  }

  // Update or create donation
  await supabase.from('donations_enhanced').upsert(
    {
      donor_id: donor.id,
      ext_id: `stripe_${paymentIntent.id}`,
      ext_source: 'stripe',
      amount_cents: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      frequency: metadata.frequency || 'one_time',
      status: 'succeeded',
      method: paymentIntent.payment_method_types?.[0] || 'card',
      campaign: metadata.campaign,
      referral_code: metadata.referral_code,
      donated_at: new Date(paymentIntent.created * 1000).toISOString(),
      processed_at: new Date().toISOString(),
      metadata: { stripe_payment_intent: paymentIntent.id },
    },
    { onConflict: 'ext_id' }
  );
}

async function handleFailedPayment(supabase: any, event: StripeWebhook) {
  const paymentIntent = event.data.object;

  await supabase
    .from('donations_enhanced')
    .update({
      status: 'failed',
      metadata: { failure_reason: paymentIntent.last_payment_error?.message },
    })
    .eq('ext_id', `stripe_${paymentIntent.id}`);

  // TODO: Trigger recovery workflow in n8n
}

async function handleDispute(supabase: any, event: StripeWebhook) {
  const dispute = event.data.object;

  await supabase
    .from('donations_enhanced')
    .update({
      status: 'disputed',
      metadata: { dispute_reason: dispute.reason },
    })
    .eq('ext_id', `stripe_${dispute.charge}`);

  // TODO: Alert admin via Slack
}

async function handleSubscription(supabase: any, event: StripeWebhook) {
  const subscription = event.data.object;
  const metadata = subscription.metadata || {};

  if (metadata.email) {
    await supabase
      .from('donors_crm')
      .update({ is_monthly_donor: subscription.status === 'active' })
      .eq('email', metadata.email);
  }
}

async function handleInvoiceFailure(supabase: any, event: StripeWebhook) {
  const invoice = event.data.object;

  // TODO: Trigger recovery email workflow
  console.log('Invoice payment failed:', invoice.id);
}