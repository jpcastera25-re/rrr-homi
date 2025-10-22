export default function handler(req, res) {
  const envs = {
    OUTBOUND: process.env.OUTBOUND,
    ALLOWLIST: process.env.ALLOWLIST,
    QUIET_HOURS: process.env.QUIET_HOURS,
    SEND_IMPL: process.env.SEND_IMPL,
  };
  res.status(200).json({ ok: true, envs, raw: process.env.ALLOWLIST });
}
