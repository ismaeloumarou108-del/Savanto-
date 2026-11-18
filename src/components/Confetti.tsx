"use client";
import { useMemo } from "react";

const COLORS = ["#ff6a2b", "#ffb062", "#e2381d", "#f7f0ea", "#3ccf8e", "#ffd15c"];

export function Confetti({ count = 90 }: { count?: number }) {
  const bits = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.8 + Math.random() * 1.6,
      dx: `${(Math.random() - 0.5) * 200}px`,
      rot: `${Math.random() * 900}deg`,
      color: COLORS[i % COLORS.length],
      w: 6 + Math.random() * 6,
      round: Math.random() > 0.6,
    })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bits.map((b, i) => (
        <span key={i} style={{
          left: `${b.left}%`, width: b.w, height: b.round ? b.w : b.w * 1.8, background: b.color,
          borderRadius: b.round ? "50%" : 2, animation: `fall ${b.dur}s ${b.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
          ["--dx" as string]: b.dx, ["--rot" as string]: b.rot,
        }} className="absolute top-0" />
      ))}
    </div>
  );
}
