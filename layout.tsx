import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClipLumia',
  description: 'Prototype de studio IA pour generer du contenu video.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
