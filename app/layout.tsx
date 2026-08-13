import { Space_Grotesk, Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AdsterraPopunderInjector } from '@/components/AdComponents';

const display = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});

const ui = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'PicLink Ads - Social Link Card Generator',
  description: 'Tạo ảnh link ẩn Facebook, Zalo, Twitter tăng CTR đơn hàng',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${display.variable} ${ui.variable} ${mono.variable}`}
    >
      <body>
        <AdsterraPopunderInjector />
        {children}
      </body>
    </html>
  );
}