import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Architecture from './pages/Architecture';
import ThreatLog from './pages/ThreatLog';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import GetStarted from './pages/GetStarted';

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
]);
