import './globals.css'
import type { Metadata } from 'next'
import AppLayout from '@/components/layout/AppLayout'

export const metadata: Metadata = {
  title: 'TaskFusion',
  description: 'Electron + Next.js + Shadcn App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
