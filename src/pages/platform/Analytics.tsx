import { useEffect, useState } from 'react';
import { PageHeader, Panel, DemoBadge } from '../../platform/ui';
import { platformService } from '../../platform/services';
import type { Detection, Incident } from '../../platform/types';

// ─── Inline SVG chart primitives (themed: green-500 accent, gray axes) ───────
function LineChart({ data, labels, color = '#22C55E', height = 180 }: { data: number[]; labels: string[]; color?: string; height?: number }) {
  const w = 560;
  const h = height;
  const pad = 24;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="#E5E7EB" strokeDasharray="3 4" />
      ))}
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const [x, y] = pts[i].split(',').map(Number);
        return <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={color} strokeWidth="2" />;
      })}
      {labels.map((l, i) => (
        <text key={i} x={pad + (i / Math.max(1, labels.length - 1)) * (w - pad * 2)} y={h - 6} fontSize="9" textAnchor="middle" fill="#9CA3AF" fontFamily="DM Mono, monospace">
          {l}
        </text>
      ))}
    </svg>
  );
}

function HBarChart({ rows }: { rows: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-24 font-mono text-[10px] text-[#4B5563] uppercase tracking-wider shrink-0">{r.label}</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-md overflow-hidden">
            <div className="h-full rounded-md" style={{ width: `${(r.value / max) * 100}%`, background: r.color ?? '#22C55E' }} />
          </div>
          <span className="w-10 text-right font-mono text-[10px] font-bold text-[#111827]">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = `${frac * C} ${C}`;
          const el = (
            <circle
              key={s.label}
              cx="70" cy="70" r={R}
              fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={dash} strokeDashoffset={-acc * C}
              transform="rotate(-90 70 70)"
            />
          );
          acc += frac;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827" fontFamily="Space Grotesk, sans-serif">
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="DM Mono, monospace">EVENTS</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-[#4B5563]">{s.label}</span>
            <span className="font-mono font-bold text-[#111827]">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HOURS = ['06', '08', '10', '12', '14', '16', '18', '20', '22', '00', '02', '04'];

export default function Analytics() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    platformService.listDetections().then(setDetections);
    platformService.listIncidents().then(setIncidents);
  }, []);

  // Deterministic pseudo-random series (demo)
  const detectionsSeries = [34, 41, 52, 61, 48, 57, 72, 65, 44, 38, 29, 31];
  const incidentsSeries = [2, 3, 2, 4, 3, 5, 6, 4, 2, 3, 1, 2];
  const cameraActivity = [
    { label: 'CAM-02', value: 184 },
    { label: 'CAM-03', value: 152 },
    { label: 'CAM-05', value: 131 },
    { label: 'CAM-01', value: 98 },
    { label: 'CAM-04', value: 64, color: '#F59E0B' },
    { label: 'CAM-06', value: 0, color: '#9CA3AF' },
  ];
  const objectMix = [
    { label: 'PERSON', value: 214, color: '#22C55E' },
    { label: 'VEHICLE', value: 176, color: '#3B82F6' },
    { label: 'ANIMAL', value: 23, color: '#A855F7' },
    { label: 'OTHER', value: 12, color: '#9CA3AF' },
  ];
  const alertDist = [
    { label: 'HIGH', value: 18, color: '#EF4444' },
    { label: 'POSSIBLE', value: 37, color: '#F59E0B' },
    { label: 'UNIDENTIFIED', value: 71, color: '#9CA3AF' },
  ];

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Analytics"
        description="Operational trends across detections, incidents, cameras, and alerts. Figures aggregate the simulated demo dataset and are labeled accordingly."
        badge="DEMO"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Detections Over Time (24h)" right={<DemoBadge kind="DEMO" />}>
          <LineChart data={detectionsSeries} labels={HOURS} />
        </Panel>

        <Panel title="Incidents Over Time (24h)">
          <LineChart data={incidentsSeries} labels={HOURS} color="#EF4444" />
        </Panel>

        <Panel title="Camera Activity (events)">
          <HBarChart rows={cameraActivity} />
        </Panel>

        <Panel title="Object Category Mix">
          <Donut segments={objectMix} />
        </Panel>

        <Panel title="Alert Distribution by Tier">
          <HBarChart rows={alertDist} />
        </Panel>

        <Panel title="Response & Uptime">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F7F8FA] rounded-xl p-4">
              <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Avg Response</div>
              <div className="text-2xl font-bold text-[#111827] font-mono mt-1">4m 12s</div>
              <div className="font-mono text-[9px] text-[#9CA3AF] mt-1">incident → acknowledged (demo)</div>
            </div>
            <div className="bg-[#F7F8FA] rounded-xl p-4">
              <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Camera Uptime</div>
              <div className="text-2xl font-bold text-green-600 font-mono mt-1">98.4%</div>
              <div className="font-mono text-[9px] text-[#9CA3AF] mt-1">trailing 7 days (demo)</div>
            </div>
            <div className="bg-[#F7F8FA] rounded-xl p-4">
              <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Watchlist Matches</div>
              <div className="text-2xl font-bold text-red-600 font-mono mt-1">{incidents.filter((i) => i.recognitionStatus.includes('WATCHLIST')).length * 2}</div>
              <div className="font-mono text-[9px] text-[#9CA3AF] mt-1">last 24h (demo)</div>
            </div>
            <div className="bg-[#F7F8FA] rounded-xl p-4">
              <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Detection Volume</div>
              <div className="text-2xl font-bold text-[#111827] font-mono mt-1">{detectionsSeries.reduce((a, b) => a + b, 0)}</div>
              <div className="font-mono text-[9px] text-[#9CA3AF] mt-1">last 24h (demo)</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
