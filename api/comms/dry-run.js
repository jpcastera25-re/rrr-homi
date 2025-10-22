// api/comms/dry-run.js
import { checkGates } from "../../lib/gates-helpers.js";

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    const body =
      method === "POST"
        ? typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body || {}
        : {};

    // ✅ Read from query string too (fixes GET ?to=... not being seen)
    const qp = req.query || {};
    const to = (body?.to ?? qp?.to ?? "").trim() || null;
    const channel = body?.channel ?? qp?.channel ?? "email";
    const msg = body?.msg ?? qp?.msg ?? "";

    const decision = await checkGates(to);

    return res.status(200).json({
      ok: true,
      note: "Dry-run only: no outbound call made",
      payload: { to: to || "(none)", channel, msg: msg || "(empty)" },
      ts: new Date().toISOString(),
      dryRun: true,
      diagnostics: decision?.diagnostics ?? {
        OUTBOUND: decision?.OUTBOUND,
        ALLOWLIST_count: decision?.ALLOWLIST_count,
        QUIET_HOURS: decision?.QUIET_HOURS,
        SEND_IMPL: decision?.SEND_IMPL,
      },
      decision: {
        wouldSend: !!decision?.wouldSend,
        reasons: decision?.reasons ?? [],
      },
    });
  } catch (err) {
    console.error("dry-run error:", err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
