import { useState, useRef } from "react"
import { useReveal } from "../hooks/useReveal"
import { Link } from "react-router"

interface Step {
  num: string
  title: string
  tagline: string
  component: string
  latency: string
  icon: string
  description: string
  techDetails: string[]
  inputData: string
  outputData: string
}

const operationalSteps: Step[] = [
  {
    num: "01",
    title: "Stream Ingestion & Buffer Management",
    tagline: "Zero-lag threaded video ingestion",
    component: "OpenCV VideoCapture + Threaded Deque",
    latency: "3.1 ms",
    icon: "📡",
    description:
      "IBVAP-Lite connects directly to RTSP IP webcams, USB cameras, or pre-recorded surveillance files. Incoming frames are read in a dedicated background worker thread with automatic backlog frame dropping to guarantee zero video delay.",
    techDetails: [
      "Asynchronous frame decoding decoupled from AI compute",
      "Dual-protocol connectivity: RTSP over TCP/UDP and local UVC cameras",
      "Auto-recovery watchdog reconnects within 500ms if stream is interrupted",
    ],
    inputData: "H.264 / MJPEG RTSP Stream (1080p @ 30 FPS)",
    outputData: "Normalized BGR frame matrix in shared memory",
  },
  {
    num: "02",
    title: "Night Vision & Dynamic CLAHE Normalization",
    tagline: "Low-light illumination recovery",
    component: "Adaptive Histogram Equalization",
    latency: "1.8 ms",
    icon: "🌙",
    description:
      "In night, dusk, or heavy fog conditions, raw footage loses contrast. The CLAHE module converts the frame to LAB color space, equalizes luminance distribution, and prevents noise overamplification to uncover hidden silhouettes.",
    techDetails: [
      "Tile grid size (8x8) with adaptive clip limit of 3.0",
      "Preserves facial skin textures without bleaching highlights",
      "Dynamically toggleable from the operator command dashboard",
    ],
    inputData: "Low-light or foggy BGR frame",
    outputData: "Contrast-enhanced, illumination-balanced frame",
  },
  {
    num: "03",
    title: "YOLO26 Nano Object Detection",
    tagline: "Native NMS-free human & vehicle localization",
    component: "Ultralytics YOLO26n (ONNX Runtime)",
    latency: "8.2 ms",
    icon: "🎯",
    description:
      "The newly upgraded YOLO26 Nano model identifies all humans and vehicles in the perimeter. Operating with a native NMS-free end-to-end architecture, it delivers up to 43% higher throughput on commodity CPUs compared to legacy architectures.",
    techDetails: [
      "Only 2.4M parameters and 3.1 GFLOPs (25% smaller than YOLOv8n)",
      "Multi-threaded SIMD AVX2 acceleration with ONNX Runtime",
      "Centroid object tracker assigns persistent tracking IDs (e.g. TRK-01)",
    ],
    inputData: "Resized tensor (1, 3, 480, 480)",
    outputData: "Bounding boxes [x1, y1, x2, y2], Class ID, Confidence",
  },
  {
    num: "04",
    title: "Biometric Face Extraction & 360° Angle Match",
    tagline: "ArcFace 512-D exemplar matrix comparison",
    component: "InsightFace MobileFaceNet + Exemplar Gallery",
    latency: "9.4 ms",
    icon: "🧠",
    description:
      "Faces are localized and aligned using 5 facial landmarks. Deep 512-dimensional normalized vectors are generated and compared across a 360° multi-angle exemplar gallery (frontal, left 45°, right 45°, and profile) stored in SQLite.",
    techDetails: [
      "Dual-stage hybrid pass: global RetinaFace scan + YOLO person-crop fallback",
      "Matrix cosine dot product: np.dot(enrolled_gallery, query_vector)",
      "Identifies targets from oblique angles where traditional 1-photo systems fail",
    ],
    inputData: "Aligned 112x112 facial crop",
    outputData: "Matched Identity, Category (VIP/Threat), Similarity Score",
  },
  {
    num: "05",
    title: "Passive Liveness Verification Gate",
    tagline: "Anti-spoofing presentation attack defense",
    component: "Fourier Texture & Micro-Motion Dynamics",
    latency: "1.2 ms",
    icon: "👁️",
    description:
      "Before an alert is confirmed, the liveness gate evaluates 3D perspective shifts, eye-nose aspect ratios, and micro-motion dynamics across consecutive video frames to prevent attacks via printed paper photos or smartphone screen replays.",
    techDetails: [
      "Detects absence of natural 3D yaw perspective jitter",
      "Zero active user cooperation required — completely passive in CCTV feeds",
      "Suspicious matches are flagged as SPOOF_ALERT rather than verified threats",
    ],
    inputData: "Temporal landmark queue (16 frames)",
    outputData: "Liveness status: LIVE vs SPOOF_SUSPECTED",
  },
  {
    num: "06",
    title: "Sub-Second Telegram Push & SQLite Audit Vault",
    tagline: "Instant tactical dispatch & forensic logging",
    component: "Telegram Bot API + Local SQLite WAL DB",
    latency: "< 800 ms",
    icon: "⚡",
    description:
      "When a high-confidence threat is confirmed, a background daemon immediately crops the intruder’s face, writes the forensic snapshot, records an immutable SQLite audit log entry, and dispatches a rich HTML notification to commanders on Telegram.",
    techDetails: [
      "30-second per-identity cooldown prevents alert notification storms",
      "Encrypted Telegram push includes face crop, confidence %, zone, and timestamp",
      "100% air-gapped local database with zero cloud data leakage",
    ],
    inputData: "Confirmed Threat Record + Cropped Evidence JPEG",
    outputData: "Instant Mobile Notification + Permanent Audit Record",
  },
]

export default function HowItWorks() {
  const revealRef = useReveal()
  const [activeStep, setActiveStep] = useState<number>(0)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [localVideoSrc, setLocalVideoSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLocalVideoSrc(url)
      setIsPlaying(true)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div
      ref={revealRef as React.Ref<HTMLDivElement>}
      className="bg-[#F7F8FA] text-[#111827]"
    >
      {/* ── HERO HEADER ── */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
          <div className="reveal max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 font-mono text-xs font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              OPERATIONAL BLUEPRINT
            </div>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111827]">
              How IBVAP-Lite Works
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#4B5563] leading-relaxed">
              A comprehensive walkthrough of the autonomous surveillance
              pipeline. Watch the working video demonstration below, then
              inspect the 6-stage algorithmic execution sequence.
            </p>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-[#E5E7EB] pt-6 font-mono text-xs">
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">
                END-TO-END LATENCY
              </span>
              <span className="text-green-600 font-bold text-lg">
                &lt; 22 ms
              </span>
              <span className="text-[10px] text-[#9CA3AF] block">
                Camera to decision
              </span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">
                DISPATCH SPEED
              </span>
              <span className="text-blue-600 font-bold text-lg">
                &lt; 800 ms
              </span>
              <span className="text-[10px] text-[#9CA3AF] block">
                To Telegram commanders
              </span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">
                MATCH ANGLE
              </span>
              <span className="text-green-600 font-bold text-lg">
                360° Multi-Angle
              </span>
              <span className="text-[10px] text-[#9CA3AF] block">
                Frontal, 45°, Profile
              </span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">
                TARGET CAPACITY
              </span>
              <span className="text-purple-600 font-bold text-lg">
                8+ Simultaneous
              </span>
              <span className="text-[10px] text-[#9CA3AF] block">
                Dual-stage detection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO DEMONSTRATION SHOWCASE ── */}
      <section className="border-b border-[#E5E7EB] bg-[#0A0D12] text-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="font-mono text-xs text-green-400 font-bold uppercase tracking-wider">
                Live Prototype Demonstration
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                System Video Walkthrough
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] font-mono mt-1">
                Watch IBVAP-Lite ingest video, localize targets, match faces,
                and dispatch live alerts.
              </p>
            </div>

            {/* Video Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:bg-green-500 cursor-pointer shadow-md"
              >
                📁 Upload / Change Demo Video
              </button>
            </div>
          </div>

          {/* Main Video Viewport */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-[#06080B] shadow-2xl">
            {localVideoSrc ? (
              <video
                ref={videoRef}
                src={localVideoSrc}
                controls
                autoPlay
                className="h-full w-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : videoUrl ? (
              <iframe
                src={videoUrl}
                title="Prototype Demonstration Video"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Tactical Interactive Video Placeholder */
              <div className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center select-none">
                {/* Background Grid & Scanlines */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#22C55E_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40" />

                {/* HUD Overlay Tags */}
                <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] text-[#64748B] text-left">
                  <div className="flex items-center gap-2 text-green-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    STANDBY // DEMO VIDEO FEED READY
                  </div>
                  <div className="mt-1">SEC: 04-B • SECTOR GATE-01</div>
                  <div>FPS: 45.2 • RESOLUTION: 1080p 60FPS</div>
                </div>

                <div className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] text-[#64748B] text-right">
                  <div className="text-green-400">YOLO26n + ARCFACE 512-D</div>
                  <div className="text-[#38BDF8]">TELEGRAM BOT READY</div>
                </div>

                {/* Central Play Button */}
                <div className="z-10 flex flex-col items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-green-400 bg-green-500/10 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:scale-110 hover:bg-green-500 hover:text-black cursor-pointer"
                    aria-label="Load demo video"
                  >
                    <svg
                      className="ml-1 h-8 w-8 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  <h3 className="mt-5 font-sans text-xl font-bold text-white">
                    Load Demonstration Video
                  </h3>
                  <p className="mt-2 max-w-md font-mono text-xs text-[#94A3B8] leading-relaxed">
                    Click above to load your recorded screen demo (MP4/WebM), or
                    paste a video URL below.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded bg-white/10 px-3 py-1.5 font-mono text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
                    >
                      📁 Browse Local MP4
                    </button>
                    <button
                      onClick={() => {
                        const url = prompt(
                          "Enter Direct MP4 URL or YouTube Embed URL:",
                        )
                        if (url) setVideoUrl(url)
                      }}
                      className="rounded border border-white/20 px-3 py-1.5 font-mono text-xs font-semibold text-[#94A3B8] hover:text-white transition cursor-pointer"
                    >
                      🔗 Paste Video URL
                    </button>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] text-[#64748B]">
                  <span>AI PIPELINE STATUS: ACTIVE</span>
                  <span>CLICK UPLOAD OR DROP VIDEO FILE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DETAILED CHRONOLOGICAL 6-STEP WALKTHROUGH ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-green-700">
              Execution Walkthrough
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
              Step-by-Step Platform Execution
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed">
              How a single incoming video frame flows through detection, feature
              normalization, biometric cosine distance evaluation, anti-spoofing
              verification, and emergency dispatch.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="mt-12 space-y-6">
            {operationalSteps.map((step, idx) => {
              const isActive = activeStep === idx

              return (
                <div
                  key={step.num}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "border-[#111827] bg-white shadow-lg ring-1 ring-black/5"
                      : "border-[#E5E7EB] bg-white/70 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <div
                    onClick={() => setActiveStep(idx)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 cursor-pointer gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-base font-bold transition-colors ${
                          isActive
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-gray-100 text-[#4B5563]"
                        }`}
                      >
                        {step.num}
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{step.icon}</span>
                          <h3 className="font-sans text-lg sm:text-xl font-bold text-[#111827]">
                            {step.title}
                          </h3>
                        </div>
                        <p className="mt-1 font-mono text-xs text-[#6B7280]">
                          {step.tagline} •{" "}
                          <span className="text-green-600 font-semibold">
                            {step.component}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center font-mono text-xs">
                      <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-1 text-[#374151]">
                        Latency:{" "}
                        <strong className="text-green-600">
                          {step.latency}
                        </strong>
                      </div>
                      <span className="text-lg text-gray-400 transition-transform">
                        {isActive ? "−" : "+"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Step Body */}
                  {isActive && (
                    <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-6 sm:p-8 rounded-b-2xl font-mono text-xs">
                      <p className="font-sans text-sm sm:text-base text-[#374151] leading-relaxed">
                        {step.description}
                      </p>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                            INPUT DATA CONTRACT
                          </span>
                          <span className="mt-1 block text-[#111827] font-semibold">
                            {step.inputData}
                          </span>
                        </div>

                        <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                          <span className="text-[10px] font-bold uppercase text-green-700 block">
                            OUTPUT DATA ARTIFACT
                          </span>
                          <span className="mt-1 block text-green-800 font-semibold">
                            {step.outputData}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-gray-200 pt-4">
                        <span className="text-[10px] font-bold uppercase text-[#6B7280] block mb-2">
                          TECHNICAL HIGHLIGHTS & RESILIENCE
                        </span>
                        <ul className="space-y-2 text-[#4B5563]">
                          {step.techDetails.map((td, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">
                                ›
                              </span>
                              <span>{td}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="border-t border-[#E5E7EB] bg-[#0C0F14] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="font-mono text-xs font-bold uppercase text-green-400 tracking-wider">
            Ready to Inspect
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Test the System in Your Terminal
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-[#94A3B8]">
            Clone the repository, initialize the virtual environment, and launch
            the live camera feed in 3 simple commands.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:bg-green-400 shadow-lg"
            >
              Get Started Guide ↗
            </Link>
            <Link
              to="/architecture"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              Architecture Blueprint
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
