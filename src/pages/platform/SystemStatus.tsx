import { useEffect, useState } from "react"
import { platformService } from "../../platform/services"
import type { SystemMetric } from "../../platform/types"
import {
  PageHeader,
  Panel,
  DemoBadge,
  useSimulatedValue,
} from "../../platform/ui"

function Gauge({
  label,
  value,
  unit = "%",
  tone,
}: {
  label: string
  value: number
  unit?: string
  tone: "green" | "amber" | "red"
}) {
  const color =
    tone === "green" ? "#22C55E" : tone === "amber" ? "#F59E0B" : "#EF4444"
  const R = 44,
    C = Math.PI * R // half circle
  const frac = Math.min(1, value / 100)
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col items-center">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path
          d={`M 12 62 A ${R} ${R} 0 0 1 108 62`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M 12 62 A ${R} ${R} 0 0 1 108 62`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${frac * C} ${C}`}
        />
        <text
          x="60"
          y="56"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#111827"
          fontFamily="Space Grotesk, sans-serif"
        >
          {value.toFixed(0)}
          {unit}
        </text>
      </svg>
      <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  )
}

export default function SystemStatus() {
  const [sys, setSys] = useState<SystemMetric | null>(null)
  const cpu = useSimulatedValue(62, 5)
  const ram = useSimulatedValue(48, 4)
  const infFps = useSimulatedValue(27.4, 2.2)
  const lat = useSimulatedValue(96, 14)

  useEffect(() => {
    platformService.getSystemMetrics().then(setSys)
  }, [])

  const storagePct = sys ? sys.storageUsedGb / sys.storageTotalGb : 0

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="System & Hardware"
        description="Health of the inference workstation, AI models, camera network, and storage. Live-ish gauges are simulated telemetry; in the real deployment these bind to the FastAPI /api/status endpoint."
        badge="SIMULATION"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Gauge
            label="CPU Load"
            value={cpu}
            tone={cpu > 85 ? "red" : cpu > 70 ? "amber" : "green"}
          />
          <Gauge
            label="RAM Usage"
            value={ram}
            tone={ram > 85 ? "red" : "green"}
          />
          <Gauge
            label="Inference FPS"
            value={(infFps / 40) * 100}
            unit="%"
            tone="green"
          />
          <Gauge
            label="Processing Latency"
            value={(lat / 300) * 100}
            unit="%"
            tone={lat > 200 ? "amber" : "green"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="AI Model Status" right={<DemoBadge kind="DEMO" />}>
            <div className="space-y-2">
              {(sys?.models ?? []).map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between bg-[#F7F8FA] rounded-lg px-3 py-2.5"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#111827]">
                      {m.name}
                    </div>
                    <div className="font-mono text-[10px] text-[#9CA3AF]">
                      {m.note}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                      m.status === "ONLINE"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : m.status === "DEGRADED"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        m.status === "ONLINE"
                          ? "bg-green-500"
                          : m.status === "DEGRADED"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    />
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel title="Camera Network (RTSP)">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-[#111827]">
                  5/6
                </span>
                <span className="font-mono text-xs text-green-600 font-bold">
                  STREAMING
                </span>
                <span className="font-mono text-[10px] text-[#9CA3AF] ml-auto">
                  1 unreachable (simulated)
                </span>
              </div>
              <div className="mt-3 flex gap-1.5">
                {[
                  "CAM-01",
                  "CAM-02",
                  "CAM-03",
                  "CAM-04",
                  "CAM-05",
                  "CAM-06",
                ].map((c, i) => (
                  <div key={c} className="flex-1 text-center">
                    <div
                      className={`h-2 rounded-full ${
                        i === 5
                          ? "bg-gray-300"
                          : i === 3
                            ? "bg-amber-400"
                            : "bg-green-500"
                      }`}
                    />
                    <div className="font-mono text-[8px] text-[#9CA3AF] mt-1">
                      {c}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[10px] text-[#9CA3AF] leading-relaxed">
                RTSP reachability shown per camera. CAM-06 is deliberately
                offline in the demo scenario to exercise the OFFLINE path.
              </p>
            </Panel>

            <Panel title="Storage">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-[#4B5563]">
                  {sys
                    ? `${sys.storageUsedGb} GB used of ${sys.storageTotalGb} GB`
                    : "—"}
                </span>
                <span className="font-mono text-[10px] text-[#9CA3AF]">
                  evidence + clips (demo)
                </span>
              </div>
              <div className="mt-2 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${storagePct * 100}%` }}
                />
              </div>
              <div className="mt-2 font-mono text-[10px] text-[#9CA3AF]">
                Network: {sys?.networkOk ? "CONNECTED" : "DEGRADED"}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
