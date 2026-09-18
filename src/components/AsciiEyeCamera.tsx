import React, { useEffect, useRef, useState, useCallback } from 'react';

type Mode = 'eye' | 'aperture' | 'radar';

interface AsciiEyeCameraProps {
  className?: string;
}

export default function AsciiEyeCamera({ className = '' }: AsciiEyeCameraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>('eye');
  const [isLocked, setIsLocked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [fps, setFps] = useState(60);
  const [clickCount, setClickCount] = useState(0);

  // Animation state refs
  const stateRef = useRef({
    angle: 0,
    pulse: 0,
    targetX: 0.5,
    targetY: 0.5,
    currentX: 0.5,
    currentY: 0.5,
    lastTime: performance.now(),
    frameCount: 0,
    lastFpsUpdate: performance.now(),
    shockwaves: [] as { radius: number; maxRadius: number; speed: number; opacity: number }[],
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    stateRef.current.targetX = x;
    stateRef.current.targetY = y;
    setMousePos({ x, y });
  }, []);

  const handleClick = useCallback(() => {
    setIsLocked((prev) => !prev);
    setClickCount((c) => c + 1);
    stateRef.current.shockwaves.push({
      radius: 5,
      maxRadius: 180,
      speed: 4.5,
      opacity: 1.0,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const state = stateRef.current;
      state.lastTime = time;

      state.frameCount++;
      if (time - state.lastFpsUpdate > 500) {
        setFps(Math.round((state.frameCount * 1000) / (time - state.lastFpsUpdate)));
        state.frameCount = 0;
        state.lastFpsUpdate = time;
      }

      state.currentX += (state.targetX - state.currentX) * 0.08;
      state.currentY += (state.targetY - state.currentY) * 0.08;

      state.angle += 0.015;
      state.pulse = (state.pulse + 0.03) % (Math.PI * 2);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#080A0C';
      ctx.fillRect(0, 0, width, height);

      const cols = 48;
      const rows = 36;
      const charWidth = width / cols;
      const charHeight = height / rows;

      ctx.font = '11px "DM Mono", "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      for (let i = state.shockwaves.length - 1; i >= 0; i--) {
        const sw = state.shockwaves[i];
        sw.radius += sw.speed;
        sw.opacity *= 0.95;
        if (sw.opacity < 0.05 || sw.radius > sw.maxRadius) {
          state.shockwaves.splice(i, 1);
        }
      }

      const pupilX = centerX + (state.currentX - 0.5) * (width * 0.35);
      const pupilY = centerY + (state.currentY - 0.5) * (height * 0.35);

      const glyphs = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
      const eyeR = Math.min(width, height) * 0.42;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * charWidth + charWidth / 2;
          const py = r * charHeight + charHeight / 2;

          const dxCenter = px - centerX;
          const dyCenter = py - centerY;
          const distCenter = Math.hypot(dxCenter, dyCenter);
          const angleCenter = Math.atan2(dyCenter, dxCenter);

          const dxPupil = px - pupilX;
          const dyPupil = py - pupilY;
          const distPupil = Math.hypot(dxPupil, dyPupil);

          let char = ' ';
          let color = '#2A3441';

          if (mode === 'eye') {
            const eyeHeight = eyeR * 0.75 * (0.95 + Math.sin(state.pulse) * 0.05);
            const normalizedX = (px - centerX) / eyeR;

            if (Math.abs(normalizedX) < 1.0) {
              const maxArc = Math.sqrt(1 - normalizedX * normalizedX) * eyeHeight;
              const inEyeLids = Math.abs(py - centerY) <= maxArc;

              if (inEyeLids) {
                if (distPupil < eyeR * 0.45) {
                  if (distPupil < eyeR * 0.15) {
                    char = isLocked ? '■' : '█';
                    color = isLocked ? '#EF4444' : '#22C55E';
                  } else if (distPupil < eyeR * 0.22) {
                    char = '@';
                    color = '#4ADE80';
                  } else {
                    const irisAngle = Math.atan2(dyPupil, dxPupil);
                    const spoke = Math.sin(irisAngle * 12 + state.angle * 2);
                    char = spoke > 0.3 ? '#' : spoke > -0.2 ? '%' : '*';
                    color = '#10B981';
                  }
                } else if (distPupil < eyeR * 0.52) {
                  char = '=';
                  color = '#059669';
                } else {
                  const scanline = (r + Math.floor(time * 0.005)) % 4 === 0;
                  char = scanline ? ':' : '.';
                  color = '#334155';
                }
              } else if (Math.abs(Math.abs(py - centerY) - maxArc) < 12) {
                char = '-';
                color = '#64748B';
              }
            }
          } else if (mode === 'aperture') {
            const bladeCount = 8;
            const bladeAngle = angleCenter + state.angle;
            const bladePhase = Math.sin(bladeAngle * bladeCount);

            if (distCenter < eyeR * 0.95 && distCenter > eyeR * 0.2) {
              if (Math.abs(distCenter - eyeR * 0.6) < 8) {
                char = 'O';
                color = '#22C55E';
              } else if (bladePhase > 0.7) {
                char = '/';
                color = '#38BDF8';
              } else if (bladePhase < -0.7) {
                char = '\\';
                color = '#10B981';
              } else {
                char = '+';
                color = '#1E293B';
              }
            } else if (distCenter <= eyeR * 0.2) {
              char = isLocked ? '●' : '○';
              color = isLocked ? '#EF4444' : '#4ADE80';
            }
          } else if (mode === 'radar') {
            const sweepAngle = (state.angle * 2.5) % (Math.PI * 2);
            let angleDiff = sweepAngle - angleCenter;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

            if (distCenter < eyeR && angleDiff > 0 && angleDiff < 0.6) {
              const intensity = 1 - angleDiff / 0.6;
              const gIdx = Math.min(glyphs.length - 1, Math.floor(intensity * glyphs.length));
              char = glyphs[gIdx];
              color = '#22C55E';
            } else if (Math.abs(distCenter - eyeR * 0.35) < 6 || Math.abs(distCenter - eyeR * 0.7) < 6 || Math.abs(distCenter - eyeR * 0.95) < 6) {
              char = '.';
              color = '#475569';
            }
          }

          for (const sw of state.shockwaves) {
            const swDiff = Math.abs(distCenter - sw.radius);
            if (swDiff < 14) {
              char = 'X';
              color = `rgba(74, 222, 128, ${sw.opacity})`;
            }
          }

          const isCrossX = Math.abs(py - pupilY) < 3 && Math.abs(px - pupilX) < eyeR * 0.7;
          const isCrossY = Math.abs(px - pupilX) < 3 && Math.abs(py - pupilY) < eyeR * 0.7;
          if (isCrossX || isCrossY) {
            if (Math.abs(px - pupilX) > 15 || Math.abs(py - pupilY) > 15) {
              char = isCrossX ? '-' : '|';
              color = isLocked ? '#EF4444' : '#22C55E';
            }
          }

          if (char !== ' ') {
            ctx.fillStyle = color;
            ctx.fillText(char, px, py);
          }
        }
      }

      const bSize = 24;
      const bx = pupilX;
      const by = pupilY;
      const bColor = isLocked ? '#EF4444' : '#22C55E';
      ctx.strokeStyle = bColor;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(bx - bSize, by - bSize + 8);
      ctx.lineTo(bx - bSize, by - bSize);
      ctx.lineTo(bx - bSize + 8, by - bSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx + bSize - 8, by - bSize);
      ctx.lineTo(bx + bSize, by - bSize);
      ctx.lineTo(bx + bSize, by - bSize + 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx - bSize, by + bSize - 8);
      ctx.lineTo(bx - bSize, by + bSize);
      ctx.lineTo(bx - bSize + 8, by + bSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx + bSize - 8, by + bSize);
      ctx.lineTo(bx + bSize, by + bSize);
      ctx.lineTo(bx + bSize, by + bSize - 8);
      ctx.stroke();

      ctx.font = '9px "DM Mono", "JetBrains Mono", monospace';
      ctx.fillStyle = bColor;
      ctx.textAlign = 'left';
      const targetLabel = isLocked ? 'TARGET LOCKED [CONF 99.4%]' : 'ACTIVE TRACKING [COCO_PERSON]';
      ctx.fillText(targetLabel, bx + bSize + 6, by - 6);
      ctx.fillStyle = '#64748B';
      const theta = (Math.round(state.angle * (180 / Math.PI)) % 360);
      ctx.fillText(`X:${Math.round(state.currentX * 1000)} Y:${Math.round(state.currentY * 1000)} THETA:${theta} DEG`, bx + bSize + 6, by + 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, isLocked]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={`relative rounded-xl border border-white/15 bg-[#080A0C] p-4 font-mono shadow-2xl transition-all select-none ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[10px] tracking-wider text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${isLocked ? 'bg-red-500 animate-ping' : 'bg-green-400'}`} />
          <span className="font-bold text-white uppercase tracking-widest">
            {isLocked ? 'TACTICAL TARGET LOCK' : 'OPTICAL SURVEILLANCE RADAR'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#38BDF8]">YOLO26n // NMS-FREE</span>
          <span className="text-green-400 font-bold">{fps} FPS</span>
        </div>
      </div>

      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-[#050709]">
        <canvas
          ref={canvasRef}
          width={520}
          height={390}
          className="h-full w-full object-contain cursor-crosshair"
        />

        <div className="pointer-events-none absolute left-3 top-3 text-[9px] font-mono text-[#64748B]">
          <div>SEC: 04-B / GATE-01</div>
          <div>OPTIC: 35mm F/1.4</div>
          <div className="text-green-400/90 font-bold">LATENCY: 8.2ms</div>
        </div>

        <div className="pointer-events-none absolute right-3 top-3 text-right text-[9px] font-mono text-[#64748B]">
          <div>X: {Math.round(mousePos.x * 1000)} / Y: {Math.round(mousePos.y * 1000)}</div>
          <div className={isLocked ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
            {isLocked ? '[TARGET_ACQUIRED]' : '[AUTO_TRACK_ARMED]'}
          </div>
          <div>SCAN_CYCLES: {clickCount + 42}</div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 text-[9px] font-mono text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>BIOMETRIC MATRIX ACTIVE</span>
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 text-[9px] font-mono text-white/50">
          AIM CURSOR • CLICK TO LOCK
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
        <div className="flex flex-wrap gap-1.5">
          {(['eye', 'aperture', 'radar'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={(e) => {
                e.stopPropagation();
                setMode(m);
              }}
              className={`rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                mode === m
                  ? 'bg-green-500 text-black shadow-sm font-bold'
                  : 'bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-white'
              }`}
            >
              {m === 'eye' ? '01 // BIOMETRIC EYE' : m === 'aperture' ? '02 // APERTURE MATRIX' : '03 // RADAR SWEEP'}
            </button>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`rounded border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            isLocked
              ? 'border-red-500 bg-red-500/20 text-red-300 hover:bg-red-500/30'
              : 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
          }`}
        >
          {isLocked ? 'UNLOCK TARGET' : 'LOCK TARGET'}
        </button>
      </div>
    </div>
  );
}
