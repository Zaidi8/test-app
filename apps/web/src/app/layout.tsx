import './globals.css';
import {ReactNode} from 'react';
import {Inter} from 'next/font/google';
import {Toaster} from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {AuthProvider} from '@/lib/auth-provider';

const inter = Inter({subsets: ['latin']});

export const metadata = {
  title: '',
  description: 'App description',
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <AuthProvider>
          <header></header>
          <main>{children}</main>
        </AuthProvider>
        <SpeedInsights/>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
