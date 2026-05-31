'use client'

import { LineChart, Activity } from 'lucide-react'

export function LanguageFiOracle() {
  const topCharacters = [
    { char: 'S', liquidity: '0.916546', momentum: '+8.92%' },
    { char: 'A', liquidity: '0.933', momentum: '+5.82%' },
    { char: 'E', liquidity: '0.763', momentum: '-3.11%' },
    { char: 'T', liquidity: '0.689', momentum: '-7.3%' },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Language-Fi Oracle</h3>
        <p className="text-sm text-muted-foreground">Character-level semantic pricing metrics</p>
      </div>

      <div className="space-y-4">
        {/* Top Characters */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Liquidity</p>
          {topCharacters.map((item) => (
            <div
              key={item.char}
              className="bg-background/50 border border-border rounded-lg p-3 flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-background">
                  {item.char}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.char}</p>
                  <p className="text-xs text-muted-foreground">{item.liquidity}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${item.momentum.startsWith('+') ? 'text-primary' : 'text-red-400'}`}>
                {item.momentum}
              </span>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="bg-background/50 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <LineChart className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Entropy</span>
            </div>
            <p className="text-lg font-bold">4.1047</p>
          </div>
          <div className="bg-background/50 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Velocity</span>
            </div>
            <p className="text-lg font-bold">1.22x</p>
          </div>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <p className="text-xs text-accent font-semibold">≈ 2.1B Words Analyzed</p>
        <p className="text-xs text-muted-foreground mt-1">Real-time semantic velocity and narrative pressure tracking</p>
      </div>
    </div>
  )
}
