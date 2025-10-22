// api/comms/send.js
const parseAllowlist = (raw) =>
  (raw || "")
    .split(/[, \n\r\t]+/g)
    .map(s => s.trim())
    .filter(Boolean);

const parseQuiet = (qh) => {
  const m = (qh || "22:00-08:00").match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  const def = { start: 22 * 60, end: 8 * 60, str: qh || "22:00-08:00" };
  if (!m) return def;
  return {
    start: (+m[1]) * 60 + (+m[2]),
    end:   (+m[3]) * 60 + (+m[4]),
    str:   qh || "22:00-08:00",
  };
};
const nowMins = () => { const d = new Date(); return d.getHours()*60 + d.getMinutes(); };
const isWithin = (mins, q) => q.start === q.end
  ? false
  : (q.start < q.end ? (mins >= q.start && mins < q.end)
                     : (mins >= q.start || mins < q.end));

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    const body = method === "POST"
      ? (typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {}))
      : {};
    const qp = req.query || {};
    const to = (body.to ?? qp.to ?? "").trim();
    const channel = (body.channel ?? qp.channel ?? "email").trim();
    const msg = (body.msg ?? qp.msg ?? "").toString();

    // --- read envs
    const OUTBOUND = String(process.env.OUTBOUND ?? "false").toLowerCase() === "true";
    const QUIET = parseQuiet(process.env.QUIET_HOURS || "22:00-08:00");
    const SEND_IMPL = process.env.SEND_IMPL || "MOCK";
    const ALLOWLIST = parseAllowlist(
      process.env.ALLOWLIST_FORCE || process.env.ALLOWLIST || ""
    );

    // --- evaluate gates (no helper; no network)
    const allowed = !!to && ALLOWLIST.includes(to);
    const quiet = isWithin(nowMins(), QUIET);
    const wouldSend = OUTBOUND && allowed && !quiet;

    // --- optional mock log
    if (wouldSend && method === "POST") {
      console.log("MOCK SEND →", to, { channel, msg });
    }

    return res.status(200).json({
      ok: true,
      mode: "SIMULATION",
      diagnostics: {
        OUTBOUND,
        ALLOWLIST_count: ALLOWLIST.length,
        isAllowed: allowed,
        QUIET_HOURS: QUIET.str,
        isQuiet: quiet,
        SEND_IMPL,
      },
      decision: { wouldSend, reasons: [
        ...(!OUTBOUND ? ["OUTBOUND=false"] : []),
        ...(quiet ? [`within QUIET_HOURS ${QUIET.str}`] : []),
        ...(!allowed ? ["recipient not in ALLOWLIST"] : []),
      ]},
      payload: { to: to || "(none)", channel, msg: msg || "(empty)" }
    });
  } catch (err) {
    console.error("send.js error:", err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
