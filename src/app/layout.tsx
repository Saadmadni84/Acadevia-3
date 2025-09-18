import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
<<<<<<< HEAD:src/app/layout.tsx
import { Providers } from './providers'
import '@/styles/globals.css'
=======
import './globals.css'
import Navigation from 'src/components/Navigation'
>>>>>>> 6810d0c7 ("initialc"):frontend/src/app/api/layout.tsx

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
<<<<<<< HEAD:src/app/layout.tsx
  title: process.env.NEXT_PUBLIC_APP_NAME || 'App',
  description: 'Your app description',
=======
  title: 'GameLearn Platform',
  description: 'Transform your learning experience with our gamified platform',
>>>>>>> 6810d0c7 ("initialc"):frontend/src/app/api/layout.tsx
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
<<<<<<< HEAD:src/app/layout.tsx
        <Providers>{children}</Providers>
=======
        <Navigation />
        {children}
>>>>>>> 6810d0c7 ("initialc"):frontend/src/app/api/layout.tsx
      </body>
    </html>
  )
}
