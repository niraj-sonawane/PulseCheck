import axios from "axios";

/**
 * All API calls use a relative /api path.
 *
 * next.config.ts rewrites /api/* → Express backend (Render) via the Next.js server.
 * This means every request is same-origin from the browser's perspective.
 * The JWT cookie is stored for the Vercel domain (first-party) and sent
 * automatically — no cross-origin cookie issues, no SameSite restrictions.
 */
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});