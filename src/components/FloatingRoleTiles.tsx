import { useEffect, useRef } from "react";
import {
  BarChart3,
  Briefcase,
  Code2,
  Headphones,
  Megaphone,
  Palette,
  PenTool,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

type TileSpec = {
  id: string;
  Icon: LucideIcon;
  size: number;
  xPct: number;
  yPct: number;
  vx: number;
  vy: number;
  rot: number;
};

const HERO_TILES: TileSpec[] = [
  { id: "code", Icon: Code2, size: 56, xPct: 0.08, yPct: 0.2, vx: 38, vy: 28, rot: -12 },
  { id: "trend", Icon: TrendingUp, size: 50, xPct: 0.18, yPct: 0.52, vx: -32, vy: 34, rot: 8 },
  { id: "palette", Icon: Palette, size: 54, xPct: 0.1, yPct: 0.78, vx: 34, vy: -30, rot: 14 },
  { id: "chart", Icon: BarChart3, size: 46, xPct: 0.27, yPct: 0.16, vx: 28, vy: 36, rot: -8 },
  { id: "mega", Icon: Megaphone, size: 56, xPct: 0.88, yPct: 0.22, vx: -36, vy: 26, rot: 12 },
  { id: "support", Icon: Headphones, size: 50, xPct: 0.78, yPct: 0.5, vx: 30, vy: -34, rot: -10 },
  { id: "pen", Icon: PenTool, size: 54, xPct: 0.86, yPct: 0.76, vx: -32, vy: -28, rot: -14 },
  { id: "brief", Icon: Briefcase, size: 46, xPct: 0.7, yPct: 0.16, vx: -28, vy: 32, rot: 7 },
  { id: "users", Icon: Users, size: 48, xPct: 0.22, yPct: 0.84, vx: 35, vy: -26, rot: -6 },
];

const CTA_TILES: TileSpec[] = [
  { id: "cta-code", Icon: Code2, size: 54, xPct: 0.07, yPct: 0.22, vx: 34, vy: 24, rot: -12 },
  { id: "cta-trend", Icon: TrendingUp, size: 48, xPct: 0.17, yPct: 0.56, vx: -28, vy: 30, rot: 8 },
  { id: "cta-chart", Icon: BarChart3, size: 50, xPct: 0.1, yPct: 0.72, vx: 30, vy: -26, rot: 12 },
  { id: "cta-brief", Icon: Briefcase, size: 54, xPct: 0.88, yPct: 0.22, vx: -32, vy: 24, rot: 12 },
  { id: "cta-users", Icon: Users, size: 48, xPct: 0.78, yPct: 0.54, vx: 28, vy: -30, rot: -8 },
  { id: "cta-pen", Icon: PenTool, size: 50, xPct: 0.86, yPct: 0.72, vx: -30, vy: -24, rot: -12 },
];

type Props = {
  variant?: "hero" | "cta";
};

export default function FloatingRoleTiles({ variant = "hero" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const specs = variant === "cta" ? CTA_TILES : HERO_TILES;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 1200;
    let height = container.clientHeight || 520;

    const bodies = specs.map((t) => ({
      x: Math.max(12, Math.min(width - t.size - 12, t.xPct * width)),
      y: Math.max(12, Math.min(height - t.size - 12, t.yPct * height)),
      vx: t.vx,
      vy: t.vy,
      size: t.size,
      rot: t.rot,
      vrot: (t.vx > 0 ? 1 : -1) * 6,
    }));

    const onResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth || width;
      height = containerRef.current.clientHeight || height;
      for (const b of bodies) {
        b.x = Math.max(8, Math.min(Math.max(8, width - b.size - 8), b.x));
        b.y = Math.max(8, Math.min(Math.max(8, height - b.size - 8), b.y));
      }
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Move & bounce off container walls
      for (const b of bodies) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vrot * dt;

        const maxX = Math.max(8, width - b.size - 8);
        const maxY = Math.max(8, height - b.size - 8);

        if (b.x <= 8) {
          b.x = 8;
          b.vx = Math.abs(b.vx);
        } else if (b.x >= maxX) {
          b.x = maxX;
          b.vx = -Math.abs(b.vx);
        }

        if (b.y <= 8) {
          b.y = 8;
          b.vy = Math.abs(b.vy);
        } else if (b.y >= maxY) {
          b.y = maxY;
          b.vy = -Math.abs(b.vy);
        }
      }

      // Elastic collisions between tiles ("bouncing on each other")
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const ax = a.x + a.size / 2;
          const ay = a.y + a.size / 2;
          const bx = b.x + b.size / 2;
          const by = b.y + b.size / 2;

          const dx = bx - ax;
          const dy = by - ay;
          const dist = Math.hypot(dx, dy);
          const minDist = (a.size + b.size) * 0.56;

          if (dist > 0.001 && dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            // Separate equally so tiles never stick together
            a.x -= nx * (overlap / 2);
            a.y -= ny * (overlap / 2);
            b.x += nx * (overlap / 2);
            b.y += ny * (overlap / 2);

            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const relVel = dvx * nx + dvy * ny;

            if (relVel > 0) {
              a.vx -= relVel * nx;
              a.vy -= relVel * ny;
              b.vx += relVel * nx;
              b.vy += relVel * ny;

              // Subtle spin reaction on bounce
              a.vrot = -a.vrot;
              b.vrot = -b.vrot;
            }
          }
        }
      }

      // Apply GPU-accelerated transforms directly to DOM nodes
      for (let i = 0; i < bodies.length; i++) {
        const el = tileRefs.current[i];
        if (el) {
          const b = bodies[i];
          el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(
            1
          )}px, 0) rotate(${b.rot.toFixed(1)}deg)`;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [specs]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden md:block"
    >
      {specs.map((tile, idx) => (
        <div
          key={tile.id}
          ref={(el) => {
            tileRefs.current[idx] = el;
          }}
          style={{
            width: `${tile.size}px`,
            height: `${tile.size}px`,
            willChange: "transform",
          }}
          className="absolute left-0 top-0 flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-xl ring-1 ring-inset ring-white/20 backdrop-blur-md"
        >
          <tile.Icon className="h-5 w-5" />
        </div>
      ))}
    </div>
  );
}
