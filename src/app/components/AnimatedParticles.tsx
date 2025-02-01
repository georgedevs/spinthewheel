// components/AnimatedParticles.tsx
'use client';

import { motion } from "framer-motion";
import { useWindowSize } from "../hooks/useWindowSize";

export const AnimatedParticles = () => {
  const { width = 0, height = 0 } = useWindowSize();

  if (width === 0 || height === 0) {
    return null; // Don't render particles until we have window dimensions
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
          animate={{
            x: [
              Math.random() * width,
              Math.random() * width,
            ],
            y: [
              Math.random() * height,
              Math.random() * height,
            ],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};