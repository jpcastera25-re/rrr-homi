// api/echo.js
export default async function handler(req, res) {
  // Only echo safe, non-sensitive bits
  const safeHeaders = {};
  // Whitelist a couple of innocuous headers for demo
  ['host','user-agent','accept'].forEach(h => {
    if (req.headers[h]) safeHeaders[h] = req.headers[h];
  });

  const body = (req.method === 'GET') ? null : (req.body ?? null);

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(200).send(JSON.stringify({
    ok: true,
    method: req.method,
    query: req.query || {},
    headers: safeHeaders,
    body,
    ts: new Date().toISOString(),
  }));
}
