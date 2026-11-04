import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Medicine Box | IoT Caretaker Monitoring Platform',
  description: 'Commercial IoT medication adherence and caretaker monitoring platform with ESP32 hardware synchronization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-slate-100 min-h-screen selection:bg-violet-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
