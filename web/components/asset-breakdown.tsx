'use client'

export function AssetBreakdown() {
  const assets = [
    { symbol: 'MEMCORE', value: '102.5K', files: '130K', pct: 18.6 },
    { symbol: 'OVMNF', value: '117.5K', files: '31K', pct: 21.3 },
    { symbol: 'MEMFIN', value: '92.5K', files: '104K', pct: 16.8 },
    { symbol: 'AIINF', value: '57.5K', files: '39K', pct: 10.4 },
    { symbol: 'MEMECO', value: '27.5K', files: '10K', pct: 5.0 },
    { symbol: 'DATAST', value: '45.0K', files: '238', pct: 8.2 },
  ]

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 text-muted-foreground text-xxs font-bold p-2 border-b border-border sticky top-0 bg-muted">
          <div>REPO</div>
          <div className="text-right">VALUE</div>
          <div className="text-right">%</div>
        </div>
        <div className="divide-y divide-border">
          {assets.map((a) => (
            <div key={a.symbol} className="p-2 hover:bg-muted/30 transition-colors">
              <div className="flex justify-between mb-1">
                <span className="text-primary font-bold text-sm">{a.symbol}</span>
                <span className="text-accent">${a.value}</span>
              </div>
              <div className="flex justify-between text-xxs text-muted-foreground">
                <span>{a.files} files</span>
                <span>{a.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border bg-muted p-2 text-xxs text-muted-foreground">
        TOTAL: 10 REPOS • $551.5K
      </div>
    </div>
  )
}
