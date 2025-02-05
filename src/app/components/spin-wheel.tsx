'use client';

import React, { useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { motion } from 'framer-motion';

interface SpinWheelProps {
  ticketCode: string;
  onSpinComplete: (prize: string) => void;
}

export const SpinWheel = ({ ticketCode, onSpinComplete }: SpinWheelProps) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = [
    { option: '₦1,000,000', style: { backgroundColor: '#4338CA', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: '₦20,000', style: { backgroundColor: '#5B21B6', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: 'Phone', style: { backgroundColor: '#4338CA', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: 'Try Again', style: { backgroundColor: '#5B21B6', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: 'Artifact Hoodie', style: { backgroundColor: '#4338CA', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: '₦50,000', style: { backgroundColor: '#5B21B6', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: 'Premiere Invite', style: { backgroundColor: '#4338CA', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: 'Try Again', style: { backgroundColor: '#5B21B6', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: '₦100,000', style: { backgroundColor: '#4338CA', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
    { option: 'Try Again', style: { backgroundColor: '#5B21B6', textColor: 'white', fontSize: 20, fontWeight: 'bold' } },
  ];

  const handleSpinClick = async () => {
    if (!mustSpin && !hasSpun) {
      try {
        const response = await fetch('/api/spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketCode })
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          setError(result.error);
          return;
        }
  
        // Find exact match instead of partial match
        const prizeIndex = data.findIndex(item => item.option === result.prize);
        if (prizeIndex === -1) {
          // If prize not found, default to "Try Again"
          const tryAgainIndex = data.findIndex(item => item.option === 'Try Again');
          setPrizeNumber(tryAgainIndex);
        } else {
          setPrizeNumber(prizeIndex);
        }
  
        setMustSpin(true);
        setHasSpun(true);
      } catch (err) {
        setError('Something went wrong. Please try again.');
      }
    }
  };
  return (
    <motion.div 
      className="relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Larger wheel container */}
      <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px]">
        {/* Glowing background for emphasis */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-xl" />
        
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={() => {
            setMustSpin(false);
            onSpinComplete(data[prizeNumber].option);
          }}
          backgroundColors={['#4338CA', '#5B21B6']}
          textColors={['white']}
          fontSize={22} // Increased font size
          outerBorderColor="#C026D3"
          outerBorderWidth={4}
          innerRadius={0}
          innerBorderColor="#0EA5E9"
          innerBorderWidth={3}
          radiusLineColor="#0EA5E9"
          radiusLineWidth={2}
          spinDuration={0.8}
          textDistance={75} // Adjusted to move text closer to the edge
        />
        
        {/* Larger pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-12 h-12">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-accent-500 drop-shadow-lg"></div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center mt-4 text-lg">
          {error}
        </div>
      )}

      {!hasSpun && (
        <button
          onClick={handleSpinClick}
          disabled={mustSpin}
          className="mt-8 group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-12 py-5 text-xl font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mustSpin ? 'Spinning...' : 'SPIN!'}
          <span className="absolute -inset-0.5 -z-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 blur transition-opacity group-hover:opacity-75" />
        </button>
      )}
    </motion.div>
  );
};