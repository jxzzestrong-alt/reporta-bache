import { DemoBanner } from "@/components/demo-banner";
import { ReportWizard } from "@/components/wizard/report-wizard";
import { CITY } from "@/lib/config";

export default function HomePage() {
  const authorityName = process.env.AUTHORITY_NAME || "Atención Ciudadana del municipio";
  const authorityEmail = process.env.AUTHORITY_EMAIL || "";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:pt-10">
      <DemoBanner />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[2.75rem]">
          Reporta un bache en {CITY.shortName}
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg text-grava">
          Cuatro preguntas rápidas. Tu reporte llega a Atención Ciudadana con foto y ubicación exacta, y recibes un folio
          para darle seguimiento.
        </p>
      </div>
      <ReportWizard authorityName={authorityName} authorityEmail={authorityEmail} />
    </div>
  );
}
