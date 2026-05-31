'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

export function PortfolioOverview() {
  const tickers = [
    {
      symbol: 'CUSD',
      name: 'COLLATERAL USD',
      value: '551,500',
      change: '+15.3%',
      positive: true,
    },
    {
      symbol: 'ASET',
      name: 'VERIFIED ASSETS',
      value: '330,018',
      change: 'files',
      neutral: true,
    },
    {
      symbol: 'RATIO',
      name: 'COLLATERAL RATIO',
      value: '110%',
      change: 'Over-backed',
      positive: true,
    },
    {
      symbol: 'CHAR',
      name: 'CHARACTER VALUE',
      value: '1,672,244',
      change: '+4,084%',
      positive: true,
    },
    {
      symbol: 'LQFY',
      name: 'LIQUIDIFICATION',
      value: '1,421,408',
      change: 'moderate',
      neutral: true,
    },
    {
      symbol: 'REPO',
      name: 'REPOSITORIES',
      value: '10',
      change: 'verified',
      neutral: true,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Ticker Display */}
      <div className="flex-1 overflow-y-auto font-mono text-xs divide-y divide-border">
        {tickers.map((ticker) => (
          <div
            key={ticker.symbol}
            className="p-3 border-l-2 border-l-muted hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="font-bold text-primary">{ticker.symbol}</div>
                <div className="text-muted-foreground text-xxs">{ticker.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">${ticker.value}</div>
                <div
                  className={`text-xxs font-semibold ${
                    ticker.positive
                      ? 'text-accent'
                      : ticker.neutral
                        ? 'text-neutral'
                        : 'text-negative'
                  }`}
                >
                  {ticker.positive && <TrendingUp className="w-3 h-3 inline mr-1" />}
                  {ticker.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t border-border bg-muted p-2 text-xxs text-muted-foreground">
        <div className="flex justify-between">
          <span>LAST UPDATE: 14:37:22</span>
          <span>PRECISION: 0.001</span>
        </div>
      </div>
    </div>
  )
}
