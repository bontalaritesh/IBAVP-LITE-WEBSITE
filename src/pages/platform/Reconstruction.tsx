import { useEffect, useState } from 'react';
import { platformService } from '../../platform/services';
import type { ReconstructionStep, Target } from '../../platform/types';
import { PageHeader, Panel, Bar, DemoBadge } from '../../platform/ui';

export default function Reconstruction() {
  const [steps, setSteps] = useState<ReconstructionStep[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [trackId, setTrackId] = useState<string>('');

  useEffect(() => {
    platformService.listTargets().then((t) => {
      setTargets(t);
      const person = t.find((x) => x.history.length > 2) ?? t[0];
      if (person) setTrackId(person.trackId);
    });
  }, []);

  useEffect(() => {
    if (trackId) platformService.getReconstruction(trackId).then(setSteps);
  }, [trackId]);

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Cross-Camera Reconstruction"
        description="Reconstruct how one target moved across the camera network: camera-to-camera hand-offs, dwell gaps, and confidence at each hop. Reconstruction is computed from simulated track events."
        badge="SIMULATION"
      >
        {targets.map((t) => (
          <Chipish key={t.trackId} active={trackId === t.trackId} onClick={() => setTrackId(t.trackId)} label={t.trackId} />
        ))}
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vertical camera chain */}
        <Panel title="Camera Hand-off Chain" right={<DemoBadge kind="DEMO" />}>
          <div className="flex flex-col items-stretch">
            {steps.map((s, i) => (
              <div key={i}>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#111827]">{s.cameraId}</span>
                    <span className="font-mono text-xs text-[#4B5563]">{s.timestamp}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1">
                      <Bar value={s.confidence} tone={s.confidence >= 0.85 ? 'green' : 'amber'} />
                    </div>
                    <span className="font-mono text-[10px] text-[#4B5563] w-9 text-right">{(s.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] text-[#9CA3AF]">
                    {s.trackId} · {s.direction}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex flex-col items-center py-1.5 text-[#9CA3AF]">
                    <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
                      <path d="M7 0v20M7 20l-4.5-4.5M7 20l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono text-[10px] text-[#6B7280]">+{steps[i + 1]?.gapLabel} between sightings</span>
                  </div>
                )}
              </div>
            ))}
            {!steps.length && (
              <div className="py-10 text-center font-mono text-xs text-[#9CA3AF]">NO RECONSTRUCTION FOR THIS TRACK</div>
            )}
          </div>
        </Panel>

        {/* Horizontal timeline */}
        <Panel title="Sighting Timeline">
          <div className="pt-6 pb-2 px-1">
            <Timeline steps={steps} />
          </div>
          <p className="mt-6 font-mono text-[10px] text-[#9CA3AF] leading-relaxed">
            Timestamps are relative within the simulated scenario. Gaps between sightings indicate estimated traversal time between
            camera coverage areas — used here for layout demonstration only.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function Chipish({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-semibold font-mono transition-colors ${
        active ? 'bg-[#111827] text-white' : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function Timeline({ steps }: { steps: ReconstructionStep[] }) {
  if (!steps.length) return <div className="h-32" />;
  const parse = (t: string) => {
    const [h, m, s] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };
  const t0 = parse(steps[0].timestamp);
  const t1 = parse(steps[steps.length - 1].timestamp);
  const span = Math.max(1, t1 - t0);

  return (
    <div className="relative h-36">
      {/* axis */}
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#E5E7EB]" />
      {steps.map((s, i) => {
        const frac = (parse(s.timestamp) - t0) / span;
        const top = i % 2 === 0;
        return (
          <div key={i} className="absolute" style={{ left: `${frac * 92 + 2}%`, top: 0, bottom: 0 }}>
            <div className={`absolute left-0 -translate-x-1/2 flex flex-col items-center ${top ? 'top-1' : 'bottom-1'}`}>
              <div className="bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-center shadow-sm">
                <div className="font-mono text-[10px] font-bold text-[#111827]">{s.cameraId}</div>
                <div className="font-mono text-[9px] text-[#6B7280]">{s.timestamp}</div>
              </div>
              <div className={`w-px h-5 ${top ? '' : 'order-first'} bg-[#E5E7EB]`} />
            </div>
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow"
            />
          </div>
        );
      })}
      <div className="absolute left-0 right-0 top-1/2 mt-4 flex justify-between font-mono text-[9px] text-[#9CA3AF]">
        <span>{steps[0].timestamp}</span>
        <span>{steps[steps.length - 1].timestamp}</span>
      </div>
    </div>
  );
}
