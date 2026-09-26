import { useEffect, useState } from "react"
import { platformService } from "../../platform/services"
import type { Camera } from "../../platform/types"
import { PageHeader, Panel, DemoBadge } from "../../platform/ui"

function Toggle({
  label,
  hint,
  defaultOn = true,
}: {
  label: string
  hint?: string
  defaultOn?: boolean
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E5E7EB] last:border-0">
      <div>
        <div className="text-xs font-semibold text-[#111827]">{label}</div>
        {hint && (
          <div className="text-[10px] text-[#9CA3AF] mt-0.5">{hint}</div>
        )}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          on ? "bg-green-500" : "bg-gray-300"
        }`}
        role="switch"
        aria-checked={on}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}

function NumberField({
  label,
  value,
  suffix,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string
  value: number
  suffix?: string
  min?: number
  max?: number
  step?: number
}) {
  const [v, setV] = useState(value)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E5E7EB] last:border-0">
      <span className="text-xs font-semibold text-[#111827]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          className="w-32 accent-green-500"
          aria-label={label}
        />
        <span className="font-mono text-xs font-bold text-[#111827] w-14 text-right">
          {v}
          {suffix}
        </span>
      </div>
    </div>
  )
}

export default function Settings() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [section, setSection] =
    useState<"cameras" | "detection" | "recognition" | "alerts" | "evidence" | "system">(
      "cameras",
    )

  useEffect(() => {
    platformService.listCameras().then(setCameras)
  }, [])

  const sections = [
    { id: "cameras", label: "Camera Configuration" },
    { id: "detection", label: "Detection Settings" },
    { id: "recognition", label: "Recognition Settings" },
    { id: "alerts", label: "Alert Settings" },
    { id: "evidence", label: "Evidence Settings" },
    { id: "system", label: "System Preferences" },
  ] as const

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Settings"
        description="Operational configuration for cameras, detection, recognition, alerting, evidence handling, and system preferences. Values are local-only in this demo and are not persisted."
        badge="DEMO"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Section nav */}
        <div className="lg:col-span-3">
          <Panel title="Categories">
            <div className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    section === s.id
                      ? "bg-[#111827] text-white"
                      : "text-[#4B5563] hover:bg-gray-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
              <DemoBadge kind="DEMO" />
            </div>
          </Panel>
        </div>

        {/* Section body */}
        <div className="lg:col-span-9 space-y-4">
          {section === "cameras" && (
            <Panel title="Camera Configuration">
              <div className="space-y-2">
                {cameras.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#F7F8FA] rounded-lg px-3 py-2.5"
                  >
                    <span className="font-mono text-xs font-bold text-[#111827] w-16">
                      {c.id}
                    </span>
                    <span className="text-xs text-[#4B5563] flex-1">
                      {c.name} · {c.zone}
                    </span>
                    <input
                      defaultValue={`rtsp://demo.local/${c.id.toLowerCase()}/stream`}
                      className="font-mono text-[10px] px-2 py-1 rounded border border-[#E5E7EB] bg-white w-full sm:w-64"
                      aria-label={`${c.id} RTSP URL`}
                    />
                    <span
                      className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        c.status === "OFFLINE"
                          ? "bg-gray-200 text-gray-500"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[10px] text-[#9CA3AF]">
                RTSP endpoints shown are placeholders; editing does not
                reconfigure anything in the demo.
              </p>
            </Panel>
          )}

          {section === "detection" && (
            <Panel title="Detection Settings">
              <NumberField
                label="YOLO Confidence Threshold"
                value={35}
                suffix="%"
                min={10}
                max={90}
              />
              <NumberField
                label="Frame Skip (AI interval)"
                value={3}
                suffix=" f"
                min={1}
                max={10}
              />
              <NumberField
                label="Max Detections / Frame"
                value={30}
                min={5}
                max={100}
              />
              <Toggle
                label="Vehicle Detection"
                hint="car, truck, bus classes"
              />
              <Toggle label="Person Detection" hint="COCO class 0" />
              <Toggle
                label="Animal Detection"
                hint="demo extension class group"
                defaultOn={false}
              />
              <Toggle
                label="Night Mode (CLAHE)"
                hint="low-light contrast enhancement"
                defaultOn={false}
              />
            </Panel>
          )}

          {section === "recognition" && (
            <Panel title="Recognition Settings">
              <NumberField
                label="HIGH Tier Threshold"
                value={55}
                suffix="%"
                min={40}
                max={80}
              />
              <NumberField
                label="POSSIBLE Tier Threshold"
                value={40}
                suffix="%"
                min={20}
                max={60}
              />
              <Toggle
                label="Multi-Angle Enrollment Averaging"
                hint="average 512-d embeddings across photos"
              />
              <Toggle
                label="Re-ID Across Cameras"
                hint="associate tracks between cameras"
              />
              <Toggle
                label="Anti-Spoof / Liveness"
                hint="reject photo-of-photo attacks (demo flag)"
              />
            </Panel>
          )}

          {section === "alerts" && (
            <Panel title="Alert Settings">
              <NumberField
                label="HIGH Cooldown"
                value={5}
                suffix=" s"
                min={1}
                max={60}
              />
              <NumberField
                label="POSSIBLE Cooldown"
                value={15}
                suffix=" s"
                min={5}
                max={120}
              />
              <Toggle
                label="Telegram Dispatch"
                hint="push evidence photo on HIGH matches (demo channel)"
              />
              <Toggle
                label="Dashboard Banner"
                hint="red banner overlay on live feed"
              />
              <Toggle
                label="Audible Alert"
                hint="play tone on HIGH matches"
                defaultOn={false}
              />
              <Toggle
                label="CSV Audit Export Row"
                hint="log every alert to audit_logs table"
              />
            </Panel>
          )}

          {section === "evidence" && (
            <Panel title="Evidence Settings">
              <Toggle
                label="Auto-Snapshot on HIGH Match"
                hint="save cropped face evidence automatically"
              />
              <Toggle
                label="Chain-of-Custody Lock"
                hint="seal evidence immediately on capture"
              />
              <Toggle
                label="SHA-256 Sealing"
                hint="requires backend hashing service (stub in demo)"
                defaultOn={false}
              />
              <NumberField
                label="Clip Retention"
                value={30}
                suffix=" d"
                min={1}
                max={365}
              />
              <NumberField
                label="Snapshot Retention"
                value={90}
                suffix=" d"
                min={1}
                max={365}
              />
            </Panel>
          )}

          {section === "system" && (
            <Panel title="System Preferences">
              <Toggle
                label="Simulated Data Mode"
                hint="populate pages with DEMO dataset instead of live APIs"
              />
              <Toggle
                label="Auto-Rotate Border Map"
                hint="slow orbit when idle"
              />
              <Toggle
                label="Compact Density"
                hint="tighter table rows"
                defaultOn={false}
              />
              <Toggle label="24-hour Clock" />
              <NumberField
                label="Map Overlay Opacity"
                value={70}
                suffix="%"
                min={20}
                max={100}
              />
              <p className="mt-3 font-mono text-[10px] text-[#9CA3AF]">
                Preferences reset on page reload in this demo build.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
