#!/usr/bin/env bun
/**
 * Sentiment Analysis Only
 * Analyzes sentiment of existing zo-desk data
 */

import { readFileSync, writeFileSync } from "fs";

const dataPath = "/home/workspace/zo-desk-latest.json";

interface Data {
  lastUpdated: string;
  headlines: any[];
  socialMentions: any[];
  sentiment?: { positive: number; negative: number; neutral: number };
  platformStats?: Record<string, number>;
  topKeywords?: { term: string; count: number }[];
  [key: string]: any;
}

// Analyze sentiment using Zo API
async function analyzeSentiment(text: string): Promise<"positive" | "negative" | "neutral"> {
  try {
    const response = await fetch("https://api.zo.computer/zo/ask", {
      method: "POST",
      headers: {
        "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        input: `Analyze the sentiment of this text. Return ONLY one word: "positive", "negative", or "neutral".

Text: "${text}"`,
        model_name: "vercel:zai/glm-5",
      }),
    });

    const result = await response.json();
    const sentiment = result.output?.trim()?.toLowerCase();
    
    if (sentiment === "positive" || sentiment === "negative" || sentiment === "neutral") {
      return sentiment;
    }
    return "neutral";
  } catch (e) {
    console.error("Sentiment analysis failed:", e);
    return "neutral";
  }
}

async function main() {
  const data: Data = JSON.parse(readFileSync(dataPath, "utf-8"));
  
  console.log("Analyzing sentiment of", data.socialMentions.length, "social mentions...");
  
  const counts = { positive: 0, negative: 0, neutral: 0 };
  
  for (const mention of data.socialMentions) {
    const text = mention.content || mention.title || "";
    if (text) {
      const sentiment = await analyzeSentiment(text);
      counts[sentiment]++;
      console.log(`  "${text.slice(0, 40)}..." -> ${sentiment}`);
    }
  }

  const total = counts.positive + counts.negative + counts.neutral;
  
  if (total > 0) {
    data.sentiment = {
      positive: Math.round((counts.positive / total) * 100),
      negative: Math.round((counts.negative / total) * 100),
      neutral: Math.round((counts.neutral / total) * 100),
    };
  } else {
    data.sentiment = { positive: 0, negative: 0, neutral: 0 };
  }

  console.log("\nSentiment results:", data.sentiment);
  
  writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Updated", dataPath);
}

main().catch(console.error);
