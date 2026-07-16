import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'XrayMOD Panel',
  description: 'Modular proxy management panel on Cloudflare Workers',
  robots: 'noindex, nofollow',
};

export const viewport: Viewport = {
  themeColor: '#050506',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="dark min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#fafafa',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
