// api/comms/dry-run.js
import { checkGates } from "../../lib/gates-helpers.js";

export default async function handler(req, res) {
  const { to, msg, channel } = req.body || {};
  const now = new Date();

  // Use the shared helper
  const { diagnostics, decision } = checkGates(to);

  const safePreview = {
    to: to || "(none)",
    channel: channel || "email",
    msg: msg || "(empty)",
    ts: now.toISOString(),
    dryRun: true,
  };

  res.setHeader("content-type", "application/json; charset=utf-8");
  res.status(200).send(
    JSON.stringify({
      ok: true,
      note: "Dry-run only: no outbound call made",
      payload: safePreview,
      diagnostics,
      decision,
    })
  );
}

