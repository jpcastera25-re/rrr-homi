// lib/gates-helpers.js
function parseQuietHours(qh) {
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

export function checkGates(to, env = process.env) {
  const OUTBOUND = String(env.OUTBOUND || "false").toLowerCase() === "true";
  const QUIET_HOURS_STR = env.QUIET_HOURS || "22:00-08:00";
  const SEND_IMPL = env.SEND_IMPL || "MOCK";
  const ALLOWLIST_ENV = (env.ALLOWLIST || "").trim();
  const ALLOWLIST = ALLOWLIST_ENV ? ALLOWLIST_ENV.split(/[, \\n\\r\\t]+/).filter(Boolean) : [];
  const ALLOWLIST_count = ALLOWLIST.length;

  const qh = parseQuietHours(QUIET_HOURS_STR);
  const nowMins = minutesNow();
  const isQuiet = (nowMins >= qh.startMins || nowMins < qh.endMins) && qh.startMins > qh.endMins
    ? true
    : nowMins >= qh.startMins && nowMins < qh.endMins;

  const isAllowed = to ? ALLOWLIST.includes(String(to).trim()) : false;

  const reasons = [];
  if (!OUTBOUND) reasons.push("OUTBOUND=false");
  if (isQuiet) reasons.push(`within QUIET_HOURS (${QUIET_HOURS_STR})`);
  if (!isAllowed) reasons.push("recipient not in ALLOWLIST");

  const wouldSend = OUTBOUND && !isQuiet && isAllowed;

  return {
    diagnostics: { OUTBOUND, ALLOWLIST_count, QUIET_HOURS: QUIET_HOURS_STR, SEND_IMPL },
    decision: { wouldSend, reasons },
  };
}
