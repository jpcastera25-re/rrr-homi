// api/comms/dry-run.js
export default async function handler(req, res) {
  const { to, msg, channel } = req.body || {};

  // --- Diagnostics (read-only; no enforcement) ---
  const OUTBOUND = String(process.env.OUTBOUND || "false").toLowerCase() === "true";
  const QUIET_HOURS = process.env.QUIET_HOURS || "22:00-08:00";
  const SEND_IMPL = process.env.SEND_IMPL || "MOCK";
  const ALLOWLIST_env = (process.env.ALLOWLIST || "").trim();
  const ALLOWLIST_count = ALLOWLIST_env
    ? ALLOWLIST_env.split(/[, \n\r\t]+/).filter(Boolean).length
    : 0;

  const safePreview = {
    to: to || "(none)",
    channel: channel || "email",
    msg: msg || "(empty)",
    ts: new Date().toISOString(),
    dryRun: true,
  };

  res.setHeader("content-type", "application/json; charset=utf-8");
  res.status(200).send(
    JSON.stringify({
      ok: true,
      note: "Dry-run only: no outbound call made",
      payload: safePreview,
      diagnostics: {
        OUTBOUND,
        ALLOWLIST_count,
        QUIET_HOURS,
        SEND_IMPL,
      },
    })
  );
}
