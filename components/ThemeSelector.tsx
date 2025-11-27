import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, ChevronLeft } from 'lucide-react';
import { THEMES } from '../constants';
import { PlayerStats } from '../types';

interface Props {
  currentStats: PlayerStats;
  onSelect: (themeId: string) => void;
  onBack: () => void;
}

export const ThemeSelector: React.FC<Props> = ({ currentStats, onSelect, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full p-4 md:p-6 max-w-2xl mx-auto w-full"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-display font-bold">Themes</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20 no-scrollbar">
        {THEMES.map((theme) => {
          const isUnlocked = currentStats.unlockedThemes.includes(theme.id);
          const isSelected = currentStats.selectedThemeId === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => isUnlocked && onSelect(theme.id)}
              disabled={!isUnlocked}
              className={`
                relative w-full h-32 rounded-2xl border-2 transition-all duration-300
                text-left overflow-hidden group shadow-md
                ${isSelected ? 'border-current scale-[1.02]' : 'border-transparent hover:scale-[1.01]'}
                ${!isUnlocked ? 'opacity-70 grayscale' : ''}
              `}
            >
              {/* Background Preview */}
              <div className={`absolute inset-0 ${theme.background} transition-colors duration-300`} />

              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-between p-6">
                <div className="flex flex-col gap-2">
                  <span className={`text-2xl font-bold ${theme.text}`}>
                    {theme.name}
                  </span>
                  
                  {/* Color Swatches */}
                  <div className="flex gap-2">
                    {theme.itemColors.slice(0, 4).map((colorClass, i) => (
                      <div 
                        key={i} 
                        className={`w-6 h-6 rounded-full shadow-sm border border-black/10 ${colorClass.replace('text-', 'bg-')}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className={`${theme.text}`}>
                  {isSelected && (
                    <div className="bg-current p-2 rounded-full shadow-lg">
                      <Check size={20} className={theme.background.replace('bg-', 'text-')} />
                    </div>
                  )}
                  {!isUnlocked && <Lock size={24} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};