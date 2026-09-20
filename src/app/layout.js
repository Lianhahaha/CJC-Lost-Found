import './globals.css';
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://cjc-lost-found.vercel.app'),
  title: {
    default: 'CJC Lost & Found',
    template: '%s · CJC Lost & Found',
  },
  description:
    'Lost something at Cor Jesu College? Browse found items, post a lost alert, and get your belongings back.',
  applicationName: 'CJC Lost & Found',
  openGraph: {
    title: 'CJC Lost & Found',
    description: 'Browse found items and post lost alerts for the Cor Jesu College campus.',
    type: 'website',
    images: ['/cjc-logo-transparent.png'],
  },
};

export const viewport = {
  themeColor: '#b71f2e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
