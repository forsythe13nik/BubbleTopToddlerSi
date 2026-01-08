import React, { useState } from 'react';
import { GameMode, Category, DifficultyLevel, Language } from './types';
import HomeView from './components/HomeView';
import SelectorView from './components/SelectorView';
import GameView from './components/GameView';
import RewardView from './components/RewardView';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.HOME);
  const [category, setCategory] = useState<Category>(Category.LETTERS);
  const [selectedChar, setSelectedChar] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [winsWithCurrentChar, setWinsWithCurrentChar] = useState<number>(0);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setMode(GameMode.SELECTOR);
  };

  const handleCharSelected = (char: string) => {
    setSelectedChar(char);
    setWinsWithCurrentChar(0);
    setDifficulty(1);
    setMode(GameMode.GAME);
  };

  const handleGameWin = () => {
    const nextWins = winsWithCurrentChar + 1;
    setWinsWithCurrentChar(nextWins);

    if (nextWins > 0 && nextWins % 3 === 0) {
      setMode(GameMode.REWARD);
    } else {
      if (difficulty < 3) {
        setDifficulty(prev => (prev + 1) as DifficultyLevel);
      }
      setMode(GameMode.GAME);
    }
  };

  const handleRewardContinue = () => {
    setDifficulty(1);
    setMode(GameMode.GAME);
  };

  const handleExitToSelector = () => {
    setMode(GameMode.SELECTOR);
    setWinsWithCurrentChar(0);
  };

  const handleExitToHome = () => {
    setMode(GameMode.HOME);
    setWinsWithCurrentChar(0);
  };

  const targetCount = Math.floor(winsWithCurrentChar / 3) + 1;

  return (
    <div className="font-sans text-gray-900 overflow-hidden h-screen w-screen">
      {mode === GameMode.HOME && (
        <HomeView 
          onSelect={handleCategorySelect} 
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      {mode === GameMode.SELECTOR && (
        <SelectorView 
          category={category} 
          onCharacterSelected={handleCharSelected} 
          onBack={handleExitToHome}
          language={language}
        />
      )}

      {mode === GameMode.GAME && (
        <GameView 
          key={`${selectedChar}-${difficulty}-${targetCount}`}
          targetChar={selectedChar} 
          category={category} 
          difficulty={difficulty}
          targetCount={targetCount}
          onWin={handleGameWin}
          onExit={handleExitToSelector}
          language={language}
        />
      )}

      {mode === GameMode.REWARD && (
        <RewardView 
          onContinue={handleRewardContinue} 
          language={language}
        />
      )}
    </div>
  );
};

export default App;
