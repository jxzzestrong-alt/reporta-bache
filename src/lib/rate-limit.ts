// Límite sencillo en memoria para frenar envíos repetidos desde una misma IP.
// En despliegues con varias instancias es aproximado, pero evita la mayoría del spam.

const hits = new Map<string, number[]>();

export function rateLimit(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    const retryInMs = windowMs - (now - recent[0]);
    return { ok: false, retryInMinutes: Math.ceil(retryInMs / 60000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryInMinutes: 0 };
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "desconocida"
  );
}
