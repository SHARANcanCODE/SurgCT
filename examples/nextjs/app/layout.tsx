import type { ReactNode } from 'react';

export const metadata = {
  title: 'SURGCT — Next.js example',
  description: 'Embedding SURGCT in a Next.js App Router page.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
