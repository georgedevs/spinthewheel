'use client';

import { motion } from "framer-motion";
import { useWindowSize } from "../hooks/useWindowSize";
import { useEffect, useState } from "react";

export const AnimatedParticles = () => {
  const windowSize = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on the server or until mounted on client
  if (!isMounted || typeof windowSize.width === 'undefined' || typeof windowSize.height === 'undefined') {
    return null;
  }

  // Now TypeScript knows windowSize.width and height are defined
  const width = windowSize.width;
  const height = windowSize.height;

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