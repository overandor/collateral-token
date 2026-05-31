'use client'

import { Check, FileText } from 'lucide-react'

export function AssetBreakdown() {
  const assets = [
    {
      name: 'MEMBRA Core',
      value: '$102.5K',
      files: '130,378',
      percentage: 18.6,
      merkle: '1b744d0d...',
    },
    {
      name: 'Overmanifold',
      value: '$117.5K',
      files: '30,974',
      percentage: 21.3,
      merkle: 'e5d005da...',
    },
    {
      name: 'MEMBRA Finance',
      value: '$92.5K',
      files: '103,833',
      percentage: 16.8,
      merkle: '3d59f1bf...',
    },
    {
      name: 'AI Infrastructure',
      value: '$57.5K',
      files: '38,616',
      percentage: 10.4,
      merkle: '5f327e13...',
    },
    {
      name: 'MEMBRA Ecosystem',
      value: '$27.5K',
      files: '10,315',
      percentage: 5.0,
      merkle: '6c3fceb9...',
    },
    {
      name: 'Data Assets',
      value: '$45.0K',
      files: '238',
      percentage: 8.2,
      merkle: '11d87e74...',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Asset Breakdown</h2>
        <p className="text-muted-foreground">Collateral distribution across verified repositories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div
            key={asset.name}
            className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 overflow-hidden"
          >
            {/* Percentage Bar Background */}
            <div
              className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-primary via-accent to-primary opacity-30 group-hover:opacity-60 transition-opacity"
              style={{ width: `${Math.min(asset.percentage * 1.5, 100)}%` }}
            />

            <div className="relative z-10 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">{asset.name}</h4>
                </div>
                <Check className="w-5 h-5 text-primary" />
              </div>

              {/* Value */}
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{asset.value}</p>
                <p className="text-xs text-muted-foreground">{asset.files} files</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Allocation</span>
                  <span className="font-semibold text-primary">{asset.percentage}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300"
                    style={{ width: `${asset.percentage}%` }}
                  />
                </div>
              </div>

              {/* Merkle Root */}
              <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Merkle Root</p>
                <p className="font-mono text-xs text-primary truncate">{asset.merkle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
