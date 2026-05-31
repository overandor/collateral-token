import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'MEMBRA Collateral Dashboard',
  description: 'Unified portfolio for collateral verification, language-fi oracle, and permissioned assets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
