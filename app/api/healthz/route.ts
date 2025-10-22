// app/api/healthz/route.ts
export const runtime = 'edge'; // ok to keep or remove; edge = faster cold start
export const dynamic = 'force-dynamic'; // don't cache

export async function GET() {
  const payload = {
    ok: true,
    service: 'RRR',
    env: process.env.VERCEL_ENV || 'unknown',
    ts: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
