import { metadataFor } from '@/lib/metadata';
import './globals.css';
export const metadata = metadataFor(false);
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang = location.pathname.startsWith('/en') ? 'en' : 'uk';" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
