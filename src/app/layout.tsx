import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
// import { Inter } from 'next/font/google';
import { ConsentModal } from '@/components/compliance/ConsentModal';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'MyARK',
  description: 'Your personal inventory, powered by AI.',
  manifest: '/manifest.json',
};

// const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={`font-sans font-body antialiased`}>
        <FirebaseClientProvider>
          {children}
          <ConsentModal />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
