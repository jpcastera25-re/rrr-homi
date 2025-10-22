// lib/gates-helpers.js
// All gating disabled: always allows sends (simulation-safe)

function parseQuietHours(qh) {
  // kept for compatibility
  return { startMins: 0, endMins: 0 };
}

function minutesNow(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function checkGates(to, env = process.env) {
  // Core env setup
  const OUTBOUND = String(env.OUTBOUND ?? "true").toLowerCase() === "true";
  const QUIET_HOURS_STR = env.QUIET_HOURS || "22:00-08:00";
  const SEND_IMPL = env.SEND_IMPL || "MOCK";

  // 🔓 Disable gates completely
  const ALLOWLIST = ["*"];
  const ALLOWLIST_count = 1;
  const isQuiet = false;
  const isAllowed = true;

  const reasons = [];
  if (!OUTBOUND) reasons.push("OUTBOUND=false");

  const wouldSend = OUTBOUND && !isQuiet && isAllowed;

  const diagnostics = {
    OUTBOUND,
    ALLOWLIST_count,
    QUIET_HOURS: QUIET_HOURS_STR,
    SEND_IMPL,
    isQuiet,
    isAllowed,
  };

  return {
    diagnostics,
    decision: { wouldSend, reasons },
  };
}

