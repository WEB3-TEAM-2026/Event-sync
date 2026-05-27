import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "EventSync", template: "%s · EventSync" },
  description: "La plateforme moderne de gestion d'événements en temps réel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}