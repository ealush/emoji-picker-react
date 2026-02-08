"use client";

import { useEffect, useState, useRef } from "react";
import styles from "@/styles/Home.module.css";

const allEmojis = [
  "😊",
  "🎨",
  "⭐",
  "🎉",
  "🚀",
  "💡",
  "🎯",
  "🔥",
  "✨",
  "🌟",
  "💜",
  "🎪",
  "🎭",
  "🎬",
  "🎮",
  "🎸",
  "🌈",
  "🦋",
  "🍀",
  "🌸",
  "💎",
  "🏆",
  "⚡",
  "🎈",
];

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  distanceFromCenter: number; // 0-1, used for mouse interaction
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function FloatingEmojis() {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pick 6-8 random emojis on each page load
    const count = 6 + Math.floor(Math.random() * 3); // 6, 7, or 8
    const shuffled = shuffleArray(allEmojis);
    const selected = shuffled.slice(0, count);

    // Position emojis in a circle around the center
    const generated = selected.map((emoji, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2; // Start from top
      const baseRadius = 35 + Math.random() * 10; // 35-45% from center

      // Add slight randomization to position
      const jitterX = (Math.random() - 0.5) * 8;
      const jitterY = (Math.random() - 0.5) * 8;

      // Normalize distance for interaction (0 = center, 1 = far edge)
      const distanceFromCenter = baseRadius / 50;

      return {
        id: i,
        emoji,
        x: 50 + Math.cos(angle) * baseRadius + jitterX,
        y: 50 + Math.sin(angle) * baseRadius + jitterY,
        size: 1.75 + Math.random() * 1.25,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * -10,
        distanceFromCenter,
      };
    });
    setEmojis(generated);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate offset from center (-1 to 1 range)
      const offsetX = (e.clientX - rect.left - centerX) / centerX;
      const offsetY = (e.clientY - rect.top - centerY) / centerY;

      // Only update if mouse is in the hero area
      if (e.clientY < rect.bottom) {
        setMouseOffset({
          x: offsetX * 8, // Reduced: max 8px base offset
          y: offsetY * 6, // Reduced: max 6px base offset
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (emojis.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={styles.floatingEmojis}
      aria-hidden="true"
    >
      {emojis.map((item) => {
        // Farther emojis react more, closer ones react less
        const sensitivity = 0.3 + item.distanceFromCenter * 0.7; // 0.3 to 1.0
        // Farther emojis have longer transition delay (wave effect)
        const transitionDelay = item.distanceFromCenter * 150; // 0 to ~150ms

        return (
          <span
            key={item.id}
            className={styles.floatingEmoji}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}rem`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              transform: `translate(-50%, -50%) translate(${mouseOffset.x * sensitivity}px, ${mouseOffset.y * sensitivity}px)`,
              transitionDelay: `${transitionDelay}ms`,
            }}
          >
            {item.emoji}
          </span>
        );
      })}
    </div>
  );
}
