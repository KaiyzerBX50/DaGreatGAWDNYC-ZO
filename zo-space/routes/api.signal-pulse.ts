import type { Context } from "hono";

export default (c: Context) => {
  return c.json(
    {
      error: "Public Signal Pulse API is disabled to prevent accidental credit usage.",
      use_instead: {
        public_prompt_generator: "https://dagawdnyc.zo.space/signal-pulse",
        private_runner: "https://dagawdnyc.zo.space/signal-pulse-private",
      },
    },
    410
  );
};
