import React from 'react';
import { Pause, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  timeLeft: number;
  totalTime: number;
  score: number;
  onPause: () => void;
  gameMode: string;
}

export const GameControls: React.FC<Props> = ({ timeLeft, totalTime, score, onPause, gameMode }) => {
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / totalTime) * 100));

  return (
    <div className="w-full max-w-md mx-auto mb-4 px-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col">
           <span className="text-xs opacity-60 font-semibold tracking-wider">SCORE</span>
           <span className="text-2xl font-display font-bold">{score}</span>
        </div>
        
        {gameMode !== 'ZEN' && (
             <div className="flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <Clock size={16} className="opacity-80" />
                <span className={`font-mono font-bold ${timeLeft < 3 ? 'text-red-500' : 'text-current'}`}>
                    {timeLeft.toFixed(1)}s
                </span>
            </div>
        )}

        <button 
            onClick={onPause}
            className="p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 active:scale-95 transition"
        >
            <Pause size={20} />
        </button>
      </div>

      {gameMode !== 'ZEN' && (
        <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
            <motion.div 
                className={`h-full ${timeLeft < 3 ? 'bg-red-500' : 'bg-current opacity-80'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
            />
        </div>
      )}
    </div>
  );
};