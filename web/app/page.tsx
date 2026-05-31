import { Header } from '@/components/header'
import { PortfolioOverview } from '@/components/portfolio-overview'
import { TokenMechanics } from '@/components/token-mechanics'
import { LanguageFiOracle } from '@/components/language-fi-oracle'
import { AssetBreakdown } from '@/components/asset-breakdown'
import { MerkleVerification } from '@/components/merkle-verification'

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-mono">
      <Header />
      {/* Bloomberg Terminal Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border p-px h-[calc(100vh-120px)]">
        {/* Left Panel - Portfolio & Tickers */}
        <div className="col-span-1 overflow-y-auto border border-border bg-card flex flex-col">
          <div className="terminal-header text-xs font-bold border-b border-border">
            COLLATERAL PORTFOLIO
          </div>
          <PortfolioOverview />
        </div>

        {/* Center Panel - Character Trading & Liquidification */}
        <div className="col-span-1 lg:col-span-2 overflow-y-auto border border-border bg-card flex flex-col">
          <div className="terminal-header text-xs font-bold flex justify-between">
            <span>LANGUAGE-FI PRIMITIVES • CHARACTER MARKET</span>
            <span className="text-accent">LIVE</span>
          </div>
          <LanguageFiOracle />
        </div>
      </div>

      {/* Bottom Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border mt-px">
        <div className="col-span-1 border border-border bg-card overflow-y-auto max-h-96">
          <div className="terminal-header text-xs font-bold">TOKEN MECHANICS</div>
          <TokenMechanics />
        </div>
        <div className="col-span-1 border border-border bg-card overflow-y-auto max-h-96">
          <div className="terminal-header text-xs font-bold">ASSET ALLOCATION</div>
          <AssetBreakdown />
        </div>
        <div className="col-span-1 border border-border bg-card overflow-y-auto max-h-96">
          <div className="terminal-header text-xs font-bold">MERKLE VERIFICATION</div>
          <MerkleVerification />
        </div>
      </div>
    </main>
  )
}
