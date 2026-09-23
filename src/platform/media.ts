// Media manifest — real, freely-licensed reference media (Wikimedia Commons)
// used as visual texture in the SIMULATED demo. See MEDIA.md at repo root for
// full attributions. Media depicts unrelated public events; people shown are
// NOT suspects or watchlist targets. Demo names/tracks are fictional.

export interface MediaItem {
  file: string;
  alt: string;
  credit: string;
  license: string;
  sourceUrl: string;
}

export const CAMERA_MEDIA: Record<string, MediaItem> = {
  'CAM-01': {
    file: '/media/cam01_soldier.jpg',
    alt: 'Border guard standing at a border fence',
    credit: 'Still Thinking via Wikimedia Commons',
    license: 'CC BY-SA 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:India_soldier.jpg',
  },
  'CAM-02': {
    file: '/media/cam02_fence.jpg',
    alt: 'Border security personnel along a fenced border line',
    credit: 'Jason Burwen via Wikimedia Commons',
    license: 'CC BY-SA 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Border_security_force_India.jpg',
  },
  'CAM-03': {
    file: '/media/cam03_wagah_march.jpg',
    alt: 'Border guards marching in formation at a ceremony',
    credit: 'Peter van Aller via Wikimedia Commons',
    license: 'CC BY-SA 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bsf_india_wagah.jpg',
  },
  'CAM-04': {
    file: '/media/cam04_gate.jpg',
    alt: 'Border gate and fence line at a crossing point',
    credit: 'Diego Delso via Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Frontera_India-Parkistan-India08.JPG',
  },
  'CAM-05': {
    file: '/media/cam05_posture.jpg',
    alt: 'Border guard standing watch at a post',
    credit: 'Diego Delso via Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Frontera_India-Parkistan-India491.JPG',
  },
};

export const CLIP_MEDIA: Record<string, MediaItem & { durationLabel: string }> = {
  'EV-2082': {
    file: '/media/cam07_firing.webm',
    alt: 'Soldiers conducting a live-fire exercise (real footage, unrelated event)',
    credit: 'DVIDS via Wikimedia Commons',
    license: 'Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:B-Roll-_Dutch_recon_forces_sharpen_gunnery_skills_in_Senegal_during_African_Lion_2025_(961880).webm',
    durationLabel: '00:00:50',
  },
  'EV-2079': {
    file: '/media/cam06_patrol.webm',
    alt: 'Soldiers on a commemorative patrol march (real footage, unrelated event)',
    credit: 'U.S. Army / DVIDS via Wikimedia Commons',
    license: 'Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:AUSA_commemorates_Last_Patrol_(964984).webm',
    durationLabel: '00:00:51',
  },
};

export const MEDIA_FOOTER_NOTE =
  'Demo media: real, freely-licensed footage from Wikimedia Commons (see MEDIA.md). Depicts unrelated public events — shown purely as placeholder texture in this simulated demo. People shown are not suspects.';
