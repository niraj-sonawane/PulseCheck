import axios from "axios";

/**
 * All API requests use a relative /api base URL.
 *
 * In production:  Next.js rewrites /api/* → Render backend (see next.config.ts)
 *                 Cookie is stored for pulsecheck.vercel.app (first-party, same-origin)
 *
 * In development: Next.js rewrites /api/* → http://localhost:5000/api/*
 *                 Cookie is stored for localhost (same-origin)
 *
 * withCredentials: true ensures the cookie is included on every request.
 */
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});