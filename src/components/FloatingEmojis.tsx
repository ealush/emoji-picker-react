"use client";

import { useEffect, useState, useRef } from "react";
import styles from "@/styles/Home.module.css";

const allEmojis = [
  "😊","😂","🥹","🔥","✨","💬","🎉","🚀","❤️","🙌","🤔","😍","👏","⚡","🎨","💡","🌈","🍀","📌","⭐","💎","🥳","🤝","🎈","🧠","🦄","📦","😎","🫀","🌟",
];

interface RainDrop {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  spin: number; // -120 to 120 random
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function FloatingEmojis() {
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; inside: boolean }>({ x: -9999, y: -9999, inside: false });
  const rafRef = useRef<number | null>(null);
  // per-drop current offset, lerped
  const curOffsetsRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const count = 22;
    const picked = shuffle(allEmojis).slice(0, count);
    setDrops(
      picked.map((emoji, i) => ({
        id: i,
        emoji,
        x: Math.random() * 100,
        size: 0.78 + Math.random() * 1.1, // 0.78-1.88 slight more variance
        duration: 15 + Math.random() * 12, // 15-27s
        delay: -(Math.random() * 22),
        rotate: (Math.random() - 0.5) * 50, // initial tilt
        spin: (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 90), // 60-150 deg random direction
      }))
    );
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, inside: true };
    };
    const onLeave = () => {
      mouseRef.current.inside = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    // also track when mouse leaves hero - container will be whole viewport, so leave is enough
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (drops.length === 0) return;
    // init offsets
    drops.forEach((d) => curOffsetsRef.current.set(d.id, { x: 0, y: 0 }));

    const BUBBLE_RADIUS = 380; // slightly larger, quarter screen+
    const MAX_PUSH = 74; // stronger push

    const tick = () => {
      if (!containerRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const mouse = mouseRef.current;
      const dropsEls = containerRef.current.querySelectorAll<HTMLSpanElement>(`.${styles.rainDrop}`);

      dropsEls.forEach((el) => {
        const id = Number(el.dataset.id);
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let targetX = 0;
        let targetY = 0;
        if (mouse.inside) {
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < BUBBLE_RADIUS && dist > 2) {
            const norm = 1 - dist / BUBBLE_RADIUS;
            const force = Math.pow(norm, 1.7) * MAX_PUSH; // weaker farther, smooth falloff
            const angle = Math.atan2(dy, dx);
            targetX = Math.cos(angle) * force;
            targetY = Math.sin(angle) * force * 0.5; // less vertical push
          }
        }

        const cur = curOffsetsRef.current.get(id) || { x: 0, y: 0 };
        // lerp for gentle, non-janky motion
        const nextX = cur.x + (targetX - cur.x) * 0.11;
        const nextY = cur.y + (targetY - cur.y) * 0.11;
        curOffsetsRef.current.set(id, { x: nextX, y: nextY });

        // apply without React re-render
        if (Math.abs(nextX) < 0.05 && Math.abs(nextY) < 0.05) {
          el.style.transform = "translate3d(0,0,0)";
        } else {
          el.style.transform = `translate3d(${nextX.toFixed(2)}px,${nextY.toFixed(2)}px,0)`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drops]);

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const h = () => setReduced(m.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);

  if (drops.length === 0) return null;
  if (reduced) {
    return (
      <div ref={containerRef} className={styles.rainContainer} aria-hidden>
        {drops.slice(0, 10).map((d) => (
          <span key={d.id} className={styles.rainDrop} style={{ left: `${d.x}%`, fontSize: `${d.size}rem`, opacity: 0.18 }}>
            {d.emoji}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.rainContainer} aria-hidden>
      {drops.map((d) => (
        <span
          key={d.id}
          data-id={d.id}
          className={styles.rainDrop}
          style={{ left: `${d.x}%`, fontSize: `${d.size}rem` } as React.CSSProperties}
        >
          <span
            className={styles.rainEmoji}
            style={
              {
                animationDuration: `${d.duration}s`,
                animationDelay: `${d.delay}s`,
                display: "inline-block",
                ["--r" as any]: `${d.rotate}deg`,
                ["--spin" as any]: `${d.spin}deg`,
              } as React.CSSProperties
            }
          >
            {d.emoji}
          </span>
        </span>
      ))}
    </div>
  );
}
