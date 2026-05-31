'use client'

import { Activity, TrendingUp } from 'lucide-react'

export function Header() {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })

  return (
    <header className="border-b-2 border-border bg-muted font-mono sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between text-xs">
        {/* Left: System Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="text-primary font-bold text-sm">BLOOMBERG TERMINAL</div>
          <div className="border-l border-border pl-4">
            <span className="text-foreground">LINGUISTIC-ASSETS PRIMITIVES EXCHANGE</span>
          </div>
        </div>

        {/* Center: Live Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-accent animate-pulse" />
            <span className="text-accent">LIVE</span>
          </div>
          <span className="text-neutral">|</span>
          <span className="text-muted-foreground">{timestamp} UTC</span>
        </div>

        {/* Right: Market Status */}
        <div className="flex items-center gap-4 ml-4 border-l border-border pl-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="text-accent">OPEN</span>
          </div>
          <span className="text-muted-foreground text-right">CUSD: $551.5K | CHAR: $1.67M</span>
        </div>
      </div>
    </header>
  )
}
