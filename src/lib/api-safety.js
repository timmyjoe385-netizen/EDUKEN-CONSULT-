// Client-side preview safety rail only; server-side authorization remains required.
export const PRODUCTION_ORIGIN = 'https://eduken-consult.workers.dev';

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const shouldBlockWrite = (origin, method = 'GET') =>
  origin !== PRODUCTION_ORIGIN &&
  !READ_ONLY_METHODS.has(String(method || 'GET').toUpperCase());
