import React from 'react';
import { Category, Language, LOCALIZATION } from '../types.ts';
import { audioService } from '../services/audioService.ts';

interface HomeViewProps {
  onSelect: (category: Category) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSelect, language, onLanguageChange }) => {
  const handleSelection = async (category: Category) => {
    await audioService.resume();
    onSelect(category);
  };

  const t = LOCALIZATION[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-100 to-purple-100 overflow-y-auto relative">
      <div className="absolute top-6 right-6 flex gap-2">
        <button
          onClick={() => onLanguageChange(Language.ENGLISH)}
          className={`px-4 py-2 rounded-full font-bold transition-all shadow-md ${language === Language.ENGLISH ? 'bg-blue-500 text-white scale-110' : 'bg-white text-blue-500'}`}
        >
          🇺🇸 EN
        </button>
        <button
          onClick={() => onLanguageChange(Language.GERMAN)}
          className={`px-4 py-2 rounded-full font-bold transition-all shadow-md ${language === Language.GERMAN ? 'bg-red-500 text-white scale-110' : 'bg-white text-red-500'}`}
        >
          🇩🇪 DE
        </button>
      </div>

      <div className="mb-12 text-center animate-float">
        <h1 className="text-5xl md:text-7xl font-black text-blue-600 drop-shadow-lg mb-2">
          Bubble Pop!
        </h1>
        <p className="text-xl text-blue-400 font-bold uppercase tracking-widest">Toddler Edition</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <button
          onClick={() => handleSelection(Category.LETTERS)}
          className="flex-1 bg-white border-8 border-blue-400 rounded-3xl p-8 hover:scale-105 transition-transform shadow-2xl group active:scale-95"
        >
          <div className="text-7xl mb-4 group-hover:rotate-12 transition-transform">🔤</div>
          <span className="text-3xl font-black text-blue-500 uppercase">
            {language === Language.GERMAN ? 'Buchstaben' : 'Letters'}
          </span>
        </button>

        <button
          onClick={() => handleSelection(Category.NUMBERS)}
          className="flex-1 bg-white border-8 border-yellow-400 rounded-3xl p-8 hover:scale-105 transition-transform shadow-2xl group active:scale-95"
        >
          <div className="text-7xl mb-4 group-hover:-rotate-12 transition-transform">🔢</div>
          <span className="text-3xl font-black text-yellow-500 uppercase">
            {language === Language.GERMAN ? 'Zahlen' : 'Numbers'}
          </span>
        </button>

        <button
          onClick={() => handleSelection(Category.SHAPES)}
          className="flex-1 bg-white border-8 border-green-400 rounded-3xl p-8 hover:scale-105 transition-transform shadow-2xl group active:scale-95"
        >
          <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">⭐</div>
          <span className="text-3xl font-black text-green-500 uppercase">
            {language === Language.GERMAN ? 'Formen' : 'Shapes'}
          </span>
        </button>
      </div>

      <div className="mt-12 text-blue-300 flex items-center gap-2">
        <i className="fas fa-volume-up"></i>
        <span className="font-bold">{t.volume}</span>
      </div>
    </div>
  );
};

export default HomeView;