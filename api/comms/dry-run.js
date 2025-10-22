// api/comms/dry-run.js
export default async function handler(req, res) {
  const { to, msg, channel } = req.body || {};
  const safePreview = {
    to: to || "(none)",
    channel: channel || "email",
    msg: msg || "(empty)",
    ts: new Date().toISOString(),
    dryRun: true,
  };
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(200).send(JSON.stringify({
    ok: true,
    note: "Dry-run only: no outbound call made",
    payload: safePreview,
  }));
}
