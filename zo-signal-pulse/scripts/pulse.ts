type ExtractedTask = {
  task: string;
  owner?: string | null;
  deadline?: string | null;
  priority?: "High" | "Medium" | "Low" | null;
  clarity?: "Clear" | "Low" | null;
  dependencies?: string[] | null;
  notes?: string | null;
};

type ExtractedSignals = {
  meeting_type?: string | null;
  action_items: ExtractedTask[];
  decisions: { decision: string; clarity?: "Clear" | "Unclear" | null; notes?: string | null }[];
  open_questions: { question: string; owner?: string | null; deadline?: string | null }[];
  risks_blockers: {
    item: string;
    severity?: "High" | "Medium" | "Low" | null;
    owner?: string | null;
    mitigation?: string | null;
  }[];
  dependencies: { item: string; blocked_by?: string[] | null; blocking?: string[] | null }[];
  accountability_gaps: string[];
  notes?: string | null;
};

type RunMetrics = {
  total_tasks: number;
  high_priority_tasks: number;
  unassigned_tasks: number;
  tasks_missing_deadline: number;
  low_clarity_tasks: number;
  unclear_decisions: number;
  open_questions: number;
  blockers: number;
  high_priority_missing_deadline: number;
};

import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function nowTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      positional.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i++;
  }

  return { args, positional };
}

async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function stripJsonFences(s: string) {
  return s
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function gradeFromScore(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function canonicalizeTeam(teamCsv: string | undefined) {
  if (!teamCsv) return null;
  const parts = teamCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  const map = new Map<string, string>();
  for (const p of parts) map.set(p.toLowerCase(), p);
  return { list: parts, map };
}

function normalizeOwner(owner: string | null | undefined, team: ReturnType<typeof canonicalizeTeam>) {
  const raw = (owner || "").trim();
  if (!raw) return "Unassigned";
  if (!team) return raw;
  const hit = team.map.get(raw.toLowerCase());
  return hit || "Unassigned";
}

function normalizeDeadline(deadline: string | null | undefined) {
  const raw = (deadline || "").trim();
  if (!raw) return "Not specified";
  return raw;
}

function normalizePriority(p: any): "High" | "Medium" | "Low" {
  if (p === "High" || p === "Medium" || p === "Low") return p;
  return "Medium";
}

function normalizeClarity(c: any): "Clear" | "Low" {
  if (c === "Clear" || c === "Low") return c;
  return "Clear";
}

function computeMetrics(signals: ExtractedSignals, team: ReturnType<typeof canonicalizeTeam>): { normalized: ExtractedSignals; metrics: RunMetrics } {
  const normalizedTasks: ExtractedTask[] = (signals.action_items || []).map((t) => {
    const priority = normalizePriority((t as any).priority);
    const clarity = normalizeClarity((t as any).clarity);
    const owner = normalizeOwner((t as any).owner, team);
    const deadline = normalizeDeadline((t as any).deadline);
    return {
      task: String((t as any).task || "").trim() || "(missing task)",
      owner,
      deadline,
      priority,
      clarity,
      dependencies: Array.isArray((t as any).dependencies) ? (t as any).dependencies : null,
      notes: (t as any).notes ? String((t as any).notes) : null,
    };
  });

  const normalizedDecisions = (signals.decisions || []).map((d) => {
    const clarity = (d as any).clarity === "Unclear" ? "Unclear" : "Clear";
    return { decision: String((d as any).decision || "").trim(), clarity, notes: (d as any).notes ? String((d as any).notes) : null };
  });

  const normalizedQuestions = (signals.open_questions || []).map((q) => {
    return {
      question: String((q as any).question || "").trim(),
      owner: normalizeOwner((q as any).owner, team),
      deadline: normalizeDeadline((q as any).deadline),
    };
  });

  const normalizedRisks = (signals.risks_blockers || []).map((r) => {
    const sev = (r as any).severity;
    const severity = sev === "High" || sev === "Medium" || sev === "Low" ? sev : "Medium";
    return {
      item: String((r as any).item || "").trim(),
      severity,
      owner: normalizeOwner((r as any).owner, team),
      mitigation: (r as any).mitigation ? String((r as any).mitigation) : null,
    };
  });

  const normalized: ExtractedSignals = {
    meeting_type: signals.meeting_type || null,
    action_items: normalizedTasks,
    decisions: normalizedDecisions as any,
    open_questions: normalizedQuestions as any,
    risks_blockers: normalizedRisks as any,
    dependencies: Array.isArray(signals.dependencies) ? signals.dependencies : [],
    accountability_gaps: Array.isArray(signals.accountability_gaps) ? signals.accountability_gaps : [],
    notes: signals.notes || null,
  };

  const total = normalizedTasks.length;
  const highPriority = normalizedTasks.filter((t) => t.priority === "High").length;
  const unassigned = normalizedTasks.filter((t) => t.owner === "Unassigned").length;
  const missingDeadline = normalizedTasks.filter((t) => t.deadline === "Not specified").length;
  const lowClarity = normalizedTasks.filter((t) => t.clarity === "Low").length;
  const unclearDecisions = normalizedDecisions.filter((d) => (d as any).clarity === "Unclear").length;
  const openQuestions = normalizedQuestions.length;
  const blockers = normalizedRisks.filter((r) => r.severity === "High").length;
  const highMissingDeadline = normalizedTasks.filter((t) => t.priority === "High" && t.deadline === "Not specified").length;

  const metrics: RunMetrics = {
    total_tasks: total,
    high_priority_tasks: highPriority,
    unassigned_tasks: unassigned,
    tasks_missing_deadline: missingDeadline,
    low_clarity_tasks: lowClarity,
    unclear_decisions: unclearDecisions,
    open_questions: openQuestions,
    blockers,
    high_priority_missing_deadline: highMissingDeadline,
  };

  return { normalized, metrics };
}

function computeScores(metrics: RunMetrics) {
  const accountability = clamp(100 - metrics.unassigned_tasks * 12 - metrics.tasks_missing_deadline * 6, 0, 100);
  const clarity = clamp(100 - metrics.low_clarity_tasks * 10 - metrics.unclear_decisions * 8 - metrics.open_questions * 4, 0, 100);
  const risk = clamp(100 - metrics.blockers * 18 - metrics.high_priority_missing_deadline * 14, 0, 100);

  const overall = Math.round(0.35 * accountability + 0.35 * clarity + 0.3 * risk);
  const grade = gradeFromScore(overall);

  let executionRisk: "High" | "Medium" | "Low" = "Low";
  if (metrics.unassigned_tasks >= 3) executionRisk = "High";
  if (metrics.high_priority_missing_deadline >= 1) executionRisk = "High";
  if (metrics.blockers >= 1 && metrics.high_priority_tasks >= 1) executionRisk = "High";
  if (executionRisk !== "High") {
    if (metrics.unassigned_tasks >= 1 || metrics.blockers >= 1 || metrics.tasks_missing_deadline >= 2 || metrics.low_clarity_tasks >= 2) {
      executionRisk = "Medium";
    }
  }

  return { accountability, clarity, risk, overall, grade, executionRisk };
}

async function zoAsk(prompt: string) {
  const token = process.env.ZO_CLIENT_IDENTITY_TOKEN;
  if (!token) throw new Error("Missing ZO_CLIENT_IDENTITY_TOKEN");

  const resp = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      authorization: token,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      input: prompt,
      model_name: "openai:gpt-5.2-2025-12-11",
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Zo Ask API error ${resp.status}: ${text.slice(0, 500)}`);
  }

  const data = (await resp.json()) as any;
  return String(data.output || "");
}

function extractionPrompt(meetingNotes: string, meetingType: string | undefined, teamCsv: string | undefined) {
  const teamLine = teamCsv ? `Team members list (owners must be chosen from this list if possible): ${teamCsv}` : "No team list provided.";

  return [
    "You extract execution signals from meeting notes.",
    "Return ONLY valid JSON. No markdown. No code fences.",
    "Do not invent names, dates, or decisions. If missing, use null.",
    teamLine,
    meetingType ? `Meeting type hint: ${meetingType}` : "Meeting type hint: null",
    "",
    "JSON schema:",
    "{",
    "  \\\"meeting_type\\\": string|null,",
    "  \\\"action_items\\\": [",
    "    {\\\"task\\\": string, \\\"owner\\\": string|null, \\\"deadline\\\": string|null, \\\"priority\\\": \\\"High\\\"|\\\"Medium\\\"|\\\"Low\\\"|null, \\\"clarity\\\": \\\"Clear\\\"|\\\"Low\\\"|null, \\\"dependencies\\\": string[]|null, \\\"notes\\\": string|null}",
    "  ],",
    "  \\\"decisions\\\": [ {\\\"decision\\\": string, \\\"clarity\\\": \\\"Clear\\\"|\\\"Unclear\\\"|null, \\\"notes\\\": string|null} ],",
    "  \\\"open_questions\\\": [ {\\\"question\\\": string, \\\"owner\\\": string|null, \\\"deadline\\\": string|null} ],",
    "  \\\"risks_blockers\\\": [ {\\\"item\\\": string, \\\"severity\\\": \\\"High\\\"|\\\"Medium\\\"|\\\"Low\\\"|null, \\\"owner\\\": string|null, \\\"mitigation\\\": string|null} ],",
    "  \\\"dependencies\\\": [ {\\\"item\\\": string, \\\"blocked_by\\\": string[]|null, \\\"blocking\\\": string[]|null} ],",
    "  \\\"accountability_gaps\\\": string[],",
    "  \\\"notes\\\": string|null",
    "}",
    "",
    "Meeting notes:",
    meetingNotes,
  ].join("\n");
}

function reportPrompt(payload: {
  meetingType: string;
  tone: string;
  normalized: ExtractedSignals;
  metrics: RunMetrics;
  scores: { accountability: number; clarity: number; risk: number; overall: number; grade: string; executionRisk: string };
}) {
  return [
    "You generate an execution intelligence report from extracted meeting signals.",
    `Output tone: ${payload.tone}`,
    "Write in Markdown.",
    "Do not add extra sections beyond what is requested.",
    "",
    "Required sections and fields:",
    "1) Pulse Snapshot (use the labels below, each on its own line)",
    "Meeting Type:",
    "Priority Breakdown:",
    "Action Items:",
    "Decisions:",
    "Blockers/Risks:",
    "Dependencies:",
    "Unassigned Tasks:",
    "Missing Deadline:",
    "Low Clarity Tasks:",
    "Execution Risk Level:",
    "Meeting Effectiveness Score: X/100",
    "Meeting Grade:",
    "2 to 4 sentence explanation of grade.",
    "Behavioral Pulse Note aligned with grade.",
    "Add improvement challenge line exactly:",
    "Run Zo Signal Pulse after your next meeting and aim to raise your score by at least 10 points.",
    "",
    "9) Signal Strengthening Actions (concrete, operational, specific to extracted tasks)",
    "",
    "10) Follow Up Message Draft (ready to send; reinforce ownership, clarify deadlines, highlight risks, prompt confirmation)",
    "",
    "Data (do not restate as JSON, use it to generate the report):",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

async function main() {
  const { args } = parseArgs(process.argv.slice(2));

  const notesFile = typeof args["notes-file"] === "string" ? String(args["notes-file"]) : null;
  const notesInline = typeof args["notes"] === "string" ? String(args["notes"]) : null;
  const teamCsv = typeof args["team"] === "string" ? String(args["team"]) : undefined;
  const meetingType = typeof args["meeting-type"] === "string" ? String(args["meeting-type"]) : undefined;
  const tone = typeof args["tone"] === "string" ? String(args["tone"]) : "Structured professional";
  const outdirArg = typeof args["outdir"] === "string" ? String(args["outdir"]) : null;

  let meetingNotes = "";
  if (notesInline) {
    meetingNotes = notesInline;
  } else if (notesFile) {
    meetingNotes = await readFile(notesFile, "utf8");
  } else {
    meetingNotes = await readStdin();
  }

  meetingNotes = meetingNotes.trim();
  if (!meetingNotes) {
    console.error("No meeting notes provided. Use --notes, --notes-file, or pipe stdin.");
    process.exit(2);
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const skillRoot = path.resolve(__dirname, "..");
  const ts = nowTimestamp();
  const outdir = outdirArg || path.join(skillRoot, "runs", ts);
  await mkdir(outdir, { recursive: true });

  const team = canonicalizeTeam(teamCsv);

  const extract = await zoAsk(extractionPrompt(meetingNotes, meetingType, teamCsv));
  const extractedJson = stripJsonFences(extract);

  let signals: ExtractedSignals;
  try {
    signals = JSON.parse(extractedJson);
  } catch (e) {
    await writeFile(path.join(outdir, "extraction_raw.txt"), extract, "utf8");
    throw new Error("Failed to parse extracted JSON. Saved raw output to extraction_raw.txt");
  }

  const { normalized, metrics } = computeMetrics(signals, team);
  const scores = computeScores(metrics);

  const finalMeetingType = meetingType || normalized.meeting_type || "Meeting";

  const report = await zoAsk(
    reportPrompt({
      meetingType: finalMeetingType,
      tone,
      normalized,
      metrics,
      scores,
    })
  );

  const signalsPath = path.join(outdir, "signals.json");
  const runPath = path.join(outdir, "run.json");
  const reportPath = path.join(outdir, "report.md");

  await writeFile(signalsPath, JSON.stringify(normalized, null, 2), "utf8");
  await writeFile(
    runPath,
    JSON.stringify(
      {
        timestamp: ts,
        meeting_type: finalMeetingType,
        metrics,
        scores,
      },
      null,
      2
    ),
    "utf8"
  );
  await writeFile(reportPath, report, "utf8");

  const historyLine = JSON.stringify({
    timestamp: ts,
    meeting_type: finalMeetingType,
    score: scores.overall,
    grade: scores.grade,
    execution_risk_level: scores.executionRisk,
    metrics,
  });
  await appendFile(path.join(skillRoot, "history.jsonl"), historyLine + "\n", "utf8");

  process.stdout.write(report.trim() + "\n");
}

main().catch((err) => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exit(1);
});
