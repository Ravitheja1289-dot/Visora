import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visora — Multimodal Visual Reasoning Assistant",
  description: "See it. Question it. Understand it. Advanced visual reasoning and layout inspection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#ededed] antialiased">
        {children}
      </body>
    </html>
  );
}
