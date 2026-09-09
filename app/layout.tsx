import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'ARQON — Зерносушарки SAHARA',
  description:
    'Канадсько-українські зерносушарки ARQON SAHARA. Чотири моделі, технології сушіння зерна та калькулятор окупності.',
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
