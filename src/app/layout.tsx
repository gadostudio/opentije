import type { Metadata } from "next";
import "./globals.scss";
import Link from "next/link";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Open Tije",
  description: "Track transporation around Jabodetabek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <Link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
