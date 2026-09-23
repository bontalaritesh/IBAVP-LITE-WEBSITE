import { useEffect, useMemo, useState } from 'react';
import { platformService } from '../../platform/services';
import type { Incident, IncidentStatus, Severity } from '../../platform/types';
import { PageHeader, Panel, SeverityBadge, StatusBadge, Chip, DemoBadge } from '../../platform/ui';

const SEVERITIES: (Severity | 'All')[] = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: (IncidentStatus | 'All')[] = ['All', 'NEW', 'INVESTIGATING', 'ACKNOWLEDGED', 'RESOLVED'];

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sevFilter, setSevFilter] = useState<Severity | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'All'>('All');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'timestamp' | 'severity' | 'confidence'>('timestamp');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    platformService.listIncidents().then((list) => {
      setIncidents(list);
      setSelectedId(list[0]?.id ?? null);
    });
  }, []);

  const sevRank: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  const filtered = useMemo(() => {
    let list = [...incidents];
    if (sevFilter !== 'All') list = list.filter((i) => i.severity === sevFilter);
    if (statusFilter !== 'All') list = list.filter((i) => i.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.zone.toLowerCase().includes(q) ||
          i.cameraId.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          (i.trackId ?? '').toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      if (sortKey === 'timestamp') return b.timestamp.localeCompare(a.timestamp);
      if (sortKey === 'confidence') return b.confidence - a.confidence;
      return sevRank[b.severity] - sevRank[a.severity];
    });
    return list;
  }, [incidents, sevFilter, statusFilter, query, sortKey]);

  const selected = incidents.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Incidents"
        description="Triage and manage surveillance incidents from detection through resolution. Every record on this page is demonstration data."
        badge="DEMO"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* List column */}
        <div className="lg:col-span-8 space-y-4">
          <Panel>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Severity</span>
                {SEVERITIES.map((s) => (
                  <Chip key={s} active={sevFilter === s} onClick={() => setSevFilter(s)}>
                    {s === 'All' ? 'ALL' : s}
                  </Chip>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Status</span>
                {STATUSES.map((s) => (
                  <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                    {s === 'All' ? 'ALL' : s}
                  </Chip>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ID, camera, zone, track, summary…"
                  className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                  className="px-2 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-mono bg-white"
                  aria-label="Sort incidents"
                >
                  <option value="timestamp">SORT: Newest</option>
                  <option value="severity">SORT: Severity</option>
                  <option value="confidence">SORT: Confidence</option>
                </select>
                <span className="font-mono text-[10px] text-[#9CA3AF]">{filtered.length} shown</span>
              </div>
            </div>
          </Panel>

          <Panel title="Incident Register" right={<DemoBadge kind="DEMO" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {['ID', 'Timestamp', 'Camera / Zone', 'Severity', 'Object', 'Status', 'Conf.'].map((h) => (
                      <th key={h} className="text-left px-2 py-2 font-mono text-[10px] text-[#9CA3AF] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr
                      key={i.id}
                      onClick={() => setSelectedId(i.id)}
                      className={`border-t border-[#E5E7EB] cursor-pointer transition-colors ${
                        selectedId === i.id ? 'bg-green-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-2 py-2.5 font-mono text-xs font-semibold text-[#111827]">{i.id}</td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-[#4B5563] whitespace-nowrap">{i.timestamp.split(' ')[1]}</td>
                      <td className="px-2 py-2.5 text-[11px] text-[#4B5563] whitespace-nowrap">
                        {i.cameraId} · {i.zone}
                      </td>
                      <td className="px-2 py-2.5"><SeverityBadge severity={i.severity} /></td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-[#4B5563]">{i.label}</td>
                      <td className="px-2 py-2.5"><StatusBadge status={i.status} /></td>
                      <td className="px-2 py-2.5 font-mono text-[11px]">{(i.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 font-mono text-xs text-[#9CA3AF]">
                        NO INCIDENTS MATCH FILTERS
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-4">
          <Panel title="Incident Detail">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-lg font-bold text-[#111827]">{selected.id}</div>
                    <div className="font-mono text-[11px] text-[#9CA3AF]">{selected.timestamp}</div>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Camera', selected.cameraId],
                    ['Zone', selected.zone],
                    ['Detected', `${selected.detectedObject} (${selected.label})`],
                    ['Track ID', selected.trackId ?? '—'],
                    ['Recognition', selected.recognitionStatus],
                    ['Confidence', `${(selected.confidence * 100).toFixed(0)}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#F7F8FA] rounded-lg px-2.5 py-2">
                      <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider">{k}</div>
                      <div className="font-mono text-[11px] font-semibold text-[#111827] mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-1">Summary</div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">{selected.summary}</p>
                </div>

                <div>
                  <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-1">Linked Evidence</div>
                  {selected.evidenceIds.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selected.evidenceIds.map((ev) => (
                        <span key={ev} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-semibold">
                          {ev}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] text-[#9CA3AF]">none attached</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  {(['ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED'] as IncidentStatus[]).map((s) => (
                    <button
                      key={s}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-[#E5E7EB] text-[10px] font-mono font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
                      title="Status transitions are UI-only in this demo build"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[9px] text-[#9CA3AF]">
                  Status transition buttons are non-functional in this DEMO — no incident state is persisted.
                </p>
              </div>
            ) : (
              <div className="py-10 text-center font-mono text-xs text-[#9CA3AF]">SELECT AN INCIDENT</div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
