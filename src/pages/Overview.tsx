import { Link } from "react-router"
import { useEffect, useRef, useState } from "react"
import AsciiEyeCamera from "../components/AsciiEyeCamera"

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 12h15M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Marker({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[.18em] uppercase text-[#697586]">
      <i className="block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      {text}
    </span>
  )
}

function RevealNumber({
  value,
  label,
  sub,
}: {
  value: string
  label: string
  sub?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const n = ref.current
    if (!n) return
    const o = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0.3 },
    )
    o.observe(n)
    return () => o.disconnect()
  }, [])

  return (
    <div ref={ref} className="border-t border-white/15 pt-5">
      <div
        className={`metric-number transition-all duration-700 ${
          seen ? "metric-show" : "opacity-0 translate-y-4"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-xs font-semibold tracking-wider text-white uppercase">
        {label}
      </div>
      {sub && (
        <div className="mt-1 font-mono text-[11px] text-white/50">{sub}</div>
      )}
    </div>
  )
}

const capabilities = [
  {
    num: "01",
    title: "SEE",
    subtitle: "YOLO26 Nano Perception",
    desc: "Native NMS-free end-to-end detection tracks humans and perimeter vehicles at 45+ FPS directly on edge CPUs without cloud latency.",
  },
  {
    num: "02",
    title: "IDENTIFY",
    subtitle: "ArcFace 512-D Exemplars",
    desc: "360° multi-angle exemplar gallery matches frontal, profile, and oblique viewpoints with sub-millisecond cosine distance matrix calculations.",
  },
  {
    num: "03",
    title: "ACT",
    subtitle: "Autonomous Threat Push",
    desc: "Zero-lag verification gate triggers tiered alerts and pushes forensic photos to field commanders via Telegram in <1 second.",
  },
]

export default function Overview() {
  return (
    <div className="overflow-hidden bg-[#F7F8FA] text-[#111827]">
      {/* ── HERO SECTION WITH INTERACTIVE ASCII SURVEILLANCE EYE ── */}
      <section className="relative border-b border-[#E5E7EB] bg-white">
        <div className="absolute inset-0 opacity-[.06] dot-paper pointer-events-none" />
        <div className="relative mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl lg:grid-cols-[1.08fr_0.92fr]">
          {/* Left Column: Mission Statement */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:border-r lg:border-[#E5E7EB] lg:p-14">
            <div>
              <Marker text="Autonomous Perimeter Defense // SIH Prototype" />
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 font-mono text-xs font-semibold text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  UPGRADED TO YOLO26n // NMS-FREE
                </div>
                <h1 className="mt-4 font-sans text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#111827] leading-[1.02]">
                  SEE WHAT
                  <br />
                  <span className="text-green-600">MATTERS.</span>
                  <br />
                  WHERE IT HAPPENS.
                </h1>
                <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-[#4B5563]">
                  IBVAP-Lite is an edge-native, zero-cloud visual intelligence
                  engine. It transforms raw border CCTV and IP camera feeds into
                  instant, actionable security alerts in under 1 second.
                </p>

                <div className="mt-8 flex flex-wrap gap-3.5">
                  <Link
                    to="/architecture"
                    className="inline-flex items-center gap-2.5 rounded-lg bg-green-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-green-500"
                  >
                    System Architecture <Arrow />
                  </Link>
                  <Link
                    to="/get-started"
                    className="inline-flex items-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1F2937] transition hover:border-black hover:bg-[#F9FAFB]"
                  >
                    Deploy Locally <Arrow />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-[#E5E7EB] pt-4 font-mono text-[11px] text-[#6B7280]">
              <span>LOCAL CPU INFERENCE • ZERO CLOUD LEAKAGE</span>
              <span className="text-green-600 font-bold">
                100% AIR-GAPPED READY
              </span>
            </div>
          </div>

          {/* Right Column: Interactive JetBrains-Style ASCII Surveillance Eye / Camera */}
          <div className="flex flex-col justify-center bg-[#07090C] p-6 sm:p-10 lg:p-12">
            <div className="mb-3 flex items-center justify-between font-mono text-xs text-[#94A3B8]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                TACTICAL RADAR VIEWPORT
              </span>
              <span className="text-green-400">
                INTERACTIVE JETBRAINS ASCII ENGINE
              </span>
            </div>

            <AsciiEyeCamera className="w-full" />

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center font-mono text-[10px] text-[#64748B]">
              <div>
                <span className="block text-white font-bold">45+ FPS</span>
                <span>CPU PIPELINE</span>
              </div>
              <div>
                <span className="block text-green-400 font-bold">
                  &lt;1.0 SEC
                </span>
                <span>ALERT LATENCY</span>
              </div>
              <div>
                <span className="block text-[#38BDF8] font-bold">512-D</span>
                <span>ARCFACE VECTORS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ── */}
      <div className="ticker border-b border-black bg-green-500 py-2.5 font-mono text-xs font-bold tracking-[.18em] text-black select-none">
        <div>
          ✦ FAST EDGE DETECTION &nbsp;&nbsp; ✦ ZERO CLOUD DEPENDENCY
          &nbsp;&nbsp; ✦ 360° MULTI-ANGLE BIOMETRICS &nbsp;&nbsp; ✦ REAL-TIME
          TELEGRAM DISPATCH &nbsp;&nbsp; ✦ NATIVE YOLO26 &nbsp;&nbsp; ✦ FAST
          EDGE DETECTION &nbsp;&nbsp; ✦ ZERO CLOUD DEPENDENCY &nbsp;&nbsp; ✦
        </div>
      </div>

      {/* ── PROBLEM VS SOLUTION COMPARISON MATRIX ── */}
      <section className="border-b border-[#E5E7EB] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Marker text="The Surveillance Problem" />
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
              Human Fatigue vs Autonomous Vigilance
            </h2>
            <p className="mt-3 text-base text-[#4B5563]">
              Border security guards watching 16+ CCTV feeds miss up to 95% of
              target sightings after 22 minutes. IBVAP-Lite replaces fatigue
              with continuous mathematical certainty.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Manual Monitoring Card */}
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-red-200 pb-3">
                <span className="font-mono text-xs font-bold uppercase text-red-600">
                  Conventional Human Monitoring
                </span>
                <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold text-red-700">
                  HIGH RISK
                </span>
              </div>
              <ul className="mt-5 space-y-4 font-mono text-xs text-[#374151]">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>
                    <strong>Attention Decay:</strong> 95% detection failure rate
                    after 20 minutes of continuous screen monitoring.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>
                    <strong>Costly Infrastructure:</strong> Requires server
                    racks with expensive high-wattage GPUs ($5,000+ per
                    station).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>
                    <strong>Cloud Vulnerability:</strong> Streaming sensitive
                    border feeds over public internet introduces cyber
                    interception risks.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>
                    <strong>Response Lag:</strong> 2 to 5 minutes between
                    spotting an intruder and alerting border response personnel.
                  </span>
                </li>
              </ul>
            </div>

            {/* IBVAP-Lite Card */}
            <div className="rounded-xl border border-green-300 bg-green-50/40 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-green-200 pb-3">
                <span className="font-mono text-xs font-bold uppercase text-green-700">
                  IBVAP-Lite Edge Autonomous AI
                </span>
                <span className="rounded bg-green-200/70 px-2 py-0.5 font-mono text-[10px] font-bold text-green-800">
                  RECOMMENDED
                </span>
              </div>
              <ul className="mt-5 space-y-4 font-mono text-xs text-[#1F2937]">
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Tireless Vigilance:</strong> Evaluates every single
                    frame 24/7 without cognitive fatigue or missed events.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Commodity Hardware:</strong> Runs at 45+ FPS on
                    standard Intel Core i5 edge mini-PCs with zero GPUs
                    required.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Air-Gapped Privacy:</strong> 100% of inference,
                    embedding extraction, and SQLite logging stays strictly
                    on-premise.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Sub-Second Dispatch:</strong> Verified threats
                    pushed to Telegram and web radar in under 1 second with
                    evidence crops.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE TRIAD CAPABILITIES ── */}
      <section className="border-b border-black bg-[#0C0F12] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Marker text="Autonomous Security Pipeline" />
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Engineered for High-Stakes Perimeters
              </h2>
            </div>
            <div className="font-mono text-xs text-green-400">
              YOLO26 • INSIGHTFACE • FASTAPI
            </div>
          </div>

          <div className="mt-12 grid border-y border-white/15 md:grid-cols-3">
            {capabilities.map((cap) => (
              <article
                key={cap.num}
                className="group border-b border-white/15 p-6 sm:p-8 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-green-400 font-bold">
                    {cap.num}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-[#64748B]">
                    {cap.subtitle}
                  </span>
                </div>
                <h3 className="mt-8 text-3xl sm:text-4xl font-bold tracking-tight text-white group-hover:text-green-400 transition-colors">
                  {cap.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                  {cap.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 font-mono text-xs text-green-400">
                  <span>SYSTEM_READY</span>
                  <Arrow className="transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNICAL TELEMETRY COUNTERS ── */}
      <section className="border-b border-black bg-[#080A0D] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <Marker text="Performance Benchmarks on Local Edge CPU" />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                PROVEN SPEEDS.
                <br />
                <span className="text-green-400">NO COMPROMISES.</span>
              </h2>
              <p className="mt-4 text-sm text-[#94A3B8] leading-relaxed max-w-md">
                Benchmarked on standard 11th Gen Intel Core i5 processors using
                ONNX Runtime CPUExecutionProvider with multi-threaded SIMD
                acceleration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 self-end">
              <RevealNumber
                value="45+ FPS"
                label="Inference Throughput"
                sub="Zero GPU required"
              />
              <RevealNumber
                value="<1.0s"
                label="Dispatch Latency"
                sub="Camera to Telegram"
              />
              <RevealNumber
                value="512-D"
                label="Face Embedding Depth"
                sub="Normalized ArcFace"
              />
              <RevealNumber
                value="100%"
                label="Local Persistence"
                sub="SQLite Audit Vault"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CALL TO ACTION ── */}
      <section className="relative overflow-hidden bg-green-500 px-6 py-20 sm:px-10 lg:px-14">
        <div className="absolute -right-8 -top-12 text-[16rem] font-bold text-black/10 select-none pointer-events-none">
          ↗
        </div>
        <div className="relative mx-auto max-w-7xl">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-black/70">
            Open & Verifiable Codebase
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-black max-w-3xl">
            Inspect the Full System Architecture & Live Detections
          </h2>
          <p className="mt-4 max-w-xl text-base sm:text-lg text-black/80 leading-relaxed">
            Ready to dive deeper? Explore the 8-stage data pipeline, examine
            real threat logs, or deploy the prototype in 3 terminal commands.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/architecture"
              className="inline-flex items-center gap-2.5 rounded-lg bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-black shadow-lg"
            >
              Explore Architecture <Arrow />
            </Link>
            <Link
              to="/threat-log"
              className="inline-flex items-center gap-2.5 rounded-lg border-2 border-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-black hover:text-white"
            >
              Inspect Threat Logs <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
