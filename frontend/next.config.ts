import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Proxy all /api/* requests through the Next.js server to the Express backend.
   *
   * WHY: Vercel (frontend) and Render (backend) are different domains.
   * Browsers block cookies on cross-origin requests (SameSite policy,
   * third-party cookie deprecation). This rewrite makes every API call
   * appear same-origin to the browser — the cookie is stored for the
   * Vercel domain and sent automatically on every subsequent request.
   *
   * HOW IT USES YOUR EXISTING ENV VAR:
   * NEXT_PUBLIC_API_URL=https://pulsecheck-flfd.onrender.com/api
   * This strips the /api suffix → https://pulsecheck-flfd.onrender.com
   * Then rewrites /api/:path* → https://pulsecheck-flfd.onrender.com/api/:path*
   *
   * No new environment variables are needed.
   */
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    // Strip trailing /api (with or without trailing slash)
    const backendBase = apiUrl.replace(/\/api\/?$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
