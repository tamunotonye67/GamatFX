import { useEffect, useRef, type RefObject } from "react";

type LatLon = { lat: number; lon: number };

// Coarse continent landmass polygons (lat, lon) so the 3D globe shows real Earth shapes
function isLand(lat: number, lon: number): boolean {
  // North America
  if (lat > 15 && lat < 70 && lon > -165 && lon < -55) {
    if (lat < 30 && lon > -85) return false;
    if (lat > 55 && lon > -95 && lon < -60) return false;
    return true;
  }
  // South America
  if (lat >= -55 && lat <= 12 && lon >= -82 && lon <= -34) {
    if (lat < -20 && lon < -73) return false;
    if (lat < -35 && lon > -55) return false;
    return true;
  }
  // Europe
  if (lat >= 36 && lat <= 70 && lon >= -10 && lon <= 45) return true;
  // Africa
  if (lat >= -35 && lat <= 36 && lon >= -18 && lon <= 52) {
    if (lat > 12 && lon < -17) return false;
    if (lat < 5 && lon < 8) return false;
    return true;
  }
  // Asia
  if (lat >= 8 && lat <= 75 && lon >= 45 && lon <= 155) {
    if (lat < 22 && lon < 68) return false;
    return true;
  }
  // Australia
  if (lat >= -40 && lat <= -12 && lon >= 112 && lon <= 154) return true;
  return false;
}

function buildGlobePoints(): LatLon[] {
  const pts: LatLon[] = [];
  for (let lat = -75; lat <= 75; lat += 4.5) {
    const rad = (lat * Math.PI) / 180;
    const stepLon = Math.max(4.5, 4.5 / Math.max(0.25, Math.cos(rad)));
    for (let lon = -180; lon < 180; lon += stepLon) {
      if (isLand(lat, lon)) {
        pts.push({ lat, lon });
      }
    }
  }
  return pts;
}

const LAND_POINTS = buildGlobePoints();

const PEOPLE_NODES = [
  { lat: 6.5, lon: 3.4, solid: true }, // Lagos Hub
  { lat: 51.5, lon: -0.1, solid: false }, // London Session
  { lat: 40.7, lon: -74.0, solid: false }, // New York Session
  { lat: 25.2, lon: 55.3, solid: false }, // Dubai
  { lat: -26.2, lon: 28.0, solid: false }, // Johannesburg
];

const ARCS: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [0, 4],
];

function latLonTo3D(latDeg: number, lonDeg: number, radius: number) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  return {
    x: radius * Math.cos(lat) * Math.sin(lon),
    y: -radius * Math.sin(lat),
    z: radius * Math.cos(lat) * Math.cos(lon),
  };
}

function rotate3D(
  p: { x: number; y: number; z: number },
  rotY: number,
  tiltX: number,
  tiltZ: number
) {
  // 1. Spin around Y axis (revolving globe)
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;
  const y1 = p.y;

  // 2. Axial tilt around X axis
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;
  const x2 = x1;

  // 3. Slight Z-axis tilt for natural Earth angle
  const cosZ = Math.cos(tiltZ);
  const sinZ = Math.sin(tiltZ);
  return {
    x: x2 * cosZ - y2 * sinZ,
    y: x2 * sinZ + y2 * cosZ,
    z: z2,
  };
}

export default function RevolvingGlobe3D({
  orbitRefs,
}: {
  orbitRefs?: RefObject<Array<HTMLDivElement | null>>;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let rotY = -0.35;
    let tiltX = 0.28;
    const tiltZ = -0.14;

    let isDragging = false;
    let activePointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let velY = 0.0042;
    let velX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      activePointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      velY = 0;
      velX = 0;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || (activePointerId !== null && e.pointerId !== activePointerId)) {
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      const deltaY = dx * 0.0075;
      const deltaX = dy * 0.0055;
      rotY += deltaY;
      tiltX = Math.max(-1.1, Math.min(1.1, tiltX + deltaX));
      velY = deltaY;
      velX = deltaX;
    };

    const endDrag = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      isDragging = false;
      activePointerId = null;
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {}
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(280, rect.width);
      const height = Math.max(280, rect.height);

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.43;
      const fov = radius * 3.1;

      const project = (p3: { x: number; y: number; z: number }) => {
        const scale = fov / (fov - p3.z);
        return {
          sx: cx + p3.x * scale,
          sy: cy + p3.y * scale,
          scale,
          z: p3.z,
        };
      };

      // Subtle atmospheric red glow
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.15);
      glow.addColorStop(0, "rgba(220, 53, 69, 0.16)");
      glow.addColorStop(0.65, "rgba(220, 53, 69, 0.04)");
      glow.addColorStop(1, "rgba(17, 18, 21, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Outer sphere rim
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 3D Rotating Wireframe Meridians & Parallels
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 0.8;
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -85; lat <= 85; lat += 6) {
          const p3 = rotate3D(latLonTo3D(lat, lon, radius), rotY, tiltX, tiltZ);
          if (p3.z > -radius * 0.05) {
            const { sx, sy } = project(p3);
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 6) {
          const p3 = rotate3D(latLonTo3D(lat, lon, radius), rotY, tiltX, tiltZ);
          if (p3.z > -radius * 0.05) {
            const { sx, sy } = project(p3);
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // 3D Continent Dots (back hemisphere dimmed, front hemisphere bright)
      for (let i = 0; i < LAND_POINTS.length; i++) {
        const pt = LAND_POINTS[i];
        const p3 = rotate3D(latLonTo3D(pt.lat, pt.lon, radius), rotY, tiltX, tiltZ);
        const { sx, sy, scale } = project(p3);
        const depthNorm = (p3.z / radius + 1) * 0.5; // 0 (back) -> 1 (front)
        const alpha = p3.z < 0 ? 0.08 + depthNorm * 0.14 : 0.28 + depthNorm * 0.68;
        const dotR = (p3.z < 0 ? 0.9 : 1.35) * scale;

        ctx.fillStyle = `rgba(220, 53, 69, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3D Great-Circle Arcs between People Nodes
      const projectedNodes = PEOPLE_NODES.map((n) => {
        const p3 = rotate3D(latLonTo3D(n.lat, n.lon, radius), rotY, tiltX, tiltZ);
        return { ...n, p3, ...project(p3) };
      });

      for (const [aIdx, bIdx] of ARCS) {
        const a = PEOPLE_NODES[aIdx];
        const b = PEOPLE_NODES[bIdx];
        const steps = 24;
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const lat = a.lat + (b.lat - a.lat) * t;
          const lon = a.lon + (b.lon - a.lon) * t;
          const lift = 1 + Math.sin(t * Math.PI) * 0.12;
          const p3 = rotate3D(latLonTo3D(lat, lon, radius * lift), rotY, tiltX, tiltZ);
          if (p3.z > -radius * 0.1) {
            const { sx, sy } = project(p3);
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            started = false;
          }
        }
        ctx.strokeStyle = "rgba(220, 53, 69, 0.85)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // Draw People Nodes sorted by Z depth (back-to-front)
      const sortedNodes = [...projectedNodes].sort((a, b) => a.z - b.z);
      for (const node of sortedNodes) {
        if (node.z < -radius * 0.18) continue; // Hide far-back nodes cleanly
        const fade = node.z < 0 ? 0.35 : 1;
        const r = (node.solid ? 16 : 13.5) * node.scale;

        ctx.save();
        ctx.globalAlpha = fade;

        if (node.solid) {
          // Outer halo
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(220, 53, 69, 0.35)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Solid brand-red circle
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = "#dc3545";
          ctx.fill();
        } else {
          // Dark outlined circle
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = "#111215";
          ctx.fill();
          ctx.strokeStyle = "#dc3545";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Person icon inside circle
        const iconColor = node.solid ? "#ffffff" : "#dc3545";
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        // Head
        ctx.beginPath();
        ctx.arc(node.sx, node.sy - r * 0.22, r * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        // Shoulders
        ctx.beginPath();
        ctx.arc(node.sx, node.sy + r * 0.48, r * 0.36, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        ctx.restore();
      }

      // Project two orbital callout card anchors so they revolve in 3D with the globe
      if (orbitRefs?.current) {
        const anchors: LatLon[] = [
          { lat: 14, lon: 24 },
          { lat: -14, lon: 204 },
        ];
        const orbitR = radius * 1.06;
        const offX = canvas.offsetLeft;
        const offY = canvas.offsetTop;

        anchors.forEach((anchor, idx) => {
          const el = orbitRefs.current?.[idx];
          if (!el) return;
          const p3 = rotate3D(latLonTo3D(anchor.lat, anchor.lon, orbitR), rotY, tiltX, tiltZ);
          const proj = project(p3);
          const depth = Math.max(-1, Math.min(1, p3.z / orbitR));
          const cardScale = 0.78 + ((depth + 1) / 2) * 0.24;
          const opacity = depth > -0.15 ? 0.38 + ((depth + 0.15) / 1.15) * 0.62 : 0.28;

          el.style.left = `${(offX + proj.sx).toFixed(1)}px`;
          el.style.top = `${(offY + proj.sy).toFixed(1)}px`;
          el.style.transform = `translate(-50%, -50%) scale(${cardScale.toFixed(3)})`;
          el.style.opacity = opacity.toFixed(2);
          el.style.zIndex = p3.z >= 0 ? "25" : "5";
        });
      }

      if (!isDragging) {
        rotY += velY;
        tiltX = Math.max(-1.1, Math.min(1.1, tiltX + velX));
        // Smoothly damp flick momentum back toward gentle auto-rotation
        velY = velY * 0.94 + 0.0042 * 0.06;
        velX *= 0.9;
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
    };
  }, [orbitRefs]);

  return (
    <canvas
      ref={canvasRef}
      className="relative z-10 mx-auto block h-[340px] w-[340px] sm:h-[520px] sm:w-[520px] lg:h-[680px] lg:w-[680px] cursor-grab active:cursor-grabbing touch-none select-none"
    />
  );
}
