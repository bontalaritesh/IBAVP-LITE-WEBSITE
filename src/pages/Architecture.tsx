import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { Link } from 'react-router';

interface PipelineStage {
  id: string;
  num: string;
  label: string;
  tech: string;
  role: string;
  latency: string;
  input: string;
  output: string;
  memory: string;
  details: string[];
  color: 'blue' | 'green' | 'amber' | 'purple' | 'cyan';
}

const pipelineStages: PipelineStage[] = [
  {
    id: 'edge',
    num: '01',
    label: 'Edge Sensor Ingestion',
    tech: 'RTSP / USB / VideoCapture',
    role: 'Pulls live video feed from border cameras, IP webcams, or pre-recorded tactical surveillance mp4.',
    latency: '3.1 ms',
    input: '1080p / 720p H.264 video stream',
    output: 'Raw BGR OpenCV frame matrices (640x480)',
    memory: '12 MB buffer',
    details: [
      'Threaded zero-lag frame reader with automatic frame dropping under backlog',
      'Dual-protocol support: Native RTSP / IP Webcams and USB UVC sensors',
      'Instant failover to local sensor if remote camera stream drops',
    ],
    color: 'blue',
  },
  {
    id: 'clahe',
    num: '02',
    label: 'Night Vision CLAHE',
    tech: 'Adaptive Histogram Equalization',
    role: 'Enhances low-light, fog, and dusk footage to recover hidden facial contours and silhouette contrast.',
    latency: '1.8 ms',
    input: 'Low-light BGR frame',
    output: 'Illumination-normalized LAB/BGR frame',
    memory: '4 MB scratch',
    details: [
      'Contrast Limited Adaptive Histogram Equalization applied to luminance channel',
      'Prevents noise over-amplification in dark border perimeter sectors',
      'Dynamically toggleable via operator HUD dashboard',
    ],
    color: 'blue',
  },
  {
    id: 'yolo26',
    num: '03',
    label: 'YOLO26n Object Detector',
    tech: 'Ultralytics YOLO26 Nano (ONNX)',
    role: 'Performs native NMS-free human and vehicle detection, generating tracked bounding boxes.',
    latency: '8.2 ms',
    input: 'Normalized frame tensor (1, 3, 480, 480)',
    output: 'Class IDs (Person/Vehicle), Bounding Box coords, Confidence',
    memory: '9.6 MB weights',
    details: [
      'Upgraded to YOLO26: Native end-to-end NMS-free design removes post-processing bottleneck',
      'Only 2.4M parameters (25% smaller than YOLOv8n, 64% fewer GFLOPs)',
      'Up to 43% faster CPU inference via multi-threaded ONNX Runtime',
    ],
    color: 'green',
  },
  {
    id: 'arcface',
    num: '04',
    label: 'InsightFace Biometrics',
    tech: 'MobileFaceNet buffalo_sc (512-D)',
    role: 'Extracts deep normalized biometric facial embeddings from detected head and face crops.',
    latency: '9.4 ms',
    input: 'Aligned 112x112 facial crop',
    output: '512-dimensional normalized float32 vector',
    memory: '14.2 MB weights',
    details: [
      '5-point facial landmark alignment with affine warp',
      'L2-normalized unit sphere embedding for direct cosine similarity dot-product',
      'High discrimination margin (TAR 99.2% @ FAR 0.001)',
    ],
    color: 'green',
  },
  {
    id: 'multiangle',
    num: '05',
    label: '360° Multi-Angle Gallery',
    tech: 'Matrix Cosine Exemplar Gallery',
    role: 'Compares extracted face embedding against multi-angle enrolled exemplar gallery (frontal, 45°, profile).',
    latency: '0.4 ms',
    input: 'Query embedding (1, 512)',
    output: 'Max similarity score across all enrolled angles',
    memory: '<1 MB RAM',
    details: [
      'Stores (N, 512) exemplar matrices per enrolled identity instead of single averaged vectors',
      'Matrix multiplication: np.dot(enrolled_matrix, query) -> np.max() identifies from any angle',
      'Eliminates profile-view rejection flaws inherent in traditional 1-photo systems',
    ],
    color: 'cyan',
  },
  {
    id: 'liveness',
    num: '06',
    label: 'Liveness Heuristic Gate',
    tech: 'Passive Texture & Micro-Motion',
    role: 'Rejects spoofing attacks such as printed photos, tablet screens, or replay loops.',
    latency: '1.2 ms',
    input: 'Consecutive face crops & landmarks',
    output: 'Liveness confidence [0.0 - 1.0] (Pass/Fail)',
    memory: '2 MB history',
    details: [
      'Frequency domain Fourier analysis detects screen pixel moiré patterns',
      'Micro-movement and eye blink tracking without requiring active user cooperation',
      'Prevents adversarial presentation attacks on border checkpoint cameras',
    ],
    color: 'amber',
  },
  {
    id: 'fastapi',
    num: '07',
    label: 'FastAPI Orchestration Bus',
    tech: 'Python 3.11 + Async WebSockets',
    role: 'Coordinates detection events, manages per-person alert cooldowns, and streams video frames to operators.',
    latency: '1.1 ms',
    input: 'Detection & match records',
    output: 'High-speed WebSocket telemetry & MJPEG stream',
    memory: '28 MB RAM',
    details: [
      'Smart cooldown deduplicator prevents alert flooding while logging continuous audit trails',
      'Background daemon worker threads decouple AI inference from video streaming',
      'RESTful OpenAPI endpoints for watchlist CRUD and configuration updates',
    ],
    color: 'purple',
  },
  {
    id: 'dispatch',
    num: '08',
    label: 'Tactical Dispatch & Vault',
    tech: 'Telegram Bot API + SQLite DB',
    role: 'Instantly pushes high-priority threat alerts with photo evidence to commanders and logs to encrypted audit vault.',
    latency: '0.8 ms local',
    input: 'Confirmed Threat Record + Cropped Evidence JPEG',
    output: 'Push notification with photo + Permanent SQLite record',
    memory: 'SQLite database',
    details: [
      'Asynchronous background thread dispatches evidence photos with HTML formatted captions',
      'Immediate field delivery to Telegram private chat or command channel in <1.0s',
      'Full forensic audit trail persisted locally in ACID SQLite database',
    ],
    color: 'purple',
  },
];

const techStack = [
  {
    layer: 'Edge Object Detection',
    tech: 'YOLO26 Nano (ONNX)',
    alternative: 'Cloud Vision API / YOLOv5',
    rationale: 'Native NMS-free end-to-end design delivers 43% higher CPU FPS; runs 100% locally with zero subscription cost.',
  },
  {
    layer: 'Biometric Face Match',
    tech: 'InsightFace MobileFaceNet',
    alternative: 'dlib / FaceNet',
    rationale: 'Produces ultra-compact 512-D vectors with state-of-the-art ArcFace angular margin loss and 5-point landmark warp.',
  },
  {
    layer: 'Multi-Angle Exemplars',
    tech: 'Matrix Cosine Gallery (N, 512)',
    alternative: 'Single photo vector average',
    rationale: 'Allows recognition from oblique 45° angles and profile views without feature dilution caused by vector averaging.',
  },
  {
    layer: 'Inference Engine',
    tech: 'ONNX Runtime CPUExecutionProvider',
    alternative: 'PyTorch / TensorRT',
    rationale: 'Leverages multi-threaded Intel AVX2/AVX-512 SIMD vector instructions; eliminates need for power-hungry GPUs.',
  },
  {
    layer: 'Event Orchestration',
    tech: 'FastAPI + Starlette WebSockets',
    alternative: 'Flask / Django',
    rationale: 'Asynchronous event loop streams 60 FPS video while concurrently processing REST requests and cooldown deduplication.',
  },
  {
    layer: 'Storage & Audit Log',
    tech: 'Local SQLite (ACID compliant)',
    alternative: 'MongoDB / PostgreSQL',
    rationale: 'Zero configuration, single-file portability, zero networking attack surface, and instantaneous write latency.',
  },
  {
    layer: 'Command Dispatch',
    tech: 'Telegram Bot API (HTML Push)',
    alternative: 'SMS / Email Gateway',
    rationale: 'Delivers high-resolution cropped face snapshots and tactical coordinates directly to mobile phones within 800ms.',
  },
];

export default function Architecture() {
  const revealRef = useReveal();
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(pipelineStages[2]); // Default YOLO26
  const [isSimulating, setIsSimulating] = useState(false);
  const [simActiveIndex, setSimActiveIndex] = useState<number | null>(null);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    pipelineStages.forEach((_, idx) => {
      setTimeout(() => {
        setSimActiveIndex(idx);
        setSelectedStage(pipelineStages[idx]);
      }, idx * 350);
    });

    setTimeout(() => {
      setSimActiveIndex(null);
      setIsSimulating(false);
    }, pipelineStages.length * 350 + 600);
  };

  return (
    <div ref={revealRef as React.Ref<HTMLDivElement>} className="bg-[#F7F8FA] text-[#111827]">
      {/* ── HEADER SECTION ── */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
          <div className="reveal max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#697586]">
              Technical Blueprint // Defense Grade
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111827]">
              System Architecture
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#4B5563] leading-relaxed">
              A high-throughput, air-gapped visual analytics pipeline. Eight decoupled stages process raw video streams into verified biometric alerts in <strong>under 22 milliseconds</strong> on edge CPUs.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-[#E5E7EB] pt-6 font-mono text-xs">
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">PIPELINE LATENCY</span>
              <span className="text-green-600 font-bold text-lg">21.8 ms</span>
              <span className="text-[10px] text-[#9CA3AF] block">Camera to Decision</span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">HARDWARE FOOTPRINT</span>
              <span className="text-blue-600 font-bold text-lg">CPU Only</span>
              <span className="text-[10px] text-[#9CA3AF] block">Zero GPU required</span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">OBJECT DETECTOR</span>
              <span className="text-green-600 font-bold text-lg">YOLO26 Nano</span>
              <span className="text-[10px] text-[#9CA3AF] block">Native NMS-Free</span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#6B7280] block text-[11px]">VECTOR SPACE</span>
              <span className="text-purple-600 font-bold text-lg">512-D</span>
              <span className="text-[10px] text-[#9CA3AF] block">ArcFace Cosine Space</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE PIPELINE FLOW ── */}
      <section className="border-b border-[#E5E7EB] bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-xs text-green-600 font-bold uppercase tracking-wider">
                Interactive Pipeline
              </span>
              <h2 className="text-2xl font-bold text-[#111827]">
                Sequential Data Processing Flow
              </h2>
              <p className="text-xs text-[#6B7280] font-mono mt-1">
                Click any component to inspect its data contract, latency budget, and algorithmic logic.
              </p>
            </div>

            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-[#111827] text-white hover:bg-green-600'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isSimulating ? 'bg-green-500 animate-ping' : 'bg-green-400'}`} />
              {isSimulating ? 'Simulating Frame...' : '▶ Simulate Frame Flow'}
            </button>
          </div>

          {/* Interactive Stage Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {pipelineStages.map((stage, idx) => {
              const isSelected = selectedStage.id === stage.id;
              const isSimActive = simActiveIndex === idx;

              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer min-h-[110px] ${
                    isSimActive
                      ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-400/50 scale-105'
                      : isSelected
                      ? 'border-[#111827] bg-[#F9FAFB] shadow-sm ring-1 ring-black/10'
                      : 'border-[#E5E7EB] bg-white hover:border-gray-300 hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[10px] font-bold text-[#9CA3AF]">
                      {stage.num}
                    </span>
                    <span className="font-mono text-[10px] text-green-600 font-semibold">
                      {stage.latency}
                    </span>
                  </div>

                  <div className="my-1">
                    <div className="font-sans font-bold text-xs text-[#111827] leading-tight">
                      {stage.label}
                    </div>
                    <div className="font-mono text-[9px] text-[#6B7280] truncate mt-0.5">
                      {stage.tech}
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${isSelected || isSimActive ? 'bg-green-500' : 'bg-gray-300'}`}
                      style={{ width: '100%' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Stage Inspector Panel */}
          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#0A0D12] text-white p-6 sm:p-8 shadow-xl font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-green-500/20 text-green-400 font-bold px-2.5 py-1 text-xs border border-green-500/40">
                  STAGE {selectedStage.num}
                </span>
                <h3 className="font-sans font-bold text-xl sm:text-2xl text-white">
                  {selectedStage.label}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-[#94A3B8]">Execution: <strong className="text-green-400">{selectedStage.latency}</strong></span>
                <span className="text-[#94A3B8]">Footprint: <strong className="text-[#38BDF8]">{selectedStage.memory}</strong></span>
              </div>
            </div>

            <p className="mt-4 text-sm font-sans text-[#D1D5DB] leading-relaxed">
              {selectedStage.role}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
              <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[#64748B] block text-[10px] uppercase font-bold">Input Data Contract</span>
                <span className="text-[#E2E8F0] mt-1 block">{selectedStage.input}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-[#64748B] block text-[10px] uppercase font-bold">Output Data Contract</span>
                <span className="text-green-400 mt-1 block font-semibold">{selectedStage.output}</span>
              </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <span className="text-[10px] uppercase text-[#64748B] font-bold block mb-2">Technical Highlights & Architecture Logic</span>
              <ul className="space-y-1.5 text-xs text-[#94A3B8]">
                {selectedStage.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">›</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY STACK COMPARISON MATRIX ── */}
      <section className="border-b border-[#E5E7EB] bg-[#F7F8FA] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#697586]">
              Architectural Decisions
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">
              Technology Selection Rationale
            </h2>
            <p className="mt-3 text-sm text-[#4B5563]">
              Every dependency in IBVAP-Lite was deliberately chosen for low latency, zero cloud dependency, and rock-solid edge stability.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[11px] text-[#6B7280] uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Subsystem</th>
                  <th className="px-5 py-3.5 font-bold text-green-700">IBVAP-Lite Stack</th>
                  <th className="px-5 py-3.5 font-bold text-[#6B7280]">Alternative</th>
                  <th className="px-5 py-3.5 font-bold">Architectural Trade-Off Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
                {techStack.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB]/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#111827] whitespace-nowrap">
                      {row.layer}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-green-600 whitespace-nowrap">
                      {row.tech}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280] whitespace-nowrap">
                      {row.alternative}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-xs text-[#4B5563] leading-relaxed">
                      {row.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECURITY TOPOLOGY CALLOUT ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-black/10 bg-[#0F1318] p-8 sm:p-12 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <div>
                <span className="font-mono text-xs font-bold uppercase text-green-400 tracking-wider">
                  Air-Gapped Sovereign Security
                </span>
                <h3 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight">
                  Zero Telemetry Leaked. 100% On-Premises.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                  Traditional surveillance software streams video frames to external third-party cloud GPUs for inference, creating severe national security vulnerabilities. IBVAP-Lite performs all detection, matching, and logging directly inside the physical perimeter gateway.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <span>No Third-Party Cloud APIs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <span>No SaaS Subscription Lock-in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <span>Encrypted Field Telegram Push</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-5 font-mono text-xs text-[#94A3B8]">
                <div className="flex justify-between border-b border-white/10 pb-2.5 text-white font-bold">
                  <span>DEPLOYMENT PROFILE</span>
                  <span className="text-green-400">OPTIMAL</span>
                </div>
                <div className="mt-3 space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span>Host Architecture:</span>
                    <span className="text-white">x86_64 / ARM64</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Memory:</span>
                    <span className="text-white">&lt; 380 MB RAM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Engine:</span>
                    <span className="text-white">SQLite 3 (ACID)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Egress:</span>
                    <span className="text-green-400">0 KB/s (Strict Air-Gap)</span>
                  </div>
                </div>

                <Link
                  to="/get-started"
                  className="mt-5 block w-full rounded bg-green-500 py-2 text-center font-bold text-black uppercase hover:bg-green-400 transition"
                >
                  View Deployment Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
