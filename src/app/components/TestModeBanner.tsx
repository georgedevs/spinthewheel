'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface TestModeBannerProps {
  code: string;
}

export const TestModeBanner = ({ code }: TestModeBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm z-50"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-yellow-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Test Mode Active - Using Code: <span className="font-mono font-bold">{code}</span></span>
        </div>
      </div>
    </motion.div>
  );
};