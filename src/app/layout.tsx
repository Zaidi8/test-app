import './globals.css';
import {ReactNode} from 'react';
import {Inter} from 'next/font/google';
import Link from 'next/link';
import {Toaster} from 'sonner';

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
        <header>
          <nav>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
          </nav>
        </header>
        <main>{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
