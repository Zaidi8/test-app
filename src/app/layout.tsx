import './globals.css';
import {ReactNode} from 'react';
import {Inter} from 'next/font/google';
import {Toaster} from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        <header></header>
        <main>{children}</main>
        <SpeedInsights/>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
