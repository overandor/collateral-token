'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Zap, BarChart3, DollarSign } from 'lucide-react'
import { appraiseLinguisticCollateral, type CharacterAppraisal } from '@/lib/character-appraisal'

export function LanguageFiOracle() {
  const [appraisal, setAppraisal] = useState<CharacterAppraisal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const result = appraiseLinguisticCollateral()
    setAppraisal(result)
    setLoading(false)
  }, [])

  if (loading || !appraisal) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const topChars = appraisal.top_valued_characters.slice(0, 4)
  const avgCharValue = (appraisal.additional_linguistic_value_usd / 330018).toFixed(4)
  const moderateScenario = appraisal.liquidification_scenarios.moderate

  return (
    <div className="bg-card border border-border rounded-xl p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 gold-text" />
          Language-Fi Oracle
        </h3>
        <p className="text-sm text-muted-foreground">Real character-level appraisal with USD liquidification</p>
      </div>

      <div className="space-y-4">
        {/* Top Valued Characters - Real Data */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-3 h-3" />
            Top Valued Characters
          </p>
          {topChars.map((item) => (
            <div
              key={item.character}
              className="bg-background/50 border border-border rounded-lg p-3 flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-background text-sm">
                  {item.character === ' ' ? '␣' : item.character}
                </div>
                <div>
                  <p className="font-semibold text-sm">'{item.character}' ({(item.frequency * 100).toFixed(2)}%)</p>
                  <p className="text-xs text-muted-foreground">Rarity: {item.rarity_multiplier.toFixed(2)}x</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold gold-text">${(item.total_value / 10000).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Real Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="bg-background/50 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Semantic Velocity</span>
            </div>
            <p className="text-lg font-bold gold-text">{(appraisal.semantic_velocity * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-background/50 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Avg Char Value</span>
            </div>
            <p className="text-lg font-bold gold-text">${avgCharValue}</p>
          </div>
        </div>
      </div>

      {/* Real Liquidification Summary */}
      <div className="border-t border-border pt-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Liquidification Analysis</p>
        
        <div className="bg-background/50 border border-border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground">Current Language-Fi Value</p>
              <p className="text-lg font-bold gold-text">${appraisal.language_fi_current_usd.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Projected Character Value</p>
              <p className="text-lg font-bold gold-text">${appraisal.projected_character_value_usd.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2">Moderate Liquidification Scenario</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">{moderateScenario.discount_percent}% discount applied</p>
                <p className="text-lg font-bold gold-text">${moderateScenario.liquidification_usd.toLocaleString()}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-muted-foreground">Additional</p>
                <p className="text-muted-foreground">Collateral</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-1">New Total Collateral</p>
            <p className="text-xl font-bold gold-text">${appraisal.total_with_linguistic_usd.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Collateral Ratio: {(appraisal.estimated_collateral_ratio * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <p className="text-xs text-primary font-semibold">Real Data Source</p>
        <p className="text-xs text-muted-foreground mt-1">{appraisal.sample_size.toLocaleString()} characters sampled across 330K+ files • Merkle-verified collateral • Rarity-weighted pricing</p>
      </div>
    </div>
  )
}
