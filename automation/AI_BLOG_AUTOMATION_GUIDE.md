# AI Blog Automation Guide

Complete guide for setting up automated weekly blog posts with AI-generated natural-sounding content.

## Overview

The blog automation system uses OpenAI's GPT-4o to:
- Generate relevant blog topics based on recent news and recovery efforts
- Write comprehensive, natural-sounding blog posts (1000-1500 words)
- Automatically publish one blog post per week
- Notify team via Slack when blogs are published

## Components

### 1. Edge Functions

**`ai-blog-writer`** - Main AI blog generation function
- Generates blog topics
- Writes full blog posts with natural language
- Saves to database

**`weekly-blog-scheduler`** - Weekly automation trigger
- Runs automatically every week
- Calls ai-blog-writer
- Publishes blog post
- Sends Slack notification

### 2. Database

**`blog_posts` table** stores:
- Title, slug, content (HTML formatted)
- SEO metadata (title, description)
- Category and tags
- Publication status and timestamp
- View count tracking

## Setup Instructions

### Step 1: Configure OpenAI API Key

The OpenAI API key needs to be added to your Supabase project:

1. Get your OpenAI API key:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. Add to Supabase:
   - Go to your Supabase Dashboard
   - Settings → Edge Functions → Secrets
   - Add new secret:
     - Name: `OPENAI_API_KEY`
     - Value: `sk-your-api-key-here`

### Step 2: Configure Slack Notifications (Optional)

1. Create a Slack Incoming Webhook:
   - Go to https://api.slack.com/apps
   - Create new app → From scratch
   - Select your workspace
   - Features → Incoming Webhooks → Activate
   - Add New Webhook to Workspace
   - Select channel (e.g., #blog-updates)
   - Copy Webhook URL

2. Add to Supabase:
   - Settings → Edge Functions → Secrets
   - Add new secret:
     - Name: `SLACK_WEBHOOK_URL`
     - Value: `https://hooks.slack.com/services/...`

### Step 3: Set Up Weekly Schedule

You have two options:

#### Option A: Using GitHub Actions (Recommended)

Create `.github/workflows/weekly-blog.yml`:

```yaml
name: Weekly Blog Post

on:
  schedule:
    # Runs every Monday at 10:00 AM UTC
    - cron: '0 10 * * 1'
  workflow_dispatch: # Manual trigger

jobs:
  publish-blog:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Blog Publication
        run: |
          curl -X POST \
            https://your-project.supabase.co/functions/v1/weekly-blog-scheduler \
            -H "Content-Type: application/json"
```

#### Option B: Using Cron Job Service

Use a service like **Cron-Job.org** or **EasyCron**:

1. Sign up at https://cron-job.org/en/
2. Create new cron job:
   - URL: `https://your-project.supabase.co/functions/v1/weekly-blog-scheduler`
   - Schedule: Every Monday at 10:00 AM
   - Method: POST
   - Enable: Yes

#### Option C: Using n8n Workflow

Add this to your n8n workflows:

```json
{
  "name": "Weekly Blog Publisher",
  "nodes": [
    {
      "type": "n8n-nodes-base.cron",
      "schedule": "0 10 * * 1",
      "name": "Every Monday 10 AM"
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "method": "POST",
      "url": "https://your-project.supabase.co/functions/v1/weekly-blog-scheduler"
    }
  ]
}
```

### Step 4: Test the System

#### Test Topic Generation

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/ai-blog-writer \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "generate-topics"}'
```

#### Test Blog Writing

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/ai-blog-writer \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "write-blog",
    "topic": "How Climate-Resilient Housing is Rebuilding Jamaican Communities",
    "keywords": ["climate resilience", "housing", "Jamaica", "recovery"]
  }'
```

#### Test Automated Publishing

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/weekly-blog-scheduler
```

## Blog Writing Features

### Natural Language

The AI is configured to:
- Write in a warm, authentic, human voice
- Tell compelling stories with emotional connection
- Use short paragraphs for readability
- Include specific details and examples
- Be culturally sensitive to Jamaican context
- Focus on hope, resilience, and community

### Content Structure

Each blog post includes:
- **Compelling title** (optimized for engagement)
- **Excerpt** (150 characters for previews)
- **Full content** (1000-1500 words in HTML)
- **Category** (Impact Stories, Recovery Updates, Climate Resilience, Community Voices, Donor Spotlight)
- **Tags** (for organization and SEO)
- **SEO metadata** (title and description)

### SEO Optimization

- SEO-friendly titles (60 characters max)
- Meta descriptions (155 characters max)
- Clean URL slugs
- Keyword integration
- Structured HTML content

## Manual Blog Creation

You can also create blogs manually through the API:

```typescript
// Generate topic ideas
const topicsResponse = await fetch(
  `${supabaseUrl}/functions/v1/ai-blog-writer`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'generate-topics' }),
  }
);

const { topics } = await topicsResponse.json();
console.log(topics); // Array of 5 topic ideas

// Write a blog post
const blogResponse = await fetch(
  `${supabaseUrl}/functions/v1/ai-blog-writer`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'write-blog',
      topic: topics[0],
      keywords: ['recovery', 'Jamaica', 'resilience'],
    }),
  }
);

const { blog_post } = await blogResponse.json();
console.log(blog_post);
```

## Displaying Blogs on Website

Add a blog page to display published posts:

```typescript
// Fetch published blogs
const { data: blogs } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false });

// Display in your component
{blogs.map(blog => (
  <article key={blog.id}>
    <h2>{blog.title}</h2>
    <p>{blog.excerpt}</p>
    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
  </article>
))}
```

## Content Quality

The AI is trained to:
1. **Tell authentic stories** - Focus on real people and real impact
2. **Use emotional connection** - Create empathy and inspire action
3. **Include calls-to-action** - Encourage donations and engagement
4. **Maintain cultural sensitivity** - Respect Jamaican culture and context
5. **Write conversationally** - Sound natural, not robotic
6. **Use specific details** - Include facts, numbers, and examples
7. **Structure for readability** - Short paragraphs, clear headings

## Monitoring & Analytics

Track blog performance:

```sql
-- Most viewed posts
SELECT title, view_count, published_at
FROM blog_posts
WHERE status = 'published'
ORDER BY view_count DESC
LIMIT 10;

-- Posts by category
SELECT category, COUNT(*) as post_count
FROM blog_posts
WHERE status = 'published'
GROUP BY category;

-- Publishing frequency
SELECT DATE_TRUNC('week', published_at) as week, COUNT(*) as posts
FROM blog_posts
WHERE status = 'published'
GROUP BY week
ORDER BY week DESC;
```

## Cost Estimates

**OpenAI API Costs:**
- GPT-4o: ~$0.015 per 1K input tokens, ~$0.06 per 1K output tokens
- Average blog post: ~2000 tokens input, ~2500 tokens output
- Cost per blog: ~$0.18
- Monthly cost (4 blogs): ~$0.72
- Annual cost (52 blogs): ~$9.36

**Very affordable for high-quality, natural-sounding blog content!**

## Troubleshooting

### Blog not generating
- Check OpenAI API key is set correctly
- Verify API key has credits/billing enabled
- Check Edge Function logs in Supabase

### Scheduler not running
- Verify cron job is active
- Check webhook URL is correct
- Test manually with curl

### Blogs sound robotic
- The system uses GPT-4o with temperature 0.7
- Prompts emphasize natural, warm tone
- Consider adjusting temperature in code (0.6-0.9)

### No Slack notifications
- Check webhook URL is correct
- Verify webhook channel permissions
- Test webhook directly with curl

## Support

For issues or questions:
- Email: tech@jamaicahurricanefund.org
- Check Edge Function logs in Supabase Dashboard
- Review OpenAI API logs at platform.openai.com

---

**Last Updated:** 2024
**Maintained By:** JHRF Technical Team
