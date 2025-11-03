import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Starting weekly blog generation...');

    const response = await fetch(
      `${supabaseUrl}/functions/v1/ai-blog-writer`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'auto-publish' }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate blog');
    }

    console.log('Weekly blog published successfully:', result.blog_post?.title);

    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `✍️ New blog post published: *${result.blog_post?.title}*`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✍️ *New Weekly Blog Post Published*\n\n*Title:* ${result.blog_post?.title}\n*Category:* ${result.blog_post?.category}\n*Status:* Published`,
              },
            },
          ],
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly blog published',
        blog_post: result.blog_post,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Weekly blog scheduler error:', error);
    
    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `❌ Weekly blog generation failed: ${error.message}`,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
