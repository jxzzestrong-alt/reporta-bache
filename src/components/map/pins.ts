import L from "leaflet";
import type { Urgency } from "@/lib/types";
import { URGENCY } from "@/lib/urgency";

const PIN_PATH =
  "M18 1C8.6 1 1 8.6 1 18c0 12.4 14.6 25.8 16.1 27.2a1.3 1.3 0 0 0 1.8 0C20.4 43.8 35 30.4 35 18 35 8.6 27.4 1 18 1z";

function pinSvg(fill: string, inner: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
    <path d="${PIN_PATH}" fill="${fill}" stroke="#1b2125" stroke-width="2"/>
    ${inner}
  </svg>`;
}

const cache = new Map<string, L.DivIcon>();

/** Pin del color de la urgencia para el mapa ciudadano. */
export function urgencyIcon(urgency: Urgency, selected = false) {
  const key = `${urgency}-${selected}`;
  let icon = cache.get(key);
  if (!icon) {
    const u = URGENCY[urgency];
    icon = L.divIcon({
      className: `pin-icon${selected ? " pin-selected" : ""}`,
      html: `<span class="pin-drop">${pinSvg(u.color, `<circle cx="18" cy="18" r="6.5" fill="${u.onColor}"/>`)}</span>`,
      iconSize: [36, 46],
      iconAnchor: [18, 45],
      popupAnchor: [0, -40],
    });
    cache.set(key, icon);
  }
  return icon;
}

/** Pin del punto que el ciudadano está marcando (negro con aro amarillo). */
export const pickerIcon = L.divIcon({
  className: "pin-icon",
  html: pinSvg(
    "#1b2125",
    `<circle cx="18" cy="18" r="8" fill="#ffc72c"/><circle cx="18" cy="18" r="3.5" fill="#1b2125"/>`,
  ),
  iconSize: [36, 46],
  iconAnchor: [18, 45],
});
