import { useState, useMemo } from "react"
import { useReveal } from "../hooks/useReveal"
import { Link } from "react-router"

type Status = "Live" | "In Progress" | "Planned"
type Category = "All" | "Perception" | "Biometrics" | "Alerting" | "Security"

interface FeatureItem {
  id: string
  icon: string
  name: string
  category: Category
  spec: string
  desc: string
  status: Status
  metrics: string
}

const allFeatures: FeatureItem[] = [
  // Perception
  {
    id: "f1",
    icon: "🎯",
    name: "YOLO26 Nano Object Detection",
    category: "Perception",
    spec: "Ultralytics YOLO26n ONNX (2.4M params, 3.1 GFLOPs)",
    desc: "Runs native NMS-free end-to-end detection for humans and perimeter vehicles at 45+ FPS directly on commodity edge CPUs.",
    status: "Live",
    metrics: "45+ FPS on CPU",
  },
  {
    id: "f2",
    icon: "🌙",
    name: "CLAHE Night Vision Enhancer",
    category: "Perception",
    spec: "Contrast Limited Adaptive Histogram Equalization",
    desc: "Dynamically balances illumination across dusk and low-light CCTV footage, recovering hidden facial structures and edge contours.",
    status: "Live",
    metrics: "1.8ms per frame",
  },
  {
    id: "f3",
    icon: "🐾",
    name: "Multi-Class Animal Taxonomy",
    category: "Perception",
    spec: "COCO Animal Taxonomy (10 Species)",
    desc: "Detects livestock, stray cattle, and wildlife (dogs, horses, cows, bears) to prevent false human alarms along perimeter fences.",
    status: "Live",
    metrics: "10 Species Filtered",
  },
  {
    id: "f4",
    icon: "🛰️",
    name: "Centroid Multi-Object Tracker",
    category: "Perception",
    spec: "Euclidean + IOU Persistent Association",
    desc: "Assigns persistent track IDs across consecutive video frames to prevent duplicate inference and enable velocity telemetry.",
    status: "Live",
    metrics: "15-frame memory window",
  },

  // Biometrics
  {
    id: "f5",
    icon: "🧠",
    name: "InsightFace ArcFace 512-D Vectors",
    category: "Biometrics",
    spec: "MobileFaceNet buffalo_sc (512-D Unit Sphere)",
    desc: "Extracts deep normalized facial embeddings from 5-point aligned crops for ultra-accurate cosine distance comparison.",
    status: "Live",
    metrics: "99.2% TAR @ 0.001 FAR",
  },
  {
    id: "f6",
    icon: "📐",
    name: "360° Multi-Angle Exemplar Gallery",
    category: "Biometrics",
    spec: "Matrix Cosine Matching (N, 512)",
    desc: "Enrolls multiple viewpoints per suspect (frontal, 45° left/right, profile) to identify targets regardless of head angle.",
    status: "Live",
    metrics: "<0.5ms match latency",
  },
  {
    id: "f7",
    icon: "👁️",
    name: "Passive Heuristic Liveness Gate",
    category: "Biometrics",
    spec: "Fourier Texture & Micro-Motion Heuristics",
    desc: "Anti-spoofing verification checks surface texture and micro-movements to reject printed photographs and tablet replays.",
    status: "In Progress",
    metrics: "Anti-Spoofing Defense",
  },
  {
    id: "f8",
    icon: "🔄",
    name: "Appearance Re-ID Fallback",
    category: "Biometrics",
    spec: "Color Histogram + Silhouette Embedding",
    desc: "Re-identifies tracked targets by clothing patterns and silhouette when their face is turned away or occluded.",
    status: "Planned",
    metrics: "Occlusion Recovery",
  },

  // Alerting
  {
    id: "f9",
    icon: "🚨",
    name: "Three-Tier Threat Classification",
    category: "Alerting",
    spec: "High / Possible / Unidentified Score Windows",
    desc: "Stratifies matches into confirmed threats (>80%), soft warnings (65-80%), and routine detections with distinct cooldown windows.",
    status: "Live",
    metrics: "3 Distinct Tiers",
  },
  {
    id: "f10",
    icon: "📱",
    name: "Instant Telegram Evidence Push",
    category: "Alerting",
    spec: "Encrypted Bot API with Cropped Evidence JPEG",
    desc: "Pushes high-priority alerts with face crop, confidence score, camera sector, and timestamp to mobile phones in <1 second.",
    status: "Live",
    metrics: "<1s field delivery",
  },
  {
    id: "f11",
    icon: "⏱️",
    name: "Smart Cooldown Deduplication",
    category: "Alerting",
    spec: "Per-Target + Per-Tier Cooldown Timers",
    desc: "Suppresses notification spam for standing targets while preserving continuous forensic frame logging in the audit vault.",
    status: "Live",
    metrics: "Configurable 5s-30s",
  },
  {
    id: "f12",
    icon: "🤖",
    name: "Two-Way Telegram Command Bot",
    category: "Alerting",
    spec: "Interactive Bot Webhooks & Query Handlers",
    desc: "Allows field operators to acknowledge alerts, query suspect history, and mute camera sectors via encrypted chat commands.",
    status: "In Progress",
    metrics: "Interactive Chat Ops",
  },

  // Security & Ops
  {
    id: "f13",
    icon: "🗄️",
    name: "ACID-Compliant SQLite Audit Vault",
    category: "Security",
    spec: "Local Relational Database (WAL Mode)",
    desc: "Stores every detection, watchlist identity, and snapshot path in an air-gapped, zero-cloud encrypted database file.",
    status: "Live",
    metrics: "Zero Network Attack Surface",
  },
  {
    id: "f14",
    icon: "🖥️",
    name: "Full-Coverage Tactical Radar HUD",
    category: "Security",
    spec: "FastAPI Stream + Interactive Controls",
    desc: "Zero-black-bar camera viewport with Fill/Fit toggles, full-screen mode, real-time FPS meters, and multi-angle photo uploader.",
    status: "Live",
    metrics: "60 FPS Canvas Stream",
  },
  {
    id: "f15",
    icon: "📡",
    name: "Distributed Multi-Camera Mesh",
    category: "Security",
    spec: "Multi-Stream Worker Architecture",
    desc: "Orchestrates 4 to 16 RTSP border streams across a unified detection pipeline with centralized threat deduplication.",
    status: "Planned",
    metrics: "16 Streams per Gateway",
  },
  {
    id: "f16",
    icon: "⚡",
    name: "Edge NPU Acceleration (Hailo-8 / Coral)",
    category: "Security",
    spec: "Dedicated 13-26 TOPS Edge NPU Offload",
    desc: "Hardware acceleration for extreme-temperature, solar-powered border outposts with under 5W total system power draw.",
    status: "Planned",
    metrics: "<5W Power Envelope",
  },
]

const roadmapPhases = [
  {
    phase: "PHASE 01",
    title: "Autonomous Edge Core",
    timeline: "Shipped & Live in Production",
    status: "Completed",
    progress: 100,
    items: [
      "Upgraded to YOLO26 Nano native NMS-free edge object detection",
      "InsightFace ArcFace 512-D normalized vector embedding engine",
      "360° Multi-Angle Exemplar gallery (frontal, 45° angles, profile)",
      "Instant Telegram threat alert dispatch with cropped evidence JPEG",
      "Local SQLite database with ACID transaction safety and WAL logging",
    ],
  },
  {
    phase: "PHASE 02",
    title: "Tactical Hardening & Defense",
    timeline: "Active Development // Q1-Q2 2026",
    status: "In Flight",
    progress: 65,
    items: [
      "Passive Fourier texture & micro-motion anti-spoofing liveness gate",
      "Multi-class animal & livestock perimeter intrusion taxonomy",
      "Two-way interactive Telegram bot commands for field acknowledgment",
      "Night vision CLAHE dynamic tone mapping for fog & dusk cameras",
      "Automated camera stream health watchdog and zero-lag buffer purge",
    ],
  },
  {
    phase: "PHASE 03",
    title: "Multi-Sensor Scale & Re-ID",
    timeline: "Scheduled Milestone // Q3-Q4 2026",
    status: "Scheduled",
    progress: 25,
    items: [
      "Appearance-based Re-ID fallback across occluded targets",
      "Distributed multi-camera ingestion pipeline (up to 16 RTSP streams)",
      "Hardware NPU offloading (Hailo-8 / Google Coral Edge TPU)",
      "Geospatial sector radar tracking with GPS coordinate overlay",
    ],
  },
  {
    phase: "PHASE 04",
    title: "Autonomous Border Mesh",
    timeline: "Strategic Roadmap // 2027 Vision",
    status: "Planned",
    progress: 5,
    items: [
      "Autonomous patrol drone video feed ingestion and tracking",
      "Long-wave infrared (FLIR) thermal sensor fusion for total darkness",
      "Federated edge model synchronization across remote border outposts",
      "Air-gapped tamper-evident cryptographic blockchain audit logs",
    ],
  },
]

export default function Features() {
  const revealRef = useReveal()
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFeatures = useMemo(() => {
    return allFeatures.filter((f) => {
      const matchCat =
        selectedCategory === "All" || f.category === selectedCategory
      const matchQuery =
        searchQuery.trim() === "" ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.spec.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchQuery
    })
  }, [selectedCategory, searchQuery])

  return (
    <div
      ref={revealRef as React.Ref<HTMLDivElement>}
      className="bg-[#F7F8FA] text-[#111827]"
    >
      {/* ── HEADER ── */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
          <div className="reveal max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#697586]">
              Product Capabilities & Roadmap
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111827]">
              Engineered Capabilities
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#4B5563] leading-relaxed">
              Explore the deployed capabilities of the IBVAP-Lite platform,
              active engineering initiatives, and our long-term strategic
              defense roadmap.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 font-mono text-xs">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {([
                "All",
                "Perception",
                "Biometrics",
                "Alerting",
                "Security",
              ] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3.5 py-1.5 font-bold tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#111827] text-white shadow-sm"
                      : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  {cat === "All" ? "ALL CAPABILITIES" : cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capabilities..."
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs text-[#111827] placeholder-[#9CA3AF] focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS GRID ── */}
      <section className="border-b border-[#E5E7EB] bg-[#F7F8FA] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between font-mono text-xs text-[#6B7280]">
            <span>SHOWING {filteredFeatures.length} SPECIFICATIONS</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-green-700 font-bold">
                <span className="h-2 w-2 rounded-full bg-green-500" /> LIVE (
                {allFeatures.filter((f) => f.status === "Live").length})
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> STAGING (
                {allFeatures.filter((f) => f.status === "In Progress").length})
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 font-bold">
                <span className="h-2 w-2 rounded-full bg-gray-400" /> ROADMAP (
                {allFeatures.filter((f) => f.status === "Planned").length})
              </span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map((feat) => {
              const statusStyle =
                feat.status === "Live"
                  ? "border-green-300 bg-green-50 text-green-800"
                  : feat.status === "In Progress"
                    ? "border-blue-300 bg-blue-50 text-blue-800"
                    : "border-gray-300 bg-gray-100 text-gray-700"

              return (
                <div
                  key={feat.id}
                  className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-gray-400 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-2xl">{feat.icon}</div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}
                      >
                        {feat.status}
                      </span>
                    </div>

                    <h3 className="mt-4 font-sans text-base font-bold text-[#111827]">
                      {feat.name}
                    </h3>
                    <div className="mt-1 font-mono text-[11px] font-semibold text-green-600">
                      {feat.spec}
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#F3F4F6] pt-3 font-mono text-[11px] text-[#6B7280]">
                    <span>BENCHMARK</span>
                    <strong className="text-[#111827]">{feat.metrics}</strong>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STRATEGIC ROADMAP TIMELINE ── */}
      <section className="border-b border-[#E5E7EB] bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#697586]">
              Strategic Milestones
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">
              Product Evolution Roadmap
            </h2>
            <p className="mt-3 text-sm text-[#4B5563]">
              From a single-camera edge proof-of-concept to an autonomous
              multi-sensor defense mesh.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {roadmapPhases.map((phase, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                    <span className="font-mono text-xs font-bold text-green-600">
                      {phase.phase}
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#4B5563] border border-[#E5E7EB]">
                      {phase.status}
                    </span>
                  </div>

                  <h3 className="mt-4 font-sans text-lg font-bold text-[#111827]">
                    {phase.title}
                  </h3>
                  <div className="mt-1 font-mono text-[11px] text-[#6B7280]">
                    {phase.timeline}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        phase.progress === 100
                          ? "bg-green-500"
                          : phase.progress > 50
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>

                  <ul className="mt-6 space-y-2.5 font-mono text-xs text-[#4B5563]">
                    {phase.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">›</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="bg-[#0C0F14] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="font-mono text-xs font-bold uppercase text-green-400 tracking-wider">
            Ready to Test
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Experience the IBVAP-Lite Prototype in Action
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-[#94A3B8]">
            Clone the codebase, run the local installer, and test live face
            matching and Telegram alerts in under 3 minutes.
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
              Inspect Architecture
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
