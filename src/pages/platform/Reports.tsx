import { useEffect, useState } from "react"
import type { ReactElement } from "react"
import { platformService } from "../../platform/services"
import type { Incident } from "../../platform/types"
import { PageHeader, Panel, DemoBadge } from "../../platform/ui"

type ReportKind = "incident" | "surveillance" | "camera-health" | "target-movement" | "evidence"

const REPORTS: {
  kind: ReportKind
  title: string
  description: string
  icon: ReactElement
}[] = [
  {
    kind: "incident",
    title: "Incident Report",
    description:
      "Full narrative of a selected incident: timeline, camera, recognition result, evidence links, and operator actions.",
    icon: (
      <path
        d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
        strokeWidth="1.7"
      />
    ),
  },
  {
    kind: "surveillance",
    title: "Surveillance Summary",
    description:
      "Shift-level rollup: detections, matches, alerts dispatched, and notable events across all cameras.",
    icon: (
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
        strokeWidth="1.7"
      />
    ),
  },
  {
    kind: "camera-health",
    title: "Camera Health Report",
    description:
      "Per-camera uptime, FPS stability, latency, dropout events, and maintenance flags over the report window.",
    icon: <path d="M3 7h13v10H3zM16 10l5-3v10l-5-3" strokeWidth="1.7" />,
  },
  {
    kind: "target-movement",
    title: "Target Movement Report",
    description:
      "Cross-camera track reconstruction for a track ID: sightings, gaps, direction, and confidence at each hop.",
    icon: (
      <path
        d="M4 20c4-1 3-6 7-7s6-4 9-9M4 20l4-.5M4 20l.5-4"
        strokeWidth="1.7"
      />
    ),
  },
  {
    kind: "evidence",
    title: "Evidence Report",
    description:
      "Manifest of evidence items with hashes, chain-of-custody history, and export events (hashes demo-only).",
    icon: (
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6M9 13h6M9 17h6"
        strokeWidth="1.7"
      />
    ),
  },
]

interface ExportResult {
  ok: boolean
  message: string
}

// ─── Service abstraction: swap these for real PDF generation later ───────────
const reportService = {
  // Intentionally a stub: printing uses the browser; export/PDF left as a seam.
  async export(_kind: ReportKind): Promise<ExportResult> {
    return {
      ok: false,
      message:
        "Export service not implemented — plug a real generator (e.g. server-side PDF) here.",
    }
  },
  print(): void {
    window.print()
  },
}

export default function Reports() {
  const [previewKind, setPreviewKind] = useState<ReportKind>("incident")
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [exportMsg, setExportMsg] = useState<string | null>(null)

  useEffect(() => {
    platformService.listIncidents().then(setIncidents)
  }, [])

  const report = REPORTS.find((r) => r.kind === previewKind)!

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Reports"
        description="Generate, preview, and export operational reports. Export/PDF is a clean service abstraction in this build; PRINT uses the browser renderer."
        badge="DEMO"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Report picker */}
        <div className="lg:col-span-4 space-y-3">
          {REPORTS.map((r) => (
            <button
              key={r.kind}
              onClick={() => setPreviewKind(r.kind)}
              className={`w-full text-left bg-white border rounded-xl p-4 transition-colors ${
                previewKind === r.kind
                  ? "border-green-500 bg-green-50/40"
                  : "border-[#E5E7EB] hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    previewKind === r.kind
                      ? "bg-green-500 text-black"
                      : "bg-[#F7F8FA] text-[#4B5563]"
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {r.icon}
                  </svg>
                </span>
                <div>
                  <div className="text-sm font-bold text-[#111827]">
                    {r.title}
                  </div>
                  <div className="text-[11px] text-[#6B7280] leading-snug">
                    {r.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Preview pane */}
        <div className="lg:col-span-8">
          <Panel
            title={`${report.title} — Preview`}
            right={<DemoBadge kind="DEMO" />}
          >
            <div className="border border-[#E5E7EB] rounded-lg bg-white p-6 min-h-[420px]">
              <div className="border-b border-[#E5E7EB] pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M2 7a5 5 0 1 1 10 0A5 5 0 0 1 2 7Z"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <circle cx="7" cy="7" r="1.5" fill="white" />
                      </svg>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm tracking-wider uppercase">
                      IBVAP-Lite · {report.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#9CA3AF]">
                    GENERATED{" "}
                    {new Date().toISOString().slice(0, 16).replace("T", " ")} ·
                    DEMO DATA
                  </span>
                </div>
              </div>

              {previewKind === "incident" && (
                <div className="space-y-3">
                  {incidents.slice(0, 3).map((i) => (
                    <div
                      key={i.id}
                      className="border border-[#E5E7EB] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#111827]">
                          {i.id} — {i.zone}
                        </span>
                        <span className="font-mono text-[10px] text-[#9CA3AF]">
                          {i.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B5563] mt-1.5 leading-relaxed">
                        {i.summary}
                      </p>
                      <div className="font-mono text-[10px] text-[#9CA3AF] mt-1.5">
                        {i.cameraId} · {i.recognitionStatus} ·{" "}
                        {(i.confidence * 100).toFixed(0)}% · evidence:{" "}
                        {i.evidenceIds.join(", ") || "none"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {previewKind === "surveillance" && (
                <div className="space-y-2 font-mono text-xs text-[#4B5563]">
                  <p>
                    Reporting window: 2026-09-20 06:00 → 14:00 (demo dataset)
                  </p>
                  <p>
                    Total detections: 425 · persons 214 · vehicles 176 · animals
                    23 · other 12
                  </p>
                  <p>
                    Watchlist matches: 2 (HIGH tier) · possible tier: 37 ·
                    unidentified: 71
                  </p>
                  <p>Telegram dispatches delivered: 2 (demo channel)</p>
                  <p>
                    Notable: INC-1042 critical match at North Gate; response
                    acknowledged in 4m 12s.
                  </p>
                </div>
              )}

              {previewKind === "camera-health" && (
                <div className="space-y-2 font-mono text-xs text-[#4B5563]">
                  <p>
                    CAM-01 · uptime 99.2% · avg fps 24.1 · avg latency 92 ms · 0
                    dropouts
                  </p>
                  <p>
                    CAM-02 · uptime 99.8% · avg fps 25.0 · avg latency 88 ms · 0
                    dropouts
                  </p>
                  <p>
                    CAM-03 · uptime 99.5% · avg fps 23.7 · avg latency 105 ms ·
                    1 dropout (12:31, 40s)
                  </p>
                  <p>
                    CAM-04 · uptime 96.1% · avg fps 11.2 · avg latency 240 ms ·
                    flag: low-fps sustained
                  </p>
                  <p>
                    CAM-05 · uptime 99.0% · avg fps 24.6 · avg latency 96 ms · 0
                    dropouts
                  </p>
                  <p>
                    CAM-06 · OFFLINE since 11:02 · flag: RTSP unreachable (demo
                    scenario)
                  </p>
                </div>
              )}

              {previewKind === "target-movement" && (
                <div className="space-y-2 font-mono text-xs text-[#4B5563]">
                  <p>TRK-014 · person · watchlist MATCH (Arjun S.)</p>
                  <p>13:38:02 CAM-01 · 72% · fence approach, heading E</p>
                  <p>13:41:47 CAM-03 · 88% · checkpoint pass · gap 3m45s</p>
                  <p>13:47:22 CAM-02 · 97% · north gate stop · gap 5m35s</p>
                  <p>13:52:03 CAM-05 · 74% · east perimeter exit · gap 4m41s</p>
                  <p className="text-[#9CA3AF]">
                    Reconstruction computed from simulated track events.
                  </p>
                </div>
              )}

              {previewKind === "evidence" && (
                <div className="space-y-2 font-mono text-xs text-[#4B5563]">
                  <p>
                    EV-2081 · snapshot · CAM-02 · SEALED · sha256 demo-9f2c…b34
                  </p>
                  <p>
                    EV-2082 · video 28s · CAM-02 · SEALED · sha256 demo-77b0…2a1
                  </p>
                  <p>
                    EV-2079 · video 1m12s · CAM-03 · IN_REVIEW · sha256
                    demo-2e8a…d80
                  </p>
                  <p>
                    EV-2077 · snapshot · CAM-05 · SEALED · sha256 demo-b1f4…d1f2
                  </p>
                  <p className="text-[#9CA3AF]">
                    All hash values in this demo build are placeholders, not
                    real digests.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  const res = await reportService.export(previewKind)
                  setExportMsg(res.message)
                }}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => reportService.print()}
                className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-xs font-bold uppercase tracking-wider text-[#4B5563] hover:bg-gray-50 transition-colors"
              >
                Print
              </button>
            </div>
            {exportMsg && (
              <p className="mt-2 font-mono text-[10px] text-amber-600">
                {exportMsg}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
