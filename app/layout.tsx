import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'COT Dashboard',
  description: 'A dashboard for viewing Commitment of Traders data',
  keywords: ['COT, Commitment of Traders, Dashboard, Data Visualization'],
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
