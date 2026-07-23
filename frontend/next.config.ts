import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Rewrite all /api/* requests through the Next.js server to the Express backend.
   *
   * WHY THIS EXISTS:
   * Without this, the browser makes requests directly from pulsecheck.vercel.app
   * to pulsecheck.onrender.com — a cross-origin request. Browsers block
   * cross-origin cookies (SameSite restrictions, third-party cookie phase-out).
   *
   * WITH this rewrite:
   * - Browser requests go to pulsecheck.vercel.app/api/* (same origin)
   * - Next.js server-side proxies them to the Express backend on Render
   * - The JWT cookie is attributed to pulsecheck.vercel.app (first-party)
   * - The browser sends the cookie on every subsequent request automatically
   * - No SameSite issues, no third-party cookie blocks
   *
   * ENVIRONMENT VARIABLE:
   * Set BACKEND_URL in Vercel dashboard:
   *   BACKEND_URL=https://pulsecheck-flfd.onrender.com
   *
   * For local development, set in .env.local:
   *   BACKEND_URL=http://localhost:5000
   */
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
