'use client'

import { DollarSign, TrendingUp, CheckCircle } from 'lucide-react'

export function PortfolioOverview() {
  const stats = [
    {
      label: 'Total Collateral',
      value: '$551.5K',
      change: '+15.3%',
      icon: DollarSign,
      color: 'from-primary via-primary to-accent',
    },
    {
      label: 'Asset Count',
      value: '330,018',
      change: 'files verified',
      icon: CheckCircle,
      color: 'from-primary to-accent',
    },
    {
      label: 'Collateral Ratio',
      value: '110%',
      change: 'Over-collateralized',
      icon: TrendingUp,
      color: 'from-accent via-primary to-primary',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <span>Portfolio Overview</span>
        </h2>
        <p className="text-muted-foreground">Real-time collateral metrics across all verified repositories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-background" />
                  </div>
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
