import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Play, RefreshCw, Home, Clock, Palette, Settings
} from 'lucide-react';

import { GameMode, GamePhase, GameItem, PlayerStats, Theme } from './types';
import { THEMES, XP_PER_LEVEL } from './constants';
import { loadStats, saveStats } from './services/storageService';
import { calculateLevelConfig, generateScene, applyChanges } from './services/gameEngine';
import GridItem from './components/GridItem';
import { GameControls } from './components/GameControls';
import { ThemeSelector } from './components/ThemeSelector';

// Sound placeholders (in a real app, use Audio API)
const playSound = (type: 'correct' | 'wrong' | 'pop' | 'win') => {
  // console.log(`Playing sound: ${type}`);
};

export default function App() {
  // -- State --
  const [stats, setStats] = useState<PlayerStats>(loadStats());
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScore, setCurrentScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const [items, setItems] = useState<GameItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(5);
  
  // Computed
  const activeTheme: Theme = THEMES.find(t => t.id === stats.selectedThemeId) || THEMES[0];
  const timerRef = useRef<number | null>(null);

  // -- Persistence --
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // -- Game Loop Functions --

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setCurrentLevel(1);
    setCurrentScore(0);
    setLives(selectedMode === GameMode.BLITZ ? 1 : 3);
    startLevel(1, selectedMode);
  };

  const startLevel = (levelIdx: number, gameMode: GameMode) => {
    const config = calculateLevelConfig(levelIdx, gameMode);
    const newItems = generateScene(config, activeTheme.id);
    
    setItems(newItems);
    setTotalTime(config.observeTime);
    setTimeLeft(config.observeTime);
    setPhase(GamePhase.OBSERVE);
    playSound('pop');
  };

  const handleTimerTick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 0) {
        if (phase === GamePhase.OBSERVE) {
          // Time to hide!
          setPhase(GamePhase.LOCKED);
          return 0; 
        } else if (phase === GamePhase.GUESS && mode === GameMode.TIMED) {
            // Time ran out in timed mode guessing
            handleWrongGuess();
            return 0;
        }
      }
      return prev - 0.1;
    });
  }, [phase, mode]);

  useEffect(() => {
    if (phase === GamePhase.OBSERVE || (phase === GamePhase.GUESS && mode === GameMode.TIMED)) {
      timerRef.current = window.setInterval(handleTimerTick, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, handleTimerTick, mode]);

  // Transition from LOCKED -> GUESS automatically
  useEffect(() => {
    if (phase === GamePhase.LOCKED) {
      setTimeout(() => {
        const changedItems = applyChanges(items, currentLevel, activeTheme.id);
        setItems(changedItems);
        setPhase(GamePhase.GUESS);
        if (mode === GameMode.TIMED) {
            setTotalTime(5);
            setTimeLeft(5);
        }
      }, 800); // 0.8s suspense
    }
  }, [phase, items, currentLevel, activeTheme, mode]);

  // -- Interaction --

  const handleItemClick = (item: GameItem) => {
    if (phase !== GamePhase.GUESS) return;

    if (item.isTarget) {
      handleCorrectGuess();
    } else {
      handleWrongGuess();
    }
  };

  const handleCorrectGuess = () => {
    playSound('correct');
    const xpGain = 20 + (currentLevel * 5);
    const newScore = currentScore + (100 * currentLevel);
    
    // Update stats immediately
    setStats(prev => ({
      ...prev,
      xp: prev.xp + xpGain,
      level: Math.floor((prev.xp + xpGain) / XP_PER_LEVEL) + 1,
      streak: prev.streak + 1
    }));
    
    setCurrentScore(newScore);
    
    // Tiny delay to show success
    setTimeout(() => {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      startLevel(nextLvl, mode);
    }, 500);
  };

  const handleWrongGuess = () => {
    playSound('wrong');
    if (lives > 1) {
      setLives(l => l - 1);
    } else {
      setPhase(GamePhase.GAME_OVER);
      setStats(prev => ({
          ...prev,
          highScores: {
              ...prev.highScores,
              [mode]: Math.max(prev.highScores[mode], currentScore)
          },
          streak: 0
      }));
      playSound('wrong');
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setStats(prev => ({ ...prev, selectedThemeId: themeId }));
  };

  // -- Renders --

  const renderMainMenu = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full space-y-8 p-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold font-display tracking-tight">
          ODD ONE<br/>AWAY
        </h1>
        <p className="opacity-60 font-medium">Level {stats.level} • XP {stats.xp}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <button 
          onClick={() => startGame(GameMode.CLASSIC)}
          className={`relative group ${activeTheme.surface} hover:brightness-110 p-6 rounded-2xl shadow-sm transition-all active:scale-95`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold">Classic</span>
              <span className="text-sm opacity-50">Find the difference</span>
            </div>
            <Play className={`${activeTheme.accent} group-hover:scale-110 transition-transform`} />
          </div>
        </button>

        <button 
          onClick={() => startGame(GameMode.TIMED)}
          className={`relative group ${activeTheme.surface} hover:brightness-110 p-6 rounded-2xl shadow-sm transition-all active:scale-95`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold">Timed Rush</span>
              <span className="text-sm opacity-50">Race against clock</span>
            </div>
            <Clock className={`${activeTheme.accent} group-hover:scale-110 transition-transform`} />
          </div>
        </button>

        <button 
          onClick={() => startGame(GameMode.ZEN)}
          className={`relative group ${activeTheme.surface} hover:brightness-110 p-6 rounded-2xl shadow-sm transition-all active:scale-95`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold">Zen Mode</span>
              <span className="text-sm opacity-50">No timer, just chill</span>
            </div>
            <RefreshCw className={`${activeTheme.accent} group-hover:scale-110 transition-transform`} />
          </div>
        </button>
      </div>

      <div className="flex gap-4">
        <button 
            onClick={() => setPhase(GamePhase.THEMES)}
            className={`p-4 rounded-full transition-colors ${activeTheme.surface} hover:brightness-110 shadow-sm`}
        >
            <Palette size={24} className="opacity-80" />
        </button>
        <button 
            className={`p-4 rounded-full transition-colors ${activeTheme.surface} hover:brightness-110 shadow-sm`}
        >
            <Settings size={24} className="opacity-80" />
        </button>
      </div>
    </motion.div>
  );

  const renderGame = () => {
    const count = items.length;
    let gridCols = 'grid-cols-3';
    let iconSize = 'w-12 h-12';
    if (count > 9) { gridCols = 'grid-cols-4'; iconSize = 'w-10 h-10'; }
    if (count > 16) { gridCols = 'grid-cols-5'; iconSize = 'w-8 h-8'; }
    if (count > 25) { gridCols = 'grid-cols-6'; iconSize = 'w-6 h-6'; }

    return (
      <div className="flex flex-col h-full pt-4 pb-8 max-w-lg mx-auto w-full">
        <GameControls 
            timeLeft={timeLeft} 
            totalTime={totalTime} 
            score={currentScore} 
            onPause={() => setPhase(GamePhase.MENU)}
            gameMode={mode}
        />
        
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <AnimatePresence mode="wait">
             {phase === GamePhase.OBSERVE && (
                <motion.div 
                    key="scene-observe"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    className={`grid ${gridCols} gap-3 md:gap-4`}
                >
                    {items.map(item => (
                        <GridItem key={item.id} item={item} sizeClass={iconSize} disabled={true} />
                    ))}
                </motion.div>
             )}

             {phase === GamePhase.LOCKED && (
                 <motion.div
                    key="scene-locked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                 >
                     <h2 className="text-4xl font-black tracking-widest animate-pulse opacity-80">
                         WAIT...
                     </h2>
                 </motion.div>
             )}

             {phase === GamePhase.GUESS && (
                 <motion.div 
                    key="scene-guess"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`grid ${gridCols} gap-3 md:gap-4`}
                >
                    {items.map(item => (
                        <GridItem 
                            key={item.id} 
                            item={item} 
                            sizeClass={iconSize}
                            onClick={handleItemClick}
                        />
                    ))}
                </motion.div>
             )}
          </AnimatePresence>

          {/* Feedback Overlay */}
          <div className="absolute top-0 left-0 w-full pointer-events-none flex justify-center mt-2">
             {phase === GamePhase.OBSERVE && (
                 <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold uppercase tracking-widest">
                     Memorize
                 </div>
             )}
             {phase === GamePhase.GUESS && (
                 <div className={`${activeTheme.accent} bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg`}>
                     What Changed?
                 </div>
             )}
          </div>
        </div>

        {/* Lives / Footer */}
        <div className="px-6 flex justify-between items-center opacity-60 text-sm">
            <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                    <HeartIcon key={i} active={i < lives} />
                ))}
            </div>
            <div>Level {currentLevel}</div>
        </div>
      </div>
    );
  };

  const renderGameOver = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6"
    >
      <h2 className="text-4xl font-display font-bold">GAME OVER</h2>
      
      <div className={`${activeTheme.surface} p-6 rounded-2xl w-full max-w-xs shadow-lg`}>
        <div className="text-sm opacity-60 mb-1">Final Score</div>
        <div className={`text-3xl font-bold ${activeTheme.accent}`}>{currentScore}</div>
        
        <div className="h-px bg-current opacity-10 my-4" />
        
        <div className="flex justify-between text-sm">
          <span className="opacity-60">High Score</span>
          <span className="font-bold">{stats.highScores[mode]}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setPhase(GamePhase.MENU)}
          className={`p-4 rounded-xl transition ${activeTheme.surface} hover:brightness-110`}
        >
          <Home />
        </button>
        <button 
          onClick={() => startGame(mode)}
          className={`flex items-center gap-2 px-8 py-4 ${activeTheme.accent.replace('text-', 'bg-')} text-black font-bold rounded-xl transition shadow-lg hover:brightness-110`}
        >
          <RefreshCw size={20} />
          <span>Try Again</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`h-[100dvh] w-full overflow-hidden ${activeTheme.background} ${activeTheme.text} transition-colors duration-500`}>
      <AnimatePresence mode="wait">
        {phase === GamePhase.MENU && (
          <motion.div key="menu" className="h-full">
            {renderMainMenu()}
          </motion.div>
        )}
        {phase === GamePhase.THEMES && (
          <ThemeSelector 
            key="themes"
            currentStats={stats} 
            onSelect={handleThemeSelect} 
            onBack={() => setPhase(GamePhase.MENU)} 
          />
        )}
        {(phase === GamePhase.OBSERVE || phase === GamePhase.LOCKED || phase === GamePhase.GUESS) && (
          <motion.div key="game" className="h-full">
            {renderGame()}
          </motion.div>
        )}
        {phase === GamePhase.GAME_OVER && (
          <motion.div key="gameover" className="h-full">
            {renderGameOver()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Heart Component helper
const HeartIcon = ({ active }: { active: boolean }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill={active ? "#ef4444" : "none"} 
        stroke={active ? "#ef4444" : "currentColor"} 
        className="w-6 h-6 transition-colors duration-300"
        strokeWidth={2}
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);