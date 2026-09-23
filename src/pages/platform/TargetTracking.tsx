import { useEffect, useState } from 'react';
import { platformService } from '../../platform/services';
import type { Target, ObjectType } from '../../platform/types';
import { PageHeader, Panel, StatusBadge, Chip, Bar, DemoBadge } from '../../platform/ui';

const TYPES: (ObjectType | 'All')[] = ['All', 'PERSON', 'VEHICLE', 'ANIMAL', 'OTHER'];

export default function TargetTracking() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [typeFilter, setTypeFilter] = useState<ObjectType | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    platformService.listTargets().then((t) => {
      setTargets(t);
      setSelectedId(t[0]?.trackId ?? null);
    });
  }, []);

  const filtered = typeFilter === 'All' ? targets : targets.filter((t) => t.objectType === typeFilter);
  const selected = targets.find((t) => t.trackId === selectedId) ?? null;

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Target Tracking"
        description="Live and recent tracks as objects move across the camera network. Person tracks carry face-recognition / Re-ID state; all records are simulated."
        badge="DEMO"
      >
        {TYPES.map((t) => (
          <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
            {t}
          </Chip>
        ))}
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <Panel title="Active & Recent Tracks" right={<DemoBadge kind="DEMO" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {['Track', 'Type', 'First Seen', 'Last Seen', 'Camera', 'Conf.', 'Direction', 'Status'].map((h) => (
                      <th key={h} className="text-left px-2 py-2 font-mono text-[10px] text-[#9CA3AF] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.trackId}
                      onClick={() => setSelectedId(t.trackId)}
                      className={`border-t border-[#E5E7EB] cursor-pointer transition-colors ${
                        selectedId === t.trackId ? 'bg-green-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-2 py-2.5 font-mono text-xs font-bold text-[#111827]">{t.trackId}</td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-[#4B5563]">{t.label}</td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-[#4B5563]">{t.firstSeen}</td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-[#4B5563]">{t.lastSeen}</td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-[#4B5563]">{t.cameraId}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12"><Bar value={t.confidence} tone={t.confidence >= 0.85 ? 'green' : 'amber'} /></div>
                          <span className="font-mono text-[10px] text-[#4B5563]">{(t.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 font-mono text-[10px] text-[#4B5563]">{t.direction}</td>
                      <td className="px-2 py-2.5"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-5">
          <Panel title="Track Detail">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-lg font-bold text-[#111827]">{selected.trackId}</div>
                    <div className="text-xs text-[#6B7280] capitalize">{selected.objectType.toLowerCase()} · {selected.label}</div>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F7F8FA] rounded-lg px-2.5 py-2">
                    <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider">Confidence</div>
                    <div className="font-mono text-sm font-bold text-[#111827] mt-0.5">{(selected.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-[#F7F8FA] rounded-lg px-2.5 py-2">
                    <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider">Camera</div>
                    <div className="font-mono text-sm font-bold text-[#111827] mt-0.5">{selected.cameraId}</div>
                  </div>
                  <div className="bg-[#F7F8FA] rounded-lg px-2.5 py-2">
                    <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider">First Seen</div>
                    <div className="font-mono text-sm font-bold text-[#111827] mt-0.5">{selected.firstSeen}</div>
                  </div>
                  <div className="bg-[#F7F8FA] rounded-lg px-2.5 py-2">
                    <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider">Last Seen</div>
                    <div className="font-mono text-sm font-bold text-[#111827] mt-0.5">{selected.lastSeen}</div>
                  </div>
                </div>

                {selected.objectType === 'PERSON' && (
                  <div
                    className={`rounded-lg border px-3 py-2.5 ${
                      selected.reidStatus === 'MATCH'
                        ? 'border-red-200 bg-red-50'
                        : selected.reidStatus === 'POSSIBLE'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="font-mono text-[9px] uppercase tracking-wider text-[#9CA3AF]">Face Recognition / Re-ID</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                          selected.reidStatus === 'MATCH'
                            ? 'bg-red-600 text-white'
                            : selected.reidStatus === 'POSSIBLE'
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-400 text-white'
                        }`}
                      >
                        Re-ID: {selected.reidStatus ?? 'N/A'}
                      </span>
                      {selected.watchlistName && (
                        <span className="text-xs font-semibold text-[#111827]">{selected.watchlistName}</span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-2">Movement History</div>
                  <ol className="relative border-l-2 border-[#E5E7EB] ml-2 space-y-3">
                    {selected.history.map((h, i) => (
                      <li key={i} className="ml-4">
                        <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#111827]">{h.cameraId}</span>
                          <span className="font-mono text-[10px] text-[#9CA3AF]">{h.timestamp}</span>
                          <span className="font-mono text-[10px] text-green-600 font-semibold">{(h.confidence * 100).toFixed(0)}%</span>
                        </div>
                        {h.note && <div className="text-[11px] text-[#6B7280] mt-0.5">{h.note}</div>}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center font-mono text-xs text-[#9CA3AF]">SELECT A TRACK</div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
