// api/comms/send.js
import { checkGates } from "../../lib/gates-helpers.js";

const MODE = "SIMULATION";

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    const body =
      method === "POST"
        ? typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body || {}
        : {};

    const to = body?.to;            // e.g., "test@example.com"
    const channel = body?.channel;  // e.g., "email" | "sms"
    const msg = body?.msg;          // e.g., "Hello"

    // Gate evaluation (no network calls)
    const decision = await checkGates(to);

    // When gates pass and it's a POST, log a mock "send" to the server console
    if (decision?.wouldSend === true && method === "POST") {
      console.log("MOCK SEND →", to, { channel, msg });
    }

    return res.status(200).json({
      ok: true,
      mode: MODE,
      diagnostics: decision?.diagnostics ?? decision,
      decision: {
        wouldSend: !!decision?.wouldSend,
        reasons: decision?.reasons ?? [],
      },
    });
  } catch (err) {
    console.error("send.js error:", err);
    return res
      .status(500)
      .json({ ok: false, mode: MODE, error: String(err?.message || err) });
  }
}
