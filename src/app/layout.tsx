import type { Metadata, Viewport } from "next";
import { Overpass, Overpass_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CITY, SITE_URL } from "@/lib/config";

// Overpass deriva de la tipografía de los señalamientos viales.
const overpass = Overpass({
  subsets: ["latin"],
  variable: "--font-overpass",
  display: "swap",
});
const overpassMono = Overpass_Mono({
  subsets: ["latin"],
  variable: "--font-overpass-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Reporta un bache · ${CITY.shortName}`,
    template: `%s · Reporta Bache ${CITY.shortName}`,
  },
  description: `Reporta baches y calles en mal estado en ${CITY.name}. Tu reporte llega directo a Atención Ciudadana con foto y ubicación exacta.`,
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1b2125",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${overpass.variable} ${overpassMono.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#contenido"
          className="sr-only z-[2000] rounded bg-pintura px-4 py-2 font-bold text-asfalto focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
