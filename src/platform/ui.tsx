// Shared UI primitives for the Command Platform pages.
// They deliberately reuse the existing IBVAP-Lite marketing theme:
// light paper background #f2f2ee, black borders, green-500 accent,
// Space Grotesk + DM Mono, rounded-xl cards, gray-100 filter chips.
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Severity, CameraStatus } from './types';

export function PageHeader({
  kicker,
  title,
  description,
  badge,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  badge?: 'DEMO' | 'LIVE' | 'SIMULATION';
  children?: ReactNode;
}) {
  return (
    <section className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs text-[#9CA3AF] uppercase tracking-widest">{kicker}</span>
              {badge && <DemoBadge kind={badge} />}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mt-2">{title}</h1>
            <p className="text-[#4B5563] text-base lg:text-lg leading-relaxed max-w-3xl mt-2">{description}</p>
          </div>
          {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function DemoBadge({ kind = 'DEMO' }: { kind?: 'DEMO' | 'LIVE' | 'SIMULATION' }) {
  const styles =
    kind === 'LIVE'
      ? 'bg-green-50 text-green-700 border-green-200'
      : kind === 'SIMULATION'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold tracking-widest ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${kind === 'LIVE' ? 'bg-green-500' : kind === 'SIMULATION' ? 'bg-blue-500' : 'bg-amber-500'}`} />
      {kind} DATA
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold tracking-wider ${map[severity]}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    NEW: 'bg-red-50 text-red-700 border-red-200',
    INVESTIGATING: 'bg-amber-50 text-amber-700 border-amber-200',
    ACKNOWLEDGED: 'bg-blue-50 text-blue-700 border-blue-200',
    RESOLVED: 'bg-green-50 text-green-700 border-green-200',
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    LOST: 'bg-gray-100 text-gray-600 border-gray-200',
    HANDOFF: 'bg-blue-50 text-blue-700 border-blue-200',
    ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-200',
    ONLINE: 'bg-green-50 text-green-700 border-green-200',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
    ALERT: 'bg-red-50 text-red-700 border-red-200',
    OFFLINE: 'bg-gray-100 text-gray-500 border-gray-200',
    SEALED: 'bg-green-50 text-green-700 border-green-200',
    IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    EXPORTED: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold tracking-wider ${map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function CameraStatusDot({ status }: { status: CameraStatus }) {
  const map: Record<CameraStatus, string> = {
    ONLINE: 'bg-green-500',
    WARNING: 'bg-amber-500',
    ALERT: 'bg-red-500 animate-pulse',
    OFFLINE: 'bg-gray-400',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status]}`} />;
}

export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'green' | 'red' | 'amber';
}) {
  const toneMap = {
    default: 'text-[#111827]',
    green: 'text-green-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
      <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">{label}</div>
      <div className={`text-2xl sm:text-3xl font-bold mt-1 ${toneMap[tone]}`}>{value}</div>
      {sub && <div className="font-mono text-[10px] text-[#9CA3AF] mt-1">{sub}</div>}
    </div>
  );
}

export function Panel({
  title,
  right,
  children,
  className = '',
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-xl ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <h3 className="font-mono text-xs font-semibold text-[#111827] uppercase tracking-widest">{title}</h3>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-semibold font-mono transition-colors ${
        active ? 'bg-[#111827] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function Bar({ value, tone = 'green' }: { value: number; tone?: 'green' | 'red' | 'amber' | 'gray' }) {
  const toneMap = { green: 'bg-green-500', red: 'bg-red-500', amber: 'bg-amber-500', gray: 'bg-gray-400' };
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${toneMap[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

/** Simulated metric that jitters around a base value, labelled DEMO in UI. */
export function useSimulatedValue(base: number, jitter = 2, intervalMs = 1600): number {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setV(base + (Math.random() * 2 - 1) * jitter);
    }, intervalMs);
    return () => clearInterval(id);
  }, [base, jitter, intervalMs]);
  return v;
}
