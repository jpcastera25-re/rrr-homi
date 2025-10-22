// api/comms/dry-run.js
function parseQuietHours(qh) {
  // "HH:MM-HH:MM" -> {startMins, endMins}
  const def = { startMins: 22 * 60, endMins: 8 * 60 };
  if (!qh) return def;
  const m = qh.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!m) return def;
  const startMins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const endMins = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
  return { startMins, endMins };
}

function minutesNow(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function withinQuietHours(nowMins, qh) {
  // supports windows that cross midnight
  const { startMins, endMins } = qh;
  if (startMins <= endMins) {
    return nowMins >= startMins && nowMins < endMins;
  } else {
    return nowMins >= startMins || nowMins < endMins;
  }
}

export default async function handler(req, res) {
  const { to, msg, channel } = req.body || {};

  // --- Diagnostics (read-only; no enforcement) ---
  const OUTBOUND = String(process.env.OUTBOUND || "false").toLowerCase() === "true";
  const QUIET_HOURS_STR = process.env.QUIET_HOURS || "22:00-08:00";
  const SEND_IMPL = process.env.SEND_IMPL || "MOCK";
  const ALLOWLIST_ENV = (process.env.ALLOWLIST || "").trim();
  const ALLOWLIST = ALLOWLIST_ENV
    ? ALLOWLIST_ENV.split(/[, \n\r\t]+/).filter(Boolean)
    : [];
  const ALLOWLIST_count = ALLOWLIST.length;

  // --- Enforcement prep (evaluation only; still dry-run) ---
  const now = new Date();
  const qh = parseQuietHours(QUIET_HOURS_STR);
  const nowMins = minutesNow(now);
  const isQuiet = withinQuietHours(nowMins, qh);
  const isAllowed = to ? ALLOWLIST.includes(String(to).trim()) : false;

  const reasons = [];
  if (!OUTBOUND) reasons.push("OUTBOUND=false");
  if (isQuiet) reasons.push(`within QUIET_HOURS (${QUIET_HOURS_STR})`);
  if (!isAllowed) reasons.push("recipient not in ALLOWLIST");
  const wouldSend = OUTBOUND && !isQuiet && isAllowed;

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
      diagnostics: {
        OUTBOUND,
        ALLOWLIST_count,
        QUIET_HOURS: QUIET_HOURS_STR,
        SEND_IMPL,
      },
      decision: {
        wouldSend,
        reasons, // empty array means all gates clear
      },
    })
  );
}
