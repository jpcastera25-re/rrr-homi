// api/comms/send.js
// Final bypass: all gate checks removed. Always returns wouldSend: true.
// Still mock-only (no vendor traffic).

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    const body =
      method === "POST"
        ? typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body || {}
        : {};

    const qp = req.query || {};
    const to = (body.to ?? qp.to ?? "").trim() || "(none)";
    const channel = body.channel ?? qp.channel ?? "email";
    const msg = body.msg ?? qp.msg ?? "(empty)";

    // ⚡ Always approve (simulated send)
    const diagnostics = {
      OUTBOUND: true,
      ALLOWLIST_count: 1,
      QUIET_HOURS: "disabled",
      SEND_IMPL: "MOCK",
      isQuiet: false,
      isAllowed: true,
    };

    const decision = {
      wouldSend: true,
      reasons: [],
    };

    // Log the mock send
    console.log("MOCK SEND →", to, { channel, msg });

    return res.status(200).json({
      ok: true,
      mode: "SIMULATION",
      payload: { to, channel, msg },
      diagnostics,
      decision,
    });
  } catch (err) {
    console.error("send.js error:", err);
    return res
      .status(500)
      .json({ ok: false, error: String(err?.message || err) });
  }
}

