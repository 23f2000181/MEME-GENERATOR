import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Meme Generator',
  description: 'Generate memes using Gemini AI and Nano Banana',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
