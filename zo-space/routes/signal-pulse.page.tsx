import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Download,
  FileText,
  Home,
  Lock,
  Loader2,
  Search,
  Sparkles,
  SlidersHorizontal,
  Tag,
  Users,
  Wand,
  X,
} from "lucide-react";

type ApiResponse = {
  report?: string;
  error?: string;
  setup?: string;
  saved?: { outdir: string; reportPath: string; notesPath: string; runPath: string; signalsPath: string };
  scores?: { overall: number; grade: string; executionRisk: string; accountability: number; clarity: number; risk: number };
  metrics?: Record<string, any>;
  raw?: string;
};

type Health = {
  ok: boolean;
  server_time_iso: string;
  has_zo_api_key: boolean;
  zo_api_key_length: number;
  has_passcode: boolean;
  has_passcode_key: boolean;
  passcode_length: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function scoreColor(score: number) {
  if (score >= 85) return "from-emerald-400 to-cyan-400";
  if (score >= 70) return "from-cyan-400 to-blue-400";
  if (score >= 55) return "from-amber-300 to-orange-400";
  return "from-rose-400 to-pink-500";
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
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

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

function ScoreRing({ score, label }: { score: number; label: string }) {
  const s = clamp(Math.round(score), 0, 100);
  const deg = (s / 100) * 360;
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-20 w-20 rounded-full p-[2px]"
        style={{ background: `conic-gradient(from 270deg, rgba(34,211,238,0.95) ${deg}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="h-full w-full rounded-full bg-zinc-950/70 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold text-white leading-none">{s}</div>
            <div className="text-[10px] text-zinc-400">/100</div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm text-zinc-400">{label}</div>
        <div className={"text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent " + scoreColor(s)}>{s >= 85 ? "Elite" : s >= 70 ? "Strong" : s >= 55 ? "Needs focus" : "At risk"}</div>
      </div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  const v = clamp(Math.round(value), 0, 100);
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 tabular-nums">{v}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={"h-full rounded-full bg-gradient-to-r " + scoreColor(v)} style={{ width: v + "%" }} />
      </div>
    </div>
  );
}

const exampleNotes = `Weekly Team Sync

Updates
- Alex: shipped billing fix, needs review
- Blair: onboarding doc draft

Action items
- Assign owner for Q2 roadmap doc
- Decide deadline for onboarding doc review

Risks
- Release timeline unclear
- External dependency on vendor API
`;

export default function SignalPulsePage() {
  const [notes, setNotes] = useState("");
  const [team, setTeam] = useState("");
  const [meetingType, setMeetingType] = useState("Weekly team sync");
  const [runName, setRunName] = useState("Weekly report");
  const [tone, setTone] = useState("Structured professional");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [copyOk, setCopyOk] = useState<null | boolean>(null);

  const reportDownloadName = useMemo(() => {
    const p = resp?.saved?.reportPath;
    if (!p) return "signal-pulse-report.md";
    const last = p.split("/").pop();
    return last || "signal-pulse-report.md";
  }, [resp?.saved?.reportPath]);

  const scoreLine = useMemo(() => {
    if (!resp?.scores) return null;
    const s = resp.scores;
    return `${s.overall}/100 (${s.grade}) · Risk: ${s.executionRisk}`;
  }, [resp]);

  const notesCount = useMemo(() => notes.trim().length, [notes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/signal-pulse-health", { headers: { Accept: "application/json" } });
        const data = (await r.json()) as Health;
        if (!cancelled) setHealth(data);
      } catch {
        if (!cancelled) setHealth(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function run() {
    setLoading(true);
    setResp(null);
    setCopyOk(null);

    try {
      const r = await fetch("/api/signal-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ notes, team, meeting_type: meetingType, run_name: runName, tone, passcode }),
      });
      const data = (await r.json()) as ApiResponse;
      setResp(data);
    } catch (e: any) {
      setResp({ error: e?.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }
        .pulse-title {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

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
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 260ms ease; }
        @media (prefers-reduced-motion: reduce) {
          .warp-canvas { display: none; }
          .blob1, .blob2 { animation: none !important; }
          .fade-up { animation: none !important; }
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center gap-6 text-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent pulse-title">
              Zo Signal Pulse
            </h1>
            <p className="mt-3 text-lg text-zinc-300/80 max-w-2xl mx-auto">
              Turn meeting notes into clear ownership
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Paste notes, run the analysis, and get action items, risks, and a score you can track.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" className="rounded-xl border border-white/10 bg-zinc-950/35 px-4 py-2 text-sm text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55 transition-colors backdrop-blur">
              Home
            </a>
            <a
              href="/api/signal-pulse-health"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-zinc-950/35 px-4 py-2 text-sm text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55 transition-colors backdrop-blur"
            >
              Health
            </a>
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
                <div className="mt-1 text-xs text-zinc-400">Step 1: paste notes. Step 2: run. Step 3: review.</div>
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
                    setResp(null);
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
              <div className="grid gap-2">
                <label className="text-xs text-zinc-400">Passcode (optional)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasscode((v) => !v)}
                    className={
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors " +
                      (showPasscode ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200" : "border-white/10 bg-zinc-950/35 text-zinc-200 hover:border-white/20")
                    }
                    title="Show passcode field"
                  >
                    <Lock className="h-4 w-4" />
                    {showPasscode ? "Enabled" : "Off"}
                  </button>
                  <div className="text-xs text-zinc-500">
                    {health?.has_passcode ? "Server passcode is set" : "Use if your server has a passcode"}
                  </div>
                </div>
                {showPasscode ? (
                  <input
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-zinc-950/35 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-cyan-400/40"
                    placeholder="Enter passcode"
                    type="password"
                    autoComplete="off"
                  />
                ) : null}
              </div>

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
                    <div className="relative w-full">
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="block w-full h-11 appearance-none rounded-xl bg-zinc-950/35 pl-10 pr-10 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-cyan-400/40 truncate"
                      >
                        <option>Structured professional</option>
                        <option>Executive concise</option>
                        <option>Friendly direct</option>
                        <option>Firm accountability</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-zinc-500">Run name is used for folder and filenames. Saved under Files/Signal Pulse.</div>

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
                  onClick={run}
                  disabled={loading || !notes.trim()}
                  className={
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition-all " +
                    (loading || !notes.trim()
                      ? "bg-white/10 opacity-60"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_50px_rgba(34,211,238,0.18)]")
                  }
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {loading ? "Running" : "Run Signal Pulse"}
                </button>
                {scoreLine ? <div className="text-sm text-zinc-200 fade-up">{scoreLine}</div> : null}
              </div>

              <div className="text-[11px] text-zinc-500">
                Keep sensitive notes out of public links. If you share this page, enable a server passcode.
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-6">
            <GlassCard className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-300" />
                    <div className="text-sm font-medium text-zinc-100">Status</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">Backend readiness and score preview.</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/35 px-4 py-3">
                  <div className="text-sm text-zinc-200">Server</div>
                  <div className="flex items-center gap-2 text-sm">
                    {health?.has_zo_api_key ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-200">Ready</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-300" />
                        <span className="text-amber-200">Needs setup</span>
                      </>
                    )}
                  </div>
                </div>

                {resp?.scores ? (
                  <div className="grid gap-4">
                    <ScoreRing score={resp.scores.overall} label={`Grade ${resp.scores.grade} · Risk ${resp.scores.executionRisk}`} />
                    <div className="grid gap-3">
                      <Meter label="Accountability" value={resp.scores.accountability} />
                      <Meter label="Clarity" value={resp.scores.clarity} />
                      <Meter label="Risk" value={resp.scores.risk} />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">Run a report to see your score and breakdown.</div>
                )}
              </div>
            </GlassCard>

            {resp?.error ? (
              <GlassCard className="p-5 border-rose-500/25">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-300 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-rose-200">Error</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm text-rose-100/90">{resp.error}</div>
                    {resp.setup ? <div className="mt-3 text-xs text-rose-100/80">{resp.setup}</div> : null}
                    {resp.raw ? (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-zinc-300">Show raw</summary>
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-200">{resp.raw}</pre>
                      </details>
                    ) : null}
                  </div>
                </div>
              </GlassCard>
            ) : null}

            {resp?.report ? (
              <GlassCard className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-zinc-100">Report</div>
                    {resp.saved ? <div className="mt-1 text-xs text-zinc-500">Saved to your workspace: {resp.saved.outdir}</div> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const ok = await copyToClipboard(resp.report || "");
                        setCopyOk(ok);
                        setTimeout(() => setCopyOk(null), 1200);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/35 px-3 py-2 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55 transition-colors"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      {copyOk === true ? "Copied" : copyOk === false ? "Copy failed" : "Copy"}
                    </button>
                    <button
                      onClick={() => downloadText(reportDownloadName, resp.report || "")}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/35 px-3 py-2 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-950/55 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>

                <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-zinc-950/55 p-4 text-sm leading-relaxed text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset] fade-up">
                  {resp.report}
                </pre>
              </GlassCard>
            ) : (
              <GlassCard className="p-5">
                <div className="text-sm font-medium text-zinc-100">What you get</div>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-zinc-200">Execution score</div>
                      <div className="text-xs text-zinc-500">A single number plus breakdown: accountability, clarity, risk.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-cyan-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-zinc-200">Action items, decisions, blockers</div>
                      <div className="text-xs text-zinc-500">Structured report you can paste into docs or send as a follow up.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-emerald-300 mt-0.5" />
                    <div>
                      <div className="text-sm text-zinc-200">Safer sharing</div>
                      <div className="text-xs text-zinc-500">Enable a server passcode when you want a link for others.</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
