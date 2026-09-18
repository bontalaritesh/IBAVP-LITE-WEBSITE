import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';

const installCommands = [
  { prompt: '$', cmd: 'git clone https://github.com/your-org/ibvap-lite.git' },
  { prompt: '$', cmd: 'cd ibvap-lite' },
  { prompt: '$', cmd: 'pip install -r requirements.txt' },
  { prompt: '$', cmd: 'cp config.example.yaml config.yaml' },
  { prompt: '#', cmd: '# Edit config.yaml: set camera URL and watchlist path' },
  { prompt: '$', cmd: 'python scripts/enroll_watchlist.py --dir ./watchlist_photos/' },
  { prompt: '$', cmd: 'uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload' },
  { prompt: '', cmd: '✓ IBVAP-Lite running at http://localhost:8000' },
];

function TerminalBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentChar, setCurrentChar] = useState<number>(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          typeLines(0, 0);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function typeLines(lineIdx: number, charIdx: number) {
    if (lineIdx >= installCommands.length) return;
    const line = installCommands[lineIdx];
    const fullText = line.cmd;

    if (charIdx <= fullText.length) {
      setVisibleLines(lineIdx + 1);
      setCurrentChar(charIdx);
      setTimeout(() => typeLines(lineIdx, charIdx + 1), 28);
    } else {
      setTimeout(() => typeLines(lineIdx + 1, 0), 180);
    }
  }

  const getDisplayLine = (idx: number): string => {
    const line = installCommands[idx];
    if (idx < visibleLines - 1) return line.cmd;
    if (idx === visibleLines - 1) return line.cmd.slice(0, currentChar);
    return '';
  };

  return (
    <div
      ref={ref}
      className="bg-[#0F1117] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
      role="region"
      aria-label="Terminal installation walkthrough"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-gray-500 text-xs font-mono">ibvap-lite — install</span>
      </div>

      <div className="px-5 py-5 space-y-1.5 min-h-64 font-mono text-sm">
        {installCommands.map((line, i) => {
          if (i >= visibleLines) return null;
          const displayText = getDisplayLine(i);
          const isLast = i === visibleLines - 1;
          const isDone = i < visibleLines - 1;
          const isSuccess = line.prompt === '' && isDone;

          return (
            <div key={i} className="flex items-start gap-2">
              {line.prompt && (
                <span className={line.prompt === '#' ? 'text-gray-600' : 'text-green-400'}>
                  {line.prompt}
                </span>
              )}
              <span className={
                isSuccess ? 'text-green-400' :
                line.prompt === '#' ? 'text-gray-600 italic' :
                'text-gray-200'
              }>
                {displayText}
                {isLast && <span className="inline-block w-2 h-4 bg-green-400 ml-0.5 cursor-blink align-[-2px]" aria-hidden="true" />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GetStarted() {
  const revealRef = useReveal();

  return (
    <div ref={revealRef as React.Ref<HTMLDivElement>}>
      {/* Header */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="reveal max-w-2xl">
            <span className="font-mono text-xs text-[#9CA3AF] uppercase tracking-widest">Installation</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mt-2 mb-4">Get Started</h1>
            <p className="text-[#4B5563] text-lg leading-relaxed">
              Running on any machine with Python 3.10+ and a camera source.
              No GPU required. Setup in under 10 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="reveal mb-6">
            <h2 className="text-lg font-semibold text-[#111827]">Prerequisites</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {[
              { label: 'Python', req: '3.10 or later', note: 'pip must be available' },
              { label: 'Camera source', req: 'USB cam or RTSP URL', note: 'OpenCV compatible' },
              { label: 'RAM', req: '4 GB minimum', note: '8 GB recommended for multi-camera' },
              { label: 'OS', req: 'Linux / macOS / Windows', note: 'Ubuntu 22.04 LTS tested' },
            ].map((p) => (
              <div key={p.label} className="reveal bg-white border border-[#E5E7EB] rounded-xl p-4">
                <div className="font-semibold text-[#111827] text-sm mb-0.5">{p.label}</div>
                <div className="font-mono text-xs text-green-600 mb-1">{p.req}</div>
                <div className="text-xs text-[#9CA3AF]">{p.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="reveal mb-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-1">Install sequence</h2>
            <p className="text-sm text-[#9CA3AF]">Commands type out as you scroll into view</p>
          </div>
          <div className="reveal">
            <TerminalBlock />
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="reveal mb-6">
            <h2 className="text-lg font-semibold text-[#111827]">Required inputs</h2>
          </div>
          <div className="reveal overflow-x-auto">
            <table className="w-full bg-white border border-[#E5E7EB] rounded-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-[#F7F8FA]">
                  <th className="text-left px-5 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">config.yaml key</th>
                  <th className="text-left px-5 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">Value</th>
                  <th className="text-left px-5 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">Example</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['camera.source', 'Integer (USB index) or RTSP URL string', '0 or rtsp://192.168.1.10:554/stream'],
                  ['watchlist.dir', 'Path to folder of enrolled face photos', './watchlist_photos/'],
                  ['alert.telegram_token', 'Bot token from @BotFather', 'Bot:AAF...Xyz'],
                  ['alert.telegram_chat_id', 'Target channel or user ID', '-1001234567890'],
                  ['detection.confidence_threshold', 'YOLO minimum confidence (0–1)', '0.5'],
                  ['matching.similarity_high', 'Cosine similarity for High tier (0–1)', '0.80'],
                  ['matching.similarity_possible', 'Cosine similarity for Possible tier', '0.60'],
                ].map(([key, desc, example]) => (
                  <tr key={key as string} className="border-t border-[#E5E7EB]">
                    <td className="px-5 py-3.5 font-mono text-xs text-[#3B82F6]">{key}</td>
                    <td className="px-5 py-3.5 text-xs text-[#4B5563]">{desc}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#9CA3AF]">{example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dependencies */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="reveal mb-6">
            <h2 className="text-lg font-semibold text-[#111827]">Key dependencies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {[
              { name: 'Ultralytics YOLOv8', pkg: 'ultralytics', desc: 'Person detection model and inference runtime', href: 'https://github.com/ultralytics/ultralytics' },
              { name: 'InsightFace', pkg: 'insightface', desc: 'Face embedding model (MobileFaceNet buffalo_sc)', href: 'https://github.com/deepinsight/insightface' },
              { name: 'ONNX Runtime', pkg: 'onnxruntime', desc: 'Accelerated model inference without CUDA', href: 'https://github.com/microsoft/onnxruntime' },
              { name: 'FastAPI', pkg: 'fastapi', desc: 'Async REST API + WebSocket server', href: 'https://fastapi.tiangolo.com' },
            ].map((dep) => (
              <a
                key={dep.pkg}
                href={dep.href}
                target="_blank"
                rel="noopener noreferrer"
                className="reveal block bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#3B82F6] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-[#111827] text-sm">{dep.name}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors shrink-0 mt-0.5">
                    <path d="M2.5 11.5l9-9M7 2.5h4.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="font-mono text-xs text-[#3B82F6] mb-1.5">pip install {dep.pkg}</div>
                <p className="text-xs text-[#4B5563]">{dep.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
