// BorderMapCanvas — a visually convincing SIMULATED border terrain map.
// Layer 1 (WebGL): 3D terrain (hills, river valley, ridgelines) with orbit
//                  camera, drag-to-rotate and wheel-to-zoom. No external deps:
//                  raw WebGL 1 shaders, generated heightmap.
// Layer 2 (2D canvas overlay): camera glyphs, FOV wedges, incident pulses,
//                  target movement trails, zone boxes — interactive selection.
// NOTE: not a real GIS map; geometry is stylized terrain, not geographic data.
import { useEffect, useRef, useCallback, useState } from "react"
import type { Camera, Incident, Target } from "./types"

interface Props {
  cameras: Camera[]
  incidents?: Incident[]
  targets?: Target[]
  selectedCamera?: string | null
  onSelectCamera?: (id: string | null) => void
  onSelectIncident?: (id: string) => void
  selectedIncident?: string | null
  height?: number
}

// ─── WebGL terrain layer ─────────────────────────────────────────────────────
const VSH = `
attribute vec3 aPos;
attribute float aHeight;
uniform mat4 uMVP;
varying float vH;
varying vec3 vPos;
void main() {
  vH = aHeight;
  vPos = aPos;
  gl_Position = uMVP * vec4(aPos.xy, aHeight, 1.0);
}`

const FSH = `
precision mediump float;
varying float vH;
varying vec3 vPos;
uniform float uTime;
uniform vec3 uCamPos;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  // Palette: muted border-terrain tones derived from the IBVAP paper/green identity
  vec3 low  = vec3(0.855, 0.867, 0.820);   // valley floor (#dad9d1)
  vec3 mid  = vec3(0.760, 0.780, 0.700);   // slopes
  vec3 high = vec3(0.960, 0.960, 0.930);   // ridge highlights (#f5f4ed)
  vec3 river= vec3(0.545, 0.710, 0.760);   // riverbed accent (#8bb5c2)

  vec3 col = mix(low, mid, smoothstep(0.05, 0.45, vH));
  col = mix(col, high, smoothstep(0.55, 0.85, vH));

  // River channel along a sine path
  float riverPath = 0.5 + 0.12 * sin(vPos.x * 9.0);
  float riverDist = abs(vPos.y - riverPath);
  float riverMask = smoothstep(0.035, 0.0, riverDist) * smoothstep(0.35, 0.05, vH);
  col = mix(col, river, riverMask * 0.85);

  // Contour lines for a surveyor-map feel
  float c = abs(fract(vH * 14.0) - 0.5);
  float contour = smoothstep(0.48, 0.5, c) * smoothstep(0.4, 0.42, c);
  col = mix(col, col * 0.92, contour);

  // Subtle grain
  col += (hash(vPos.xy * 400.0 + floor(uTime * 0.5)) - 0.5) * 0.02;

  // Distance haze toward far edge
  float haze = smoothstep(0.55, 1.05, length(vPos - uCamPos.xy));
  col = mix(col, vec3(0.949, 0.949, 0.933), haze * 0.35);

  gl_FragColor = vec4(col, 1.0);
}`

function buildTerrain(grid: number) {
  const positions: number[] = []
  const heights: number[] = []
  const indices: number[] = []

  const h = (x: number, y: number) => {
    // Stylized border terrain: ridges + valley, deterministic
    let v = 0
    v += 0.32 * Math.sin(x * 3.1 + 1.7) * Math.cos(y * 2.3)
    v += 0.18 * Math.sin(x * 7.7) * Math.sin(y * 6.1 + 2.0)
    v += 0.1 * Math.sin(x * 13.0 + y * 9.0)
    v += 0.22 * Math.exp(-Math.pow((y - 0.78) * 3.4, 2)) // south ridge
    v += 0.16 * Math.exp(-Math.pow((x - 0.85) * 3.0, 2)) // east highlands
    return Math.max(0, v) * 0.55
  }

  for (let j = 0; j <= grid; j++) {
    for (let i = 0; i <= grid; i++) {
      const x = i / grid
      const y = j / grid
      positions.push(x, y, 0)
      heights.push(h(x, y))
    }
  }
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const a = j * (grid + 1) + i
      const b = a + 1
      const c = a + grid + 1
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  return {
    positions: new Float32Array(positions),
    heights: new Float32Array(heights),
    indices: new Uint16Array(indices),
  }
}

function mat4Multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16)
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + c] * b[r * 4 + k]
      out[r * 4 + c] = s
    }
  return out
}

function mat4Perspective(
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array {
  const f = 1 / Math.tan(fovY / 2)
  const nf = 1 / (near - far)
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ])
}

// Orbit camera: rotate around scene center by yaw/pitch at radius r.
function mat4OrbitView(
  yaw: number,
  pitch: number,
  radius: number,
): Float32Array {
  // View matrix = inverse of camera transform. Camera looks at origin-ish center.
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  // Camera position
  const ex = radius * sy * cp
  const ey = radius * cy * cp
  const ez = radius * sp
  // Forward (toward target), up approx world Z rotated by pitch
  const tx = 0.5,
    ty = 0.5,
    tz = 0.12
  let fx = tx - ex,
    fy = ty - ey,
    fz = tz - ez
  const fl = Math.hypot(fx, fy, fz)
  fx /= fl
  fy /= fl
  fz /= fl
  // Right = forward x up(0,0,1)
  let rx = fy * 1 - fz * 0
  let ry = fz * 0 - fx * 1
  let rz = 0
  const rl = Math.hypot(rx, ry, rz) || 1
  rx /= rl
  ry /= rl
  rz /= rl
  // Up = right x forward
  const ux = ry * fz - rz * fy
  const uy = rz * fx - rx * fz
  const uz = rx * fy - ry * fx

  const view = new Float32Array([
    rx,
    ux,
    -fx,
    0,
    ry,
    uy,
    -fy,
    0,
    rz,
    uz,
    -fz,
    0,
    -(rx * ex + ry * ey + rz * ez),
    -(ux * ex + uy * ey + uz * ez),
    fx * ex + fy * ey + fz * ez,
    1,
  ])
  return view
}

export default function BorderMapCanvas({
  cameras,
  incidents = [],
  targets = [],
  selectedCamera = null,
  onSelectCamera,
  onSelectIncident,
  selectedIncident = null,
  height = 420,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const glCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const viewRef = useRef({
    yaw: -0.7,
    pitch: 0.62,
    radius: 1.35,
    autoRotate: true,
  })
  const dragRef = useRef<{
    dragging: boolean
    lastX: number
    lastY: number
  }>({
    dragging: false,
    lastX: 0,
    lastY: 0,
  })
  const [label, setLabel] = useState<string>("")

  // ── WebGL setup ──
  useEffect(() => {
    const canvas = glCanvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: true })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return sh
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VSH))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FSH))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(
        "[BorderMap] program link failed:",
        gl.getProgramInfoLog(prog),
      )
      return
    }
    gl.useProgram(prog)

    const { positions, heights, indices } = buildTerrain(96)
    const posBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    const hBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, hBuf)
    gl.bufferData(gl.ARRAY_BUFFER, heights, gl.STATIC_DRAW)
    const idxBuf = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(prog, "aPos")
    const aHeight = gl.getAttribLocation(prog, "aHeight")
    const uMVP = gl.getUniformLocation(prog, "uMVP")
    const uTime = gl.getUniformLocation(prog, "uTime")
    const uCamPos = gl.getUniformLocation(prog, "uCamPos")

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.949, 0.949, 0.933, 1)

    let raf = 0
    const t0 = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth,
        hgt = canvas.clientHeight
      if (canvas.width !== w * dpr || canvas.height !== hgt * dpr) {
        canvas.width = w * dpr
        canvas.height = hgt * dpr
      }
    }

    const render = () => {
      resize()
      const v = viewRef.current
      if (v.autoRotate && !dragRef.current.dragging) v.yaw += 0.0012

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      const aspect = canvas.width / Math.max(1, canvas.height)
      const view = mat4OrbitView(v.yaw, v.pitch, v.radius)
      const proj = mat4Perspective(0.9, aspect, 0.05, 10)
      const mvp = mat4Multiply(proj, view)

      gl.uniformMatrix4fv(uMVP, false, mvp)
      gl.uniform1f(uTime, (performance.now() - t0) / 1000)
      gl.uniform3f(
        uCamPos,
        v.radius * Math.sin(v.yaw) * Math.cos(v.pitch),
        v.radius * Math.cos(v.yaw) * Math.cos(v.pitch),
        v.radius * Math.sin(v.pitch),
      )

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, hBuf)
      gl.enableVertexAttribArray(aHeight)
      gl.vertexAttribPointer(aHeight, 1, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ── Overlay drawing ──
  const drawOverlay = useCallback(() => {
    const overlay = overlayRef.current
    const container = containerRef.current
    if (!overlay || !container) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = container.clientWidth,
      hgt = container.clientHeight
    if (overlay.width !== w * dpr || overlay.height !== hgt * dpr) {
      overlay.width = w * dpr
      overlay.height = hgt * dpr
    }
    const ctx = overlay.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, hgt)

    const project = (mx: number, my: number) => ({
      x: mx * w,
      y: my * hgt,
    })

    // Restricted zone (stippled red-ish box)
    const rz = { x: 0.3, y: 0.2, w: 0.26, h: 0.34 }
    const p1 = project(rz.x, rz.y)
    ctx.save()
    ctx.strokeStyle = "rgba(239, 68, 68, 0.55)"
    ctx.setLineDash([5, 4])
    ctx.lineWidth = 1.2
    ctx.strokeRect(p1.x, p1.y, rz.w * w, rz.h * hgt)
    ctx.setLineDash([])
    ctx.fillStyle = "rgba(239, 68, 68, 0.75)"
    ctx.font = 'bold 9px "DM Mono", monospace'
    ctx.fillText("RESTRICTED ZONE (SIM)", p1.x + 4, p1.y + 12)
    ctx.restore()

    // Geofence border line (the "border" itself)
    ctx.save()
    ctx.strokeStyle = "rgba(17, 24, 39, 0.6)"
    ctx.lineWidth = 1.6
    ctx.setLineDash([10, 6])
    ctx.beginPath()
    ctx.moveTo(w * 0.05, hgt * 0.88)
    ctx.bezierCurveTo(
      w * 0.35,
      hgt * 0.78,
      w * 0.55,
      hgt * 0.3,
      w * 0.95,
      hgt * 0.18,
    )
    ctx.stroke()
    ctx.setLineDash([])
    ctx.font = 'bold 9px "DM Mono", monospace'
    ctx.fillStyle = "rgba(17, 24, 39, 0.6)"
    ctx.fillText("SIMULATED BORDER LINE", w * 0.62, hgt * 0.13)
    ctx.restore()

    // Camera FOV wedges + glyphs
    const now = Date.now() / 1000
    for (const cam of cameras) {
      const p = project(cam.map.x, cam.map.y)
      const fov = cam.fov
      const rr = fov.range * Math.min(w, hgt)
      const headingRad = ((fov.heading - 90) * Math.PI) / 180
      const spreadRad = (fov.spread * Math.PI) / 180

      // FOV wedge
      const active = selectedCamera === cam.id
      const alertCam = cam.status === "ALERT"
      const offline = cam.status === "OFFLINE"
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.arc(
        p.x,
        p.y,
        rr,
        headingRad - spreadRad / 2,
        headingRad + spreadRad / 2,
      )
      ctx.closePath()
      ctx.fillStyle = offline
        ? "rgba(156, 163, 177, 0.08)"
        : alertCam
          ? `rgba(239, 68, 68, ${0.1 + 0.05 * Math.sin(now * 3)})`
          : "rgba(34, 197, 94, 0.09)"
      ctx.fill()
      ctx.strokeStyle = offline
        ? "rgba(156, 163, 177, 0.35)"
        : alertCam
          ? "rgba(239, 68, 68, 0.5)"
          : "rgba(34, 197, 94, 0.45)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      // Glyph
      ctx.save()
      ctx.beginPath()
      ctx.arc(p.x, p.y, active ? 7 : 5.5, 0, Math.PI * 2)
      ctx.fillStyle = offline
        ? "#9CA3AF"
        : alertCam
          ? "#EF4444"
          : cam.status === "WARNING"
            ? "#F59E0B"
            : "#22C55E"
      ctx.fill()
      ctx.lineWidth = active ? 2.5 : 1.5
      ctx.strokeStyle = active ? "#111827" : "#FFFFFF"
      ctx.stroke()
      // lens tick toward heading
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(
        p.x + Math.cos(headingRad) * 10,
        p.y + Math.sin(headingRad) * 10,
      )
      ctx.strokeStyle = "#111827"
      ctx.lineWidth = 1.4
      ctx.stroke()
      ctx.font = 'bold 9px "DM Mono", monospace'
      ctx.fillStyle = "#111827"
      ctx.fillText(cam.id, p.x + 9, p.y - 7)
      ctx.restore()
    }

    // Target movement trails
    for (const t of targets) {
      if (!t.mapTrail.length) continue
      ctx.save()
      ctx.strokeStyle =
        t.objectType === "PERSON"
          ? "rgba(59, 130, 246, 0.8)"
          : "rgba(168, 85, 247, 0.8)"
      ctx.lineWidth = 1.8
      ctx.beginPath()
      t.mapTrail.forEach((pt, i) => {
        const p = project(pt.x, pt.y)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()
      // arrowhead at end
      const last = project(
        t.mapTrail[t.mapTrail.length - 1].x,
        t.mapTrail[t.mapTrail.length - 1].y,
      )
      ctx.beginPath()
      ctx.arc(last.x, last.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = t.objectType === "PERSON" ? "#3B82F6" : "#A855F7"
      ctx.fill()
      ctx.font = 'bold 9px "DM Mono", monospace'
      ctx.fillText(t.trackId, last.x + 7, last.y + 3)
      ctx.restore()
    }

    // Incident pulses
    for (const inc of incidents) {
      const cam = cameras.find((c) => c.id === inc.cameraId)
      if (!cam) continue
      const p = project(cam.map.x, cam.map.y)
      const pulse = (now % 2) / 2
      ctx.save()
      ctx.beginPath()
      ctx.arc(p.x, p.y, 8 + pulse * 22, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 * (1 - pulse)})`
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
    }
  }, [cameras, incidents, targets, selectedCamera])

  useEffect(() => {
    drawOverlay()
    const onResize = () => drawOverlay()
    window.addEventListener("resize", onResize)
    const id = setInterval(drawOverlay, 120) // pulse animations
    return () => {
      window.removeEventListener("resize", onResize)
      clearInterval(id)
    }
  }, [drawOverlay])

  // ── Interaction ──
  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }
  }
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return
      const dx = e.clientX - dragRef.current.lastX
      const dy = e.clientY - dragRef.current.lastY
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      viewRef.current.yaw -= dx * 0.006
      viewRef.current.pitch = Math.max(
        0.15,
        Math.min(1.25, viewRef.current.pitch + dy * 0.005),
      )
    }
    const up = () => (dragRef.current.dragging = false)
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
  }, [])

  const onOverlayClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = overlayRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    // hit-test cameras
    for (const cam of cameras) {
      const cx = cam.map.x * rect.width
      const cy = cam.map.y * rect.height
      if (Math.hypot(x - cx, y - cy) < 14) {
        onSelectCamera?.(cam.id === selectedCamera ? null : cam.id)
        return
      }
    }
    // hit-test incidents (near their camera)
    if (onSelectIncident) {
      for (const inc of incidents) {
        const cam = cameras.find((c) => c.id === inc.cameraId)
        if (!cam) continue
        const cx = cam.map.x * rect.width
        const cy = cam.map.y * rect.height
        if (Math.hypot(x - cx, y - cy) < 24) {
          onSelectIncident(inc.id)
          return
        }
      }
    }
    onSelectCamera?.(null)
  }

  // Non-passive wheel zoom (preventDefault needs { passive: false })
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      viewRef.current.radius = Math.max(
        0.7,
        Math.min(2.4, viewRef.current.radius + e.deltaY * 0.0012),
      )
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#f2f2ee] select-none"
      style={{ height }}
      onMouseDown={onMouseDown}
      onMouseEnter={() =>
        setLabel("DRAG TO ORBIT · SCROLL TO ZOOM · CLICK A CAMERA")
      }
      onMouseLeave={() => setLabel("")}
    >
      <canvas ref={glCanvasRef} className="absolute inset-0 w-full h-full" />
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        style={{ width: "100%", height: "100%" }}
        onClick={onOverlayClick}
      />
      <div className="absolute left-3 bottom-3 font-mono text-[9px] text-[#6B7280] bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-[#E5E7EB]">
        {label || "SIMULATED TERRAIN · NOT GEOGRAPHIC DATA"}
      </div>
      {selectedCamera && (
        <div className="absolute right-3 top-3 bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-lg px-3 py-2 font-mono text-[10px] text-[#111827]">
          {(() => {
            const c = cameras.find((x) => x.id === selectedCamera)
            if (!c) return null
            return (
              <>
                <div className="font-bold">
                  {c.id} — {c.name}
                </div>
                <div className="text-[#6B7280]">
                  {c.zone} · {c.status}
                </div>
                <div className="text-[#6B7280]">
                  FOV {c.fov.heading}° · {c.fov.spread}° spread
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
