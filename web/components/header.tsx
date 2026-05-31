'use client'

import { Shield, Zap } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">MEMBRA</h1>
            <p className="text-xs text-muted-foreground">Collateral Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-muted-foreground">Live System</span>
        </div>
      </div>
    </header>
  )
}
