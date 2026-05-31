import { Header } from '@/components/header'
import { PortfolioOverview } from '@/components/portfolio-overview'
import { TokenMechanics } from '@/components/token-mechanics'
import { LanguageFiOracle } from '@/components/language-fi-oracle'
import { AssetBreakdown } from '@/components/asset-breakdown'
import { MerkleVerification } from '@/components/merkle-verification'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-6 py-12 max-w-7xl mx-auto space-y-8">
        <PortfolioOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TokenMechanics />
          <LanguageFiOracle />
        </div>
        <AssetBreakdown />
        <MerkleVerification />
      </div>
    </main>
  )
}
