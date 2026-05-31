'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
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
      <div className="flex-1 overflow-y-auto font-mono text-xs p-4 text-muted-foreground">
        <div className="animate-pulse">INITIALIZING CHARACTER MARKET...</div>
      </div>
    )
  }

  const topChars = appraisal.top_valued_characters.slice(0, 6)
  const moderate = appraisal.liquidification_scenarios.moderate
  const avgCharValue = (appraisal.additional_linguistic_value_usd / 330018).toFixed(4)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Order Book Style Display */}
      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 p-3 divide-y divide-border">
        {/* Market Header */}
        <div className="grid grid-cols-4 gap-2 text-muted-foreground text-xxs font-bold pb-2 mb-2 border-b-2 border-border">
          <div>CHAR</div>
          <div className="text-right">FREQ%</div>
          <div className="text-right">RARITY</div>
          <div className="text-right">VALUE</div>
        </div>

        {/* Character Order Book */}
        {topChars.map((char) => (
          <div
            key={char.character}
            className="grid grid-cols-4 gap-2 py-2 hover:bg-muted/30 transition-colors"
          >
            <div className="font-bold text-primary text-sm">'{char.character}'</div>
            <div className="text-right text-muted-foreground">{(char.frequency * 100).toFixed(2)}</div>
            <div
              className={`text-right font-semibold ${char.rarity_multiplier > 100 ? 'text-accent' : 'text-foreground'}`}
            >
              {char.rarity_multiplier.toFixed(1)}x
            </div>
            <div className="text-right text-foreground font-bold">${(char.total_value / 10000).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Analysis Panel */}
      <div className="border-t-2 border-border bg-muted p-3 font-mono text-xs space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-xxs">SEMANTIC VELOCITY</div>
            <div className="text-primary font-bold text-sm">{(appraisal.semantic_velocity * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xxs">AVG CHAR USD</div>
            <div className="text-primary font-bold text-sm">${avgCharValue}</div>
          </div>
        </div>

        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground text-xxs">LIQUIDIFICATION</span>
            <span className="text-accent font-bold text-sm">15% DISCOUNT</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className="text-foreground font-bold">${appraisal.language_fi_current_usd.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Additional: </span>
              <span className="text-accent font-bold">${moderate.liquidification_usd.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-accent font-bold">NEW TOTAL COLLATERAL</span>
              <span className="text-primary font-bold text-lg">${appraisal.total_with_linguistic_usd.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xxs text-muted-foreground">
              <span>Collateral Ratio</span>
              <span className="text-accent">{(appraisal.estimated_collateral_ratio * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
