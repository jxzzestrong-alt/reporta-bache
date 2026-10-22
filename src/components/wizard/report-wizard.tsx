"use client";

import { ArrowLeft, ArrowRight, LoaderCircle, Send, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Report } from "@/lib/types";
import { Button } from "../ui/button";
import { ReportSuccess } from "./report-success";
import { RoadProgress } from "./road-progress";
import { StepDetails } from "./step-details";
import { isOutsideCity, StepLocation } from "./step-location";
import { StepPhoto } from "./step-photo";
import { StepReview } from "./step-review";
import { StepUrgency } from "./step-urgency";
import { STEPS, type ReportDraft } from "./types";

const EMPTY: ReportDraft = { location: null, urgency: null, photo: null, comment: "" };
const LAST = STEPS.length - 1;

export function ReportWizard({ authorityName, authorityEmail }: { authorityName: string; authorityEmail: string }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [maxReached, setMaxReached] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(EMPTY);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Report | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastView = useRef(`${0}-false`);

  // Al cambiar de paso: subir al inicio del asistente y mover el foco al título.
  useEffect(() => {
    const view = `${step}-${Boolean(result)}`;
    if (view === lastView.current) return;
    lastView.current = view;
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    (result ? document.getElementById("exito") : headingRef.current)?.focus({ preventScroll: true });
  }, [step, result]);

  const update = <K extends keyof ReportDraft>(key: K, value: ReportDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setHint(null);
  };

  const problem = (i: number): string | null => {
    if (i === 0) {
      if (!draft.location) return "Marca dónde está el bache: usa tu ubicación, busca la dirección o toca el mapa.";
      if (isOutsideCity(draft.location)) return "El punto marcado está fuera del municipio. Muévelo a la calle correcta.";
    }
    if (i === 1 && !draft.urgency) return "Elige qué tan grave es el bache.";
    if (i === 2) {
      if (photoBusy) return "Espera un momento: la foto se está preparando.";
      if (!draft.photo) return "Agrega una foto del bache para que las autoridades puedan verlo.";
    }
    return null;
  };

  const goTo = (i: number) => {
    setHint(null);
    setSubmitError(null);
    setDir(i >= step ? 1 : -1);
    setStep(i);
    setMaxReached((m) => Math.max(m, i));
  };

  const next = () => {
    const p = problem(step);
    if (p) {
      setHint(p);
      return;
    }
    goTo(step + 1);
  };

  const submit = async () => {
    for (let i = 0; i < LAST; i++) {
      const p = problem(i);
      if (p) {
        goTo(i);
        setHint(p);
        return;
      }
    }
    const { location, urgency, photo, comment } = draft;
    if (!location || !urgency || !photo) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSubmitError("No tienes conexión a internet. Tu reporte sigue aquí: conéctate y vuelve a tocar «Enviar reporte».");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.set("lat", String(location.lat));
      fd.set("lng", String(location.lng));
      if (location.address) fd.set("address", location.address);
      fd.set("urgency", urgency);
      fd.set("comment", comment.trim());
      fd.set("photo", new File([photo.blob], "bache.jpg", { type: "image/jpeg" }));
      fd.set("website", honeypot.current?.value ?? "");

      const res = await fetch("/api/reports", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { report?: Report; error?: string };
      if (!res.ok || !data.report) {
        throw new Error(data.error || "No pudimos enviar tu reporte. Revisa tu conexión e intenta de nuevo.");
      }
      setResult(data.report);
    } catch (err) {
      const msg = (err as Error).message;
      setSubmitError(
        msg === "Failed to fetch"
          ? "Se perdió la conexión al enviar. Tu reporte sigue aquí: intenta de nuevo."
          : msg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    if (draft.photo) URL.revokeObjectURL(draft.photo.previewUrl);
    setDraft(EMPTY);
    setResult(null);
    setStep(0);
    setMaxReached(0);
  };

  if (result) {
    return (
      <div ref={topRef} className="scroll-mt-4">
        <ReportSuccess report={result} authorityName={authorityName} onNew={reset} />
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div ref={topRef} className="scroll-mt-4">
      <RoadProgress step={step} maxReached={maxReached} onJump={goTo} />

      <section
        className="mt-5 overflow-x-clip rounded-2xl border-2 border-asfalto bg-white shadow-[0_6px_0_0_var(--color-asfalto)]"
        aria-labelledby="titulo-paso"
      >
        <header className="px-5 pt-5 sm:px-8 sm:pt-7">
          <p className="text-[0.95rem] font-semibold text-grava">
            {step < LAST ? `Paso ${step + 1} de ${LAST}` : "Último paso"}
          </p>
          <h2
            id="titulo-paso"
            ref={headingRef}
            tabIndex={-1}
            key={`t-${step}`}
            className={`mt-1 text-[1.75rem] font-extrabold leading-tight tracking-tight outline-none sm:text-[2.125rem] ${dir > 0 ? "animate-step-in" : "animate-step-back"}`}
          >
            {current.title}
          </h2>
        </header>

        <div
          key={step}
          className={`px-5 py-5 sm:px-8 sm:py-6 ${dir > 0 ? "animate-step-in" : "animate-step-back"}`}
        >
          {step === 0 && <StepLocation value={draft.location} onChange={(v) => update("location", v)} />}
          {step === 1 && <StepUrgency value={draft.urgency} onChange={(v) => update("urgency", v)} />}
          {step === 2 && (
            <StepPhoto value={draft.photo} onChange={(v) => update("photo", v)} onProcessing={setPhotoBusy} />
          )}
          {step === 3 && <StepDetails value={draft.comment} onChange={(v) => update("comment", v)} />}
          {step === 4 && (
            <StepReview draft={draft} goTo={goTo} authorityName={authorityName} authorityEmail={authorityEmail} />
          )}

          {/* Campo trampa anti-spam: invisible para las personas */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              No llenar
              <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </div>

        {/* Navegación: fija abajo en el celular para tenerla siempre a la mano */}
        <div className="sticky bottom-0 z-[1100] rounded-b-2xl border-t-2 border-linea bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          {(hint || submitError) && (
            <p role="alert" className="mb-3 flex gap-2 font-semibold text-alerta">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
              {hint || submitError}
            </p>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" size="lg" onClick={() => goTo(step - 1)} disabled={submitting} className="px-4">
                <ArrowLeft aria-hidden /> <span className="hidden sm:inline">Atrás</span>
                <span className="sr-only sm:hidden">Atrás</span>
              </Button>
            )}
            {step < LAST ? (
              <Button size="lg" className="flex-1" onClick={next}>
                {step === 3 ? (draft.comment.trim() ? "Continuar" : "Omitir y continuar") : "Continuar"}
                <ArrowRight aria-hidden />
              </Button>
            ) : (
              <Button variant="paint" size="lg" className="flex-1" onClick={submit} disabled={submitting}>
                {submitting ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
                {submitting ? "Enviando reporte…" : "Enviar reporte"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
