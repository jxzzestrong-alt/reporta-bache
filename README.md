# Reporta Bache · Ciudad Obregón

Plataforma ciudadana para reportar baches en Ciudad Obregón, Sonora. El vecino responde 4 preguntas (ubicación, gravedad, foto y detalles), recibe un folio `#BACHE-2026-001` con comprobante imprimible, y el reporte llega por correo a Atención Ciudadana de Cajeme con foto, enlace a Google Maps y a Street View.

**Tecnología:** Next.js (App Router) · Tailwind CSS 4 · Lucide · Leaflet (OpenStreetMap + satélite Esri, sin API key) · Supabase · Resend o SMTP.

---

## 1. Probarla en tu computadora (5 minutos)

Necesitas Node.js 20.9 o más reciente.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000. Sin configurar Supabase, la app arranca en **modo de prueba**: los reportes y fotos se guardan en la carpeta `.data/` y verás un aviso en pantalla.

> En la computadora, "Usar mi ubicación actual" funciona en `localhost`. Para probar desde el celular necesitas HTTPS (ver paso 4).

## 2. Conectar Supabase

1. Crea un proyecto gratis en https://supabase.com.
2. Ve a **SQL Editor**, pega todo el contenido de `supabase/schema.sql` y presiona **Run**. Esto crea:
   - la tabla `reports` con folio automático por año (`BACHE-2026-001`, `-002`…),
   - el bucket público `fotos-baches` para las fotos (máx. 5 MB),
   - permisos: cualquiera puede ver reportes, pero solo el servidor puede crearlos,
   - tiempo real para que el mapa ciudadano se actualice solo.
3. En **Project Settings → API Keys** copia a `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → la clave *anon* o *publishable*
   - `SUPABASE_SERVICE_ROLE_KEY` → la clave *service_role* o *secret* (**nunca** la publiques ni la subas a GitHub)
4. Reinicia `npm run dev`. El aviso de modo de prueba desaparece.

**Dar seguimiento:** en Supabase → Table Editor → `reports`, cambia la columna `status` a `en_proceso` o `reparado`. El cambio aparece en el mapa ciudadano al instante.

## 3. Activar el envío automático de correos

Todo está listo; solo faltan tus claves. Mientras tanto los reportes se guardan normalmente y el comprobante indica que el envío está pendiente.

### Opción A — Resend (recomendada)

1. Crea una cuenta en https://resend.com y **verifica un dominio propio** (Domains → Add Domain).
   Sin dominio verificado, Resend solo permite enviar a tu propio correo, así que no llegaría a `cajeme.gob.mx`.
2. Crea una API key y llena en `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM="Reporta Bache Obregón <reportes@tudominio.com>"
EMAIL_SEND_ENABLED=true
```

### Opción B — SMTP (Gmail, Outlook, servidor propio)

Deja `RESEND_API_KEY` vacío y llena `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Con Gmail usa una *contraseña de aplicación*.

### Prueba primero contigo

Antes de activar el envío real, pon **tu correo** en `AUTHORITY_EMAIL`, envía un reporte de prueba y revisa cómo llega. Cuando todo esté bien, regresa el valor a `atencionciudadana@cajeme.gob.mx`.

Es buena idea avisarle a Atención Ciudadana de Cajeme que recibirán estos reportes, para que no los filtren como spam.

## 4. Publicarla en internet (Vercel)

1. Sube el proyecto a un repositorio de GitHub (el `.gitignore` ya excluye `.env.local` y `.data/`).
2. En https://vercel.com → **Add New Project** → elige el repositorio.
3. En **Environment Variables** copia todas las variables de tu `.env.local` y cambia `NEXT_PUBLIC_SITE_URL` por tu dominio final (por ejemplo `https://reportabache.vercel.app`).
4. Deploy. Vercel da HTTPS automáticamente, así que la ubicación por GPS y la cámara funcionan desde cualquier celular.

> El modo de prueba no sirve en Vercel (su disco no es permanente). En producción, Supabase es obligatorio.

## 5. Cuando consigas la API key de Google Maps

Agrega `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` y Street View se mostrará **dentro** de la app en lugar de abrir Google Maps en otra pestaña. En Google Cloud activa **Maps Embed API** y restringe la clave a tu dominio (HTTP referrers).

---

## Variables de entorno

| Variable | Para qué sirve |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública; se usa en correos y en el QR del comprobante |
| `NEXT_PUBLIC_MAP_CENTER_LAT/LNG`, `NEXT_PUBLIC_MAP_ZOOM` | Centro del mapa (ya configurado en Ciudad Obregón) |
| `NEXT_PUBLIC_REPORT_MAX_DISTANCE_KM` | Rechaza reportes a más de X km del centro (40 por defecto, cubre Cajeme) |
| `AUTHORITY_EMAIL`, `AUTHORITY_NAME`, `AUTHORITY_EMAIL_CC` | A quién se envía cada reporte |
| `EMAIL_SEND_ENABLED` | Interruptor general del correo (`true` / `false`) |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | Remitente y dirección de respuesta |
| `RESEND_API_KEY` o `SMTP_*` | Proveedor de correo |
| `NOMINATIM_CONTACT_EMAIL` | Tu correo de contacto para el servicio gratuito de direcciones de OpenStreetMap |

## Cómo está organizado

```
supabase/schema.sql              Base de datos, folios, permisos, bucket y tiempo real
src/app/page.tsx                 Pantalla principal: asistente de reporte
src/app/mapa/page.tsx            Mapa ciudadano de reportes
src/app/reporte/[folio]/         Comprobante imprimible con código QR
src/app/api/reports/             Guarda el reporte y envía el correo
src/app/api/geocode/             Búsqueda de direcciones y dirección aproximada (OpenStreetMap)
src/components/wizard/           Los 4 pasos del asistente
src/components/map/              Mapas, capas satélite y pines por urgencia
src/lib/email.ts                 Diseño del correo para las autoridades
src/lib/store.ts                 Guardado en Supabase o en modo de prueba
```

## Protección contra abusos

- Máximo 5 reportes por cada 10 minutos desde la misma conexión.
- Campo oculto anti-bots.
- Solo se aceptan fotos JPG, PNG o WebP reales (se revisa el contenido del archivo) de hasta 5 MB; el navegador las reduce antes de subirlas.
- Se rechazan ubicaciones fuera del municipio.
- No se piden datos personales del ciudadano.

## Servicios gratuitos y sus límites

- **Mapa de calles:** OpenStreetMap. Para mucho tráfico conviene un proveedor de mosaicos (MapTiler, Stadia, etc.).
- **Satélite:** Esri World Imagery.
- **Direcciones:** Nominatim de OpenStreetMap, máximo ~1 búsqueda por segundo. La app solo busca cuando el usuario presiona "Buscar".
