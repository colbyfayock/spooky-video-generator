import type { Metadata } from "next";
import { Creepster } from 'next/font/google'

import "./globals.css";

import Footer from "@/components/Footer";

const creepster = Creepster({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-creepster'
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${creepster.variable} antialiased min-h-screen grid grid-rows-[1fr_auto]`}
      >
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
