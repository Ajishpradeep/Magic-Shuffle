/**
 * Restricts CORS to same-origin, loopback, and an optional allow-list from env.
 */
export function createCorsMiddleware(extraOrigins) {
  return (req, res, next) => {
    const origin = req.get('Origin');
    if (isAllowedOrigin(origin, extraOrigins)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return isAllowedOrigin(origin, extraOrigins) ? res.sendStatus(204) : res.sendStatus(403);
    }
    next();
  };
}

function isAllowedOrigin(origin, extraOrigins) {
  if (!origin) return true;
  if (extraOrigins.includes(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'http:' && ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}
