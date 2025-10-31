# JHRF Automation Setup Guide

Complete guide to deploying the Jamaica Hurricane Recovery Fund automation infrastructure.

## Quick Start (1-Page Checklist)

### Prerequisites (15 minutes)
- [ ] Supabase project with schema migrated
- [ ] Website deployed and operational
- [ ] Domain configured (jamaicahurricanerecoveryfund.org)
- [ ] n8n instance running (Docker or cloud)
- [ ] Accounts created: Donorbox, Stripe, Mailchimp/HubSpot, Twilio, Slack

### Phase 1: Core Infrastructure (1 hour)
- [ ] Copy `.env.sample` to `.env` and fill in credentials
- [ ] Test Supabase connection
- [ ] Deploy Edge Functions (webhook receivers + metrics API)
- [ ] Configure Donorbox and Stripe webhooks
- [ ] Test donation flow end-to-end

### Phase 2: Email/SMS Setup (30 minutes)
- [ ] Upload email templates to Mailchimp or HubSpot
- [ ] Configure Twilio phone number
- [ ] Set up SMS keywords
- [ ] Test email and SMS sending

### Phase 3: n8n Workflows (2 hours)
- [ ] Import all 11 workflows
- [ ] Configure credentials in n8n
- [ ] Test each workflow individually
- [ ] Activate workflows in order (WF-01, WF-11, then others)

### Phase 4: Monitoring (30 minutes)
- [ ] Create Slack channels (#donations, #on-call, #automation)
- [ ] Add Slack bot to channels
- [ ] Configure alert recipients
- [ ] Test alert system

### Phase 5: Validation (1 hour)
- [ ] Make test donation
- [ ] Verify donor created
- [ ] Check thank-you email received
- [ ] Confirm Slack notification
- [ ] Validate metrics API response
- [ ] Backdate test donation and trigger Day 7 workflow

**Total Setup Time**: ~5 hours

---

## Detailed Setup Instructions

### 1. Supabase Configuration

#### 1.1 Verify Schema Migration

```bash
# Check that tables exist
psql $SUPABASE_URL -c "\dt"
```

Expected tables:
- donors_crm
- donations_enhanced
- corporate_matches
- pledges
- referrals
- email_events
- sms_events
- webhooks_in
- etl_runs
- kpi_snapshots
- donor_journey_state

#### 1.2 Create Service Role Key

1. Supabase Dashboard > Settings > API
2. Copy "service_role" key (starts with `eyJ...`)
3. Add to `.env` as `SUPABASE_SERVICE_ROLE_KEY`

#### 1.3 Test Edge Functions

```bash
# Test metrics API
curl https://your-project.supabase.co/functions/v1/metrics-api/summary

# Expected response:
{
  "success": true,
  "data": {
    "total_raised_cents": 0,
    "donors_count": 0,
    ...
  }
}
```

---

### 2. Payment Processors

#### 2.1 Donorbox Setup

1. **Create Campaign**
   - Go to Donorbox Dashboard
   - Create new campaign: "JHRF General Fund"
   - Set goal: $100,000,000
   - Currency: USD

2. **Get API Key**
   - Settings > API
   - Generate API key
   - Add to `.env` as `DONORBOX_API_KEY`

3. **Configure Webhook**
   - Settings > Webhooks
   - Add endpoint: `https://your-project.supabase.co/functions/v1/webhook-donorbox`
   - Events: `donation.created`, `donation.updated`, `donation.refunded`
   - Secret: Generate random string, add to `.env` as `DONORBOX_WEBHOOK_SECRET`
   - Save and test

4. **Embed on Website**
   - Get embed code from Donorbox
   - Add to `src/pages/Donate.tsx`
   - Replace placeholder section

#### 2.2 Stripe Setup

1. **Create Account** (if needed)
   - https://dashboard.stripe.com/register
   - Complete business verification

2. **Get API Keys**
   - Dashboard > Developers > API keys
   - Copy "Publishable key" → `.env` as `STRIPE_PUBLISHABLE_KEY`
   - Reveal "Secret key" → `.env` as `STRIPE_SECRET_KEY`

3. **Configure Webhooks**
   - Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-project.supabase.co/functions/v1/webhook-stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.dispute.created`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `invoice.payment_failed`
   - Copy webhook signing secret → `.env` as `STRIPE_WEBHOOK_SECRET`

4. **Test Mode First**
   - Use test keys (sk_test_...) initially
   - Test cards: https://stripe.com/docs/testing
   - Switch to live keys after testing

#### 2.3 Test Donation Flow

```bash
# Use Stripe test card: 4242 4242 4242 4242
# Any future exp date, any CVV
# Make donation via website
# Check Supabase to verify:
psql $SUPABASE_URL -c "SELECT * FROM donations_enhanced ORDER BY created_at DESC LIMIT 5;"
```

---

### 3. Email & SMS Services

#### 3.1 Mailchimp Setup

1. **Create Account** (if needed)
   - https://mailchimp.com/signup

2. **Get API Key**
   - Account > Extras > API keys
   - Create new key
   - Copy to `.env` as `MC_API_KEY`
   - Note server prefix (e.g., `us1`) → `.env` as `MC_SERVER_PREFIX`

3. **Create Audience**
   - Audience > Create Audience
   - Name: "JHRF Donors"
   - Copy Audience ID → `.env` as `MC_LIST_ID`

4. **Upload Email Templates**
   - Campaigns > Email templates > Create Template
   - Code your own
   - Paste HTML from `/automation/templates/emails/`
   - Save each as: `thank_you_v1`, `day7_impact_v1`, etc.

5. **Configure Merge Tags**
   - Audience > Settings > Audience fields
   - Add custom fields:
     - FNAME (First Name)
     - LNAME (Last Name)
     - AMOUNT (Donation Amount)
     - DONATIONDATE (Date)
     - RECEIPTID (Receipt ID)
     - REFERRALCODE (Referral Code)

6. **Test Email Send**
   ```bash
   # Via n8n or curl to Mailchimp API
   curl -X POST https://us1.api.mailchimp.com/3.0/campaigns \\
     -u "anystring:$MC_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"type":"regular","recipients":{"list_id":"'$MC_LIST_ID'"},"settings":{"subject_line":"Test","from_name":"JHRF","reply_to":"info@jamaicahurricanefund.org"}}'
   ```

#### 3.2 HubSpot Setup (Alternative)

1. **Create Account**
   - https://app.hubspot.com/signup

2. **Create Private App**
   - Settings > Integrations > Private Apps
   - Create new app: "JHRF Automation"
   - Scopes: `crm.objects.contacts.write`, `crm.objects.contacts.read`, `cms.content.read`, `automation`
   - Copy token → `.env` as `HS_PRIVATE_APP_TOKEN`

3. **Upload Templates**
   - Marketing > Files and Templates > Design Tools
   - Create email templates
   - Use HubL tokens: `{{ contact.firstname }}`, `{{ contact.email }}`, etc.

#### 3.3 Twilio SMS Setup

1. **Create Account**
   - https://www.twilio.com/try-twilio
   - Verify your phone number

2. **Get Phone Number**
   - Phone Numbers > Buy a number
   - Choose US number with SMS capability
   - Copy to `.env` as `TWILIO_FROM_NUMBER` (format: +12345678900)

3. **Get Credentials**
   - Console > Account > Keys & Credentials
   - Copy Account SID → `.env` as `TWILIO_ACCOUNT_SID`
   - Copy Auth Token → `.env` as `TWILIO_AUTH_TOKEN`

4. **Configure Webhooks** (for keyword responses)
   - Phone Numbers > Manage > Active Numbers
   - Click your number
   - Messaging > Webhook when message comes in
   - URL: `https://your-n8n.com/webhook/twilio-sms`
   - HTTP POST

5. **Set Up Keywords**
   - Messaging > Messaging Services (optional but recommended)
   - Create service: "JHRF Donations"
   - Add sender: your phone number
   - Compliance info: Fill in organization details

6. **Test SMS**
   ```bash
   curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \\
     -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \\
     -d "From=$TWILIO_FROM_NUMBER" \\
     -d "To=+1234567890" \\
     -d "Body=Test message from JHRF automation"
   ```

---

### 4. n8n Deployment

#### 4.1 Install n8n

**Option A: Docker Compose (Recommended)**

```yaml
# docker-compose.yml
version: '3'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=change_this_password
      - N8N_HOST=your-n8n-domain.com
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://your-n8n-domain.com/
    volumes:
      - ./n8n-data:/home/node/.n8n
      - ./automation:/data/automation
```

```bash
docker-compose up -d
```

**Option B: n8n Cloud**
- Sign up at https://n8n.io
- Create workspace
- Much easier but costs $20/month

#### 4.2 Access n8n Dashboard

- URL: `https://your-n8n-domain.com:5678` (self-hosted) or cloud URL
- Login with credentials

#### 4.3 Configure Environment Variables

- Settings > Variables
- Add all variables from `.env.sample`
- Or use Environment section in docker-compose.yml

#### 4.4 Import Workflows

1. **Manual Import**:
   - Workflows > Import from File
   - Select `/automation/n8n/workflows/WF-01-donorbox-ingestion.json`
   - Review and save
   - Repeat for all 11 workflows

2. **Bulk Import** (if available):
   ```bash
   for file in automation/n8n/workflows/*.json; do
     n8n import:workflow --input="$file"
   done
   ```

#### 4.5 Configure Credentials

For each workflow, add credentials:

1. **Supabase**:
   - Type: HTTP Request (Custom Auth)
   - Auth: Bearer Token
   - Token: `SUPABASE_SERVICE_ROLE_KEY`
   - Headers: `apikey: SUPABASE_ANON_KEY`

2. **Mailchimp**:
   - Type: Mailchimp OAuth2 API
   - Follow OAuth flow

3. **Twilio**:
   - Type: Twilio
   - Account SID + Auth Token

4. **Slack**:
   - Type: Slack OAuth2 API
   - Follow OAuth flow
   - Scopes: `chat:write`, `channels:read`

5. **Google**:
   - Type: Google Service Account
   - Upload JSON key file

#### 4.6 Test Each Workflow

1. **WF-01 (Donation Ingestion)**:
   - Open workflow
   - Click "Execute Workflow"
   - Use test webhook URL
   - Send test payload via curl
   - Verify success

2. **WF-11 (Monitoring)**:
   - Should run automatically every 5 minutes
   - Check execution history
   - Verify Slack "all systems operational" message

3. **Scheduled Workflows**:
   - Won't run until schedule time
   - Manually execute to test
   - Or temporarily change schedule to "* * * * *" (every minute)

#### 4.7 Activate Workflows

**Activation Order** (important!):
1. WF-01: Donation ingestion (core functionality)
2. WF-11: Monitoring (so you know if things break)
3. WF-06: Payment failure recovery
4. WF-02, WF-03, WF-04, WF-05: Donor journey emails
5. WF-07, WF-08, WF-09: Advanced features
6. WF-10: Data sync (last, runs weekly)

Toggle "Active" switch on each workflow.

---

### 5. Slack Configuration

#### 5.1 Create Slack App

1. **Go to**: https://api.slack.com/apps
2. **Create New App** > From scratch
3. **Name**: "JHRF Automation Bot"
4. **Workspace**: Your workspace

#### 5.2 Configure Bot

1. **OAuth & Permissions**:
   - Add scopes:
     - `chat:write`
     - `channels:read`
     - `channels:join`
     - `files:write`
   - Install app to workspace
   - Copy "Bot User OAuth Token" → `.env` as `SLACK_BOT_TOKEN`

2. **Event Subscriptions** (optional):
   - Enable events
   - Request URL: `https://your-n8n.com/webhook/slack-events`
   - Subscribe to: `message.channels`

#### 5.3 Create Channels

Create these channels (public or private):
- `#donations` - Real-time donation feed
- `#on-call` - Critical alerts
- `#automation` - Workflow summaries
- `#corp-matching` - Corporate partnerships
- `#ambassadors` - Referral leaderboard

#### 5.4 Invite Bot

In each channel:
```
/invite @JHRF Automation Bot
```

#### 5.5 Get Channel IDs

1. Right-click channel name
2. Copy link
3. Extract ID from URL (e.g., `C01234567890`)
4. Add to `.env`:
   ```
   SLACK_DONATIONS_CHANNEL=C01234567890
   SLACK_ONCALL_CHANNEL=C09876543210
   etc.
   ```

#### 5.6 Test Slack Integration

```bash
curl -X POST https://slack.com/api/chat.postMessage \\
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "'$SLACK_DONATIONS_CHANNEL'",
    "text": "Test message from JHRF automation setup!"
  }'
```

---

### 6. Referral System Setup

The referral tracking system is built into the database schema and workflows.

#### 6.1 Enable Feature

```env
ENABLE_REFERRALS=true
```

#### 6.2 Update Website

Add referral parameter to donation links:

```typescript
// In src/pages/Home.tsx or Donate.tsx
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get('ref');

// Store in localStorage or pass to donation form
if (referralCode) {
  localStorage.setItem('jhrf_referral_code', referralCode);
}

// When submitting donation:
const donationData = {
  ...formData,
  referral_code: localStorage.getItem('jhrf_referral_code'),
};
```

#### 6.3 Generate Referral Links

When a donor becomes an ambassador:

```sql
-- Make donor an ambassador (auto-generates code)
UPDATE donors_crm
SET is_ambassador = true
WHERE email = 'donor@example.com';

-- Get their referral code
SELECT referral_code FROM donors_crm WHERE email = 'donor@example.com';
-- Returns: XYZ12ABC

-- Their referral URL:
https://jamaicahurricanerecoveryfund.org/donate?ref=XYZ12ABC
```

#### 6.4 Leaderboard Display

Add to website:

```typescript
// Fetch leaderboard from API
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/metrics-api/leaderboard?limit=10`
);
const { data } = await response.json();

// Display in component
{data.map((ambassador, index) => (
  <div key={index}>
    <span>{ambassador.rank}. {ambassador.name}</span>
    <span>{ambassador.converted_referrals} referrals</span>
  </div>
))}
```

---

### 7. Corporate Matching Setup

#### 7.1 Create Intake Form

Add to website (`src/pages/GetInvolved.tsx`):

```typescript
<form onSubmit={handleCorporateMatchSubmit}>
  <input name="company_name" required />
  <input name="contact_email" required />
  <input name="pledge_amount" type="number" required />
  <select name="match_ratio">
    <option value="1">1:1 Match</option>
    <option value="2">2:1 Match</option>
    <option value="0.5">50% Match</option>
  </select>
  <button type="submit">Submit</button>
</form>
```

#### 7.2 Configure Webhook

Form submission → n8n webhook:
```
https://your-n8n.com/webhook/corporate-match
```

#### 7.3 Employee Code Generation

When corporate match is approved:

```sql
-- Insert corporate match
INSERT INTO corporate_matches (
  company, contact_email, pledge_cents, match_ratio, status, employee_code_prefix
) VALUES (
  'Acme Corp', 'hr@acme.com', 5000000, 1.0, 'active', 'ACME-'
);

-- Employees use: ACME-EMPLOYEENAME when donating
-- System automatically tracks and matches
```

---

### 8. Testing & Validation

#### 8.1 End-to-End Test

**Test Scenario**: Complete donation flow

1. **Make Test Donation**:
   - Go to website/donate
   - Use Stripe test card: 4242 4242 4242 4242
   - Amount: $100
   - Email: test@example.com

2. **Verify Webhook Received**:
   ```sql
   SELECT * FROM webhooks_in ORDER BY received_at DESC LIMIT 1;
   ```

3. **Verify Donor Created**:
   ```sql
   SELECT * FROM donors_crm WHERE email = 'test@example.com';
   ```

4. **Verify Donation Recorded**:
   ```sql
   SELECT * FROM donations_enhanced ORDER BY created_at DESC LIMIT 1;
   ```

5. **Check Thank-You Email**:
   - Check test@example.com inbox
   - Verify email received within 2 minutes

6. **Check Slack Notification**:
   - Look for message in #donations channel

7. **Check Metrics API**:
   ```bash
   curl https://your-project.supabase.co/functions/v1/metrics-api/summary
   # Should show donors_count: 1, total_raised_cents: 10000
   ```

#### 8.2 Donor Journey Test

**Test Day 7 Email**:

1. **Backdate Donation**:
   ```sql
   UPDATE donations_enhanced
   SET donated_at = NOW() - INTERVAL '7 days'
   WHERE id = 'test-donation-id';
   ```

2. **Manually Trigger WF-02**:
   - Open workflow in n8n
   - Click "Execute Workflow"
   - Should find 1 eligible donor
   - Email should send

3. **Verify Journey State Updated**:
   ```sql
   SELECT * FROM donor_journey_state
   WHERE donor_id = (SELECT id FROM donors_crm WHERE email = 'test@example.com');
   -- day7_impact_sent_at should be populated
   ```

#### 8.3 Payment Failure Test

1. **Use Failing Card**: 4000 0000 0000 0341
2. **Attempt Donation**
3. **Verify**:
   - webhooks_in logs failure
   - donations_enhanced.status = 'failed'
   - Recovery email sent
   - Slack alert posted

---

### 9. Monitoring & Maintenance

#### 9.1 Daily Checks

- [ ] Check #automation channel for workflow summaries
- [ ] Review n8n execution history for errors
- [ ] Check Slack #donations for activity
- [ ] Spot-check donor records in Supabase

#### 9.2 Weekly Tasks

- [ ] Review WF-10 data sync report
- [ ] Check email bounce rates
- [ ] Review payment failure recovery metrics
- [ ] Update email templates if needed

#### 9.3 Monthly Tasks

- [ ] Rotate API keys/secrets
- [ ] Review and optimize slow workflows
- [ ] Check for n8n updates
- [ ] Audit database for orphaned records
- [ ] Generate stakeholder report

#### 9.4 Quarterly Tasks

- [ ] Full system audit
- [ ] Disaster recovery drill
- [ ] Update documentation
- [ ] Review and update SLAs
- [ ] Performance optimization

---

### 10. Troubleshooting

#### Common Issues

**Problem**: Webhooks not arriving
- Check webhook URL configuration
- Verify SSL certificate
- Test with curl
- Check firewall rules

**Problem**: Emails not sending
- Verify Mailchimp/HubSpot credentials
- Check rate limits
- Review suppression list
- Test with different email

**Problem**: Database errors
- Check Supabase connection
- Verify RLS policies
- Review query logs
- Check for schema changes

**Problem**: n8n workflow fails
- Check execution log
- Verify all credentials
- Test each node individually
- Check environment variables

#### Getting Help

- **n8n Community**: https://community.n8n.io
- **Supabase Docs**: https://supabase.com/docs
- **JHRF Tech Team**: tech@jamaicahurricanefund.org

---

### 11. Going Live Checklist

Before production launch:

**Infrastructure**
- [ ] All services on paid/production plans
- [ ] SSL certificates installed
- [ ] Backups configured
- [ ] Monitoring alerts set up

**Configuration**
- [ ] All test keys replaced with live keys
- [ ] Environment variables reviewed
- [ ] Webhook signatures verified
- [ ] Email domains authenticated

**Testing**
- [ ] End-to-end donation tested
- [ ] All workflows tested individually
- [ ] Error handling verified
- [ ] Alert system tested

**Documentation**
- [ ] Runbooks created
- [ ] Team trained
- [ ] On-call rotation established
- [ ] Contact list updated

**Compliance**
- [ ] Privacy policy updated
- [ ] Terms of service reviewed
- [ ] GDPR compliance verified
- [ ] Email opt-in process confirmed

**Launch**
- [ ] Soft launch (limited traffic)
- [ ] Monitor for 48 hours
- [ ] Full launch
- [ ] Announce to stakeholders

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        JHRF Automation Stack                     │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │     Website      │
                    │  (React + Vite)  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Payment Forms   │
                    │ Stripe/Donorbox  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────────────────────────┐
                    │    Supabase Edge Functions           │
                    ├──────────────────────────────────────┤
                    │ • webhook-donorbox                   │
                    │ • webhook-stripe                     │
                    │ • metrics-api                        │
                    └────────┬─────────────────────────────┘
                             │
                    ┌────────▼─────────────────────────────┐
                    │    Supabase PostgreSQL               │
                    ├──────────────────────────────────────┤
                    │ • donors_crm                         │
                    │ • donations_enhanced                 │
                    │ • email_events, sms_events           │
                    │ • webhooks_in, etl_runs              │
                    │ • kpi_snapshots, referrals           │
                    └────────┬─────────────────────────────┘
                             │
                    ┌────────▼─────────────────────────────┐
                    │         n8n Workflows                │
                    ├──────────────────────────────────────┤
                    │ WF-01: Donation Ingestion            │
                    │ WF-02-05: Donor Journey              │
                    │ WF-06: Payment Recovery              │
                    │ WF-07-08: Corporate/Referrals        │
                    │ WF-09: Live Telethon                 │
                    │ WF-10: Data Sync                     │
                    │ WF-11: Monitoring                    │
                    └────────┬─────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
  ┌───────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐
  │   Mailchimp/   │ │   Twilio    │  │     Slack      │
  │    HubSpot     │ │    (SMS)    │  │   (Alerts)     │
  └────────────────┘ └─────────────┘  └────────────────┘
          │                  │                  │
  ┌───────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐
  │  Thank You     │ │ Day 7 SMS   │  │ #donations     │
  │  Day 7,14,30   │ │ Upgrade SMS │  │ #on-call       │
  │  Month 11      │ │ Event SMS   │  │ #automation    │
  └────────────────┘ └─────────────┘  └────────────────┘

```

---

**Setup Guide Version**: 1.0
**Last Updated**: 2024
**Maintained By**: JHRF Technical Team
**Support**: tech@jamaicahurricanefund.org
