# MEMBRA Collateral Dashboard

A comprehensive Next.js dashboard for visualizing unified collateral, token mechanics, and language-fi oracle metrics across the MEMBRA ecosystem.

## Overview

This dashboard displays:

- **Portfolio Overview**: Total collateral ($551.5K), asset count (330,018 files), and collateral ratio (110%)
- **Token Mechanics**: CUSD token state, collateral ratios, minting/burning operations
- **Language-Fi Oracle**: Character-level pricing metrics, semantic velocity, and entropy calculations
- **Asset Breakdown**: Collateral distribution across 10 verified repositories
- **Merkle Verification**: Cryptographic proof of collateral integrity with 4-layer verification chain
- **System Verification**: Security controls, audit trails, and compliance status

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with custom MEMBRA color palette
- **Icons**: Lucide React
- **State**: Client-side rendering with React hooks

## Color Palette

- **Background**: #0a0a0a (void black)
- **Primary**: #d4a574 (gold)
- **Accent**: #ffa500 (amber)
- **Cards**: #1a1a1a (carbon)
- **Borders**: #2a2a2a

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles & Tailwind config
├── components/
│   ├── header.tsx          # Dashboard header with logo
│   ├── portfolio-overview.tsx  # Collateral metrics cards
│   ├── token-mechanics.tsx     # CUSD token info
│   ├── language-fi-oracle.tsx  # Character pricing
│   ├── asset-breakdown.tsx     # Repository breakdown
│   └── merkle-verification.tsx # Verification chain & security
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Integration Points

### Collateral Data

Data sourced from `/collateral_proof.json`:
- 10 verified repositories
- $551.5K total valuation
- 330,018 total files
- Individual merkle roots per repository

### Oracle Data

Mock language-fi metrics displayed:
- Character liquidity scores (A-Z primitives)
- Semantic velocity (1.22x)
- Entropy coefficient (4.1047)
- Top character momentum

### Token Mechanics

Solana/Anchor program state:
- CUSD token representation
- Collateral ratio enforcement
- Minting/burning capabilities
- Emergency pause system

## Features

- **Responsive Design**: Works on desktop and mobile
- **Live Metrics**: Real-time data from collateral_proof.json
- **Security Info**: Displays governance and compliance status
- **Merkle Trees**: Visualization of 4-layer proof chain
- **Interactive Cards**: Hover effects and visual feedback
- **Dark Theme**: Premium MEMBRA aesthetic with gold accents

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm install && npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Future Enhancements

- [ ] Real-time data streaming from Solana oracle
- [ ] Interactive charts (Recharts/Chart.js)
- [ ] Asset verification status updates
- [ ] Marketplace integration for MEMBRA Ads
- [ ] Dark/light theme toggle
- [ ] Export portfolio reports (PDF)
- [ ] Webhook integration for collateral updates

## License

MIT

## Related Projects

- **collateral-token**: Solana program for evidence token representation
- **language-fi**: Character-level semantic pricing infrastructure
- **membra-core**: Permission layer and asset matching engine
