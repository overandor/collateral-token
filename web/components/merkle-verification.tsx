'use client'

import { Shield, Lock, Zap } from 'lucide-react'

export function MerkleVerification() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">System Verification</h2>
        <p className="text-muted-foreground">Merkle tree cryptographic proof of collateral integrity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Root */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h3 className="font-bold">Overall Merkle Root</h3>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <p className="font-mono text-xs text-primary break-all leading-relaxed">
              e5286eb81195c4f8a6243906ed4f20f93904689c8fc605344d9622491018ae63
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">All repos verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Cryptographically signed</span>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <p className="text-xs text-accent font-semibold">✓ VERIFIED</p>
            <p className="text-xs text-muted-foreground mt-1">330,018 files across 10 repositories</p>
          </div>
        </div>

        {/* Verification Tree */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 space-y-6">
          <h3 className="font-bold">Verification Chain</h3>

          <div className="space-y-4">
            {[
              { level: 'Layer 1', desc: 'File-level hashes', repos: '330,018 artifacts' },
              { level: 'Layer 2', desc: 'Repository commits', repos: '10 root repositories' },
              { level: 'Layer 3', desc: 'Collateral proof', repos: 'Evidence merkle tree' },
              { level: 'Layer 4', desc: 'Solana on-chain', repos: 'CUSD token state' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-background text-xs font-bold">
                    {idx + 1}
                  </div>
                  {idx < 3 && <div className="w-1 h-8 bg-border my-2" />}
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-sm">{item.level}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  <p className="text-xs text-primary font-mono mt-1">{item.repos}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-card border border-border rounded-xl p-8">
        <h3 className="font-bold mb-4">Security & Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Authority Gated', desc: 'Multi-sig controlled' },
            { label: 'Emergency Pause', desc: '2/5 signature threshold' },
            { label: 'Ratio Enforced', desc: '≥100% always maintained' },
            { label: 'Audit Trail', desc: 'Full transaction logging' },
          ].map((item) => (
            <div key={item.label} className="bg-background/50 border border-border rounded-lg p-4">
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
