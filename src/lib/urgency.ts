import type { Urgency } from "./types";

export interface UrgencyInfo {
  value: Urgency;
  label: string;
  description: string;
  /** Color sólido del nivel (pin, franja) */
  color: string;
  /** Color de texto sobre `color` con contraste AA */
  onColor: string;
  /** Fondo suave para tarjetas y etiquetas */
  soft: string;
  emailTag: string;
}

export const URGENCY: Record<Urgency, UrgencyInfo> = {
  muy_urgente: {
    value: "muy_urgente",
    label: "Muy urgente",
    description: "Peligro de accidente: bache profundo o calle colapsada",
    color: "#C1121F",
    onColor: "#FFFFFF",
    soft: "#FDE8EA",
    emailTag: "MUY URGENTE",
  },
  urgente: {
    value: "urgente",
    label: "Urgente",
    description: "Daño considerable que estorba o desvía el tráfico",
    color: "#C2410C",
    onColor: "#FFFFFF",
    soft: "#FDEDE3",
    emailTag: "URGENTE",
  },
  no_urgente: {
    value: "no_urgente",
    label: "No muy urgente",
    description: "Desgaste superficial o bache pequeño",
    color: "#EAB308",
    onColor: "#1B2125",
    soft: "#FDF6D8",
    emailTag: "NO MUY URGENTE",
  },
};

export const URGENCY_ORDER: Urgency[] = ["muy_urgente", "urgente", "no_urgente"];

export function isUrgency(value: unknown): value is Urgency {
  return typeof value === "string" && value in URGENCY;
}
