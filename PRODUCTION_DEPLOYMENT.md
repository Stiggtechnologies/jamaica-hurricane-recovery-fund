# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Setup
Run all migrations in order:
```bash
# Core schema
20251030192513_create_jhrf_schema.sql
20251031171006_add_automation_crm_schema.sql
20251031172637_add_content_aggregation_schema.sql
20251031173257_add_blog_posts_email_queue.sql
20251031174244_add_multi_tenant_platform_schema.sql
20251031175408_add_volunteer_time_tracking_org_chart.sql
```

### 3. Security Configuration

#### Row Level Security (RLS)
All tables have RLS enabled. Verify policies are properly configured:
- Public read access for published content only
- Authenticated access for management operations
- Volunteer self-management policies
- Organization data isolation

#### API Security
- Rate limiting implemented via Supabase
- CORS headers configured in Edge Functions
- JWT verification enabled
- Service role key kept secure (never exposed to client)

### 4. Edge Functions Deployment

Deploy all Edge Functions to Supabase:
```bash
# Functions to deploy:
- webhook-donorbox
- webhook-stripe
- metrics-api
- news-aggregator
- ai-chatbot
- newsletter-automation
```

Each function includes:
- Proper CORS headers
- Error handling
- Input validation
- Authentication checks

### 5. Content Population

#### Initial Data
- Organizational positions (21 roles)
- News sources (5 credible sources)
- Chatbot knowledge base (6 FAQs)
- Blog posts (5 articles)
- JHRF as first organization

#### Verify Data
```sql
SELECT COUNT(*) FROM organizational_positions; -- Should be 21
SELECT COUNT(*) FROM news_sources; -- Should be 5
SELECT COUNT(*) FROM chatbot_knowledge; -- Should be 6
SELECT COUNT(*) FROM blog_posts; -- Should be 5
```

## Build and Deploy

### 1. Build for Production
```bash
npm run build
```

Verify build output:
- No TypeScript errors
- Assets optimized
- Bundle sizes acceptable (<500KB total)

### 2. Deploy to Hosting

#### Option A: Vercel
```bash
vercel --prod
```

#### Option B: Netlify
```bash
netlify deploy --prod
```

#### Option C: Custom Server
```bash
# Serve dist/ directory
# Ensure proper routing for SPA
```

### 3. DNS Configuration
- Point custom domain to hosting provider
- Enable HTTPS/SSL
- Configure CDN if using

### 4. Configure Custom Domain in Supabase
For multi-tenant platform:
```sql
UPDATE organizations
SET custom_domain = 'jamaicahurricanerecoveryfund.org'
WHERE slug = 'jhrf';
```

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] Homepage loads correctly
- [ ] Donation form works
- [ ] Volunteer portal displays positions
- [ ] Platform dashboard accessible
- [ ] Chatbot responds to queries
- [ ] News aggregation functioning
- [ ] Newsletter system operational

### 2. Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Mobile responsiveness verified

### 3. Security Tests
- [ ] RLS policies working
- [ ] Authentication flow secure
- [ ] No exposed secrets in client code
- [ ] HTTPS enforced
- [ ] Security headers configured

### 4. Monitoring Setup

#### Application Monitoring
```javascript
// Add to production environment
- Error tracking (Sentry/LogRocket)
- Performance monitoring (Web Vitals)
- User analytics (Google Analytics/Plausible)
```

#### Database Monitoring
- Enable Supabase database logs
- Set up query performance alerts
- Monitor connection pool usage

#### Edge Function Monitoring
- Track invocation counts
- Monitor response times
- Alert on error rates > 1%

## Maintenance

### Daily
- Check error logs
- Monitor donation processing
- Verify Edge Function health

### Weekly
- Review analytics dashboard
- Check volunteer applications
- Update blog content
- Review chatbot conversations

### Monthly
- Database backup verification
- Security patch updates
- Performance optimization review
- User feedback analysis

## Rollback Procedures

### Application Rollback
```bash
# Revert to previous deployment
vercel rollback [deployment-url]
# or
netlify rollback
```

### Database Rollback
```sql
-- Rollback last migration
-- Review migration file and create reverse migration
-- Test in staging first
```

### Edge Function Rollback
```bash
# Redeploy previous version via Supabase dashboard
# or use Supabase CLI
```

## Scaling Considerations

### Application Scaling
- Hosting provider handles automatically
- Static assets served via CDN
- No server-side rendering needed

### Database Scaling
- Supabase scales automatically
- Upgrade plan as needed for:
  - Database size
  - API requests
  - Bandwidth

### Edge Functions Scaling
- Serverless auto-scaling
- No configuration needed
- Monitor for rate limits

## Support and Maintenance

### Documentation
- User guides: `/docs/user-guide.md`
- Admin guides: `/docs/admin-guide.md`
- API documentation: `/docs/api.md`
- Development setup: `/README.md`

### Contact Points
- Technical issues: tech@jamaicahurricanefund.org
- Database admin: Supabase dashboard
- Hosting: Provider dashboard
- Domain: DNS provider dashboard

## Disaster Recovery

### Backups
- Database: Daily automatic backups (Supabase)
- Code: Git repository (GitHub/GitLab)
- Media: Cloud storage backup

### Recovery Time Objectives
- RTO: 4 hours
- RPO: 24 hours

### Recovery Procedures
1. Restore database from backup
2. Deploy last stable application version
3. Verify all services operational
4. Communicate with stakeholders

## Performance Optimization

### Frontend
- Lazy loading for routes
- Image optimization (WebP format)
- Code splitting implemented
- Caching strategy via CDN

### Backend
- Database indexes on key fields
- Query optimization
- Edge Function caching
- Connection pooling

### Monitoring Metrics
- Time to First Byte (TTFB) < 600ms
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms

## Compliance and Legal

### Data Protection
- GDPR compliance for EU donors
- Data retention policies implemented
- Privacy policy published
- Cookie consent mechanism

### Financial Compliance
- PCI DSS via Stripe/Donorbox
- Donation receipts automated
- Financial reporting quarterly
- Audit logs maintained

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation supported
- Screen reader compatible
- Color contrast ratios met

## Success Metrics

### Key Performance Indicators
- Total donations received
- Number of active volunteers
- Time logged by volunteers
- Campaign completion rates
- Website traffic and engagement
- Email open/click rates
- Social media reach
- Beneficiaries served

### Reporting
- Weekly dashboard review
- Monthly board reports
- Quarterly impact reports
- Annual financial statements

## Emergency Contacts

- Platform Admin: admin@jamaicahurricanefund.org
- Technical Lead: tech@jamaicahurricanefund.org
- Supabase Support: support@supabase.io
- Hosting Provider: [Provider support contact]
- Domain Registrar: [Registrar support contact]
