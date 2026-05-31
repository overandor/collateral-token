# Deployment Guide - MEMBRA Collateral Dashboard

## Quick Deploy (Vercel) - 2 Minutes

### Easiest Method

1. **Connect to GitHub** (if not already):
   ```bash
   cd /vercel/share/v0-project
   git remote set-url origin https://github.com/overandor/collateral-token.git
   git push -u origin browservm-llm-os
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `overandor/collateral-token`
   - Select branch: `browservm-llm-os`
   - Root Directory: `web`
   - Click "Deploy"

3. **Done!** Your dashboard is live

### Alternative: Vercel CLI

```bash
cd web
npm install -g vercel
vercel
```

Follow prompts, select GitHub project, and deploy.

## Production Checklist

Before deploying:

- [ ] `npm run build` succeeds
- [ ] `npm run dev` shows no errors
- [ ] Dashboard renders all sections
- [ ] Colors display correctly
- [ ] Responsive on mobile
- [ ] All links work
- [ ] Git history clean

## Environment Setup (Optional)

For real-time oracle integration (future):

```bash
# .env.local
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_ORACLE_WS=wss://oracle.membra.io
```

## Deployment Options

### Option 1: Vercel (RECOMMENDED)
- **Cost**: Free tier available
- **Setup**: 2 minutes
- **Features**: Auto-scaling, CDN, analytics
- **Command**: `vercel`

```
✅ Easiest
✅ Fastest
✅ Best performance
✅ Built-in analytics
```

### Option 2: Docker

```bash
cd web

# Build image
docker build -t membra-dashboard:latest .

# Run container
docker run -p 3000:3000 membra-dashboard:latest

# Or push to registry
docker push your-registry/membra-dashboard:latest
```

Deploy to:
- Docker Hub
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- Kubernetes

### Option 3: Traditional Hosting

**Build**:
```bash
cd web
npm run build
```

**Upload**:
- `.next/` directory to server
- `node_modules/` to server
- `package.json` to server

**Run on Server**:
```bash
npm install --production
npm start
```

Hosting options:
- **Shared Hosting**: cPanel with Node.js support
- **VPS**: DigitalOcean, Linode, AWS EC2
- **Platform**: Heroku, Railway, Render
- **Cloud**: AWS, Google Cloud, Azure

### Option 4: Static Export

For GitHub Pages or static hosting:

```bash
cd web

# Update next.config.js:
# export default {
#   output: 'export',
# }

npm run build

# Deploy '.next' folder contents to GitHub Pages
```

## Post-Deployment

### 1. Add Custom Domain (Vercel)

```bash
vercel domains add yourdomain.com
```

### 2. Configure DNS
- Point domain to Vercel nameservers
- Takes 10-30 minutes

### 3. Enable HTTPS
- Automatic with Vercel
- Free SSL certificate

### 4. Monitor

Check in Vercel dashboard:
- Visits and pageviews
- Response times
- Error rates

## Verification

After deployment, verify:

1. **Homepage loads**
   - Visit your domain
   - Confirm dashboard displays

2. **All sections render**
   - Portfolio overview ✓
   - Token mechanics ✓
   - Oracle data ✓
   - Asset breakdown ✓
   - Merkle verification ✓

3. **Data displays**
   - $551.5K collateral ✓
   - 330,018 files ✓
   - 110% ratio ✓
   - All 10 repos ✓

4. **Responsive**
   - Desktop view ✓
   - Tablet view ✓
   - Mobile view ✓

5. **Performance**
   - Page loads < 3s ✓
   - No console errors ✓
   - Smooth interactions ✓

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Performance Slow
- Check Node.js version: `node -v` (need 18+)
- Check dependencies: `npm audit`
- Review browser console for errors

### Data Not Showing
- Verify `collateral_proof.json` exists
- Check browser console for errors
- Ensure component imports are correct

## Scaling

### Low Traffic (< 1M requests/month)
- Use Vercel free tier
- No additional config needed

### Medium Traffic (1-10M requests/month)
- Upgrade Vercel Pro
- Add edge caching
- Monitor analytics

### High Traffic (> 10M requests/month)
- Self-host with auto-scaling
- Add CDN (Cloudflare)
- Database for real-time data
- Cache layer (Redis)

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - browservm-llm-os

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd web && npm ci && npm run build
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Set Secrets in GitHub
1. Go to repo Settings → Secrets
2. Add:
   - `VERCEL_TOKEN` (from vercel.com/account/tokens)
   - `VERCEL_ORG_ID` (from project settings)
   - `VERCEL_PROJECT_ID` (from project settings)

3. On push to `browservm-llm-os`, auto-deploys

## Rollback

If something breaks:

### Vercel Dashboard
1. Go to Deployments
2. Find previous good deployment
3. Click "Promote to Production"
4. Done (instant)

### Via CLI
```bash
vercel promote <deployment-url>
```

## Security

### Recommended Settings

1. **Environment Variables**
   - Never commit `.env.local`
   - Add to Vercel dashboard
   - Set for specific deployments

2. **Secrets**
   - Use Vercel managed secrets
   - Rotate API keys monthly
   - Use least privilege principle

3. **Domain**
   - Enable HTTPS (automatic)
   - Add SSL certificate
   - Configure security headers

4. **Monitoring**
   - Check Vercel analytics
   - Monitor error rates
   - Set up alerts

## Cost Estimation

| Provider | Free Tier | Pro | Enterprise |
|----------|-----------|-----|-------------|
| **Vercel** | $0/mo | $20/mo | Custom |
| **AWS** | $0-12/mo | $50-200/mo | Custom |
| **GCP** | $0-10/mo | $50-500/mo | Custom |
| **Azure** | $0-15/mo | $50-400/mo | Custom |
| **DigitalOcean** | N/A | $5-12/mo | Custom |

For small team: **Vercel Free** is perfect.

## Support

- **Vercel Support**: support.vercel.com
- **Next.js Docs**: nextjs.org/docs
- **Our Docs**: See README.md and IMPLEMENTATION.md

## Deployment Checklist

```
BEFORE DEPLOY:
- [ ] Test locally: npm run dev
- [ ] Build succeeds: npm run build
- [ ] No console errors
- [ ] Git pushed to main/production branch
- [ ] Domain ready (if custom domain)

DEPLOY:
- [ ] Run: vercel (or use dashboard)
- [ ] Review preview deployment
- [ ] Promote to production
- [ ] Verify live site loads

AFTER DEPLOY:
- [ ] Visit dashboard URL
- [ ] Check all sections load
- [ ] Test on mobile
- [ ] Monitor errors (first 24h)
- [ ] Share URL with team
```

---

## Ready? Let's Go!

```bash
cd web
vercel
```

Your MEMBRA dashboard will be live in seconds. 🚀
