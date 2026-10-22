"use client";

import { Map as MapIcon, MapPinPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CITY } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Reportar bache", short: "Reportar", icon: MapPinPlus },
  { href: "/mapa", label: "Mapa ciudadano", short: "Mapa", icon: MapIcon },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="asphalt text-white print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-3 rounded-md" aria-label="Inicio: Reporta Bache">
          <BrandMark />
          <span className="leading-tight">
            <span className="block text-xl font-extrabold tracking-tight sm:text-2xl">Reporta Bache</span>
            <span className="block text-sm font-semibold text-pintura">{CITY.shortName}</span>
          </span>
        </Link>

        <nav aria-label="Secciones">
          <ul className="flex gap-2">
            {NAV.map(({ href, label, short, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] border-2 px-3 text-base font-bold transition-colors sm:px-4",
                      active
                        ? "border-pintura bg-pintura text-asfalto"
                        : "border-white/40 text-white hover:border-white",
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{short}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="lane-dashes h-4" aria-hidden />
    </header>
  );
}

function BrandMark() {
  // Un bache visto desde arriba, interrumpiendo la línea central.
  return (
    <svg viewBox="0 0 44 44" className="size-11 shrink-0" aria-hidden>
      <rect width="44" height="44" rx="10" fill="#2c343a" />
      <rect x="2" y="20" width="10" height="4" rx="1" fill="#ffc72c" />
      <rect x="32" y="20" width="10" height="4" rx="1" fill="#ffc72c" />
      <path
        d="M14 22c0-6 4-9 8.5-9 5.5 0 8.5 4 7.5 8.5-.6 3 1.5 5-1 8-2.6 3-8.3 3.2-11.3 1.2C14.8 28.8 14 26 14 22z"
        fill="#0e1214"
        stroke="#5b6468"
        strokeWidth="1.5"
      />
      <path d="M18 19.5c1.5-2.3 4-3.2 6.5-2.6" stroke="#3a4349" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
