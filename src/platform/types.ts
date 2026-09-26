// Typed models for the IBVAP-Lite command platform demo data.
// All data shown in the Command Platform pages is SIMULATED unless a page
// explicitly marks it LIVE.

export type CameraStatus = "ONLINE" | "WARNING" | "ALERT" | "OFFLINE"
export type IncidentStatus = "NEW" | "INVESTIGATING" | "ACKNOWLEDGED" | "RESOLVED"
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ObjectType = "PERSON" | "VEHICLE" | "ANIMAL" | "OTHER"
export type EvidenceKind = "SNAPSHOT" | "VIDEO" | "METADATA"
export type HashState = "VERIFIED" | "PENDING" | "DEMO"

export interface MapPos {
  x: number
  y: number
}

export interface FovSpec {
  heading: number
  spread: number
  range: number
}

export interface Camera {
  id: string // e.g. CAM-01
  name: string
  zone: string
  status: CameraStatus
  fps: number
  latencyMs: number
  detections: number
  persons: number
  vehicles: number
  faceRecognition: boolean
  watchlistMatch: boolean
  recording: boolean
  /** Normalized position on the simulated border map, 0..1 */
  map: MapPos
  /** Camera field-of-view heading in degrees, and spread */
  fov: FovSpec
}

export interface Detection {
  id: string
  cameraId: string
  timestamp: string // ISO-like demo timestamp
  objectType: ObjectType
  label: string // e.g. 'person', 'truck'
  confidence: number // 0..1
  trackId?: string
  watchlistMatch?: string | null
}

export interface Target {
  trackId: string // e.g. TRK-014
  objectType: ObjectType
  label: string
  confidence: number
  firstSeen: string
  lastSeen: string
  cameraId: string
  direction: string // e.g. 'NE → SW'
  status: "ACTIVE" | "LOST" | "HANDOFF" | "ARCHIVED"
  reidStatus?: "MATCH" | "POSSIBLE" | "NO-FACE" | null
  watchlistName?: string | null
  history: {
    cameraId: string
    timestamp: string
    confidence: number
    note?: string
  }[]
  mapTrail: MapPos[]
}

export interface Incident {
  id: string // e.g. INC-1042
  timestamp: string
  cameraId: string
  zone: string
  severity: Severity
  detectedObject: ObjectType
  label: string
  trackId?: string
  recognitionStatus: string // e.g. 'WATCHLIST MATCH', 'UNIDENTIFIED', 'VEHICLE ONLY'
  confidence: number
  status: IncidentStatus
  summary: string
  evidenceIds: string[]
}

export interface Evidence {
  id: string // e.g. EV-2081
  incidentId?: string
  kind: EvidenceKind
  title: string
  cameraId: string
  timestamp: string
  objectType: ObjectType
  targetId?: string
  sha256: string // DEMO hash value, clearly labeled in UI
  chainOfCustody: "SEALED" | "IN_REVIEW" | "EXPORTED"
  sizeLabel: string
  durationLabel?: string
}

export interface AlertRecord {
  id: string
  timestamp: string
  cameraId: string
  zone: string
  severity: Severity
  person: string
  confidence: number
  message: string
}

export interface SystemMetric {
  cpu: number // percent
  ram: number // percent
  inferenceFps: number
  latencyMs: number
  storageUsedGb: number
  storageTotalGb: number
  networkOk: boolean
  models: {
    name: string
    status: "ONLINE" | "DEGRADED" | "OFFLINE"
    note: string
  }[]
}

export interface ReconstructionStep {
  cameraId: string
  timestamp: string
  trackId: string
  confidence: number
  direction: string
  gapLabel: string // time between sightings, e.g. '00:01:42'
}
