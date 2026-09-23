import { useEffect, useState } from 'react';
import { platformService } from '../../platform/services';
import type { Camera, Incident, Target } from '../../platform/types';
import { PageHeader, Panel, SeverityBadge, StatusBadge, DemoBadge } from '../../platform/ui';
import BorderMapCanvas from '../../platform/BorderMapCanvas';

export default function BorderMapPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  useEffect(() => {
    platformService.listCameras().then(setCameras);
    platformService.listIncidents().then((i) => setIncidents(i.filter((x) => x.status !== 'RESOLVED')));
    platformService.listTargets().then(setTargets);
  }, []);

  const selCam = cameras.find((c) => c.id === selectedCamera) ?? null;
  const selInc = incidents.find((i) => i.id === selectedIncident) ?? null;

  return (
    <div className="bg-[#f2f2ee] min-h-screen">
      <PageHeader
        kicker="Command Platform"
        title="Border Map"
        description="Interactive border monitoring visualization: camera positions, fields of view, restricted zones, active incidents, and target movement paths on simulated terrain. Drag to orbit, scroll to zoom, click cameras or incidents."
        badge="SIMULATION"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <Panel title="Operational Map" right={<DemoBadge kind="SIMULATION" />}>
            <BorderMapCanvas
              cameras={cameras}
              incidents={incidents}
              targets={targets}
              selectedCamera={selectedCamera}
              onSelectCamera={(id) => {
                setSelectedCamera(id);
                setSelectedIncident(null);
              }}
              onSelectIncident={setSelectedIncident}
              selectedIncident={selectedIncident}
              height={520}
            />
            <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-[#6B7280]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> ONLINE</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> WARNING</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> ALERT / INCIDENT PULSE</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" /> OFFLINE</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> PERSON TRAIL</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-purple-500 inline-block" /> VEHICLE/ANIMAL TRAIL</span>
              <span>NOT GEOGRAPHIC DATA</span>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Panel title="Selected Camera">
            {selCam ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#111827]">{selCam.id}</span>
                  <StatusBadge status={selCam.status} />
                </div>
                <div className="text-xs text-[#4B5563]">{selCam.name} · {selCam.zone}</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['FPS', selCam.status === 'OFFLINE' ? '—' : selCam.fps.toFixed(1)],
                    ['Latency', selCam.status === 'OFFLINE' ? '—' : `${selCam.latencyMs} ms`],
                    ['FOV', `${selCam.fov.heading}° / ${selCam.fov.spread}°`],
                    ['Recording', selCam.recording ? 'REC' : 'OFF'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#F7F8FA] rounded-lg px-2.5 py-2">
                      <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-wider">{k}</div>
                      <div className="font-mono text-xs font-bold text-[#111827] mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center font-mono text-xs text-[#9CA3AF]">CLICK A CAMERA ON THE MAP</div>
            )}
          </Panel>

          <Panel title="Selected Incident">
            {selInc ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#111827]">{selInc.id}</span>
                  <SeverityBadge severity={selInc.severity} />
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">{selInc.summary}</p>
                <div className="font-mono text-[10px] text-[#9CA3AF]">
                  {selInc.cameraId} · {selInc.zone} · {selInc.timestamp.split(' ')[1]}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center font-mono text-[11px] text-[#9CA3AF] leading-relaxed">
                CLICK A PULSING MARKER<br />TO INSPECT THE INCIDENT
              </div>
            )}
          </Panel>

          <Panel title="Zone Status">
            <div className="space-y-1.5">
              {['West Fence', 'North Gate', 'Checkpoint Alpha', 'South Post', 'Perimeter East', 'Riverbed'].map((z, i) => (
                <div key={z} className="flex items-center justify-between text-xs">
                  <span className="text-[#4B5563]">{z}</span>
                  <StatusBadge status={['ONLINE', 'ALERT', 'ONLINE', 'WARNING', 'ONLINE', 'OFFLINE'][i]} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
