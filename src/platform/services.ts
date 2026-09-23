// ─────────────────────────────────────────────────────────────────────────────
// MOCK SERVICES — the single seam between UI and (future) real backend.
// Every function is async so the UI can switch to live APIs without page
// rewrites. All data is SIMULATED; pages must keep the DEMO labeling.
// ─────────────────────────────────────────────────────────────────────────────
import {
  DEMO_CAMERAS,
  DEMO_DETECTIONS,
  DEMO_TARGETS,
  DEMO_INCIDENTS,
  DEMO_EVIDENCE,
  DEMO_ALERTS,
  DEMO_SYSTEM,
  DEMO_RECONSTRUCTION,
} from './data';
import type {
  Camera,
  Detection,
  Target,
  Incident,
  Evidence,
  AlertRecord,
  SystemMetric,
  ReconstructionStep,
} from './types';

const SIMULATED_DELAY_MS = 120;

function delay<T>(value: T, ms = SIMULATED_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const platformService = {
  listCameras(): Promise<Camera[]> {
    return delay(DEMO_CAMERAS);
  },

  listDetections(): Promise<Detection[]> {
    return delay(DEMO_DETECTIONS);
  },

  listTargets(): Promise<Target[]> {
    return delay(DEMO_TARGETS);
  },

  listIncidents(): Promise<Incident[]> {
    return delay(DEMO_INCIDENTS);
  },

  listEvidence(): Promise<Evidence[]> {
    return delay(DEMO_EVIDENCE);
  },

  listAlerts(): Promise<AlertRecord[]> {
    return delay(DEMO_ALERTS);
  },

  getSystemMetrics(): Promise<SystemMetric> {
    return delay(DEMO_SYSTEM);
  },

  getReconstruction(trackId: string): Promise<ReconstructionStep[]> {
    const steps = DEMO_RECONSTRUCTION.filter((s) => s.trackId === trackId);
    return delay(steps.length ? steps : DEMO_RECONSTRUCTION);
  },
};
