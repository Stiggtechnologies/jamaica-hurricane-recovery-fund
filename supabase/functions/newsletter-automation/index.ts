import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NewsletterRequest {
  action: 'generate' | 'send' | 'schedule';
  newsletter_id?: string;
  send_date?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, newsletter_id, send_date }: NewsletterRequest = await req.json();

    if (action === 'generate') {
      const { data: recentContent, error: contentError } = await supabase
        .from('aggregated_content')
        .select('*')
        .eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .gte('relevance_score', 0.7)
        .order('relevance_score', { ascending: false })
        .limit(10);

      if (contentError) throw contentError;

      const { data: recentDonations, error: donationsError } = await supabase
        .from('donations')
        .select('amount, donor:donors(first_name, last_name)')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('amount', { ascending: false })
        .limit(5);

      if (donationsError) throw donationsError;

      const { data: campaignStats } = await supabase
        .from('campaign_goals')
        .select('*')
        .eq('is_active', true)
        .single();

      const totalRaised = campaignStats?.current_amount || 0;
      const goal = campaignStats?.target_amount || 100000000;
      const percentComplete = ((totalRaised / goal) * 100).toFixed(1);

      const htmlContent = generateNewsletterHTML({
        recentContent: recentContent || [],
        recentDonations: recentDonations || [],
        totalRaised,
        goal,
        percentComplete
      });

      const { data: newsletter, error: insertError } = await supabase
        .from('newsletters')
        .insert({
          subject: `JHRF Weekly Update - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          content: htmlContent,
          status: 'draft',
          scheduled_for: send_date || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, newsletter }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'send' && newsletter_id) {
      const { data: newsletter, error: fetchError } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', newsletter_id)
        .single();

      if (fetchError) throw fetchError;

      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('is_active', true);

      if (subscribersError) throw subscribersError;

      let sentCount = 0;
      for (const subscriber of subscribers || []) {
        const personalizedContent = newsletter.content
          .replace(/{{first_name}}/g, subscriber.first_name || 'Friend')
          .replace(/{{email}}/g, subscriber.email);

        await supabase.from('email_queue').insert({
          recipient_email: subscriber.email,
          subject: newsletter.subject,
          html_body: personalizedContent,
          status: 'pending',
          scheduled_for: new Date().toISOString()
        });

        sentCount++;
      }

      await supabase
        .from('newsletters')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          sent_count: sentCount
        })
        .eq('id', newsletter_id);

      return new Response(
        JSON.stringify({ success: true, sent_count: sentCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or missing parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Newsletter automation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateNewsletterHTML(data: any): string {
  const { recentContent, recentDonations, totalRaised, goal, percentComplete } = data;

  const contentHTML = recentContent.map((item: any) => `
    <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
      <h3 style="color: #009739; margin: 0 0 8px 0;">${item.title}</h3>
      <p style="margin: 0 0 8px 0; color: #4b5563;">${item.summary || item.content?.substring(0, 200) + '...'}</p>
      <a href="${item.url}" style="color: #009739; text-decoration: none; font-weight: 600;">Read more →</a>
    </div>
  `).join('');

  const donationsHTML = recentDonations.map((d: any) => `
    <li style="margin-bottom: 8px;">
      <strong>${d.donor?.first_name} ${d.donor?.last_name?.charAt(0)}.</strong> donated $${d.amount.toLocaleString()}
    </li>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JHRF Weekly Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: linear-gradient(135deg, #009739 0%, #006d29 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #FED100; margin: 0; font-size: 28px; font-weight: 700;">Jamaica Hurricane Recovery Fund</h1>
      <p style="color: white; margin: 8px 0 0 0; font-size: 16px;">Weekly Update</p>
    </div>
    
    <div style="padding: 32px 20px;">
      <p style="margin: 0 0 24px 0; color: #1f2937; font-size: 16px;">Hello {{first_name}},</p>
      
      <h2 style="color: #009739; margin: 0 0 16px 0; font-size: 24px;">Campaign Progress</h2>
      <div style="background: #e6f7ed; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
        <div style="background: #d1d5db; height: 24px; border-radius: 12px; overflow: hidden; margin-bottom: 12px;">
          <div style="background: linear-gradient(90deg, #009739 0%, #FED100 100%); height: 100%; width: ${percentComplete}%; transition: width 0.3s;"></div>
        </div>
        <p style="margin: 0; text-align: center; font-size: 18px; font-weight: 600; color: #009739;">
          $${totalRaised.toLocaleString()} raised of $${goal.toLocaleString()} goal (${percentComplete}%)
        </p>
      </div>

      <h2 style="color: #009739; margin: 0 0 16px 0; font-size: 24px;">Latest News & Updates</h2>
      ${contentHTML}

      <h2 style="color: #009739; margin: 32px 0 16px 0; font-size: 24px;">Recent Supporters</h2>
      <ul style="list-style: none; padding: 0; margin: 0 0 32px 0;">
        ${donationsHTML}
      </ul>

      <div style="text-align: center; margin: 32px 0;">
        <a href="https://jamaicahurricanerecoveryfund.org" 
           style="display: inline-block; background: #009739; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Donate Now
        </a>
      </div>

      <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
        Thank you for being part of Jamaica's recovery journey.
      </p>
    </div>

    <div style="background: #1f2937; padding: 24px 20px; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 14px;">
        Jamaica Hurricane Recovery Fund<br>
        Rebuilding Stronger Together
      </p>
      <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 12px;">
        <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
