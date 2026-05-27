import type { Metadata } from "next";
import "./globals.css";
import { poppins, spaceGrotesk } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Edge AI — Smart Farming Dashboard",
  description:
    "An Integrated Edge AI Framework for Predictive Water Management and Plant Health Assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body
        className={`${poppins.className} ${poppins.variable} min-h-full flex flex-col`}
        style={poppins.style}
      >
        {children}
      </body>
    </html>
  );
}
