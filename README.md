# Jamaica Hurricane Recovery Fund (JHRF) Website

![JHRF Banner](https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg?auto=compress&cs=tinysrgb&w=1200)

## Overview

The Jamaica Hurricane Recovery Fund is a $100 million global initiative founded by Orville Davis to support hurricane relief, recovery, and long-term climate resilience in Jamaica. This repository contains the official website and digital platform for the campaign.

**Live Website**: jamaicahurricanerecoveryfund.org

## Mission

To raise US $100 million for comprehensive hurricane relief, recovery, and long-term climate resilience in Jamaica through strategic corporate partnerships, global diaspora engagement, and public donations.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom Jamaican flag color palette
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe & Donorbox (integration ready)
- **Deployment**: Vercel (recommended) or Netlify
- **CDN/Security**: Cloudflare

## Features

### Public-Facing Website

1. **Home Page**
   - Hero section with compelling imagery
   - Real-time donation progress tracker
   - Impact areas showcase
   - Call-to-action sections

2. **About Us**
   - Founder story (Orville Davis)
   - Mission, vision, and values
   - Governance and accountability
   - Strategic partners

3. **Our Impact**
   - Interactive project map of Jamaica
   - Project portfolio with filtering
   - Impact statistics dashboard
   - Stories of hope from beneficiaries

4. **Get Involved**
   - Volunteer application form
   - Corporate partnership inquiry form
   - Multiple ways to contribute
   - Diaspora engagement opportunities

5. **Donate**
   - One-time and recurring donation options
   - Multi-currency support (USD, CAD, GBP)
   - Stripe and Donorbox integration ready
   - Impact calculator showing donation effects
   - Secure payment processing

6. **News & Updates**
   - Blog/news feed with latest updates
   - Featured stories
   - Newsletter subscription
   - Social media integration

7. **Contact**
   - Contact form with database integration
   - Office locations (Canada and Jamaica)
   - FAQ section
   - Multiple contact methods

### Admin CMS

- **Authentication**: Secure login via Supabase Auth
- **Content Management**:
  - News posts (create, edit, publish)
  - Impact stories management
  - Project portfolio updates
  - Donation progress tracking
- **Real-time Updates**: Changes reflect immediately on public site

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navigation header
│   │   └── Footer.tsx          # Site footer
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── About.tsx           # About JHRF
│   │   ├── Impact.tsx          # Projects & impact
│   │   ├── GetInvolved.tsx     # Volunteer/partner forms
│   │   ├── Donate.tsx          # Donation page
│   │   ├── News.tsx            # News/blog feed
│   │   ├── Contact.tsx         # Contact page
│   │   └── Admin.tsx           # Admin CMS
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   ├── App.tsx                 # Main app component
│   ├── index.css               # Global styles
│   └── main.tsx                # Entry point
├── public/                     # Static assets
├── .env                        # Environment variables
├── SOCIAL_MEDIA_KIT.md         # Marketing materials
├── package.json                # Dependencies
└── README.md                   # This file
```

## Database Schema

The Supabase database includes the following tables:

- **news_posts**: Blog posts and updates
- **impact_stories**: Beneficiary testimonials
- **projects**: Rebuilding projects across Jamaica
- **donations**: Donation tracking
- **volunteers**: Volunteer applications
- **partnership_inquiries**: Corporate partnership requests
- **contact_submissions**: Contact form submissions
- **donation_progress**: Campaign progress tracking

All tables include Row Level Security (RLS) policies for secure data access.

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payment processing)
- Donorbox account (optional alternative)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/jhrf-website.git
cd jhrf-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the site**
   - Website: http://localhost:5173
   - Admin: http://localhost:5173 (click logo, navigate to /admin)

## Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure domain**
   - Add jamaicahurricanerecoveryfund.org in Vercel dashboard
   - Update DNS records to point to Vercel

4. **Add environment variables**
   - Go to Vercel project settings
   - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build and deploy**
```bash
npm run build
netlify deploy --prod --dir=dist
```

3. **Configure domain and environment variables** in Netlify dashboard

### Cloudflare Setup

1. **Add site to Cloudflare**
   - Add jamaicahurricanerecoveryfund.org
   - Update nameservers with your domain registrar

2. **Enable security features**
   - SSL/TLS: Full (strict)
   - DDoS protection: On
   - WAF rules: Configure as needed
   - Bot fight mode: On

## Payment Integration

### Stripe Configuration

1. **Get API keys** from https://dashboard.stripe.com/apikeys
2. **Test mode**: Use test keys for development
3. **Production**: Switch to live keys when ready
4. **Update Donate.tsx** with your Stripe publishable key
5. **Configure webhook endpoint** for donation tracking

### Donorbox Integration

1. **Create campaign** at https://donorbox.org
2. **Get embed code** from Donorbox dashboard
3. **Add to Donate.tsx** in the Donorbox section
4. **Configure webhook** for database updates

## Admin Access

### Creating Admin User

1. **Go to Supabase dashboard**
2. **Authentication > Users**
3. **Add User** with email and password
4. **Access admin panel** at yoursite.com (navigate to /admin)
5. **Login** with created credentials

### Admin Capabilities

- Publish/edit news posts
- Manage impact stories
- Update project information
- Modify donation progress
- View form submissions

## SEO & Analytics

### Built-in SEO Features

- Semantic HTML structure
- Open Graph meta tags
- Twitter Card meta tags
- Schema.org JSON-LD markup
- Canonical URLs
- Optimized meta descriptions

### Recommended Analytics

1. **Google Analytics 4**
   - Add tracking code to index.html
   - Track donation conversions

2. **Google Tag Manager**
   - Container for managing marketing tags
   - Event tracking for buttons/forms

3. **Facebook Pixel**
   - Track social media conversions
   - Create retargeting audiences

## Social Media Integration

See `SOCIAL_MEDIA_KIT.md` for:
- Post templates
- Hashtag strategy
- Brand guidelines
- Content calendar
- Engagement strategies

## Design System

### Colors

- **Jamaica Green**: #009739 (Primary)
- **Jamaica Gold**: #FED100 (Call-to-action)
- **Jamaica Black**: #000000 (Text)
- **Primary Green Scale**: 50-900 (Light to dark)

### Typography

- **Headings**: Poppins (400, 600, 700)
- **Body**: Open Sans (400, 600, 700)
- **Line Height**: 150% body, 120% headings

### Components

Pre-built Tailwind classes:
- `.btn-primary` - Gold call-to-action button
- `.btn-secondary` - Green secondary button
- `.btn-outline` - Outlined green button

## Security Best Practices

1. **Environment Variables**: Never commit .env file
2. **API Keys**: Use environment variables only
3. **RLS Policies**: All database tables protected
4. **HTTPS**: Enforced via Cloudflare/Vercel
5. **Input Validation**: Forms validated on client and server
6. **CORS**: Properly configured for API requests
7. **SQL Injection**: Prevented via Supabase client

## Performance Optimization

- **Image Optimization**: Use Pexels CDN for images
- **Code Splitting**: React lazy loading for routes
- **Minification**: Vite production build
- **CDN**: Cloudflare for global delivery
- **Caching**: Browser and CDN caching configured

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- High contrast color ratios
- Responsive design for all devices
- Screen reader compatible

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

## Testing

```bash
# Run linter
npm run lint

# Type checking
npm run typecheck

# Build test
npm run build
```

## Troubleshooting

### Common Issues

1. **Supabase connection error**
   - Check .env file has correct credentials
   - Verify Supabase project is active

2. **Build fails**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version is 18+

3. **Styles not loading**
   - Rebuild Tailwind: `npm run dev`
   - Clear browser cache

4. **Database queries failing**
   - Check RLS policies in Supabase dashboard
   - Verify table permissions

## Support & Contact

**Technical Issues**: developers@jamaicahurricanefund.org
**General Inquiries**: info@jamaicahurricanefund.org
**Media Relations**: media@jamaicahurricanefund.org
**Partnerships**: partnerships@jamaicahurricanefund.org

## Contributing

This is a private repository for JHRF. For contribution inquiries, please contact the technical team.

## License

Copyright © 2024 Jamaica Hurricane Recovery Fund. All rights reserved.

## Acknowledgments

- **Founder**: Orville Davis
- **Partners**: Stigg Security Inc., Omega Group, Alberta Tech Team
- **Development**: JHRF Technical Team
- **Images**: Pexels.com contributors
- **Community**: Global Jamaican diaspora

## Roadmap

### Phase 1 (Current)
- ✅ Website launch
- ✅ Database setup
- ✅ Basic CMS
- ✅ Donation page structure

### Phase 2 (Next)
- 🔄 Stripe payment integration
- 🔄 Donorbox integration
- 🔄 Email automation
- 🔄 Analytics setup

### Phase 3 (Future)
- ⏳ Mobile app
- ⏳ Volunteer portal
- ⏳ Project management dashboard
- ⏳ Donor portal

---

**Built with ❤️ for Jamaica**

*Rebuilding Stronger. Together.*
