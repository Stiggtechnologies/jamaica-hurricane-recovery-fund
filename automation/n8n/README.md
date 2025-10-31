# JHRF n8n Workflows

Complete automation workflows for the Jamaica Hurricane Recovery Fund donation system.

## Overview

This directory contains 11 production-ready n8n workflows that automate the entire donor journey from initial donation through long-term engagement, plus operational workflows for reporting and monitoring.

## Workflows Summary

| ID | Name | Trigger | Purpose |
|----|------|---------|---------|
| WF-01 | Donorbox → CRM Ingest & Thank-You | Webhook | Process donations, create donors, send thank you |
| WF-02 | 7-Day Impact Email | Cron (daily) | Send impact update to 7-day donors |
| WF-03 | 14-Day Monthly Upgrade | Cron (daily) | Encourage one-time donors to go monthly |
| WF-04 | 30-Day Transparency Report | Cron (daily) | Send financial transparency report |
| WF-05 | 11-Month Renewal Reminder | Cron (weekly) | Re-engage lapsed donors |
| WF-06 | Failed Payment Recovery | Webhook (Stripe) | Handle failed payments gracefully |
| WF-07 | Corporate Matching | Webhook (form) | Track corporate matching programs |
| WF-08 | Ambassador/Referral Tracking | Webhook | Track and reward referrals |
| WF-09 | Telethon Real-Time Ticker | Webhook | Live event donation updates |
| WF-10 | Weekly Data Warehouse Sync | Cron (weekly) | Generate KPI snapshots and reports |
| WF-11 | SLA/Health Monitoring | Cron (5 min) | Monitor system health and alert |

## Installation

### Prerequisites

1. **n8n Instance**
   ```bash
   # Docker Compose (recommended)
   docker-compose up -d
   ```

2. **Supabase Database**
   - Schema already migrated
   - Connection credentials in environment

3. **External Services**
   - Donorbox account with webhook configured
   - Stripe account with webhook configured
   - Mailchimp or HubSpot account
   - Twilio account (for SMS)
   - Slack workspace
   - Google Drive/Sheets access

### Environment Variables

Set these in n8n Settings > Variables or use .env file:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Donorbox
DONORBOX_WEBHOOK_SECRET=your_webhook_secret
DONORBOX_API_KEY=your_api_key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (choose one)
CRM_VENDOR=mailchimp  # or hubspot
MC_API_KEY=your_mailchimp_key
MC_SERVER_PREFIX=us1
MC_LIST_ID=your_list_id
HS_PRIVATE_APP_TOKEN=your_hubspot_token

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
SEND_SMS_ON_THANKYOU=true

# Slack
SLACK_BOT_TOKEN=xoxb-xxx
SLACK_ALERTS_CHANNEL=#donations
SLACK_ONCALL_CHANNEL=#on-call

# Google Drive
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_REPORTS_FOLDER_ID=folder_id

# S3/Backblaze (archives)
S3_ENDPOINT=s3.us-west-002.backblazeb2.com
S3_BUCKET=jhrf-archives
S3_ACCESS_KEY=your_key
S3_SECRET_KEY=your_secret

# Website
WEBSITE_URL=https://jamaicahurricanerecoveryfund.org

# Features
ENABLE_REFERRALS=true
TELETHON_MODE=false
DEFAULT_CURRENCY=USD
```

### Import Workflows

1. **In n8n Dashboard**:
   - Click **Workflows > Import from File**
   - Select JSON file from `/n8n/workflows/`
   - Review credentials
   - Activate workflow

2. **Or via CLI**:
   ```bash
   n8n import:workflow --input=./n8n/workflows/WF-01-donorbox-ingestion.json
   ```

3. **Configure Credentials**:
   - Settings > Credentials
   - Add credentials for each service
   - Test connections

### Configure Webhooks

1. **Donorbox Webhook**:
   - n8n webhook URL: `https://your-n8n.com/webhook/donorbox-donation`
   - Events: `donation.created`, `donation.updated`
   - Secret: Match `DONORBOX_WEBHOOK_SECRET`

2. **Stripe Webhook**:
   - n8n webhook URL: `https://your-n8n.com/webhook/stripe-events`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.dispute.created`, `invoice.payment_failed`
   - Secret: Match `STRIPE_WEBHOOK_SECRET`

3. **Form Webhook** (Corporate Matching):
   - n8n webhook URL: `https://your-n8n.com/webhook/corporate-match`
   - Configure in website form or Typeform

---

## Workflow Details

### WF-01: Donorbox → CRM Ingest & Thank-You

**File**: `WF-01-donorbox-ingestion.json`

**Description**: Primary donation ingestion workflow. Receives Donorbox webhooks, verifies signature, creates/updates donor and donation records, tracks referrals, sends thank-you email/SMS, posts to Slack, and triggers metrics update.

**Trigger**: Webhook (POST)
**Webhook Path**: `/webhook/donorbox-donation`

**Flow**:
```
Webhook Trigger
  ↓
Verify Signature
  ↓
Log to webhooks_in
  ↓
[Branch: Valid Signature?]
  ↓ YES
Parse Donation Data
  ↓
Upsert Donor (Supabase)
  ↓
Insert Donation (Supabase)
  ↓
[Branch: Has Referral Code?]
    ↓ YES → Track Referral
  ↓
Initialize Donor Journey State
  ↓
[Branch: CRM Vendor?]
    ├─ Mailchimp → Add to List + Tags
    └─ HubSpot → Create/Update Contact
  ↓
Send Thank You Email
  ↓
[Branch: SMS Consent + Phone?]
    ↓ YES → Send Thank You SMS (Twilio)
  ↓
Post to Slack (#donations)
  ↓
Update Metrics Cache
  ↓
[Error Handler] → Log Error + Slack Alert
  ↓
Return Success Response
```

**Key Nodes**:
- Webhook: Donorbox donation payload
- HTTP Request: Supabase upserts
- IF: Conditional branching
- Switch: CRM vendor routing
- Send Email: Mailchimp/HubSpot API
- Twilio: SMS sending
- Slack: Celebration message
- Error Trigger: Global error handling

**Error Handling**:
- All DB operations wrapped in try/catch
- Failures logged to `webhooks_in.error`
- Slack alert sent to #on-call
- Returns 200 to Donorbox to prevent retries
- Manual review queue for failed operations

**Testing**:
```bash
curl -X POST https://your-n8n.com/webhook/donorbox-donation \\
  -H "Content-Type: application/json" \\
  -H "X-Donorbox-Signature: test_signature" \\
  -d @test-payloads/donorbox-donation.json
```

---

### WF-02: 7-Day Impact Email

**File**: `WF-02-day7-impact-email.json`

**Description**: Scheduled workflow that identifies donors who gave exactly 7 days ago and haven't received the Day 7 impact email, then sends personalized impact updates.

**Trigger**: Cron (daily at 10:00 AM EST)
**Schedule**: `0 10 * * *`

**Flow**:
```
Cron Trigger (daily 10am)
  ↓
Query Supabase:
  donations_enhanced WHERE
    donated_at = NOW() - INTERVAL '7 days'
    AND donor_journey_state.day7_impact_sent_at IS NULL
  ↓
For Each Donor:
  ↓
  Fetch Donor Details + Impact Stats
  ↓
  Build Email Payload (template day7_impact_v1)
  ↓
  [Branch: CRM Vendor?]
    ├─ Mailchimp → Send via API
    └─ HubSpot → Send via API
  ↓
  Update donor_journey_state.day7_impact_sent_at
  ↓
  Log to email_events (event_type: 'sent')
  ↓
[Error Handler] → Slack Alert
  ↓
Summary to Slack: {{count}} emails sent
```

**Key Features**:
- Idempotent: Won't resend if already sent
- Batched processing: Up to 1000 donors per run
- Rate limiting: 5 emails/second to avoid spam filters
- Dynamic content: Pulls real impact numbers from DB
- UTM tracking: All links tagged with utm_source=email&utm_campaign=day7_impact

**Variables**:
- Query calculates personalized impact metrics
- Template pulled from EMAIL_SMS_TEMPLATES.md
- Unsubscribe link generated per donor

**Monitoring**:
- Success rate logged to `etl_runs`
- Failures retried next day
- Daily summary posted to #automation channel

---

### WF-03: 14-Day Monthly Upgrade

**File**: `WF-03-day14-monthly-upgrade.json`

**Description**: Encourage one-time donors to become monthly givers 14 days after their first donation.

**Trigger**: Cron (daily at 11:00 AM EST)
**Schedule**: `0 11 * * *`

**Conditions**:
- One-time donor only (frequency = 'one_time')
- First donation was 14 days ago
- No monthly upgrade email sent yet
- Not already a monthly donor

**Flow**:
```
Cron Trigger
  ↓
Query Eligible Donors
  ↓
For Each Donor:
  ↓
  Calculate Suggested Monthly Amount (original / 3)
  ↓
  Generate Monthly Upgrade URL (prefilled)
  ↓
  Generate Referral URL
  ↓
  Send Upgrade Email (template: day14_upgrade_v1)
  ↓
  Update donor_journey_state.day14_upgrade_sent_at
  ↓
  Log to email_events
  ↓
[Optional] Send SMS Nudge (+3 hours)
  ↓
Summary Report → Slack
```

**Conversion Tracking**:
- When donor converts to monthly, tag applied
- Conversion rate calculated weekly
- A/B testing support built in

**Variables**:
- `{{monthly_upgrade_url}}`: Direct link with amount prefilled
- `{{suggested_monthly}}`: 1/3 of original one-time gift
- `{{referral_url}}`: Share link to earn ambassador points

---

### WF-04: 30-Day Transparency Report

**File**: `WF-04-day30-transparency.json`

**Description**: Send comprehensive transparency report 30 days after donation, showing exactly where funds went.

**Trigger**: Cron (daily at 2:00 PM EST)
**Schedule**: `0 14 * * *`

**Flow**:
```
Cron Trigger
  ↓
Query Donors (30 days since first donation)
  ↓
For Each Donor:
  ↓
  Calculate Donor's Allocation Breakdown
  ↓
  Fetch Top 3 Active Projects
  ↓
  Fetch Monthly Stats
  ↓
  Generate PDF Report (Google Docs Template)
  ↓
  Upload PDF to Google Drive
  ↓
  Get Shareable Link
  ↓
  Send Email with Report Link
  ↓
  Update donor_journey_state
  ↓
Summary → Slack
```

**Report Contents**:
- Donation breakdown by category
- Projects funded this month
- Monthly campaign metrics
- Downloadable PDF with full financials
- Link to schedule call with team

**PDF Generation**:
- Uses Google Docs template
- Mail merge with donor data
- Saved to Google Drive folder
- Link expires after 90 days

---

### WF-05: 11-Month Renewal Reminder

**File**: `WF-05-month11-renewal.json`

**Description**: Re-engage lapsed one-time donors ~11 months after their last gift.

**Trigger**: Cron (weekly, Sundays at 9:00 AM EST)
**Schedule**: `0 9 * * 0`

**Criteria**:
- One-time donor
- Last donation 320-350 days ago (roughly 11 months)
- No donation in last 30 days
- No renewal email sent yet

**Flow**:
```
Cron Trigger (weekly)
  ↓
Query Lapsed Donors (11 months)
  ↓
For Each Donor:
  ↓
  Fetch Original Impact Created
  ↓
  Fetch Progress Since Last Gift
  ↓
  Suggest Relevant Current Project (based on previous campaign)
  ↓
  Generate Personalized Ask
  ↓
  Send Renewal Email
  ↓
  Update donor_journey_state.month11_renewal_sent_at
  ↓
[2 Days Later] Follow-up SMS (if no gift)
  ↓
Weekly Summary → Slack
```

**Personalization**:
- References their previous campaign choice
- Shows impact of their original gift
- Suggests similar current project
- Acknowledges time gap gracefully

**Segmentation**:
- High-value donors (>$500): Personal video from Orville
- Mid-tier ($100-$500): Standard email
- Small donors (<$100): Focus on referral opportunity

---

### WF-06: Failed Payment Recovery

**File**: `WF-06-payment-failure-recovery.json`

**Description**: Handle failed recurring payments with grace and recovery attempts.

**Trigger**: Webhook (Stripe events)
**Events**:
- `invoice.payment_failed`
- `payment_intent.payment_failed`
- `charge.dispute.created`

**Flow**:
```
Stripe Webhook Trigger
  ↓
Verify Stripe Signature
  ↓
Log to webhooks_in
  ↓
[Branch by Event Type]:
  │
  ├─ payment_failed:
  │   ↓
  │   Update donations_enhanced.status = 'failed'
  │   ↓
  │   Send Recovery Email (polite, helpful)
  │   ↓
  │   Schedule Retry Attempt #1 (+3 days)
  │   ↓
  │   Slack Alert (#payments channel)
  │
  ├─ dispute.created:
  │   ↓
  │   Mark donation as 'disputed'
  │   ↓
  │   Create Internal Ticket
  │   ↓
  │   Alert Slack (#disputes, @finance-team)
  │   ↓
  │   Send Email to Donor (ask to contact)
  │
  └─ (other events): Log only
  ↓
Return 200 OK to Stripe
```

**Recovery Sequence** (for failed payments):
1. **Day 0**: Payment fails
   - Immediate email: "Update your payment method"
   - Update link sent (secure, expires in 7 days)

2. **Day 3**: Auto-retry #1
   - Stripe automatically retries
   - If succeeds → Send success email
   - If fails → Schedule retry #2

3. **Day 7**: Auto-retry #2
   - Final automatic attempt
   - SMS reminder sent
   - If fails → Send final notice

4. **Day 10**: Manual intervention
   - Subscription paused
   - Personal email from donor support
   - Offer to help via phone

**Metrics Tracked**:
- Recovery rate by day
- Common failure reasons
- Donor retention after recovery

---

### WF-07: Corporate Matching Intake & Reconciliation

**File**: `WF-07-corporate-matching.json`

**Description**: Track and manage corporate matching programs, reconcile employee donations.

**Trigger**: Webhook (form submission) + Cron (weekly reconciliation)

**Intake Flow**:
```
Form Webhook Trigger (Typeform or website)
  ↓
Parse Company Info
  ↓
Insert into corporate_matches (status: 'pledged')
  ↓
Generate Employee Code Prefix (e.g., "ACME-")
  ↓
Send Welcome Email to HR Contact
  ↓
Create Matching Instructions Document (Google Doc)
  ↓
Share Document Link
  ↓
Post to Slack (#corp-matching)
  ↓
Add to CRM with tag: Corporate Partner
```

**Weekly Reconciliation Flow**:
```
Cron Trigger (Sundays 11pm)
  ↓
For Each Active Corporate Match:
  ↓
  Query Donations WHERE referral_code LIKE '{{company_prefix}}%'
  ↓
  Calculate Matched Amount (donations × match_ratio)
  ↓
  Update corporate_matches.matched_cents
  ↓
  [Branch: At 80% of pledge?]
    ↓ YES → Alert HR Contact (nearing limit)
  ↓
  [Branch: Exceeded pledge?]
    ↓ YES → Pause matching + notify
  ↓
  Generate Weekly Match Report
  ↓
  Email to HR Contact + Finance Team
  ↓
Summary Dashboard → Slack
```

**Features**:
- Unique employee codes per company
- Automatic matching calculation
- Pledge tracking and alerts
- Monthly invoicing for companies
- Leaderboard by company

**Reports**:
- Weekly: Matched amounts by company
- Monthly: Invoice generation
- Quarterly: Impact report for CSR teams

---

### WF-08: Ambassador/Referral Tracking & Leaderboard

**File**: `WF-08-referral-tracking.json`

**Description**: Track referrals, reward ambassadors, maintain leaderboard.

**Trigger**: Multiple
- Webhook: New donor with referral code
- Cron: Nightly leaderboard update

**New Referral Flow**:
```
Donation Webhook (with referral_code)
  ↓
Insert into referrals table
  ↓
[Branch: First donation from this email?]
  ↓ YES (Conversion!)
    ↓
    Update referrals.converted = true
    ↓
    Update referrals.first_donation_id
    ↓
    Check Milestones (5, 10, 25, 50 referrals)
    ↓
    [Branch: Hit Milestone?]
      ↓ YES
        ↓
        Send Milestone Email to Referrer
        ↓
        Send Milestone SMS
        ↓
        Issue Reward (badge, swag code)
        ↓
        Post Celebration to Slack
  ↓
Return Success
```

**Nightly Leaderboard Flow**:
```
Cron Trigger (daily 11:59pm)
  ↓
Query v_referral_leaderboard (top 50)
  ↓
Generate Leaderboard Image (HTML→PNG)
  ↓
Upload to Google Drive
  ↓
Post to Slack (#ambassadors)
  ↓
[Optional] Post to Social Media (if major changes)
  ↓
Email Top 10: "You're in the Top 10!"
  ↓
Update Website Leaderboard Page (via API)
```

**Gamification**:
- **Bronze**: 5 conversions → Email badge
- **Silver**: 10 conversions → SMS badge + $25 JHRF credit
- **Gold**: 25 conversions → Featured on website + $50 credit
- **Platinum**: 50 conversions → Call with Orville + $100 credit + Swag package

**Leaderboard Tiers**:
1. Public: Top 10 (names, conversion count)
2. Semi-public: Top 50 (ambassador dashboard)
3. Private: All ambassadors with stats

---

### WF-09: Telethon Real-Time Ticker

**File**: `WF-09-telethon-live-ticker.json`

**Description**: Real-time donation feed for live fundraising events.

**Trigger**: Donation webhook (Donorbox/Stripe) when `TELETHON_MODE=true`

**Features**:
- Sub-second latency
- Sanitized donor names (privacy)
- Running total updates
- SMS keyword integration ("Text JAMAICA to donate")
- Live goal tracking

**Flow**:
```
Donation Webhook (real-time)
  ↓
[Branch: TELETHON_MODE enabled?]
  ↓ YES
    ↓
    Sanitize Donor Info (first name + initial only)
    ↓
    Calculate Running Total (cache + new donation)
    ↓
    Push to Supabase Realtime Channel
      Topic: "telethon-ticker"
      Payload: {donor, amount, total, goal_progress}
    ↓
    Trigger Website Ticker Update (WebSocket)
    ↓
    [Branch: Major milestone hit?]
      ($10K, $25K, $50K, $100K increments)
      ↓ YES
        ↓
        Trigger Celebration Animation
        ↓
        Sound Effect (if in-person event)
        ↓
        Announce on Live Stream (via API)
  ↓
[Branch: Via SMS keyword?]
  (Twilio webhook: "JAMAICA")
  ↓
  Auto-reply with donation link
  ↓
  Log to sms_events
```

**SMS Keyword Handling**:
```
Incoming SMS: "JAMAICA" to {{shortcode}}
  ↓
Lookup Phone in donors_crm
  ↓
[Branch: Existing donor?]
  ├─ YES → Personalized reply with prefilled form
  └─ NO → Generic reply with link
  ↓
Reply: "{{first_name}}, donate now: {{short_url}}. Every gift matched 2X tonight! Reply STOP to opt-out. Msg&data rates apply."
  ↓
Track click-through
```

**Dashboard Display** (frontend integration):
- Recent donations ticker (scrolling)
- Running total (animated counter)
- Goal thermometer
- Donors count
- Time remaining

**Rate Limiting**:
- Ticker updates: Max 1/second (aggregate rapid donations)
- SMS replies: Standard Twilio limits

---

### WF-10: Weekly Data Warehouse Sync + KPI Snapshot

**File**: `WF-10-weekly-data-sync.json`

**Description**: Weekly ETL job to snapshot KPIs, generate reports, and sync to data warehouse.

**Trigger**: Cron (Sundays at 2:00 AM EST)
**Schedule**: `0 2 * * 0`

**Flow**:
```
Cron Trigger (weekly)
  ↓
Start ETL Run (log to etl_runs)
  ↓
Calculate KPIs:
  ├─ Total raised (all-time)
  ├─ Total donors (unique)
  ├─ Recurring donors count
  ├─ Average gift size
  ├─ Monthly recurring revenue (MRR)
  ├─ New donors (this week)
  ├─ Retention rate
  ├─ Churn rate (monthly donors)
  └─ Conversion rates (by campaign)
  ↓
Insert into kpi_snapshots (snapshot_date = today)
  ↓
Generate CSV Exports:
  ├─ donors_crm (anonymized)
  ├─ donations_enhanced (last 7 days)
  ├─ email_events (last 7 days)
  ├─ sms_events (last 7 days)
  └─ kpi_snapshots (last 52 weeks)
  ↓
Upload to Google Drive (Reports folder)
  ↓
Upload to S3/Backblaze (archive)
  ↓
Generate Google Sheet Dashboard
  ├─ Charts: Donations over time
  ├─ Tables: Top campaigns, top ambassadors
  └─ Pivot: Donors by country
  ↓
Share Sheet with Stakeholders
  ↓
Send Email Report to Leadership Team
  ↓
Post Summary to Slack (#analytics)
  ↓
Update Public Metrics API Cache
  ↓
Mark ETL Run Complete
  ↓
[Error Handler] → Slack Alert + Rollback
```

**Reports Generated**:
1. **Executive Summary** (PDF)
   - Weekly highlights
   - Key metrics vs. prior week
   - Notable donations
   - Campaign performance

2. **Operational Report** (Google Sheets)
   - Donation volume by day/hour
   - Campaign breakdown
   - Geographic distribution
   - Payment method split

3. **Donor Insights** (CSV)
   - Cohort analysis
   - Retention curves
   - Upgrade opportunities

4. **Marketing Performance** (Dashboard)
   - Email open/click rates
   - SMS engagement
   - Referral program stats
   - Ambassador leaderboard

**Data Warehouse Sync**:
- Incremental load (last 7 days)
- Deduplication logic
- Schema validation
- Data quality checks

**Scheduling**:
- Main run: Sundays 2am
- Backup/retry: Sundays 3am (if main fails)
- Quick refresh: Daily at 6am (for dashboards)

---

### WF-11: SLA/Health Monitoring & On-Call Alerts

**File**: `WF-11-health-monitoring.json`

**Description**: Monitor system health, detect issues, alert on-call team.

**Trigger**: Cron (every 5 minutes)
**Schedule**: `*/5 * * * *`

**Checks Performed**:
```
Cron Trigger (every 5 min)
  ↓
Check #1: Webhook Lag
  Query: webhooks_in WHERE received_at > NOW() - 10min
  Alert if: 0 webhooks (no donations in 10 min during campaign)
  ↓
Check #2: Processing Backlog
  Query: webhooks_in WHERE processed = false AND received_at < NOW() - 5min
  Alert if: > 10 unprocessed webhooks
  ↓
Check #3: Failed Workflows
  Query: etl_runs WHERE status = 'failed' AND started_at > NOW() - 1hour
  Alert if: Any failed runs
  ↓
Check #4: Email Bounce Rate
  Query: email_events WHERE event_type = 'bounced' AND created_at > NOW() - 1hour
  Alert if: Bounce rate > 5%
  ↓
Check #5: Payment Failure Spike
  Query: donations_enhanced WHERE status = 'failed' AND created_at > NOW() - 1hour
  Alert if: Failure rate > 10%
  ↓
Check #6: Database Connection
  Query: SELECT 1 FROM donors_crm LIMIT 1
  Alert if: Query fails
  ↓
Check #7: Metrics API Response Time
  HTTP GET: {{WEBSITE_URL}}/metrics-api/summary
  Alert if: Response time > 3 seconds OR error
  ↓
[Branch: Any Alerts?]
  ↓ YES
    ↓
    Calculate Severity (P0/P1/P2)
    ↓
    Post to Slack (#on-call)
      @channel if P0
      @on-call if P1
      #alerts if P2
    ↓
    Send SMS to On-Call Engineer (P0 only)
    ↓
    Create PagerDuty Incident (P0/P1)
    ↓
    Log to monitoring dashboard
    ↓
  ↓ NO
    ↓
    [Every hour] Post "All systems operational" to #automation
  ↓
Update Status Page
```

**Severity Levels**:
- **P0 (Critical)**: Complete system outage, data loss risk
  - No webhooks in 15 minutes during active hours
  - Database unreachable
  - Metrics API down

- **P1 (High)**: Partial outage, degraded service
  - Processing backlog > 100
  - Payment failure rate > 25%
  - Email bounces > 10%

- **P2 (Medium)**: Performance degradation
  - API response time > 3s
  - Processing lag > 5 minutes
  - Bounce rate 5-10%

**Alert Channels**:
- Slack: #on-call (P0/P1), #alerts (P2)
- SMS: On-call engineer (P0 only)
- PagerDuty: Auto-escalation
- Email: ops-team@jhrf.org

**Resolution Tracking**:
- Incident start time logged
- Alert acknowledged (Slack reaction)
- Resolution time tracked
- Post-mortem for P0/P1

---

## Testing & Validation

### Test Data

Use provided test payloads:
```bash
# Donorbox donation
curl -X POST https://n8n.local/webhook/donorbox-donation \\
  -H "Content-Type: application/json" \\
  -d @test-payloads/donorbox-one-time.json

# Stripe payment failure
curl -X POST https://n8n.local/webhook/stripe-events \\
  -H "Content-Type: application/json" \\
  -d @test-payloads/stripe-payment-failed.json
```

### Manual Testing

1. **End-to-End Donation**:
   - Make test donation via Donorbox
   - Verify donor created in Supabase
   - Check thank-you email received
   - Confirm Slack notification
   - Validate metrics updated

2. **Donor Journey**:
   - Backdate test donation to 7 days ago
   - Manually trigger WF-02
   - Verify Day 7 email sent
   - Check journey state updated

3. **Payment Failure**:
   - Use Stripe test card 4000000000000341 (decline)
   - Verify recovery email sent
   - Check retry scheduled

### Monitoring Dashboard

Access n8n Monitoring:
- URL: `https://your-n8n.com/workflow/monitoring`
- Shows: Execution history, error rates, response times
- Alerts: Configured via Slack/PagerDuty

---

## Maintenance

### Daily
- Check #automation Slack channel for summaries
- Review failed executions in n8n dashboard

### Weekly
- Review WF-10 data sync report
- Check for new unhandled errors
- Update test payloads if API changes

### Monthly
- Audit credentials (rotate if needed)
- Review workflow performance
- Optimize slow queries
- Update email templates

### Quarterly
- Full system test (all workflows)
- Disaster recovery drill
- Update documentation
- Review and update SLAs

---

## Troubleshooting

### Common Issues

**1. Webhook not triggering**
- Check webhook URL configuration
- Verify SSL certificate valid
- Test with curl
- Check n8n logs: `docker logs n8n_container`

**2. Database connection errors**
- Verify SUPABASE_URL and keys
- Check IP allowlist in Supabase
- Test connection: `psql $DATABASE_URL`

**3. Email not sending**
- Check Mailchimp/HubSpot credentials
- Verify API rate limits not exceeded
- Check email_events for errors
- Test email address not on suppression list

**4. SMS failures**
- Verify Twilio credentials
- Check phone number format (+1...)
- Confirm SMS consent given
- Review Twilio error codes

**5. Slack alerts not posting**
- Check bot token valid
- Verify bot added to channels
- Test with simple message

### Debug Mode

Enable debug logging:
```bash
# In n8n container
export N8N_LOG_LEVEL=debug
docker restart n8n_container
```

View logs:
```bash
docker logs -f n8n_container | grep ERROR
```

### Support

- **n8n Docs**: https://docs.n8n.io
- **Community Forum**: https://community.n8n.io
- **JHRF Tech Team**: tech@jamaicahurricanefund.org

---

## Deployment Checklist

Before going live:

- [ ] All workflows imported and tested
- [ ] Credentials configured and verified
- [ ] Webhooks configured in Donorbox/Stripe
- [ ] Test donations completed successfully
- [ ] Email templates uploaded to Mailchimp/HubSpot
- [ ] SMS sending tested (Twilio)
- [ ] Slack channels created and bots invited
- [ ] Google Drive folder structure created
- [ ] S3 bucket configured
- [ ] Monitoring alerts configured
- [ ] On-call rotation established
- [ ] Documentation reviewed by team
- [ ] Disaster recovery plan documented
- [ ] Rollback plan prepared

**Production Launch**:
1. Set `TELETHON_MODE=false` initially
2. Activate WF-01 (donation ingestion)
3. Activate WF-11 (monitoring)
4. Monitor for 24 hours
5. Activate remaining workflows gradually
6. Full launch after 72 hours stable

---

**Workflows Version**: 1.0
**Last Updated**: 2024
**Maintained By**: JHRF Automation Team
