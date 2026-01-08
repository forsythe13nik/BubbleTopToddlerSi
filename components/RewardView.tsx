import React, { useEffect } from 'react';
import { STICKERS, Language, LOCALIZATION } from '../types.ts';
import { audioService } from '../services/audioService.ts';

interface RewardViewProps {
  onContinue: () => void;
  language: Language;
}

const RewardView: React.FC<RewardViewProps> = ({ onContinue, language }) => {
  const sticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
  const t = LOCALIZATION[language];

  useEffect(() => {
    audioService.playCelebrationSound();
    const timer = setTimeout(onContinue, 3500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="animate-bounce">
        <h1 className="text-6xl font-black text-pink-500 mb-8 uppercase tracking-widest">
          {t.amazing}
        </h1>
      </div>
      
      <div className="relative">
        <div className="text-[180px] md:text-[250px] animate-pulse drop-shadow-2xl">
          {sticker}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {[...Array(12)].map((_, i) => (
             <div 
              key={i} 
              className="absolute animate-float text-4xl"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-200px)`,
                animationDelay: `${i * 0.1}s`
              }}
             >
               ✨
             </div>
           ))}
        </div>
      </div>

      <p className="text-3xl font-bold text-pink-400 mt-12">
        {t.sticker}
      </p>

      <button 
        onClick={onContinue}
        className="mt-12 bg-pink-500 text-white text-3xl font-black px-12 py-6 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
      >
        {t.keepPlaying}
      </button>
    </div>
  );
};

export default RewardView;