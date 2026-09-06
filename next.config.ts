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
};

export default nextConfig;
