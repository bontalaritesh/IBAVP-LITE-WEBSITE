import { useState } from "react"
import { useReveal } from "../hooks/useReveal"

type Tier = "High" | "Possible" | "Unidentified"

interface Detection {
  id: string
  timestamp: string
  zone: string
  tier: Tier
  identity: string
  confidence: number
  notes: string
}

const detections: Detection[] = [
  {
    id: "EVT-0041",
    timestamp: "2024-11-15 03:47:22",
    zone: "North Gate — Cam 2",
    tier: "High",
    identity: "WATCHLIST-007 (Arjun S.)",
    confidence: 0.91,
    notes: "Day 3 reappearance, same entry corridor",
  },
  {
    id: "EVT-0040",
    timestamp: "2024-11-15 03:31:05",
    zone: "Perimeter East — Cam 5",
    tier: "Possible",
    identity: "WATCHLIST-012 (Deepak R.)",
    confidence: 0.74,
    notes: "Partial face obstruction — cap worn",
  },
  {
    id: "EVT-0039",
    timestamp: "2024-11-15 02:58:49",
    zone: "West Fence — Cam 1",
    tier: "Unidentified",
    identity: "Unidentified",
    confidence: 0.52,
    notes: "Low lighting. Below face-match threshold.",
  },
  {
    id: "EVT-0038",
    timestamp: "2024-11-15 01:14:33",
    zone: "South Post — Cam 3",
    tier: "High",
    identity: "WATCHLIST-002 (Priya M.)",
    confidence: 0.93,
    notes: "Clear frontal face. Liveness confirmed.",
  },
  {
    id: "EVT-0037",
    timestamp: "2024-11-14 23:42:11",
    zone: "North Gate — Cam 2",
    tier: "Possible",
    identity: "WATCHLIST-019 (Unknown M)",
    confidence: 0.71,
    notes: "Side-profile match only",
  },
  {
    id: "EVT-0036",
    timestamp: "2024-11-14 22:09:57",
    zone: "Checkpoint Alpha — Cam 4",
    tier: "Unidentified",
    identity: "Unidentified",
    confidence: 0.44,
    notes: "Person passed quickly. No usable face crop.",
  },
  {
    id: "EVT-0035",
    timestamp: "2024-11-14 20:55:22",
    zone: "Perimeter East — Cam 5",
    tier: "High",
    identity: "WATCHLIST-007 (Arjun S.)",
    confidence: 0.88,
    notes: "Alert deduped — within 30s cooldown of prior EVT",
  },
  {
    id: "EVT-0034",
    timestamp: "2024-11-14 19:27:04",
    zone: "West Fence — Cam 1",
    tier: "Possible",
    identity: "WATCHLIST-031 (Rajan T.)",
    confidence: 0.67,
    notes: "Thermal conditions degraded image quality",
  },
]

const tierConfig: Record<Tier, {
  label: string
  bg: string
  text: string
  dot: string
}> = {
  High: {
    label: "HIGH",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  Possible: {
    label: "POSSIBLE",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Unidentified: {
    label: "UNIDENTIFIED",
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
}

function TierBadge({ tier }: { tier: Tier }) {
  const c = tierConfig[tier]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

const TIERS: (Tier | "All")[] = ["All", "High", "Possible", "Unidentified"]

export default function ThreatLog() {
  const revealRef = useReveal()
  const [filter, setFilter] = useState<Tier | "All">("All")

  const filtered =
    filter === "All" ? detections : detections.filter((d) => d.tier === filter)

  return (
    <div ref={revealRef as React.Ref<HTMLDivElement>}>
      {/* Header */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="reveal">
            <span className="font-mono text-xs text-[#9CA3AF] uppercase tracking-widest">
              Audit Trail
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mt-2 mb-4">
              Threat Detection Log
            </h1>
            <p className="text-[#4B5563] text-lg leading-relaxed max-w-2xl">
              Every detection event from the prototype, with timestamp, zone,
              confidence tier, and matched identity. This is a proof-of-function
              record, not a marketing summary.
            </p>
          </div>
        </div>
      </section>

      {/* Confidence tier explainer */}
      <section className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="reveal mb-6">
            <h2 className="text-base font-semibold text-[#111827]">
              Three-tier confidence system
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
            {[
              {
                tier: "High" as Tier,
                threshold: "≥ 0.80 cosine similarity",
                desc: "Strong match against watchlist identity. Liveness check passed. Immediate alert dispatched to operator and Telegram.",
              },
              {
                tier: "Possible" as Tier,
                threshold: "0.60 – 0.79",
                desc: "Partial match — face obstructed, angle off-axis, or lighting degraded. Logged and flagged for manual review. Soft alert only.",
              },
              {
                tier: "Unidentified" as Tier,
                threshold: "< 0.60",
                desc: "Person detected but face-match score too low to attribute. Logged with evidence for later review. No alert sent.",
              },
            ].map(({ tier, threshold, desc }) => (
              <div
                key={tier}
                className="reveal bg-white border border-[#E5E7EB] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <TierBadge tier={tier} />
                  <span className="font-mono text-xs text-[#9CA3AF]">
                    {threshold}
                  </span>
                </div>
                <p className="text-sm text-[#4B5563] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-6 bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-2">
              Deduplication & cooldown logic
            </h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              Once an identity triggers a <em>High</em> or <em>Possible</em>{" "}
              alert, a 30-second cooldown window suppresses repeat alerts for
              the same identity. This prevents alert flooding from a stationary
              subject. Each event is still logged independently — only the push
              notification is suppressed. Example: EVT-0035 above was
              deduplicated within 30 seconds of a prior High-tier event for the
              same identity.
            </p>
          </div>
        </div>
      </section>

      {/* Detection log */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Filters */}
          <div className="reveal flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs font-semibold text-[#9CA3AF] font-mono mr-1">
              FILTER:
            </span>
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold font-mono transition-colors ${
                  filter === t
                    ? "bg-[#111827] text-white"
                    : "bg-gray-100 text-[#4B5563] hover:bg-gray-200"
                }`}
                aria-pressed={filter === t}
              >
                {t === "All" ? "ALL TIERS" : t.toUpperCase()}
              </button>
            ))}
            <span className="ml-auto text-xs text-[#9CA3AF] font-mono">
              {filtered.length} events shown
            </span>
          </div>

          <div className="reveal overflow-x-auto">
            <table className="w-full border border-[#E5E7EB] rounded-xl overflow-hidden text-sm bg-white">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
                  <th className="text-left px-4 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">
                    Event ID
                  </th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">
                    Identity
                  </th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-[#9CA3AF] uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((evt) => (
                  <tr
                    key={evt.id}
                    className="border-t border-[#E5E7EB] hover:bg-gray-50/50 transition-colors align-top"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-[#9CA3AF]">
                      {evt.id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#4B5563] whitespace-nowrap">
                      {evt.timestamp}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#4B5563] whitespace-nowrap">
                      {evt.zone}
                    </td>
                    <td className="px-4 py-3.5">
                      <TierBadge tier={evt.tier} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              evt.confidence >= 0.8
                                ? "bg-red-500"
                                : evt.confidence >= 0.6
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                            }`}
                            style={{ width: `${evt.confidence * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[#4B5563]">
                          {(evt.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#111827] font-medium whitespace-nowrap">
                      {evt.identity}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#9CA3AF] max-w-xs">
                      {evt.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
