'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { PartyPopper, Frown, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PrizeWinModalProps {
  isOpen: boolean;
  closeModal: () => void;
  prize: string;
}

export const PrizeWinModal = ({
  isOpen,
  closeModal,
  prize,
}: PrizeWinModalProps) => {
  const [shouldPlayConfetti, setShouldPlayConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && prize !== 'Try Again' && !shouldPlayConfetti) {
      setShouldPlayConfetti(true);
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const shootConfetti = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0ea5e9', '#d946ef', '#FFD700']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0ea5e9', '#d946ef', '#FFD700']
        });

        if (Date.now() < end) {
          requestAnimationFrame(shootConfetti);
        }
      };

      shootConfetti();
    }
    return () => setShouldPlayConfetti(false);
  }, [isOpen, prize]);

  const handleTryAgain = () => {
    // Close modal and reload page
    closeModal();
    window.location.reload();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-center align-middle shadow-xl transition-all
                  ${prize === 'Try Again' 
                    ? 'bg-gray-900 border border-gray-800' 
                    : 'bg-gradient-to-b from-primary-900 to-accent-900'
                  }`}
              >
                <div className="relative">
                  {/* Icon Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    className="flex justify-center mb-6"
                  >
                    {prize === 'Try Again' ? (
                      <Frown className="w-16 h-16 text-gray-500" />
                    ) : (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <PartyPopper className="w-16 h-16 text-yellow-500" />
                      </motion.div>
                    )}
                  </motion.div>

                  <Dialog.Title
                    as="h3"
                    className={`text-3xl font-montserrat font-bold mb-4
                      ${prize === 'Try Again' ? 'text-gray-300' : 'text-white'}`}
                  >
                    {prize === 'Try Again' ? 'Better Luck Next Time!' : 'Congratulations! 🎉'}
                  </Dialog.Title>

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                  >
                    {prize === 'Try Again' ? (
                      <p className="text-gray-400">
                        Don&apos;t worry, the movie is worth it!
                      </p>
                    ) : (
                      <>
                        <p className="text-gray-300 mb-2">You&apos;ve Won</p>
                        <p className="text-2xl font-bold text-primary-400">{prize}</p>
                      </>
                    )}
                  </motion.div>

                  {prize !== 'Try Again' && (
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-center text-gray-300">
                        Save your ticket code! Our team will contact you with details on how to claim your prize.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={closeModal}
                      className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      {prize === 'Try Again' ? 'Close' : 'Amazing!'}
                    </button>

                    {prize === 'Try Again' && (
                      <button
                        onClick={handleTryAgain}
                        className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gray-800 hover:bg-gray-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      >
                        <RotateCw className="w-5 h-5" />
                        Try With Another Ticket
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};