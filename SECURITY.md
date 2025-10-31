# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the Jamaica Hurricane Recovery Fund platform, please report it responsibly:

**Email:** security@jamaicahurricanefund.org

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will acknowledge receipt within 48 hours and provide a detailed response within 5 business days.

## Security Measures

### Application Security

#### Authentication & Authorization
- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on all database tables
- Role-based access control (RBAC)
- Session management with auto-refresh
- Secure password requirements (handled by Supabase)

#### Data Protection
- All data encrypted in transit (HTTPS/TLS 1.3)
- Database encryption at rest (Supabase)
- No sensitive data in client-side code
- Environment variables for secrets
- PCI DSS compliance via Stripe/Donorbox

#### Input Validation
- Client-side validation for all forms
- Server-side validation in Edge Functions
- SQL injection prevention (Supabase parameterized queries)
- XSS protection (React escaping, CSP headers)
- CSRF protection (SameSite cookies)

### Infrastructure Security

#### Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictive

#### CORS
- Properly configured CORS headers
- Whitelist-based origin validation
- Credentials handling secure

#### Rate Limiting
- Supabase built-in rate limiting
- Edge Function invocation limits
- API request throttling

### Database Security

#### Row Level Security Policies
All tables enforce strict RLS:
- Public: Read-only access to published content
- Authenticated: Full access to owned data
- Admin: Platform-wide management access
- Volunteers: Self-service profile and time log management
- Organizations: Isolated multi-tenant data access

#### Data Isolation
- Multi-tenant architecture with strict isolation
- Organization data never crosses boundaries
- Volunteer PII protected
- Donor information encrypted

### Payment Security

#### Integration
- No credit card data touches our servers
- PCI DSS Level 1 compliant processors (Stripe/Donorbox)
- Webhook signature verification
- Secure callback handling

#### Fraud Prevention
- Transaction validation
- Duplicate detection
- Suspicious activity monitoring
- Automated alerts

### API Security

#### Edge Functions
- Input validation on all endpoints
- Error handling without information leakage
- Service role key protection
- Request logging for audit

#### Authentication
- JWT verification required
- Token expiration enforced
- Refresh token rotation
- Session invalidation on logout

### Monitoring & Response

#### Logging
- Application errors logged (no PII)
- Authentication attempts tracked
- Database queries monitored
- Edge Function invocations logged

#### Alerts
- Failed authentication attempts
- Unusual donation patterns
- Database performance issues
- Edge Function errors
- RLS policy violations

#### Incident Response
1. Detection and analysis
2. Containment and eradication
3. Recovery and restoration
4. Post-incident review
5. Documentation and communication

### Third-Party Security

#### Dependencies
- Regular dependency audits
- Automated security updates
- Vulnerability scanning
- License compliance

#### Services
- Supabase: SOC 2 Type II certified
- Vercel/Netlify: Enterprise security
- Stripe: PCI DSS Level 1
- All vendors vetted for security

### Compliance

#### Data Protection
- GDPR compliant (EU donors)
- CCPA compliant (California donors)
- Data retention policies enforced
- Right to deletion honored
- Data portability supported

#### Financial
- Tax-exempt organization compliance
- Financial reporting standards
- Donation receipt requirements
- Audit trail maintenance

#### Accessibility
- WCAG 2.1 AA compliance
- Accessible to all users
- Regular accessibility audits

### Security Best Practices

#### Development
- Secure coding standards
- Code review process
- Security testing in CI/CD
- Secrets management
- Least privilege principle

#### Operations
- Regular security audits
- Penetration testing (annual)
- Vulnerability assessments
- Security training for team
- Incident response drills

### User Security

#### Recommendations
- Use strong, unique passwords
- Enable two-factor authentication (when available)
- Keep software updated
- Beware of phishing attempts
- Report suspicious activity

#### Privacy
- Privacy policy published
- Cookie consent obtained
- Data collection minimized
- User rights respected
- Transparency maintained

## Security Updates

We take security seriously and continuously improve our security posture:

- Regular security audits
- Prompt patching of vulnerabilities
- Security-focused development practices
- Transparent communication about security issues

## Contact

For security concerns or questions:
- Email: security@jamaicahurricanefund.org
- General: info@jamaicahurricanefund.org

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve our security.
