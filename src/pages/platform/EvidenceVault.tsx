import { useEffect, useMemo, useState } from "react"
import { platformService } from "../../platform/services"
import {
  CAMERA_MEDIA,
  CLIP_MEDIA,
  MEDIA_FOOTER_NOTE,
} from "../../platform/media"
import type { Evidence, ObjectType } from "../../platform/types"
import {
  PageHeader,
  Panel,
  StatusBadge,
  Chip,
  DemoBadge,
} from "../../platform/ui"

const KINDS: (Evidence["kind"] | "All")[] = [
  "All",
  "SNAPSHOT",
  "VIDEO",
  "METADATA",
]
const TYPES: (ObjectType | "All")[] = [
  "All",
  "PERSON",
  "VEHICLE",
  "ANIMAL",
  "OTHER",
]

export default function EvidenceVault() {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [kind, setKind] = useState<Evidence["kind"] | "All">("All")
  const [type, setType] = useState<ObjectType | "All">("All")
  const [query, setQuery] = useState("")
  const [verifying, setVerifying] =
    useState<Record<string, "idle" | "running" | "done">>({})

  useEffect(() => {
    platformService.listEvidence().then(setEvidence)
  }, [])

  const filtered = useMemo(() => {
    let list = [...evidence]
    if (kind !== "All") list = list.filter((e) => e.kind === kind)
    if (type !== "All") list = list.filter((e) => e.objectType === type)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.cameraId.toLowerCase().includes(q) ||
          (e.targetId ?? "").toLowerCase().includes(q) ||
          (e.incidentId ?? "").toLowerCase().includes(q),
      )
    }
    return list
  }, [evidence, kind, type, query])

  const runVerify = (id: string) => {
    setVerifying((v) => ({ ...v, [id]: "running" }))
    setTimeout(() => setVerifying((v) => ({ ...v, [id]: "done" })), 1400)
  }

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Evidence Vault"
        description="Snapshots, clips, and detection metadata with chain-of-custody state. Hash values shown are DEMO placeholders — real SHA-256 sealing requires the backend evidence service."
        badge="DEMO"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <Panel>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">
                Kind
              </span>
              {KINDS.map((k) => (
                <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                  {k}
                </Chip>
              ))}
              <span className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest ml-3">
                Object
              </span>
              {TYPES.map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(t)}>
                  {t}
                </Chip>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search evidence ID, title, camera, target, incident…"
              className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-500/40"
            />
          </div>
        </Panel>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((e) => {
            const v = verifying[e.id] ?? "idle"
            return (
              <div
                key={e.id}
                className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
              >
                {/* Media: real reference image/video frame (Wikimedia Commons, see MEDIA.md) */}
                <div className="relative h-36 bg-[#111827] flex items-center justify-center overflow-hidden">
                  {(() => {
                    const img = CAMERA_MEDIA[e.cameraId]
                    const clip = CLIP_MEDIA[e.id]
                    const src = clip || img
                    if (!src) {
                      return (
                        <div className="text-center">
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-white/70 mx-auto"
                          >
                            <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
                            <path d="M14 3v6h6" />
                          </svg>
                          <span className="font-mono text-[9px] text-gray-500 mt-1 block">
                            METADATA ONLY
                          </span>
                        </div>
                      )
                    }
                    return (
                      <>
                        {clip ? (
                          <video
                            src={clip.file}
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={src.file}
                            alt={src.alt}
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                            loading="lazy"
                          />
                        )}
                        <span className="absolute bottom-1.5 right-1.5 bg-black/70 rounded px-1.5 py-0.5 font-mono text-[8px] text-white/85">
                          REFERENCE · {src.license}
                        </span>
                      </>
                    )
                  })()}
                  <span className="absolute top-2 left-2 bg-black/60 rounded px-2 py-0.5 font-mono text-[9px] text-white font-bold">
                    {e.id}
                  </span>
                  <span className="absolute top-2 right-2 bg-black/60 rounded px-2 py-0.5 font-mono text-[9px] text-amber-300">
                    DEMO MEDIA
                  </span>
                  {e.durationLabel && (
                    <span className="absolute bottom-1.5 left-2 bg-black/70 rounded px-1.5 py-0.5 font-mono text-[9px] text-white">
                      {e.durationLabel}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-[#111827] leading-snug">
                      {e.title}
                    </div>
                    <StatusBadge status={e.chainOfCustody} />
                  </div>
                  <div className="font-mono text-[10px] text-[#9CA3AF]">
                    {e.timestamp} · {e.cameraId} · {e.sizeLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[9px] font-semibold text-[#4B5563]">
                      {e.objectType}
                    </span>
                    {e.targetId && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[9px] font-semibold">
                        {e.targetId}
                      </span>
                    )}
                    {e.incidentId && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[9px] font-semibold">
                        {e.incidentId}
                      </span>
                    )}
                  </div>

                  {/* SHA-256 (demo) */}
                  <div className="bg-[#F7F8FA] rounded-lg px-2.5 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider">
                        SHA-256
                      </span>
                      <span className="font-mono text-[9px] font-bold text-amber-600">
                        DEMO VALUE
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-[#4B5563] break-all mt-0.5">
                      {e.sha256}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-0.5">
                    <button
                      className="flex-1 px-2 py-1.5 rounded-lg border border-[#E5E7EB] text-[10px] font-mono font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
                      title="Viewer opens real media when backend is connected"
                    >
                      VIEW
                    </button>
                    <button
                      className="flex-1 px-2 py-1.5 rounded-lg border border-[#E5E7EB] text-[10px] font-mono font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
                      title="Export requires the backend evidence service"
                    >
                      DOWNLOAD
                    </button>
                    <button
                      onClick={() => runVerify(e.id)}
                      disabled={v === "running"}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                        v === "done"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50"
                      }`}
                    >
                      {v === "idle" && "VERIFY"}
                      {v === "running" && "HASHING…"}
                      {v === "done" && "✓ DEMO PASS"}
                    </button>
                  </div>
                  {v === "done" && (
                    <p className="font-mono text-[9px] text-[#9CA3AF] leading-relaxed">
                      Simulated verification: in the real system this recomputes
                      SHA-256 server-side and compares against the sealed value.
                      No real hashing happened here.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
          {!filtered.length && (
            <div className="col-span-full py-12 text-center font-mono text-xs text-[#9CA3AF]">
              NO EVIDENCE MATCHES FILTERS
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <DemoBadge kind="DEMO" />
          <span className="font-mono text-[10px] text-[#9CA3AF]">
            {filtered.length} items · chain-of-custody states are illustrative
          </span>
        </div>
        <p className="text-[11px] font-mono text-[#9CA3AF] leading-relaxed">
          {MEDIA_FOOTER_NOTE}
        </p>
      </div>
    </div>
  )
}
