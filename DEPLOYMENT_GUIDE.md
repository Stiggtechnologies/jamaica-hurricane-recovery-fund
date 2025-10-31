# JHRF Website Deployment Guide

## Quick Start Deployment Checklist

- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Payment processors configured
- [ ] Admin account created
- [ ] Initial content added
- [ ] Analytics installed
- [ ] Social media connected
- [ ] Backup system in place

## Pre-Deployment Setup

### 1. Supabase Configuration

The database schema is already created. Verify in your Supabase dashboard:

1. Go to https://supabase.com/dashboard
2. Open your project
3. Navigate to **Table Editor**
4. Confirm these tables exist:
   - news_posts
   - impact_stories
   - projects
   - donations
   - volunteers
   - partnership_inquiries
   - contact_submissions
   - donation_progress

5. Navigate to **Authentication > Policies**
6. Verify RLS policies are enabled

### 2. Environment Variables

Your `.env` file should contain:

```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: Supabase Dashboard > Settings > API

### 3. Domain Setup

#### Register Domain
- **Recommended**: Namecheap, GoDaddy, or Google Domains
- **Domain**: jamaicahurricanerecoveryfund.org

#### DNS Configuration (Cloudflare)
1. Create Cloudflare account
2. Add site: jamaicahurricanerecoveryfund.org
3. Update nameservers at your domain registrar
4. Wait for nameserver propagation (up to 48 hours)

## Deployment Options

### Option A: Vercel (Recommended)

**Advantages**: Zero-config, automatic SSL, global CDN, serverless functions

#### Step-by-Step

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

3. **Login**
```bash
vercel login
```

4. **Deploy**
```bash
cd /tmp/cc-agent/59472953/project
vercel --prod
```

5. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings > Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

6. **Add Custom Domain**
   - Project Settings > Domains
   - Add: jamaicahurricanerecoveryfund.org
   - Copy DNS records shown
   - Add to Cloudflare DNS

7. **Configure Cloudflare**
   - DNS > Add Records:
     ```
     Type: CNAME
     Name: www
     Target: cname.vercel-dns.com
     Proxy: On (orange cloud)
     ```
   - SSL/TLS > Overview > Full (strict)

8. **Verify Deployment**
   - Visit https://jamaicahurricanerecoveryfund.org
   - Check all pages load correctly
   - Test forms (volunteer, contact, partnership)
   - Verify donation page displays correctly

### Option B: Netlify

#### Step-by-Step

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

3. **Login**
```bash
netlify login
```

4. **Build Project**
```bash
npm run build
```

5. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

6. **Configure Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

7. **Add Custom Domain**
   - Domain settings > Add custom domain
   - Follow DNS configuration instructions

## Post-Deployment Configuration

### 1. Create Admin Account

```sql
-- Run in Supabase SQL Editor
-- Replace with actual admin email and generate secure password
```

Or use Supabase Dashboard:
1. Authentication > Users
2. Add User
3. Email: admin@jamaicahurricanefund.org
4. Password: [Generate secure password]
5. Auto Confirm: Yes

### 2. Add Initial Content

#### Donation Progress
1. Login to admin panel: https://jamaicahurricanerecoveryfund.org (navigate to /admin)
2. Go to "Donation Progress" tab
3. Set initial values (usually 0)

#### Sample News Post
1. Admin > News Posts
2. Create first announcement post
3. Title: "Jamaica Hurricane Recovery Fund Launches"
4. Content: Welcome message from Orville Davis
5. Publish

### 3. Configure Payment Processors

#### Stripe Setup

1. **Create Stripe Account**
   - https://dashboard.stripe.com/register

2. **Get API Keys**
   - Dashboard > Developers > API keys
   - Copy Publishable key and Secret key

3. **Test Mode First**
   - Use test keys initially
   - Test donations thoroughly

4. **Update Code** (when ready for production)
   - Replace test keys with live keys
   - Update in environment variables

5. **Configure Webhook**
   - Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://jamaicahurricanerecoveryfund.org/api/stripe-webhook`
   - Events: `payment_intent.succeeded`, `customer.created`

#### Donorbox Setup

1. **Create Donorbox Account**
   - https://donorbox.org/nonprofit-sign-up

2. **Create Campaign**
   - Campaign name: Jamaica Hurricane Recovery Fund
   - Goal: $100,000,000

3. **Get Embed Code**
   - Campaign > Embed options
   - Copy embed code

4. **Add to Website**
   - Edit src/pages/Donate.tsx
   - Replace placeholder with actual embed code
   - Redeploy

### 4. Install Analytics

#### Google Analytics 4

1. **Create GA4 Property**
   - https://analytics.google.com
   - Create Account: JHRF
   - Create Property: JHRF Website

2. **Get Measurement ID**
   - Format: G-XXXXXXXXXX

3. **Add to Website**
   - Edit `index.html`
   - Add Google tag before `</head>`:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

4. **Set Up Goals**
   - Donation initiated
   - Volunteer form submitted
   - Contact form submitted
   - Newsletter signup

#### Google Search Console

1. **Add Property**
   - https://search.google.com/search-console
   - Add: jamaicahurricanerecoveryfund.org

2. **Verify Ownership**
   - DNS verification (recommended)
   - Add TXT record to Cloudflare

3. **Submit Sitemap**
   - Generate sitemap (or use plugin)
   - Submit: https://jamaicahurricanerecoveryfund.org/sitemap.xml

### 5. Social Media Integration

#### Create Accounts
- [ ] Facebook Page: @jamaicahurricanefund
- [ ] Instagram: @jhrf
- [ ] Twitter/X: @jhrf
- [ ] LinkedIn: company/jhrf
- [ ] YouTube: JHRF Official

#### Update Website Footer
- Edit `src/components/Footer.tsx`
- Add actual social media URLs

#### Add Social Share Buttons
Consider adding share buttons to:
- News posts
- Impact stories
- Donation page

### 6. Email Configuration

#### SendGrid Setup (Recommended)

1. **Create Account**
   - https://signup.sendgrid.com

2. **Verify Domain**
   - Settings > Sender Authentication
   - Verify: jamaicahurricanefund.org

3. **Create API Key**
   - Settings > API Keys
   - Create key with Mail Send permissions

4. **Set Up Templates**
   - Donation receipt
   - Volunteer confirmation
   - Newsletter
   - Contact form autoresponse

#### Alternative: Mailgun or AWS SES

Follow similar domain verification and API key setup.

### 7. Security Hardening

#### Cloudflare Settings

1. **SSL/TLS**
   - Mode: Full (strict)
   - Always Use HTTPS: On
   - Minimum TLS Version: 1.2
   - Automatic HTTPS Rewrites: On

2. **Firewall**
   - Security Level: Medium
   - Bot Fight Mode: On
   - Rate Limiting: Configure for API endpoints

3. **Caching**
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours

4. **Page Rules**
   - Cache everything for `/assets/*`
   - Always Use HTTPS for all URLs

#### Supabase Security

1. **Enable Row Level Security**
   - Already configured in migration
   - Verify policies in dashboard

2. **API Rate Limiting**
   - Monitor usage
   - Set up alerts for unusual activity

3. **Backup Strategy**
   - Daily automatic backups (Supabase Pro)
   - Or manual exports weekly

### 8. Monitoring Setup

#### Uptime Monitoring

Use any of these free services:
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

Configuration:
- Monitor URL: https://jamaicahurricanerecoveryfund.org
- Check interval: 5 minutes
- Alert contacts: tech-team@jamaicahurricanefund.org

#### Error Tracking

**Sentry** (Recommended)
1. Create account: https://sentry.io
2. Add Sentry SDK to project
3. Configure error alerts

### 9. Backup & Recovery

#### Database Backups
- **Supabase Pro**: Automatic daily backups
- **Manual**: Weekly SQL dumps
- **Storage**: Secure cloud storage (S3, Google Cloud)

#### Code Backups
- Primary: GitHub repository
- Secondary: Local machine
- Tertiary: Cloud backup service

#### Recovery Testing
- Test backup restoration monthly
- Document recovery procedures
- Train team on recovery process

## Launch Checklist

### Pre-Launch (T-7 days)

- [ ] Complete all deployment steps
- [ ] Test all forms and functionality
- [ ] Verify payment processing (test mode)
- [ ] Check mobile responsiveness
- [ ] Test on major browsers
- [ ] Proofread all content
- [ ] Check all links work
- [ ] Verify images load
- [ ] Test page load speed
- [ ] Review SEO meta tags

### Pre-Launch (T-3 days)

- [ ] Switch to production payment keys
- [ ] Final content review
- [ ] Test donation flow end-to-end
- [ ] Verify email notifications work
- [ ] Set up social media posts
- [ ] Prepare press release
- [ ] Brief all team members
- [ ] Test admin panel access

### Launch Day

- [ ] Monitor site performance
- [ ] Check analytics tracking
- [ ] Post on social media
- [ ] Send press release
- [ ] Monitor for issues
- [ ] Respond to feedback
- [ ] Document any problems
- [ ] Celebrate! 🎉

### Post-Launch (Week 1)

- [ ] Daily monitoring
- [ ] Review analytics data
- [ ] Check form submissions
- [ ] Monitor donation flow
- [ ] Collect user feedback
- [ ] Fix any bugs found
- [ ] Optimize based on data
- [ ] Plan content calendar

## Troubleshooting Common Issues

### Site Not Loading

1. Check DNS propagation: https://dnschecker.org
2. Verify Cloudflare proxy is enabled
3. Check Vercel/Netlify deployment status
4. Review build logs for errors

### Forms Not Submitting

1. Check Supabase connection in browser console
2. Verify environment variables are set
3. Test RLS policies allow inserts
4. Check network tab for API errors

### Donation Page Issues

1. Verify payment API keys are correct
2. Check browser console for errors
3. Test in incognito mode
4. Verify webhook URLs are correct

### Admin Panel Login Issues

1. Verify admin user exists in Supabase
2. Check authentication settings
3. Clear browser cache
4. Try password reset

### Performance Issues

1. Check Lighthouse score
2. Optimize images (compress, WebP format)
3. Enable CDN caching
4. Review third-party scripts
5. Consider lazy loading

## Maintenance Schedule

### Daily
- Monitor uptime
- Check error logs
- Review new form submissions

### Weekly
- Review analytics
- Update content
- Test key functionality
- Database maintenance

### Monthly
- Security updates
- Performance optimization
- Content audit
- Backup verification
- Analytics review

### Quarterly
- Full security audit
- SEO review
- User experience testing
- Feature planning
- Infrastructure review

## Support Contacts

**Deployment Issues**: tech@jamaicahurricanefund.org
**Emergency Downtime**: emergency@jamaicahurricanefund.org
**Vercel Support**: https://vercel.com/support
**Supabase Support**: https://supabase.com/support

## Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare Learning**: https://www.cloudflare.com/learning
- **Stripe Documentation**: https://stripe.com/docs
- **React Documentation**: https://react.dev

---

**Deployment Version**: 1.0
**Last Updated**: 2024
**Maintained By**: JHRF Technical Team
