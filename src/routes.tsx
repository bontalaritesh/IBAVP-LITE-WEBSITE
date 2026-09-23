import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Architecture from './pages/Architecture';
import ThreatLog from './pages/ThreatLog';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import GetStarted from './pages/GetStarted';

import PlatformLayout from './pages/platform/PlatformLayout';
import CommandCenter from './pages/platform/CommandCenter';
import LiveSurveillance from './pages/platform/LiveSurveillance';
import Incidents from './pages/platform/Incidents';
import BorderMapPage from './pages/platform/BorderMap';
import TargetTracking from './pages/platform/TargetTracking';
import Reconstruction from './pages/platform/Reconstruction';
import EvidenceVault from './pages/platform/EvidenceVault';
import EvidenceClips from './pages/platform/EvidenceClips';
import Analytics from './pages/platform/Analytics';
import SystemStatus from './pages/platform/SystemStatus';
import Reports from './pages/platform/Reports';
import Settings from './pages/platform/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Overview },
      { path: 'how-it-works', Component: HowItWorks },
      { path: 'architecture', Component: Architecture },
      { path: 'threat-log', Component: ThreatLog },
      { path: 'features', Component: Features },
      { path: 'get-started', Component: GetStarted },
    ],
  },
  {
    // Command Platform — functional demo extension, IBVAP-Lite visual identity.
    path: '/platform',
    Component: PlatformLayout,
    children: [
      { index: true, Component: CommandCenter },
      { path: 'surveillance', Component: LiveSurveillance },
      { path: 'incidents', Component: Incidents },
      { path: 'map', Component: BorderMapPage },
      { path: 'tracking', Component: TargetTracking },
      { path: 'reconstruction', Component: Reconstruction },
      { path: 'evidence', Component: EvidenceVault },
      { path: 'clips', Component: EvidenceClips },
      { path: 'analytics', Component: Analytics },
      { path: 'system', Component: SystemStatus },
      { path: 'reports', Component: Reports },
      { path: 'settings', Component: Settings },
    ],
  },
]);
