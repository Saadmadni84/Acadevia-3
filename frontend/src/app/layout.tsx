import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/common/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Acadevia - Gamified Learning Platform',
  description: 'Transform your learning experience with gamification',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ONLY Header and Navigation here - nowhere else! */}
        <Header />
        <Navigation />
        
        <main>
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
