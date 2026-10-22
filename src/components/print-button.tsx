"use client";

import { Printer } from "lucide-react";
import { Button } from "./ui/button";

export function PrintButton() {
  return (
    <Button variant="paint" size="lg" className="w-full" onClick={() => window.print()}>
      <Printer aria-hidden /> Guardar como PDF o imprimir
    </Button>
  );
}
