import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ClipboardCopy,
  Download,
  FileText,
  Sparkles,
  Tag,
  Users,
  Wand,
  X,
} from "lucide-react";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

type Star = {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  hue: number;
  tw: number;
};

function WarpSpeedBackground({ intensity = 0.62, density = 0.58, trail = 0.74 }: { intensity?: number; density?: number; trail?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });
  const reducedRef = useRef(false);
  const visibleRef = useRef(true);

  const params = useMemo(() => {
    const base = {
      zMax: 1800,
      fov: 360,
      baseSpeed: 10,
      warpSpeed: 58,
      bgFade: 0.16,
    };

    return {
      ...base,
      speed: base.baseSpeed + (base.warpSpeed - base.baseSpeed) * intensity,
      count: Math.floor(320 + density * 980),
      trail: 0.55 + trail * 2.4,
      fade: base.bgFade - intensity * 0.06,
    };
  }, [density, intensity, trail]);

  useEffect(() => {
    reducedRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const onVis = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resetStar = (s: Star, w: number, h: number, zMax: number) => {
      const spread = Math.max(w, h) * 1.25;
      s.x = (Math.random() * 2 - 1) * spread;
      s.y = (Math.random() * 2 - 1) * spread;
      s.z = Math.random() * zMax + 40;
      s.px = 0;
      s.py = 0;
      s.hue = 190 + Math.random() * 70;
      s.tw = 0.35 + Math.random() * 0.65;
    };

    const ensureStars = (count: number) => {
      const { w, h } = sizeRef.current;
      const zMax = params.zMax;
      const arr = starsRef.current;
      while (arr.length < count) {
        const s: Star = { x: 0, y: 0, z: 0, px: 0, py: 0, hue: 210, tw: 0.6 };
        resetStar(s, w, h, zMax);
        arr.push(s);
      }
      while (arr.length > count) arr.pop();
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const s of starsRef.current) resetStar(s, w, h, params.zMax);
    };

    resize();
    ensureStars(params.count);

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    let last = performance.now();
    let speedNow = params.speed;

    const tick = (t: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (!visibleRef.current) return;

      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;

      ensureStars(params.count);

      if (reducedRef.current) {
        ctx.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h);
        return;
      }

      const { w, h } = sizeRef.current;
      const cx = w * 0.5;
      const cy = h * 0.5;

      speedNow += (params.speed - speedNow) * 0.05;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(2, 6, 23, ${clamp(params.fade, 0.06, 0.22)})`;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";

      const fov = params.fov;
      const trailK = params.trail;

      for (let i = 0; i < starsRef.current.length; i++) {
        const s = starsRef.current[i];
        const zPrev = s.z;

        s.z -= speedNow * (dt * 60);
        if (s.z < 1) {
          resetStar(s, w, h, params.zMax);
          continue;
        }

        const k = fov / (fov + s.z);
        const x = cx + s.x * k;
        const y = cy + s.y * k;

        const kp = fov / (fov + zPrev);
        const xp = cx + s.x * kp;
        const yp = cy + s.y * kp;

        const dx = x - xp;
        const dy = y - yp;
        const len = Math.sqrt(dx * dx + dy * dy);

        const alpha = clamp((0.1 + len / 18) * (0.18 + intensity * 0.55) * s.tw, 0.02, 0.85);
        const width = clamp(0.5 + len / 36, 0.6, 2.2);

        ctx.strokeStyle = `hsla(${s.hue}, 95%, 72%, ${alpha})`;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(xp, yp);
        ctx.lineTo(xp + dx * trailK, yp + dy * trailK);
        ctx.stroke();

        if (len < 1.2) {
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
          ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }

      ctx.globalCompositeOperation = "source-over";
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [params, intensity]);

  return (
    <div ref={hostRef} className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 warp-canvas" />
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/35 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_30px_80px_rgba(0,0,0,0.55)] " +
        className
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px 320px at 50% 0%, rgba(34, 211, 238, 0.14), transparent 60%), linear-gradient(90deg, rgba(34,211,238,0.0), rgba(167,139,250,0.10), rgba(34,211,238,0.0))",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] scanlines" />
      <div className="relative">{children}</div>
    </div>
  );
}

const exampleNotes = `Weekly Team Sync\n\nUpdates\n- Alex: shipped billing fix, needs review\n- Blair: onboarding doc draft\n\nAction items\n- Assign owner for Q2 roadmap doc\n- Decide deadline for onboarding doc review\n\nRisks\n- Release timeline unclear\n- External dependency on vendor API\n`;

function buildPrompt(args: { notes: string; team: string; meetingType: string; runName: string; tone: string }) {
  const teamLine = args.team.trim()
    ? `Team members list (owners must be chosen from this list if possible): ${args.team.trim()}`
    : "No team list provided.";

  return [
    "ROLE",
    "You are Zo Signal Pulse, an execution intelligence analyst.",
    "",
    "TASK",
    "Analyze the meeting notes and produce an execution report with a score.",
    "",
    "RULES",
    "- Do not invent names, dates, owners, or decisions. If missing, say so.",
    "- If an owner is not explicitly stated, mark it as Unassigned.",
    "- If a deadline is not explicitly stated, mark it as Not specified.",
    "- Be specific and operational. Avoid generic advice.",
    "",
    "SCORING (0 to 100)",
    "Compute these counts from your extracted action items and decisions:",
    "- unassigned_tasks: number of action items with Unassigned owner",
    "- tasks_missing_deadline: number of action items with Not specified deadline",
    "- low_clarity_tasks: number of action items whose wording is vague (example: 'look into', 'discuss', 'sync', no clear deliverable)",
    "- unclear_decisions: number of decisions that are ambiguous or not final",
    "- open_questions: number of open questions that block progress",
    "- blockers: number of high severity blockers/risks",
    "- high_priority_missing_deadline: number of High priority action items missing a deadline",
    "",
    "Then compute:",
    "accountability = clamp(100 - unassigned_tasks*12 - tasks_missing_deadline*6, 0, 100)",
    "clarity = clamp(100 - low_clarity_tasks*10 - unclear_decisions*8 - open_questions*4, 0, 100)",
    "risk = clamp(100 - blockers*18 - high_priority_missing_deadline*14, 0, 100)",
    "overall = round(0.35*accountability + 0.35*clarity + 0.30*risk)",
    "grade: A if overall>=90, B if >=80, C if >=70, D if >=60, else F",
    "Execution Risk Level:",
    "- High if unassigned_tasks>=3 OR high_priority_missing_deadline>=1 OR (blockers>=1 AND you see at least one high priority item)",
    "- Medium if not High and any of: unassigned_tasks>=1 OR blockers>=1 OR tasks_missing_deadline>=2 OR low_clarity_tasks>=2",
    "- Low otherwise",
    "",
    "OUTPUT FORMAT (Markdown)",
    "1) Pulse Snapshot (use the labels below, each on its own line)",
    "Meeting Type:",
    "Run Name:",
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
    "9) Signal Strengthening Actions (concrete, operational, specific to your extracted tasks)",
    "",
    "10) Follow Up Message Draft (ready to send; reinforce ownership, clarify deadlines, highlight risks, prompt confirmation)",
    "",
    `Tone: ${args.tone}`,
    teamLine,
    `Meeting type hint: ${args.meetingType || "Meeting"}`,
    `Run name: ${args.runName || "(none)"}`,
    "",
    "MEETING NOTES",
    args.notes.trim(),
  ].join("\n");
}

export default function SignalPulsePublicPromptPage() {
  const [notes, setNotes] = useState("");
  const [team, setTeam] = useState("");
  const [meetingType, setMeetingType] = useState("Weekly team sync");
  const [runName, setRunName] = useState("Weekly report");
  const [tone, setTone] = useState("Structured professional");
  const [prompt, setPrompt] = useState("");
  const [copyOk, setCopyOk] = useState<null | boolean>(null);

  const ZO_INVITE_URL = "https://zo.computer?referrer=dagawdnyc";

  const notesCount = useMemo(() => notes.trim().length, [notes]);

  const downloadName = useMemo(() => {
    const safe = (runName || "signal-pulse").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+/, "").replace(/-+$/, "").slice(0, 48);
    return `${safe || "signal-pulse"}-prompt.txt`;
  }, [runName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
      <div className="fixed inset-0 -z-10">
        <WarpSpeedBackground />
        <div className="absolute inset-0 bg-zinc-950/35" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 600px at 50% 30%, rgba(34, 211, 238, 0.10), transparent 60%), radial-gradient(900px 600px at 50% 120%, rgba(99, 102, 241, 0.08), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute top-0 right-0 w-[520px] h-[520px] opacity-18 blur-[110px] blob1" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }} />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] opacity-18 blur-[110px] blob2" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 50% 30%, rgba(0,0,0,0.0), rgba(0,0,0,0.60) 70%, rgba(0,0,0,0.78) 100%)",
          }}
        />
      </div>

      <style>{`
        @keyframes floaty {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.18; }
          50% { transform: translate(24px, -18px) scale(1.08); opacity: 0.26; }
        }
        .blob1 { animation: floaty 10s ease-in-out infinite; }
        .blob2 { animation: floaty 12s ease-in-out infinite; animation-delay: -3s; }
        .scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.03),
            rgba(255,255,255,0.03) 1px,
            rgba(255,255,255,0.0) 2px,
            rgba(255,255,255,0.0) 6px
          );
          mix-blend-mode: overlay;
        }
        @media (prefers-reduced-motion: reduce) {
          .warp-canvas { display: none; }
          .blob1, .blob2 { animation: none !important; }
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center gap-6 text-center mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/35 px-3 py-1 text-xs text-zinc-200">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Public prompt generator
            </div>
            <h1 className="mt-3 text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              Zo Signal Pulse
            </h1>
            <p className="mt-3 text-lg text-zinc-300/80 max-w-2xl mx-auto">
              Turn meeting notes into a ready-to-run prompt for your AI app. Paste notes, generate, then copy.
            </p>
            <p className="mt-2 text-xs text-zinc-500 max-w-2xl mx-auto">
              This page does not run AI. It only formats your text into a structured prompt.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-3 text-left">
                <div className="text-xs font-semibold uppercase text-zinc-400">Step 1</div>
                <div className="mt-1 text-sm text-zinc-200">Paste your notes</div>
                <div className="mt-1 text-xs text-zinc-400">Bullets work best. Include owners and deadlines if you have them.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-3 text-left">
                <div className="text-xs font-semibold uppercase text-zinc-400">Step 2</div>
                <div className="mt-1 text-sm text-zinc-200">Generate the prompt</div>
                <div className="mt-1 text-xs text-zinc-400">We format your notes into a strict analysis prompt.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-3 text-left">
                <div className="text-xs font-semibold uppercase text-zinc-400">Step 3</div>
                <div className="mt-1 text-sm text-zinc-200">Run it where you want</div>
                <div className="mt-1 text-xs text-zinc-400">Paste into ChatGPT, Claude, Gemini, or run the private version on Zo.</div>
              </div>
            </div>

            <div className="mt-5 max-w-3xl mx-auto">
              <GlassCard className="p-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-100">Want AI with 1 click runs and saved outputs?</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Create on Zo. In your private Zo, Signal Pulse runs AI using your Zo API key.
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={ZO_INVITE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white bg-emerald-600/90 hover:bg-emerald-500 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset]"
                    >
                      Create on Zo
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <span className="hidden sm:inline text-zinc-700">•</span>
                    <a
                      href={ZO_INVITE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="whitespace-nowrap text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
                    >
                      What’s Zo?
                    </a>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <GlassCard className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-300" />
                  <div className="text-sm font-medium text-zinc-100">Input</div>
                </div>
                <div className="mt-1 text-xs text-zinc-400">Paste notes, then generate a prompt.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNotes(exampleNotes)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/35 px-3 py-2 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55 transition-colors"
                >
                  <Wand className="h-4 w-4 text-purple-300" />
                  Example
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotes("");
                    setPrompt("");
                    setCopyOk(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/35 px-3 py-2 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55 transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-300" />
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="flex justify-center">
                <div className="flex gap-4">
                  <div className="grid gap-2 w-40">
                    <label className="text-xs font-semibold uppercase text-zinc-400 text-center">Meeting type</label>
                    <input
                      value={meetingType}
                      onChange={(e) => setMeetingType(e.target.value)}
                      className="w-full h-11 rounded-xl bg-zinc-950/35 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-cyan-400/40"
                      placeholder="Weekly team sync"
                    />
                  </div>
                  <div className="grid gap-2 w-40">
                    <label className="text-xs font-semibold uppercase text-zinc-400 text-center">Run name</label>
                    <div className="relative w-full">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        value={runName}
                        onChange={(e) => setRunName(e.target.value)}
                        className="w-full h-11 rounded-xl bg-zinc-950/35 pl-10 pr-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-cyan-400/40"
                        placeholder="Weekly report"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 w-40">
                    <label className="text-xs font-semibold uppercase text-zinc-400 text-center">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="block w-full h-11 appearance-none rounded-xl bg-zinc-950/35 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-cyan-400/40"
                    >
                      <option>Structured professional</option>
                      <option>Executive concise</option>
                      <option>Friendly direct</option>
                      <option>Firm accountability</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <div className="grid gap-2 min-w-0">
                  <label className="text-xs font-semibold uppercase text-zinc-400 text-center">Team members (optional)</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950/35 pl-10 pr-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-cyan-400/40"
                      placeholder="Alex, Blair, Casey"
                    />
                  </div>
                  <div className="text-[11px] text-zinc-500">Owners are matched to this list when present.</div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase text-zinc-400 text-center">Meeting notes</label>
                  <div className="text-[11px] text-zinc-500 tabular-nums">{notesCount.toLocaleString()} chars</div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[260px] w-full rounded-2xl bg-zinc-950/35 px-3 py-3 text-sm leading-relaxed outline-none ring-1 ring-white/10 focus:ring-cyan-400/40"
                  placeholder="Paste notes here. Bullets work great. Include owners and deadlines when you have them."
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const p = buildPrompt({ notes, team, meetingType, runName, tone });
                    setPrompt(p);
                    setCopyOk(null);
                  }}
                  disabled={!notes.trim()}
                  className={
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition-all " +
                    (!notes.trim()
                      ? "bg-white/10 opacity-60"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_50px_rgba(34,211,238,0.18)]")
                  }
                >
                  <Sparkles className="h-4 w-4" />
                  Generate prompt
                </button>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-6">
            <GlassCard className="p-5">
              <div className="text-sm font-medium text-zinc-100">Prompt</div>
              <div className="mt-2 text-xs text-zinc-400">Copy and paste into ChatGPT, Claude, Gemini, or whatever you use.</div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!prompt) return;
                    const ok = await copyToClipboard(prompt);
                    setCopyOk(ok);
                    setTimeout(() => setCopyOk(null), 1200);
                  }}
                  disabled={!prompt}
                  className={
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors " +
                    (!prompt ? "border-white/10 bg-white/5 text-zinc-400" : "border-white/10 bg-zinc-950/35 text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55")
                  }
                >
                  <ClipboardCopy className="h-4 w-4" />
                  {copyOk === true ? "Copied" : copyOk === false ? "Copy failed" : "Copy"}
                </button>
                <button
                  onClick={() => {
                    if (!prompt) return;
                    downloadText(downloadName, prompt);
                  }}
                  disabled={!prompt}
                  className={
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors " +
                    (!prompt ? "border-white/10 bg-white/5 text-zinc-400" : "border-white/10 bg-zinc-950/35 text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55")
                  }
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>

              <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-zinc-950/55 p-4 text-xs leading-relaxed text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]">
                {prompt || "Generate a prompt to see it here."}
              </pre>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
