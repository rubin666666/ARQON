import { metadataFor } from '@/lib/metadata';
import './globals.css';
export const metadata = metadataFor(false);
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
