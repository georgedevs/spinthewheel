'use client';

import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
;
// import { PrizeWinModal } from '@/components/prize-win-modal';
import { AnimatedHeading } from './components/animated-heading';
import { SpinWheel } from './components/spin-wheel';
import { AnimatedParticles } from './components/AnimatedParticles';
import { PrizeWinModal } from './components/PrizeWinModal';
import { TestModeBanner } from './components/TestModeBanner';

export const dynamic = "force-dynamic";
export const runtime = "edge";
export const preferredRegion = "auto";
export const revalidate = 0;

const TEST_CODES = ['TEST123', 'DEMO456', 'SPIN789'];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winningPrize, setWinningPrize] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if it's a test code
      const isTestCode = TEST_CODES.includes(ticketCode);
      setIsTestMode(isTestCode);

      const response = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setIsVerified(true);
      setError(null);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-primary-900/10 to-gray-900" />
        <section className="relative container mx-auto px-4 pt-8 pb-8 md:pt-12">
          <h1 className="text-center text-4xl md:text-5xl lg:text-6xl pb-4 font-montserrat font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
            Spin & Win Big!
          </h1>
        </section>
      </main>
    );
  }


  return (
    <main className="min-h-screen relative overflow-hidden bg-gray-900">

      {/* Test mode banner */}
      {isTestMode && isVerified && <TestModeBanner code={ticketCode} />}

      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-primary-900/10 to-gray-900" />
      
      {/* Animated background particles */}
  <AnimatedParticles/>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-8 pb-8 md:pt-12">
        <AnimatedHeading className="text-center text-4xl md:text-5xl lg:text-6xl pb-4">
          Spin & Win Big!
        </AnimatedHeading>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-2">
            Stand a Chance to Win ₦1,000,000
          </h2>
          <p className="text-gray-300 text-lg">
            Enter your ticket code to spin the wheel and win amazing prizes!
          </p>
        </motion.div>

        {!isVerified ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <form onSubmit={handleVerifyTicket} className="space-y-4">
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Enter your ticket code"
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <button
                type="submit"
                className="w-full group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Verify Ticket
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <SpinWheel 
              ticketCode={ticketCode}
              onSpinComplete={(prize) => setWinningPrize(prize)}
            />
          </div>
        )}
      </section>

   {/* Terms and conditions */}
<footer className="relative container mx-auto px-4 py-6 md:py-8 text-center">
  <p className="text-sm md:text-base font-semibold text-gray-400/90 tracking-wide">
    Terms and conditions apply. One spin per ticket. Prizes subject to availability.
  </p>
</footer>

      {winningPrize && (
  <PrizeWinModal
    isOpen={!!winningPrize}
    closeModal={() => setWinningPrize(null)}
    prize={winningPrize}
  />
)}
    </main>
  );
}