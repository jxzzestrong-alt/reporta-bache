import { BellRing, Map as MapIcon, MapPinPlus, Send, Wrench } from "lucide-react";
import Link from "next/link";
import { DemoBanner } from "@/components/demo-banner";
import { buttonVariants } from "@/components/ui/button";
import { ReportWizard } from "@/components/wizard/report-wizard";
import { CITY } from "@/lib/config";
import { listReports } from "@/lib/store";

// Las cifras del letrero se actualizan cada minuto.
export const revalidate = 60;

async function getStats() {
  try {
    const reports = await listReports();
    return {
      total: reports.length,
      urgent: reports.filter((r) => r.urgency === "muy_urgente" && r.status !== "reparado").length,
      fixed: reports.filter((r) => r.status === "reparado").length,
    };
  } catch {
    return null;
  }
}

const AFTER = [
  {
    icon: Send,
    title: "Se envía al municipio",
    text: "Atención Ciudadana recibe un correo con la foto, la ubicación exacta y enlaces a Google Maps y Street View.",
  },
  {
    icon: BellRing,
    title: "Lo ven tus vecinos",
    text: "Tu reporte aparece en el mapa ciudadano para que nadie tenga que reportar el mismo bache dos veces.",
  },
  {
    icon: Wrench,
    title: "Sigues tu folio",
    text: "Con tu folio puedes preguntar por la reparación. Cuando avanza, el estado se actualiza en el mapa.",
  },
];

export default async function HomePage() {
  const authorityName = process.env.AUTHORITY_NAME || "Atención Ciudadana del municipio";
  const authorityEmail = process.env.AUTHORITY_EMAIL || "";
  const stats = await getStats();

  return (
    <>
      {/* ── Portada ── */}
      <section className="asphalt text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-8 sm:pt-12 lg:grid-cols-[1.25fr_1fr] lg:pb-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-[0.95rem] font-semibold text-white/85">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-pintura opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-pintura" />
              </span>
              Plataforma ciudadana de {CITY.shortName}
            </p>
            <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-balance sm:text-[4rem]">
              ¿Viste un bache? Repórtalo en un minuto.
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg text-white/80 sm:text-xl">
              Tu reporte llega a Atención Ciudadana con foto, ubicación exacta y un folio para darle seguimiento.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#reportar" className={buttonVariants({ variant: "paint", size: "xl" })}>
                <MapPinPlus aria-hidden /> Reportar un bache
              </a>
              <Link href="/mapa" className={buttonVariants({ variant: "light", size: "xl" })}>
                <MapIcon aria-hidden /> Ver baches reportados
              </Link>
            </div>
          </div>

          {stats && <StatsSign {...stats} />}
        </div>
        <div className="h-4 animate-lane lane-dashes" aria-hidden />
      </section>

      {/* ── Asistente ── */}
      <div id="reportar" className="mx-auto max-w-3xl scroll-mt-28 px-4 pb-14 pt-10">
        <DemoBanner />
        <ReportWizard authorityName={authorityName} authorityEmail={authorityEmail} />
      </div>

      {/* ── Qué pasa después ── */}
      <section className="border-t-2 border-linea bg-white" aria-labelledby="despues">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 id="despues" className="text-[2rem] font-extrabold leading-tight tracking-tight">
            ¿Qué pasa con tu reporte?
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {AFTER.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl border-2 border-linea bg-banqueta p-6">
                <span
                  className="absolute -top-4 left-6 flex size-8 items-center justify-center rounded-full border-2 border-asfalto bg-pintura font-extrabold"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <Icon className="mt-2 size-8 text-asfalto" aria-hidden />
                <h3 className="mt-3 text-xl font-extrabold">{title}</h3>
                <p className="mt-1 text-grava">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

/** Cifras en forma de letrero vial verde. */
function StatsSign({ total, urgent, fixed }: { total: number; urgent: number; fixed: number }) {
  const rows = [
    { label: "Baches reportados", value: total },
    { label: "Muy urgentes sin reparar", value: urgent },
    { label: "Ya reparados", value: fixed },
  ];
  return (
    <div className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
      <div className="rounded-2xl bg-letrero p-2 shadow-[0_18px_40px_-12px_rgb(0_0_0_/_0.6)]">
        <div className="rounded-xl border-[3px] border-white px-5 py-4">
          <p className="flex items-center justify-between gap-3 border-b-2 border-white/40 pb-2 text-lg font-extrabold">
            {CITY.shortName}
            <span className="rounded bg-white px-2 py-0.5 text-sm text-letrero">Al día</span>
          </p>
          <dl className="divide-y-2 divide-white/25">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-lg font-semibold">{r.label}</dt>
                <dd className="font-mono text-4xl font-bold tabular-nums">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {/* Postes del letrero */}
      <div className="mx-auto flex w-2/3 justify-between" aria-hidden>
        <span className="h-8 w-2.5 bg-[#8a9399]" />
        <span className="h-8 w-2.5 bg-[#8a9399]" />
      </div>
    </div>
  );
}
