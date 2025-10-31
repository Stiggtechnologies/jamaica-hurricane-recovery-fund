# JHRF Email & SMS Templates

Complete set of templates for donor journey automation. All templates support variable substitution using `{{variable_name}}` syntax.

---

## Email Templates

### 1. Thank You Email (Immediate)

**Template ID**: `thank_you_v1`
**Trigger**: Immediately after donation
**Channel**: Email

**Subject**: Thank you for supporting Jamaica's recovery, {{first_name}}!

**Plain Text Version**:
```
Dear {{first_name}},

Thank you for your generous donation of {{amount_formatted}} to the Jamaica Hurricane Recovery Fund!

Your support goes directly toward:
✓ Rebuilding homes destroyed by hurricanes
✓ Restoring schools and educational facilities
✓ Building emergency shelters for displaced families
✓ Creating long-term climate resilience

DONATION RECEIPT
Date: {{donation_date}}
Amount: {{amount_formatted}} {{currency}}
Frequency: {{frequency}}
Receipt ID: {{receipt_id}}
Tax-deductible: Yes

We'll keep you updated on the impact of your donation with stories from the communities you're helping rebuild.

See your impact: {{website_url}}/impact

With gratitude,
Orville Davis
Founder, Jamaica Hurricane Recovery Fund

---
Rebuilding Stronger. Together. 🇯🇲
jamaicahurricanerecoveryfund.org
```

**HTML Version**: See `/automation/templates/emails/01_thank_you.html`

**Variables**:
- `{{first_name}}` - Donor first name
- `{{amount_formatted}}` - e.g., "$100.00"
- `{{currency}}` - USD, CAD, GBP
- `{{frequency}}` - One-time, Monthly, etc.
- `{{donation_date}}` - Formatted date
- `{{receipt_id}}` - Unique receipt identifier
- `{{website_url}}` - Base website URL

---

### 2. Day 7 Impact Email

**Template ID**: `day7_impact_v1`
**Trigger**: 7 days after first donation
**Channel**: Email

**Subject**: {{first_name}}, see the impact you're making in Jamaica

**Body**:
```
Dear {{first_name}},

One week ago, you made a difference in Jamaica. Today, we want to show you exactly how.

Your {{amount_formatted}} donation is already at work:

🏠 HOMES BEING REBUILT
Your contribution is helping repair {{homes_count}} damaged homes in {{parish_name}}.
Families like the Campbells are moving out of temporary shelters and back into safe, climate-resilient homes.

📚 SCHOOLS REOPENING
{{schools_count}} classrooms are being restored, ensuring {{students_count}} children can continue their education without interruption.

💪 COMMUNITIES GROWING STRONGER
Together with {{total_donors}} other donors, we've raised {{total_raised}} toward our $100M goal.

READ MARIA'S STORY
Maria Campbell, mother of three, shares how your support changed her family's life.
[Read Story] → {{website_url}}/stories/maria-campbell

PROGRESS UPDATE
Campaign Progress: {{progress_percentage}}% of $100M goal
Donors: {{donor_count}}
Projects: {{active_projects}} active rebuilding projects

Want to multiply your impact? Consider becoming a monthly donor and join our Village Builders Circle.
[Become a Monthly Donor] → {{website_url}}/donate/monthly

Thank you for being part of Jamaica's recovery story.

With hope,
The JHRF Team

P.S. Share your support! Use #JamaicaStrong and help us reach more people.
[Share on Facebook] [Share on Twitter]
```

**Variables**:
- `{{homes_count}}`, `{{schools_count}}`, `{{students_count}}` - Dynamic impact numbers
- `{{parish_name}}` - Geographic area
- `{{total_donors}}`, `{{total_raised}}` - Campaign stats
- `{{progress_percentage}}` - Current progress toward goal
- `{{active_projects}}` - Number of ongoing projects

---

### 3. Day 14 Monthly Upgrade Email

**Template ID**: `day14_upgrade_v1`
**Trigger**: 14 days after one-time donation
**Channel**: Email
**Condition**: One-time donors only

**Subject**: {{first_name}}, join the Village Builders Circle

**Body**:
```
Dear {{first_name}},

Two weeks ago, your one-time gift of {{amount_formatted}} made an immediate impact.

Today, we're inviting you to make a lasting difference.

🌟 JOIN THE VILLAGE BUILDERS CIRCLE 🌟

Monthly donors are the backbone of our recovery efforts. Here's why:

✓ SUSTAINABLE IMPACT
Monthly donations allow us to commit to long-term rebuilding projects with confidence.

✓ GREATER EFFICIENCY
Predictable funding means less time fundraising, more time building.

✓ EXCLUSIVE UPDATES
Monthly donors receive behind-the-scenes project updates and quarterly video calls with our team in Jamaica.

YOUR MONTHLY IMPACT
$25/month = 1 classroom supplies annually
$50/month = Roof repair for 1 home every 2 months
$100/month = Emergency shelter construction quarterly

Special Offer: Start your monthly donation this week and we'll send you an exclusive "Village Builder" pin and impact certificate.

[Become a Monthly Donor] → {{monthly_upgrade_url}}

Not ready for monthly giving? Share JHRF with 3 friends:
[Share Your Referral Link] → {{referral_url}}

Every new donor you refer earns you recognition on our Ambassador Leaderboard!

Thank you for considering this deeper commitment to Jamaica's future.

In partnership,
Orville Davis
Founder, JHRF

P.S. Already a monthly donor through another platform? Let us know so we can send your Village Builder welcome package!
```

**Variables**:
- `{{monthly_upgrade_url}}` - Direct link to monthly donation page
- `{{referral_url}}` - Personalized referral link with donor's code

---

### 4. Day 30 Transparency Report Email

**Template ID**: `day30_transparency_v1`
**Trigger**: 30 days after donation
**Channel**: Email

**Subject**: Your impact report: 30 days of transparency

**Body**:
```
Dear {{first_name}},

It's been 30 days since your donation, and we promised you full transparency.

Here's exactly where your money went:

📊 YOUR DONATION BREAKDOWN

{{amount_formatted}} Total Donation
├─ {{project_amount}} ({{project_percent}}%) → Direct Project Funding
├─ {{admin_amount}} ({{admin_percent}}%) → Operations & Admin
└─ {{fundraising_amount}} ({{fundraising_percent}}%) → Fundraising Costs

PROJECTS FUNDED THIS MONTH
1. {{project_1_name}} - {{project_1_location}}
   Status: {{project_1_status}}
   Beneficiaries: {{project_1_beneficiaries}} families

2. {{project_2_name}} - {{project_2_location}}
   Status: {{project_2_status}}
   Beneficiaries: {{project_2_beneficiaries}} children

3. {{project_3_name}} - {{project_3_location}}
   Status: {{project_3_status}}
   Beneficiaries: {{project_3_beneficiaries}} community members

BY THE NUMBERS (Last 30 Days)
→ ${{monthly_raised}} raised
→ {{monthly_donors}} new donors
→ {{homes_completed}} homes completed
→ {{classrooms_restored}} classrooms restored

DOWNLOAD FULL REPORT
[Download Transparency Report PDF] → {{report_url}}

Our commitment to you:
✓ 100% of direct donations go to projects
✓ Quarterly independent audits
✓ Real-time project tracking
✓ Community oversight boards

Questions about our finances or projects?
Reply to this email or schedule a call with our team.

[Schedule Call] → {{calendly_url}}

Thank you for your trust and partnership.

With accountability,
The JHRF Team

---

SHARE OUR MISSION
Know someone who cares about Jamaica? Share your referral code: {{referral_code}}
For every person who donates using your code, you'll earn recognition as a JHRF Ambassador!

Current Leaderboard: {{leaderboard_position}}
Referrals: {{referral_count}} | Conversions: {{conversion_count}}
```

**Variables**:
- `{{project_amount}}`, `{{admin_amount}}`, `{{fundraising_amount}}` - Dollar amounts
- `{{project_percent}}`, `{{admin_percent}}`, `{{fundraising_percent}}` - Percentages
- `{{project_X_name}}`, `{{project_X_location}}`, etc. - Project details
- `{{report_url}}` - Link to downloadable PDF report
- `{{leaderboard_position}}` - Ambassador ranking

---

### 5. Month 11 Renewal Reminder Email

**Template ID**: `month11_renewal_v1`
**Trigger**: 11 months after last donation
**Channel**: Email
**Condition**: One-time donors, not recent givers

**Subject**: We miss you, {{first_name}} - Jamaica still needs you

**Body**:
```
Dear {{first_name}},

Almost a year ago, you joined our mission to rebuild Jamaica.

Your {{amount_formatted}} donation helped {{impact_summary}}.

The work continues, and we need you again.

WHAT'S HAPPENED SINCE YOUR LAST GIFT

Since {{last_donation_date}}, we've:
✓ Completed {{homes_since}} additional homes
✓ Restored {{schools_since}} more schools
✓ Sheltered {{families_since}} displaced families
✓ Trained {{communities_since}} communities in climate resilience

But {{families_waiting}} families are still waiting for safe homes.
{{schools_waiting}} schools still need repairs.

WILL YOU GIVE AGAIN?

Your previous generosity shows you care. Jamaica still needs champions like you.

[Make Another Gift] → {{donate_url}}

Or consider monthly giving to create lasting impact:
[Join Village Builders Circle] → {{monthly_url}}

PERSONALIZED IMPACT OPPORTUNITY

Based on your previous gift to {{previous_campaign}}, we think you'd love our current focus on {{suggested_project}}:

{{project_description}}

Goal: {{project_goal}}
Raised: {{project_raised}}
Days Remaining: {{days_remaining}}

[Support This Project] → {{project_url}}

Every journey back to Jamaica starts with a single step. Will you take it today?

With gratitude for your past support,
Orville Davis & The JHRF Team

P.S. Life circumstances change. If you're unable to give right now, you can still help by sharing our mission with 3 friends:
[Share My Referral Link] → {{referral_url}}
```

**Variables**:
- `{{last_donation_date}}` - Date of last gift
- `{{impact_summary}}` - Brief description of what their gift accomplished
- `{{homes_since}}`, `{{schools_since}}`, etc. - Progress metrics
- `{{families_waiting}}`, `{{schools_waiting}}` - Outstanding needs
- `{{previous_campaign}}` - What they donated to before
- `{{suggested_project}}` - Recommended current project
- `{{project_goal}}`, `{{project_raised}}`, `{{days_remaining}}` - Project stats

---

### 6. Payment Failure Recovery Email

**Template ID**: `payment_failed_v1`
**Trigger**: Stripe/Donorbox payment failure event
**Channel**: Email

**Subject**: Action needed: Update your payment method

**Body**:
```
Dear {{first_name}},

We tried to process your recurring donation of {{amount_formatted}}, but the payment didn't go through.

This can happen for many reasons:
• Expired credit card
• Insufficient funds
• Bank security hold
• Card replacement

📌 NO ACTION NEEDED IF YOU'VE ALREADY UPDATED

If you've recently updated your payment method, please disregard this message.

🔧 UPDATE YOUR PAYMENT METHOD

To continue your monthly support:
[Update Payment Method] → {{update_payment_url}}

Secure link expires in 7 days.

❓ QUESTIONS?

If you'd like to:
• Change your donation amount
• Pause your monthly giving
• Cancel your subscription
• Speak with our team

Reply to this email or call: {{support_phone}}

YOUR IMPACT SO FAR

Since you started giving {{months_active}} months ago:
→ Total donated: {{total_donated}}
→ Homes supported: {{homes_impact}}
→ Families helped: {{families_impact}}

We value your partnership and hope to continue this important work together.

Thank you,
JHRF Donor Support Team

---

NOT A MISTAKE?
If you meant to cancel, no problem! Just let us know by replying to this email.
```

**Variables**:
- `{{amount_formatted}}` - Recurring donation amount
- `{{update_payment_url}}` - Secure payment update link
- `{{support_phone}}` - Phone number
- `{{months_active}}` - Duration as monthly donor
- `{{total_donated}}` - Lifetime giving amount
- `{{homes_impact}}`, `{{families_impact}}` - Personalized impact stats

---

## SMS Templates

All SMS messages must be ≤160 characters including link.

### SMS-01: Thank You (Immediate)

**Template ID**: `sms_thankyou_v1`
**Trigger**: Immediately after donation (if phone + consent)

```
{{first_name}}, thank you for your {{amount}} donation to JHRF! Your receipt: {{short_url}}. Together we rebuild Jamaica stronger. 🇯🇲
```

### SMS-02: Day 7 Impact Nudge

**Template ID**: `sms_day7_impact_v1`
**Trigger**: 7 days after donation

```
{{first_name}}, your JHRF gift is already at work! See your impact: {{short_url}} #JamaicaStrong 💚
```

### SMS-03: Day 14 Monthly Upgrade

**Template ID**: `sms_day14_upgrade_v1`
**Trigger**: 14 days after one-time donation

```
{{first_name}}, join 500+ monthly donors in the Village Builders Circle! ${{monthly_amount}}/mo = lasting change. {{short_url}}
```

### SMS-04: Event/Telethon Real-Time

**Template ID**: `sms_event_live_v1`
**Trigger**: During live fundraising events

```
🔴 LIVE NOW: JHRF Telethon! We're {{percent}}% to tonight's goal. Donate now: {{short_url}} Every gift matched until 9pm!
```

### SMS-05: Keyword Auto-Reply

**Template ID**: `sms_keyword_jamaica_v1`
**Trigger**: When donor texts "JAMAICA" to shortcode

```
Thank you for texting JHRF! Donate now to help rebuild Jamaica: {{short_url}}. Reply STOP to unsubscribe. Msg&data rates may apply.
```

### SMS-06: Payment Failure Alert

**Template ID**: `sms_payment_failed_v1`
**Trigger**: Failed recurring payment

```
{{first_name}}, your JHRF monthly gift of {{amount}} couldn't process. Update payment: {{short_url}}. Questions? Call {{phone}}.
```

### SMS-07: Ambassador Milestone

**Template ID**: `sms_ambassador_milestone_v1`
**Trigger**: Referral conversion milestone (5, 10, 25, 50)

```
🎉 {{first_name}}, you've referred {{count}} donors to JHRF! You're making a HUGE impact. Leaderboard: {{short_url}} Keep sharing!
```

---

## Template Variable Glossary

### Donor Data
- `{{first_name}}` - Donor's first name
- `{{last_name}}` - Donor's last name
- `{{email}}` - Donor's email address
- `{{phone}}` - Donor's phone number (for SMS)
- `{{country}}` - Donor's country

### Donation Data
- `{{amount}}` - Raw amount (e.g., 100)
- `{{amount_formatted}}` - Formatted amount (e.g., "$100.00")
- `{{currency}}` - Currency code (USD, CAD, GBP)
- `{{frequency}}` - One-time, Monthly, Quarterly, Annual
- `{{donation_date}}` - Formatted date
- `{{receipt_id}}` - Unique receipt identifier
- `{{last_donation_date}}` - Date of most recent prior gift
- `{{total_donated}}` - Lifetime giving amount

### Campaign Metrics
- `{{total_raised}}` - Campaign total raised
- `{{donor_count}}` - Total number of donors
- `{{progress_percentage}}` - Progress toward $100M goal (e.g., "1.5")
- `{{donations_24h}}` - Donations in last 24 hours
- `{{monthly_raised}}` - Amount raised this month
- `{{monthly_donors}}` - New donors this month

### Impact Metrics
- `{{homes_count}}`, `{{homes_completed}}`, `{{homes_impact}}` - Home rebuilding stats
- `{{schools_count}}`, `{{classrooms_restored}}` - Education stats
- `{{families_since}}`, `{{families_impact}}` - Family assistance stats
- `{{students_count}}` - Students helped
- `{{active_projects}}` - Number of ongoing projects

### URLs
- `{{website_url}}` - Base website URL
- `{{donate_url}}` - Donation page
- `{{monthly_url}}` - Monthly donation page
- `{{monthly_upgrade_url}}` - Monthly upgrade with prefilled amount
- `{{referral_url}}` - Personalized referral link
- `{{update_payment_url}}` - Secure payment update link
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{preferences_url}}` - Email preference center
- `{{short_url}}` - Bit.ly or similar shortened link (for SMS)
- `{{report_url}}` - Link to transparency report PDF
- `{{calendly_url}}` - Link to schedule call
- `{{project_url}}` - Link to specific project page

### Referral Data
- `{{referral_code}}` - Donor's unique referral code
- `{{referral_count}}` - Total referrals made
- `{{conversion_count}}` - Referrals who donated
- `{{leaderboard_position}}` - Current rank on leaderboard

### Social Links
- `{{facebook_url}}` - JHRF Facebook page
- `{{instagram_url}}` - JHRF Instagram
- `{{twitter_url}}` - JHRF Twitter
- `{{linkedin_url}}` - JHRF LinkedIn

### Project Data
- `{{project_name}}`, `{{project_1_name}}`, etc. - Project names
- `{{project_location}}` - Geographic location
- `{{project_status}}` - Planned, In Progress, Completed
- `{{project_beneficiaries}}` - Number of people helped
- `{{project_goal}}`, `{{project_raised}}` - Financial stats
- `{{days_remaining}}` - Days until project deadline

### Organization Data
- `{{parish_name}}` - Parish in Jamaica
- `{{support_phone}}` - Support phone number
- `{{months_active}}` - Months as recurring donor

---

## Mailchimp Template Setup

### Template Upload Instructions

1. **Login to Mailchimp**
2. **Campaigns > Email templates > Create Template**
3. **Choose "Code your own"**
4. **Paste HTML** from `/automation/templates/emails/`
5. **Name template** using Template ID (e.g., `thank_you_v1`)
6. **Save**

### Merge Tags (Mailchimp Format)

Replace `{{variable}}` with Mailchimp merge tags:
- `{{first_name}}` → `*|FNAME|*`
- `{{last_name}}` → `*|LNAME|*`
- `{{email}}` → `*|EMAIL|*`
- Custom fields: `*|AMOUNT|*`, `*|DONATIONDATE|*`, etc.

### Automation Setup

1. **Automations > Create > Custom**
2. **Trigger**: Tag added or list join
3. **Add email step** with template
4. **Set delays**: 7 days, 14 days, etc.
5. **Configure segmentation** (one-time vs recurring)

---

## HubSpot Template Setup

### Template Upload Instructions

1. **Marketing > Files and Templates > Design Tools**
2. **Create > Email**
3. **Drag-and-drop or HTML**
4. **Paste HTML** content
5. **Add HubL personalization tokens**
6. **Test and publish**

### Personalization Tokens (HubSpot Format)

Replace `{{variable}}` with HubSpot tokens:
- `{{first_name}}` → `{{ contact.firstname }}`
- `{{email}}` → `{{ contact.email }}`
- Custom properties: `{{ contact.donation_amount }}`, etc.

### Workflow Setup

1. **Automation > Workflows > Create workflow**
2. **From scratch**
3. **Set enrollment trigger** (form submission, list membership)
4. **Add delays and actions**
5. **Use if/then branches** for segmentation
6. **Activate**

---

## SMS Best Practices

### Compliance
- Always include opt-out language in first SMS
- Honor STOP requests immediately
- Keep keyword (HELP, STOP, INFO) responses ready
- Include "Msg&data rates may apply"
- Get explicit SMS consent before sending

### Shortening URLs
- Use Bit.ly, TinyURL, or branded shortener
- Include UTM parameters: `?utm_source=sms&utm_campaign=day7_impact`
- Track click-through rates

### Timing
- Send between 10am-8pm local time
- Avoid Sundays unless event/emergency
- Respect timezone (EST for Jamaica, local for donor)

### Tone
- Keep friendly and conversational
- Use emojis sparingly (1-2 max)
- Personalize with first name
- Clear call-to-action

---

## Testing Checklist

Before launching any template:

- [ ] All variables render correctly
- [ ] Links work and include UTM parameters
- [ ] Mobile responsive (email)
- [ ] Character count under 160 (SMS)
- [ ] Unsubscribe link present (email)
- [ ] Brand colors and logo correct
- [ ] Grammar and spelling checked
- [ ] Tested on multiple email clients (Gmail, Outlook, Apple Mail)
- [ ] Spam score checked (mail-tester.com)
- [ ] Legal compliance verified (CAN-SPAM, GDPR, CASL)

---

**Template Version**: 1.0
**Last Updated**: 2024
**Maintained By**: JHRF Marketing & Automation Team
