# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open Browser
Visit `http://localhost:3000`

## What You'll See

A comprehensive dashboard with 6 main sections:

1. **Header**: MEMBRA branding + live status
2. **Portfolio Overview**: $551.5K collateral, 110% ratio
3. **Token Mechanics**: CUSD token info
4. **Language-Fi Oracle**: Character pricing metrics
5. **Asset Breakdown**: 10 repositories with allocations
6. **System Verification**: Merkle proof and security

## Deploy to Vercel

```bash
npm run build
vercel
```

## Environment Variables

None required for basic dashboard display.

Optional future additions:
```bash
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_ORACLE_WS=wss://oracle.membra.io
```

## Project Structure

```
web/
├── app/page.tsx              ← Main dashboard
├── components/
│   ├── header.tsx           ← Top navigation
│   ├── portfolio-overview.tsx  ← Metrics cards
│   ├── token-mechanics.tsx   ← Token info
│   ├── language-fi-oracle.tsx ← Oracle data
│   ├── asset-breakdown.tsx   ← Repository list
│   └── merkle-verification.tsx ← Verification chain
├── globals.css               ← Styles + colors
├── tailwind.config.js        ← Tailwind config
└── next.config.js           ← Next.js config
```

## Key Metrics Displayed

| Metric | Value | Source |
|--------|-------|--------|
| Total Collateral | $551.5K | collateral_proof.json |
| Asset Count | 330,018 files | Sum across repos |
| Collateral Ratio | 110% | Calculated (over-col) |
| Verified Repos | 10 | All verified ✓ |

## Styling

Colors are defined in `globals.css`:
- **Background**: #0a0a0a (dark)
- **Primary**: #d4a574 (gold)
- **Accent**: #ffa500 (orange)

All Tailwind classes use these CSS variables, making rebranding easy.

## Common Tasks

### Change Colors
Edit `/globals.css`:
```css
:root {
  --primary: #your-color;
  --accent: #your-color;
}
```

### Add a New Section
1. Create `components/my-section.tsx`
2. Add client component with `'use client'`
3. Import in `app/page.tsx`
4. Add to layout

### Update Data
Dashboard reads from `../collateral_proof.json`. To refresh:
1. Run collateral_verifier.py (generates new proof)
2. Commit changes
3. Dashboard auto-updates on refresh

## Troubleshooting

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

**Styling not loading?**
```bash
# Clear build cache
rm -rf .next
npm run dev
```

**Dependencies outdated?**
```bash
npm update
npm audit fix
```

## Build for Production

```bash
npm run build
npm start
```

Output in `.next/` directory.

## Next Steps

1. ✅ Dashboard running locally
2. Push to GitHub
3. Connect to Vercel for auto-deployment
4. Share URL with team
5. Future: Add real-time oracle integration

## Support

See `README.md` for full documentation.
