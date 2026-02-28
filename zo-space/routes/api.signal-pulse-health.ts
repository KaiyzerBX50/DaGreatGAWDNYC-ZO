import type { Context } from "hono";

export default (c: Context) => {
  const raw = process.env.ZO_API_KEY;
  const pass = process.env.SIGNAL_PULSE_PASSCODE;

  const zoApiKeyLen = typeof raw === "string" ? raw.trim().length : 0;
  const passLen = typeof pass === "string" ? pass.trim().length : 0;
  const hasPassKey = Object.prototype.hasOwnProperty.call(process.env, "SIGNAL_PULSE_PASSCODE");

  return c.json({
    ok: true,
    server_time_iso: new Date().toISOString(),
    has_zo_api_key: zoApiKeyLen > 0,
    zo_api_key_length: zoApiKeyLen,
    has_passcode: passLen > 0,
    has_passcode_key: hasPassKey,
    passcode_length: passLen,
  });
};
