import { useEffect, useState } from "react"
import { Link } from "react-router"
import { platformService } from "../../platform/services"
import { CAMERA_MEDIA } from "../../platform/media"
import type {
  Camera,
  Incident,
  AlertRecord,
  Detection,
} from "../../platform/types"
import {
  PageHeader,
  DemoBadge,
  StatCard,
  Panel,
  SeverityBadge,
  CameraStatusDot,
  useSimulatedValue,
} from "../../platform/ui"
import BorderMapCanvas from "../../platform/BorderMapCanvas"

export default function CommandCenter() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [alerts, setAlerts] = useState<AlertRecord[]>([])
  const [detections, setDetections] = useState<Detection[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  const cpu = useSimulatedValue(62, 4)
  const infFps = useSimulatedValue(27.4, 2.5)

  useEffect(() => {
    platformService.listCameras().then(setCameras)
    platformService.listIncidents().then(setIncidents)
    platformService.listAlerts().then(setAlerts)
    platformService.listDetections().then(setDetections)
  }, [])

  const online = cameras.filter((c) => c.status !== "OFFLINE").length
  const alertCams = cameras.filter((c) => c.status === "ALERT").length
  const activeIncidents = incidents.filter(
    (i) => i.status !== "RESOLVED",
  ).length
  const trackedTargets = new Set(
    detections.filter((d) => d.trackId).map((d) => d.trackId),
  ).size

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Command Center"
        description="Operational overview of the border surveillance network: camera health, active incidents, tracked targets, and system metrics at a glance."
        badge="SIMULATION"
      >
        <Link
          to="/platform/surveillance"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
        >
          Open Live Feed
        </Link>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top stat row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard
            label="Cameras"
            value={cameras.length}
            sub={`${online} online`}
          />
          <StatCard
            label="In Alert"
            value={alertCams}
            tone="red"
            sub="requires attention"
          />
          <StatCard
            label="Active Incidents"
            value={activeIncidents}
            tone="amber"
            sub="unresolved"
          />
          <StatCard
            label="Tracked Targets"
            value={trackedTargets}
            tone="green"
            sub="unique tracks"
          />
          <StatCard
            label="Watchlist Matches"
            value="2"
            tone="red"
            sub="last 24h (demo)"
          />
          <StatCard
            label="System Health"
            value="96%"
            tone="green"
            sub="all core services"
          />
        </div>

        {/* Main grid: left summary / center map / right feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: camera/status summary */}
          <div className="lg:col-span-3">
            <Panel title="Camera Network">
              <div className="space-y-2">
                {cameras.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id === selected ? null : c.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors ${
                      selected === c.id
                        ? "border-green-500 bg-green-50/50"
                        : "border-[#E5E7EB] hover:bg-gray-50"
                    }`}
                  >
                    {CAMERA_MEDIA[c.id] ? (
                      <img
                        src={CAMERA_MEDIA[c.id].file}
                        alt={CAMERA_MEDIA[c.id].alt}
                        loading="lazy"
                        className={`w-9 h-9 rounded-md object-cover border border-[#E5E7EB] shrink-0 ${
                          c.status === "OFFLINE" ? "grayscale opacity-50" : ""
                        }`}
                      />
                    ) : (
                      <CameraStatusDot status={c.status} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#111827] font-mono">
                        {c.id}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] truncate">
                        {c.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono text-[10px] font-bold ${
                          c.status === "OFFLINE"
                            ? "text-gray-400"
                            : "text-green-600"
                        }`}
                      >
                        {c.status === "OFFLINE"
                          ? "—"
                          : `${c.fps.toFixed(0)} fps`}
                      </div>
                      <div className="font-mono text-[9px] text-[#9CA3AF]">
                        {c.status === "OFFLINE"
                          ? "NO LINK"
                          : `${c.latencyMs} ms`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#E5E7EB] font-mono text-[10px] text-[#9CA3AF]">
                {online}/{cameras.length} ONLINE · 1 OFFLINE (SIM)
              </div>
            </Panel>
          </div>

          {/* CENTER: map visualization */}
          <div className="lg:col-span-6">
            <Panel
              title="Border Overview — Simulated Terrain"
              right={<DemoBadge kind="SIMULATION" />}
            >
              <BorderMapCanvas
                cameras={cameras}
                incidents={incidents.filter((i) => i.status !== "RESOLVED")}
                selectedCamera={selected}
                onSelectCamera={setSelected}
                height={380}
              />
            </Panel>
          </div>

          {/* RIGHT: incident/event feed */}
          <div className="lg:col-span-3">
            <Panel title="Live Event Feed" right={<DemoBadge kind="DEMO" />}>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="border-l-2 border-[#E5E7EB] pl-3 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#9CA3AF]">
                        {a.timestamp}
                      </span>
                      <SeverityBadge severity={a.severity} />
                    </div>
                    <div className="text-xs font-semibold text-[#111827] mt-0.5">
                      {a.person}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">
                      {a.cameraId} · {a.zone} ·{" "}
                      {(a.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* BOTTOM: system metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Panel>
            <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">
              CPU Load
            </div>
            <div className="text-xl font-bold text-[#111827] font-mono mt-1">
              {cpu.toFixed(0)}%
            </div>
            <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${cpu}%` }}
              />
            </div>
          </Panel>
          <Panel>
            <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">
              AI Inference
            </div>
            <div className="text-xl font-bold text-green-600 font-mono mt-1">
              {infFps.toFixed(1)} fps
            </div>
            <div className="font-mono text-[10px] text-[#9CA3AF] mt-2">
              YOLO26n + ArcFace pipeline
            </div>
          </Panel>
          <Panel>
            <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">
              Recent Detections
            </div>
            <div className="text-xl font-bold text-[#111827] font-mono mt-1">
              {detections.length}
            </div>
            <div className="font-mono text-[10px] text-[#9CA3AF] mt-2">
              rolling window (demo)
            </div>
          </Panel>
          <Panel>
            <div className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">
              Latest Incident
            </div>
            <div className="text-xl font-bold text-red-600 font-mono mt-1">
              {incidents[0]?.id ?? "—"}
            </div>
            <div className="font-mono text-[10px] text-[#9CA3AF] mt-2 truncate">
              {incidents[0]?.zone ?? ""}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
