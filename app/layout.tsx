import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kling Video Generator',
  description: 'Generate AI videos with Kling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
