// api/healthz.js
export default function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(200).send(JSON.stringify({
    ok: true,
    service: 'RRR',
    env: process.env.VERCEL_ENV || 'unknown',
    ts: new Date().toISOString(),
  }));
}
