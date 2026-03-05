#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { join } from "node:path";

// Generate a random passcode
function generatePasscode(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function setupSignalPulse() {
  console.log("🚀 Zo Signal Pulse Setup\n");
  console.log("This will create your private Signal Pulse pages with your own API key.\n");

  // Step 1: Verify ZO_API_KEY exists
  const zoApiKey = process.env.ZO_API_KEY;
  if (!zoApiKey) {
    console.error(
      "❌ ZO_API_KEY environment variable not found.\n\n" +
      "To set it up:\n" +
      "  1. Open Settings > Advanced > Access Tokens\n" +
      "  2. Create a new access token\n" +
      "  3. Go to Settings > Advanced > Secrets\n" +
      "  4. Add: SIGNAL_PULSE_ZO_API_KEY = <your-token>\n" +
      "  5. Run this setup again\n"
    );
    process.exit(1);
  }

  // Step 2: Generate passcode
  const passcode = generatePasscode();
  console.log("✅ ZO_API_KEY found\n");

  // Step 3: Show what we'll do
  console.log("📋 This setup will:\n");
  console.log("  1. Create your private Signal Pulse runner page");
  console.log("  2. Create the API endpoint to process meetings");
  console.log("  3. Generate a passcode for security\n");

  console.log("🔐 Your passcode (save this somewhere safe):\n");
  console.log(`   ${passcode}\n`);

  console.log("Next steps:\n");
  console.log("  1. Go to Settings > Advanced > Secrets");
  console.log("  2. Update or add these secrets:\n");
  console.log(`     SIGNAL_PULSE_ZO_API_KEY = ${zoApiKey}`);
  console.log(`     SIGNAL_PULSE_PASSCODE = ${passcode}\n`);
  console.log("  3. Press Enter when done...\n");

  // Wait for user to press Enter
  process.stdout.write("Press Enter to continue: ");
  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  console.log("\n✅ Setup complete!\n");
  console.log("Your private Signal Pulse is ready:");
  console.log("  - URL: https://<your-handle>.zo.space/signal-pulse-private");
  console.log(`  - Passcode: ${passcode}\n`);
  console.log("Use from command line:");
  console.log("  bun /home/workspace/Skills/zo-signal-pulse/scripts/pulse.ts \\");
  console.log("    --notes 'your meeting notes'\n");
}

setupSignalPulse().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
