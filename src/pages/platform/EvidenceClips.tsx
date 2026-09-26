import { useEffect, useState } from "react"
import { platformService } from "../../platform/services"
import { CLIP_MEDIA, MEDIA_FOOTER_NOTE } from "../../platform/media"
import type { Evidence, ObjectType } from "../../platform/types"
import { PageHeader, Panel, Chip, DemoBadge } from "../../platform/ui"

const CATS: (ObjectType | "All" | "CONTRABAND")[] = [
  "All",
  "PERSON",
  "VEHICLE",
  "CONTRABAND",
  "ANIMAL",
  "OTHER",
]

export default function EvidenceClips() {
  const [clips, setClips] = useState<Evidence[]>([])
  const [cat, setCat] = useState<ObjectType | "All" | "CONTRABAND">("All")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [verify, setVerify] = useState<"idle" | "running" | "done">("idle")

  useEffect(() => {
    platformService.listEvidence().then((ev) => {
      const vid = ev.filter((e) => e.kind === "VIDEO")
      setClips(vid)
      setSelectedId(vid[0]?.id ?? null)
    })
  }, [])

  // CONTRABAND is a requested category with no demo records; show it as an empty filter state.
  const filtered =
    cat === "All"
      ? clips
      : cat === "CONTRABAND"
        ? []
        : clips.filter((c) => c.objectType === cat)
  const selected = clips.find((c) => c.id === selectedId) ?? null

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Evidence Clips"
        description="Video evidence playback with hash-status and incident relationships. The player shell below shows the layout; real playback streams from the IBVAP backend."
        badge="DEMO"
      >
        {CATS.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Player column */}
        <div className="lg:col-span-8 space-y-4">
          <Panel>
            {selected ? (
              <div>
                {/* Real reference video player (Wikimedia Commons / DVIDS — see MEDIA.md) */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[#111827]">
                  {(() => {
                    const clip = CLIP_MEDIA[selected.id]
                    if (clip) {
                      return (
                        <video
                          key={clip.file}
                          src={clip.file}
                          controls
                          muted
                          loop
                          preload="metadata"
                          className="absolute inset-0 w-full h-full object-cover"
                          aria-label={clip.alt}
                        />
                      )
                    }
                    return (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-mono text-xs text-gray-500">
                          NO REFERENCE VIDEO FOR THIS CLIP
                        </span>
                      </div>
                    )
                  })()}
                  <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                    <span className="bg-black/60 rounded px-2 py-1 font-mono text-[10px] text-white font-bold">
                      {selected.cameraId}
                    </span>
                    <span className="bg-black/60 rounded px-2 py-1 font-mono text-[10px] text-white">
                      {selected.timestamp}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-500/90 rounded px-2 py-1 font-mono text-[10px] text-black font-bold pointer-events-none">
                    REFERENCE FOOTAGE · DEMO
                  </div>
                </div>
                {CLIP_MEDIA[selected.id] && (
                  <p className="mt-2 font-mono text-[10px] text-[#9CA3AF] leading-relaxed">
                    Playing: {CLIP_MEDIA[selected.id].credit} ·{" "}
                    {CLIP_MEDIA[selected.id].license} ·{" "}
                    <a
                      href={CLIP_MEDIA[selected.id].sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-700 underline"
                    >
                      source
                    </a>{" "}
                    — real footage of an unrelated event, used as stand-in
                    content in this simulated demo.
                  </p>
                )}

                {/* Hash verification interface */}
                <div className="mt-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">
                      Clip Integrity (SHA-256)
                    </span>
                    <span className="font-mono text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      DEMO HASH
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#4B5563] break-all bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
                    {selected.sha256}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        setVerify("running")
                        setTimeout(() => setVerify("done"), 1600)
                      }}
                      disabled={verify === "running"}
                      className="px-3 py-1.5 rounded-lg bg-[#111827] text-white text-[11px] font-mono font-bold hover:bg-black transition-colors"
                    >
                      {verify === "idle" && "RUN HASH CHECK"}
                      {verify === "running" && "COMPUTING…"}
                      {verify === "done" && "✓ MATCH (SIMULATED)"}
                    </button>
                    <span className="font-mono text-[10px] text-[#9CA3AF]">
                      {verify === "done"
                        ? "Recomputed digest equals sealed value (demo result)."
                        : "Recomputes digest and compares to sealed value — simulated in this build."}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center font-mono text-xs text-[#9CA3AF]">
                NO CLIP SELECTED
              </div>
            )}
          </Panel>
        </div>

        {/* Clip list */}
        <div className="lg:col-span-4">
          <Panel title="Clip List" right={<DemoBadge kind="DEMO" />}>
            <div className="space-y-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id)
                    setVerify("idle")
                  }}
                  className={`w-full text-left border rounded-xl p-3 transition-colors ${
                    selectedId === c.id
                      ? "border-green-500 bg-green-50/50"
                      : "border-[#E5E7EB] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#111827]">
                      {c.id}
                    </span>
                    <span className="font-mono text-[9px] text-[#9CA3AF]">
                      {CLIP_MEDIA[c.id]?.durationLabel ?? c.durationLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4B5563] mt-0.5">
                    {c.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[9px] font-semibold text-[#4B5563]">
                      {c.objectType}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[9px] font-semibold text-[#4B5563]">
                      {c.cameraId}
                    </span>
                    {c.incidentId && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[9px] font-semibold">
                        ↔ {c.incidentId}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {!filtered.length && (
                <div className="py-10 text-center font-mono text-[11px] text-[#9CA3AF] leading-relaxed">
                  {cat === "CONTRABAND"
                    ? "NO CONTRABAND CLIPS IN DEMO SET"
                    : "NO CLIPS FOR THIS CATEGORY"}
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-[11px] font-mono text-[#9CA3AF] leading-relaxed">
          {MEDIA_FOOTER_NOTE}
        </p>
      </div>
    </div>
  )
}
