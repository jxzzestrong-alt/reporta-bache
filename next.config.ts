import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer usa módulos nativos de Node; se deja fuera del bundle del servidor.
  serverExternalPackages: ["nodemailer"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permite geolocalización y cámara solo en este mismo sitio.
          { key: "Permissions-Policy", value: "geolocation=(self), camera=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
