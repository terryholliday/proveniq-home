import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { Inter } from 'next/font/google';
import { ConsentModal } from '@/components/compliance/ConsentModal';

export const metadata: Metadata = {
  title: 'MyARK',
  description: 'Your personal inventory, powered by AI.',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={`${inter.className} font-body antialiased`} suppressHydrationWarning>
        <FirebaseClientProvider>
          {children}
          <ConsentModal />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
