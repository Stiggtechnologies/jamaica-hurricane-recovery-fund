import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  amount: number;
  currency: string;
  donationType: 'one-time' | 'recurring';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const { amount, currency, donationType }: CheckoutRequest = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const successUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/donate?success=true`;
    const cancelUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/donate?canceled=true`;

    let sessionData: any = {
      payment_method_types: ['card'],
      mode: donationType === 'recurring' ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        donation_type: donationType,
      },
    };

    if (donationType === 'recurring') {
      sessionData.line_items = [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Monthly Donation - Jamaica Hurricane Recovery Fund',
            description: 'Monthly recurring donation to support hurricane recovery efforts',
          },
          unit_amount: amount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }];
    } else {
      sessionData.line_items = [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Donation - Jamaica Hurricane Recovery Fund',
            description: 'One-time donation to support hurricane recovery efforts',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'mode': sessionData.mode,
        'success_url': sessionData.success_url,
        'cancel_url': sessionData.cancel_url,
        'metadata[donation_type]': donationType,
        'line_items[0][price_data][currency]': currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': sessionData.line_items[0].price_data.product_data.name,
        'line_items[0][price_data][product_data][description]': sessionData.line_items[0].price_data.product_data.description,
        'line_items[0][price_data][unit_amount]': amount.toString(),
        'line_items[0][quantity]': '1',
        ...(donationType === 'recurring' ? {
          'line_items[0][price_data][recurring][interval]': 'month',
        } : {}),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Stripe API error:', errorData);
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
