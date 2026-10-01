import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Loghi degli sponsor caricati nello Storage di Supabase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        // La pagina Eventi non c'è più: gli eventi ora stanno nella Home.
        // Chi ha ancora il vecchio link finisce lì invece che su un 404.
        source: "/eventi",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Il service worker non deve essere messo in cache dal browser,
        // così gli aggiornamenti arrivano subito.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
