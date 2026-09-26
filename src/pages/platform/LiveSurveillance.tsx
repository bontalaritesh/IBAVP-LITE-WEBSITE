import { useEffect, useState } from "react"
import { platformService } from "../../platform/services"
import { CAMERA_MEDIA, MEDIA_FOOTER_NOTE } from "../../platform/media"
import type { Camera } from "../../platform/types"
import {
  PageHeader,
  Panel,
  CameraStatusDot,
  StatusBadge,
  useSimulatedValue,
} from "../../platform/ui"

function SimulatedFeed({ cam }: { cam: Camera }) {
  const fps = useSimulatedValue(cam.fps || 0, 0.8, 1400)
  const lat = useSimulatedValue(cam.latencyMs || 0, 12, 1800)
  const offline = cam.status === "OFFLINE"
  const media = CAMERA_MEDIA[cam.id]

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#111827]">
      {/* Real reference footage as feed texture (Wikimedia Commons, see MEDIA.md) */}
      {media && (
        <img
          src={media.file}
          alt={media.alt}
          className={`absolute inset-0 w-full h-full object-cover ${
            offline ? "opacity-30 blur-sm" : "opacity-90"
          }`}
          loading="lazy"
        />
      )}
      {/* Surveillance tint + scan texture over the real image */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-40"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)",
        }}
      />
      {offline ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#111827]/85">
          <span className="font-mono text-xs text-gray-400">NO SIGNAL</span>
          <span className="font-mono text-[10px] text-gray-500">
            RTSP unreachable (simulated)
          </span>
        </div>
      ) : (
        <>
          {/* AI-style detection boxes over the real image */}
          <div className="absolute left-[16%] top-[30%] w-[12%] h-[46%] border-2 border-green-400/90 rounded-sm">
            <span className="absolute -top-4 left-0 font-mono text-[9px] text-green-400 bg-black/60 px-1 rounded">
              person {cam.id === "CAM-02" ? "97" : "88"}%
            </span>
          </div>
          <div className="absolute left-[55%] top-[48%] w-[26%] h-[34%] border-2 border-sky-400/90 rounded-sm">
            <span className="absolute -top-4 left-0 font-mono text-[9px] text-sky-300 bg-black/60 px-1 rounded">
              structure 91%
            </span>
          </div>
        </>
      )}

      {/* HUD overlays */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 rounded px-2 py-1">
        <CameraStatusDot status={cam.status} />
        <span className="font-mono text-[10px] text-white font-bold">
          {cam.id}
        </span>
        <span className="font-mono text-[9px] text-gray-300">{cam.name}</span>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {cam.recording && (
          <span className="flex items-center gap-1 bg-black/60 rounded px-2 py-1 font-mono text-[9px] text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{" "}
            REC
          </span>
        )}
        {cam.watchlistMatch && (
          <span className="bg-red-600/90 rounded px-2 py-1 font-mono text-[9px] text-white font-bold animate-pulse">
            WATCHLIST MATCH (DEMO)
          </span>
        )}
      </div>
      <div className="absolute bottom-2 left-2 flex gap-2 font-mono text-[9px] text-gray-200 bg-black/60 rounded px-2 py-1">
        <span>{offline ? "— fps" : `${fps.toFixed(1)} fps`}</span>
        <span>{offline ? "— ms" : `${lat.toFixed(0)} ms`}</span>
        <span>FR {cam.faceRecognition ? "ON" : "OFF"}</span>
      </div>
      {media && (
        <div className="absolute bottom-2 right-2 font-mono text-[8px] text-white/75 bg-black/55 rounded px-1.5 py-0.5">
          REFERENCE IMG · {media.license}
        </div>
      )}
    </div>
  )
}

export default function LiveSurveillance() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    platformService.listCameras().then((cams) => {
      setCameras(cams)
      setSelected(cams[1]?.id ?? cams[0]?.id ?? null)
    })
  }, [])

  const sel = cameras.find((c) => c.id === selected) ?? null
  const visible = selected ? cameras.filter((c) => c.id === selected) : cameras

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Live Surveillance"
        description="Multi-camera monitoring wall with per-camera status, stream health, and AI detection state. Tiles use real, freely-licensed reference footage as stand-in texture; detection boxes are synthetic overlays — connect the IBVAP FastAPI backend to replace them with live WebSocket streams."
        badge="SIMULATION"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Camera selector rail */}
        <div className="lg:col-span-3">
          <Panel title="Camera Selector">
            <div className="space-y-1.5">
              <button
                onClick={() => setSelected(null)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                  selected === null
                    ? "border-green-500 bg-green-50/60 text-[#111827]"
                    : "border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50"
                }`}
              >
                ▦ ALL CAMERAS
              </button>
              {cameras.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    selected === c.id
                      ? "border-green-500 bg-green-50/60"
                      : "border-[#E5E7EB] hover:bg-gray-50"
                  }`}
                >
                  <CameraStatusDot status={c.status} />
                  <span className="text-xs font-mono font-semibold text-[#111827]">
                    {c.id}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] truncate flex-1">
                    {c.name}
                  </span>
                  <StatusBadge status={c.status} />
                </button>
              ))}
            </div>
          </Panel>

          {sel && (
            <Panel title={`Stream Health — ${sel.id}`} className="mt-4">
              <dl className="space-y-2 text-xs">
                {[
                  ["Status", sel.status],
                  [
                    "FPS",
                    sel.status === "OFFLINE"
                      ? "—"
                      : `${sel.fps.toFixed(1)} fps`,
                  ],
                  [
                    "Latency",
                    sel.status === "OFFLINE" ? "—" : `${sel.latencyMs} ms`,
                  ],
                  ["Detections", String(sel.detections)],
                  ["Persons", String(sel.persons)],
                  ["Vehicles", String(sel.vehicles)],
                  ["Face Recognition", sel.faceRecognition ? "ACTIVE" : "OFF"],
                  [
                    "Watchlist Match",
                    sel.watchlistMatch ? "MATCH (alert active)" : "none",
                  ],
                  ["Recording", sel.recording ? "REC" : "stopped"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-[#9CA3AF] font-mono text-[10px] uppercase tracking-wider">
                      {k}
                    </dt>
                    <dd className="font-mono text-[11px] font-semibold text-[#111827]">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              {CAMERA_MEDIA[sel.id] && (
                <p className="mt-3 pt-3 border-t border-[#E5E7EB] font-mono text-[9px] text-[#9CA3AF] leading-relaxed">
                  Tile image: {CAMERA_MEDIA[sel.id].credit} ·{" "}
                  {CAMERA_MEDIA[sel.id].license} ·{" "}
                  <a
                    href={CAMERA_MEDIA[sel.id].sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-700 underline"
                  >
                    source
                  </a>
                </p>
              )}
            </Panel>
          )}
        </div>

        {/* Feed wall */}
        <div className="lg:col-span-9">
          <div
            className={`grid gap-4 ${
              selected ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {visible.map((c) => (
              <SimulatedFeed key={c.id} cam={c} />
            ))}
          </div>
          <p className="mt-4 text-[11px] font-mono text-[#9CA3AF] leading-relaxed">
            {MEDIA_FOOTER_NOTE}
          </p>
        </div>
      </div>
    </div>
  )
}
