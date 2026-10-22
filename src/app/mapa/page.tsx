import type { Metadata } from "next";
import { CitizenMap } from "@/components/citizen-map";
import { DemoBanner } from "@/components/demo-banner";
import { listReports, publicSupabaseConfig } from "@/lib/store";
import type { Report } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mapa ciudadano de baches",
  description: "Consulta los baches que tus vecinos ya reportaron, con foto, ubicación y nivel de urgencia.",
};

export default async function MapaPage({ searchParams }: { searchParams: Promise<{ folio?: string }> }) {
  const { folio } = await searchParams;
  let reports: Report[] = [];
  let loadError = false;
  try {
    reports = await listReports();
  } catch (err) {
    console.error("[mapa]", err);
    loadError = true;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 [&>p]:mb-0 [&>p]:mt-4 empty:hidden">
        <DemoBanner />
      </div>
      {loadError && (
        <p role="alert" className="mx-auto mt-4 max-w-6xl px-4 font-semibold text-alerta">
          No pudimos cargar los reportes guardados. El mapa mostrará los nuevos en cuanto lleguen.
        </p>
      )}
      <CitizenMap initialReports={reports} initialFolio={folio} realtime={publicSupabaseConfig()} />
    </>
  );
}
