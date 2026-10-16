export const PRODUCTION_ORIGIN = "https://eduken-consult.timmyjoe385.workers.dev";

// Client-side preview guard only. Server-side authorization remains required.
export function isUnisolatedPreviewOrigin(origin) {
  return origin !== PRODUCTION_ORIGIN;
}
