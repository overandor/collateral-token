'use client'

import { Shield } from 'lucide-react'

export function MerkleVerification() {
  const layers = [
    { level: 'L1', name: 'FILE HASH', count: '330,018', status: 'VERIFIED' },
    { level: 'L2', name: 'REPO HASH', count: '10', status: 'VERIFIED' },
    { level: 'L3', name: 'COLLATERAL SUM', count: '1', status: 'VERIFIED' },
    { level: 'L4', name: 'MERKLE ROOT', count: '1', status: 'VERIFIED' },
  ]

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {/* Root Hash */}
        <div className="p-2 bg-muted border-b-2 border-border">
          <div className="text-muted-foreground text-xxs mb-1 flex items-center gap-2">
            <Shield className="w-3 h-3" />
            MERKLE ROOT
          </div>
          <div className="text-primary font-bold break-all text-xxs leading-tight">
            e5286eb81195c4f8a624390...
          </div>
        </div>

        {/* Verification Layers */}
        {layers.map((layer) => (
          <div key={layer.level} className="p-2 hover:bg-muted/30 transition-colors border-l-2 border-l-accent">
            <div className="flex justify-between mb-1">
              <span className="text-primary font-bold">{layer.level}</span>
              <span className={layer.status === 'VERIFIED' ? 'text-accent' : 'text-negative'}>
                {layer.status}
              </span>
            </div>
            <div className="flex justify-between text-xxs text-muted-foreground">
              <span>{layer.name}</span>
              <span>{layer.count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-muted p-2 text-xxs">
        <div className="text-accent font-bold mb-1">✓ INTEGRITY VERIFIED</div>
        <div className="text-muted-foreground">All assets merkle-signed</div>
      </div>
    </div>
  )
}
