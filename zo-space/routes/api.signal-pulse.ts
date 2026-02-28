import type { Context } from "hono";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

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

function nowTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function dateNY(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function timeNYCompact(d: Date) {
  const t = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
  return t.replaceAll(":", "");
}

function slugify(input: string) {
  const s = String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
  return (s || "meeting").slice(0, 64);
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

async function zoAsk(prompt: string, zoApiKey: string) {
  const resp = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${zoApiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
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
    "  \"meeting_type\": string|null,",
    "  \"action_items\": [",
    "    {\"task\": string, \"owner\": string|null, \"deadline\": string|null, \"priority\": \"High\"|\"Medium\"|\"Low\"|null, \"clarity\": \"Clear\"|\"Low\"|null, \"dependencies\": string[]|null, \"notes\": string|null}",
    "  ],",
    "  \"decisions\": [ {\"decision\": string, \"clarity\": \"Clear\"|\"Unclear\"|null, \"notes\": string|null} ],",
    "  \"open_questions\": [ {\"question\": string, \"owner\": string|null, \"deadline\": string|null} ],",
    "  \"risks_blockers\": [ {\"item\": string, \"severity\": \"High\"|\"Medium\"|\"Low\"|null, \"owner\": string|null, \"mitigation\": string|null} ],",
    "  \"dependencies\": [ {\"item\": string, \"blocked_by\": string[]|null, \"blocking\": string[]|null} ],",
    "  \"accountability_gaps\": string[],",
    "  \"notes\": string|null",
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

export default async (c: Context) => {
  try {
    const body = await c.req.json();
    const notes = String(body.notes || "").trim();
    const meetingType = body.meeting_type ? String(body.meeting_type) : undefined;
    const teamCsv = body.team ? String(body.team) : undefined;
    const tone = body.tone ? String(body.tone) : "Structured professional";
    const passcode = body.passcode ? String(body.passcode) : "";
    const runName = body.run_name ? String(body.run_name) : "";

    const requiredPasscode = process.env.SIGNAL_PULSE_PASSCODE;
    if (requiredPasscode && passcode !== requiredPasscode) {
      return c.json({ error: "Invalid passcode" }, 401);
    }

    if (!notes) return c.json({ error: "Missing notes" }, 400);

    const zoApiKey = process.env.ZO_API_KEY;
    if (!zoApiKey) {
      return c.json({
        error: "Missing ZO_API_KEY",
        setup: "Create a Zo access token in Settings > Advanced > Access Tokens, then save it as secret ZO_API_KEY. Optionally set SIGNAL_PULSE_PASSCODE.",
      }, 500);
    }

    const team = canonicalizeTeam(teamCsv);

    const extract = await zoAsk(extractionPrompt(notes, meetingType, teamCsv), zoApiKey);
    const extractedJson = stripJsonFences(extract);

    let signals: ExtractedSignals;
    try {
      signals = JSON.parse(extractedJson);
    } catch (e) {
      return c.json({ error: "Failed to parse extracted JSON", raw: extract.slice(0, 2000) }, 500);
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
      }),
      zoApiKey
    );

    const ts = nowTimestamp();
    const short = Math.random().toString(16).slice(2, 10);
    const d = new Date();
    const date = dateNY(d);
    const time = timeNYCompact(d);
    const base = slugify(runName || finalMeetingType);

    const folderName = `${date}_${time}_${base}_${short}`;
    const outdir = path.join("/home/workspace/Files/Signal Pulse", folderName);
    await mkdir(outdir, { recursive: true });

    const signalsPath = path.join(outdir, `${base}-signals_${date}.json`);
    const runPath = path.join(outdir, `${base}-run_${date}.json`);
    const reportPath = path.join(outdir, `${base}-report_${date}.md`);
    const notesPath = path.join(outdir, `${base}-notes_${date}.md`);

    const notesMd = [
      "# Meeting notes",
      "",
      `- Date (NY): ${date}`,
      `- Time (NY): ${time}`,
      `- Meeting type: ${finalMeetingType}`,
      runName ? `- Run name: ${runName}` : "- Run name: (none)",
      `- Run id: ${ts}_${short}`,
      "",
      "## Notes",
      "",
      notes,
      "",
    ].join("\n");

    await writeFile(signalsPath, JSON.stringify(normalized, null, 2), "utf8");
    await writeFile(runPath, JSON.stringify({ run_id: `${ts}_${short}`, meeting_type: finalMeetingType, run_name: runName || null, metrics, scores }, null, 2), "utf8");
    await writeFile(reportPath, report, "utf8");
    await writeFile(notesPath, notesMd, "utf8");

    return c.json({
      report,
      saved: {
        outdir,
        reportPath,
        notesPath,
        runPath,
        signalsPath,
      },
      scores,
      metrics,
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: String(err && (err as any).message ? (err as any).message : err) }, 500);
  }
};
