import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'CJC Lost & Found',
  description: 'Lost something on campus? Report or browse found items at CJC. Help reunite belongings with their owners.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
