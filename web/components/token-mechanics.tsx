'use client'

import { ArrowDown, ArrowUp, Lock } from 'lucide-react'

export function TokenMechanics() {
  return (
    <div className="bg-card border border-border rounded-xl p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">CUSD Token Mechanics</h3>
        <p className="text-sm text-muted-foreground">Collateral-backed USD representation on Solana</p>
      </div>

      <div className="space-y-4">
        {/* Collateral Status */}
        <div className="bg-background/50 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground">Collateral Value</span>
            <span className="text-2xl font-bold text-accent">$551.5K</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent h-full w-full rounded-full" />
          </div>
        </div>

        {/* Ratio Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Current Ratio</span>
            </div>
            <p className="text-2xl font-bold text-primary">110%</p>
          </div>
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <p className="text-2xl font-bold text-accent">≥100%</p>
          </div>
        </div>

        {/* Operations */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            <ArrowUp className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Minting</p>
              <p className="text-xs text-muted-foreground">Authority-gated token issuance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ArrowDown className="w-4 h-4 text-accent" />
            <div className="flex-1">
              <p className="font-medium">Burning & Redemption</p>
              <p className="text-xs text-muted-foreground">Token owner redemption available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <p className="text-xs text-primary font-semibold">✓ Over-collateralized</p>
        <p className="text-xs text-muted-foreground mt-1">Reviewed evidence token with emergency pause capability</p>
      </div>
    </div>
  )
}
