import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bubble, DifficultyLevel, Category, LETTERS, NUMBERS, SHAPES, SHAPE_ICONS, COLORS, Language, LOCALIZATION } from '../types';
import { speak, getAudioBuffer } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface GameViewProps {
  targetChar: string;
  category: Category;
  onWin: () => void;
  onExit: () => void;
  difficulty: DifficultyLevel;
  targetCount: number;
  language: Language;
}

const GameView: React.FC<GameViewProps> = ({ targetChar, category, onWin, onExit, difficulty, targetCount, language }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  
  // Audio Caches
  const winBufferRef = useRef<AudioBuffer | null>(null);
  const foundOneBufferRef = useRef<AudioBuffer | null>(null);

  const t = LOCALIZATION[language];

  // Pre-cache voiceovers for the current target
  useEffect(() => {
    let active = true;
    const preload = async () => {
      // Clear previous level's audio queue immediately
      audioService.stopAll();

      const [winBuf, foundBuf] = await Promise.all([
        getAudioBuffer(t.win(targetChar)),
        getAudioBuffer(t.foundOne(targetChar))
      ]);
      
      if (active) {
        winBufferRef.current = winBuf;
        foundOneBufferRef.current = foundBuf;
      }
    };
    preload();
    return () => { active = false; };
  }, [targetChar, t]);

  const getSizing = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const baseSize = Math.min(width, height) / 5;
    
    let scale = 1.1; 
    if (difficulty === 1) scale = 1.8;
    if (difficulty === 2) scale = 1.4;
    
    return {
      baseSize,
      targetSize: baseSize * scale,
      distractorSize: baseSize
    };
  }, [difficulty]);

  const createBubbles = useCallback(() => {
    const { targetSize, distractorSize } = getSizing();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let pool: string[] = [];
    if (category === Category.LETTERS) pool = LETTERS;
    else if (category === Category.NUMBERS) pool = NUMBERS;
    else if (category === Category.SHAPES) pool = SHAPES;
    
    const distractorCount = Math.min(difficulty * 2 + 2, 10);
    const newBubbles: Bubble[] = [];

    for (let i = 0; i < targetCount; i++) {
      newBubbles.push({
        id: `target-${i}-${Date.now()}`,
        char: targetChar,
        x: Math.random() * (width - targetSize) + targetSize/2,
        y: Math.random() * (height - targetSize) + targetSize/2,
        vx: (Math.random() - 0.5) * (1.2 + difficulty * 1.0),
        vy: (Math.random() - 0.5) * (1.2 + difficulty * 1.0),
        radius: targetSize / 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        isTarget: true,
        isPopping: false
      });
    }

    for (let i = 0; i < distractorCount; i++) {
      let char = pool[Math.floor(Math.random() * pool.length)];
      while (char === targetChar) {
        char = pool[Math.floor(Math.random() * pool.length)];
      }

      newBubbles.push({
        id: `dist-${i}-${Date.now()}`,
        char,
        x: Math.random() * (width - distractorSize) + distractorSize/2,
        y: Math.random() * (height - distractorSize) + distractorSize/2,
        vx: (Math.random() - 0.5) * (1.2 + difficulty * 1.0),
        vy: (Math.random() - 0.5) * (1.2 + difficulty * 1.0),
        radius: distractorSize / 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        isTarget: false,
        isPopping: false
      });
    }

    setBubbles(newBubbles);
  }, [targetChar, category, difficulty, getSizing, targetCount]);

  const update = (time: number) => {
    if (lastTimeRef.current !== null && lastTimeRef.current !== undefined) {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setBubbles(prev => prev.map(b => {
        if (b.isPopping) return b;

        let nextX = b.x + b.vx;
        let nextY = b.y + b.vy;
        let nextVx = b.vx;
        let nextVy = b.vy;

        if (nextX - b.radius < 0 || nextX + b.radius > width) {
          nextVx *= -1;
          nextX = nextX - b.radius < 0 ? b.radius : width - b.radius;
        }
        if (nextY - b.radius < 0 || nextY + b.radius > height) {
          nextVy *= -1;
          nextY = nextY - b.radius < 0 ? b.radius : height - b.radius;
        }

        return { ...b, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
      }));
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    createBubbles();
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [createBubbles]);

  const handlePop = async (id: string) => {
    if (isTransitioning) return;
    
    const bubble = bubbles.find(b => b.id === id);
    if (!bubble || bubble.isPopping) return;

    audioService.playCelebrationSound();
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, isPopping: true } : b));

    if (bubble.isTarget) {
      const remaining = bubbles.filter(b => b.isTarget && !b.isPopping && b.id !== id).length;
      
      if (remaining === 0) {
        setIsTransitioning(true);
        audioService.stopAll();
        
        if (winBufferRef.current) {
          await audioService.playBuffer(winBufferRef.current);
        } else {
          await speak(t.win(bubble.char));
        }
        
        onWin();
      } else {
        if (foundOneBufferRef.current) {
          audioService.playBuffer(foundOneBufferRef.current);
        } else {
          speak(t.foundOne(bubble.char));
        }
      }
    } else {
      speak(t.incorrect(bubble.char, targetChar));
      setTimeout(() => {
         setBubbles(prev => prev.filter(b => b.id !== id));
      }, 400);
    }
  };

  const activeTargets = bubbles.filter(b => b.isTarget && !b.isPopping).length;

  return (
    <div ref={canvasRef} className="fixed inset-0 overflow-hidden bg-blue-50 cursor-pointer">
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-6 pointer-events-none">
        <button 
          onClick={() => { audioService.stopAll(); onExit(); }}
          className="bg-white/90 p-4 rounded-full shadow-lg text-blue-500 pointer-events-auto active:scale-90 hover:bg-white"
        >
          <i className="fas fa-chevron-left text-2xl"></i>
        </button>
        <div className="bg-white/90 px-8 py-4 rounded-full shadow-lg border-4 border-blue-400 flex flex-col items-center">
           <span className="text-xl font-bold text-blue-400 uppercase leading-none">{t.find}</span>
           <span className="text-4xl font-black text-blue-600 leading-tight flex items-center gap-2">
             {activeTargets} {category === Category.SHAPES ? (
               <i className={`${SHAPE_ICONS[targetChar]} text-3xl`}></i>
             ) : (
               targetChar
             )}
             {activeTargets > 1 && category !== Category.SHAPES ? (language === Language.GERMAN ? "" : "'s") : ""}
           </span>
        </div>
        <div className="w-12"></div>
      </div>

      {bubbles.map(b => (
        <div
          key={b.id}
          onClick={() => handlePop(b.id)}
          className={`absolute rounded-full flex items-center justify-center transition-opacity shadow-lg border-4 border-white/40 ${b.color} ${b.isPopping ? 'bubble-pop' : ''}`}
          style={{
            left: b.x - b.radius,
            top: b.y - b.radius,
            width: b.radius * 2,
            height: b.radius * 2,
            opacity: b.isPopping ? 0 : 1,
            zIndex: b.isTarget ? 5 : 4,
            transition: 'opacity 0.2s ease',
            pointerEvents: isTransitioning ? 'none' : 'auto'
          }}
        >
          {category === Category.SHAPES ? (
            <i 
              className={`${SHAPE_ICONS[b.char]} text-white drop-shadow-sm select-none`}
              style={{ fontSize: b.radius * 1.0 }}
            ></i>
          ) : (
            <span 
              className="text-white font-black drop-shadow-sm select-none"
              style={{ fontSize: b.radius * 1.2 }}
            >
              {b.char}
            </span>
          )}
          <div className="absolute top-1/6 left-1/6 w-1/3 h-1/3 bg-white/20 rounded-full"></div>
        </div>
      ))}

      {isTransitioning && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-[1px] z-50 pointer-events-none flex items-center justify-center">
           <div className="bg-white/80 px-8 py-4 rounded-3xl shadow-2xl border-4 border-blue-400 animate-bounce">
              <span className="text-4xl font-black text-blue-600 uppercase tracking-widest animate-pulse">
                {language === Language.GERMAN ? 'Super!' : 'Great!'}
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
