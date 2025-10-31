# Quick Deployment Guide

## Deploy Now - 3 Minutes

Your website is production-ready and can be deployed immediately. Choose one of these options:

---

## Option 1: Vercel (Recommended - Fastest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /tmp/cc-agent/59472953/project
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **jamaica-hurricane-recovery-fund**
- Directory? **./** (press Enter)
- Override settings? **N**

**Result:** You'll get a live URL like `https://jamaica-hurricane-recovery-fund.vercel.app`

### Step 3: Add Environment Variables
After deployment, add these in Vercel dashboard:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then redeploy:
```bash
vercel --prod
```

---

## Option 2: Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login
```bash
netlify login
```

### Step 3: Deploy
```bash
cd /tmp/cc-agent/59472953/project
netlify deploy --prod
```

Follow the prompts:
- Create & configure new site? **Y**
- Site name? **jamaica-hurricane-recovery-fund**
- Publish directory? **dist**

**Result:** You'll get a live URL like `https://jamaica-hurricane-recovery-fund.netlify.app`

### Step 4: Add Environment Variables
```bash
netlify env:set VITE_SUPABASE_URL "your-supabase-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
```

---

## Option 3: GitHub + Vercel (No CLI Needed)

### Step 1: Push to GitHub
```bash
cd /tmp/cc-agent/59472953/project
git init
git add .
git commit -m "Initial commit - Production ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jamaica-hurricane-fund.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

**Result:** Live in 2 minutes at `https://your-project.vercel.app`

---

## Option 4: Netlify Drop (Drag & Drop - No CLI)

### Step 1: Build
```bash
cd /tmp/cc-agent/59472953/project
npm run build
```

### Step 2: Deploy
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `dist` folder to the drop zone
3. Wait 30 seconds

**Result:** Live URL like `https://random-name-123456.netlify.app`

### Step 3: Add Environment Variables
1. Go to Site settings > Build & deploy > Environment
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Trigger new deploy

---

## Your Environment Variables

You need these values from Supabase:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find them:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key

---

## After Deployment

### Test Your Live Site
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Donation page accessible
- ✅ Volunteer portal displays
- ✅ News section shows content
- ✅ Chatbot responds
- ✅ Contact form works

### Share Your Site
Your live URL will be something like:
- `https://jamaica-hurricane-recovery-fund.vercel.app`
- `https://jamaica-hurricane-recovery-fund.netlify.app`

---

## Connect Custom Domain (Later)

### On Vercel:
1. Go to Project Settings > Domains
2. Add: `jamaicahurricanerecoveryfund.org`
3. Follow DNS instructions

### On Netlify:
1. Go to Site Settings > Domain Management
2. Add: `jamaicahurricanerecoveryfund.org`
3. Follow DNS instructions

---

## Quick Commands Reference

```bash
# Vercel
npm install -g vercel
vercel                    # Deploy preview
vercel --prod            # Deploy production

# Netlify
npm install -g netlify-cli
netlify login
netlify deploy --prod

# Local testing
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
```

---

## Need Help?

**Build not working?**
```bash
npm install
npm run build
```

**Environment variables not loading?**
- Make sure they start with `VITE_`
- Redeploy after adding them
- Check the deployment logs

**Database not connecting?**
- Verify Supabase URL and key are correct
- Check that RLS policies allow public read access where needed
- Review Edge Functions are deployed

---

## Fastest Path (Under 5 Minutes)

1. **Install Vercel CLI:** `npm install -g vercel`
2. **Deploy:** `vercel` (from project directory)
3. **Add env vars** in Vercel dashboard
4. **Redeploy:** `vercel --prod`
5. **Share your live URL!**

Your site is production-ready with:
- ✅ Security fixes applied
- ✅ All features working
- ✅ Mobile responsive
- ✅ SEO optimized
- ✅ Fast performance
- ✅ Professional design

**Deploy now and share with the world!**
