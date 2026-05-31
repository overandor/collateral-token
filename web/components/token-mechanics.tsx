'use client'

export function TokenMechanics() {
  const metrics = [
    { label: 'CUSD SUPPLY', value: '551,500', unit: 'USD' },
    { label: 'MINT CAP', value: '1,972,907', unit: 'USD' },
    { label: 'BURN POOL', value: '0', unit: 'CUSD' },
    { label: 'BACKING', value: '110%', unit: 'ratio' },
    { label: 'EMERGENCY', value: 'ACTIVE', unit: 'status' },
    { label: 'APY', value: '8.5%', unit: 'annual' },
  ]

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {metrics.map((m) => (
          <div key={m.label} className="p-2 hover:bg-muted/30 transition-colors">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground text-xxs">{m.label}</span>
              <span className="text-xxs text-neutral">{m.unit}</span>
            </div>
            <div className="text-primary font-bold">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border bg-muted p-2 text-xxs text-muted-foreground">
        CUSD:CHAR RATIO 1:3
      </div>
    </div>
  )
}
