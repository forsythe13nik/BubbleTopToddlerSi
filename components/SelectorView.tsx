import React from 'react';
import { Category, LETTERS, NUMBERS, SHAPES, SHAPE_ICONS, COLORS, Language, LOCALIZATION } from '../types.ts';
import { speak } from '../services/geminiService.ts';

interface SelectorViewProps {
  category: Category;
  onCharacterSelected: (char: string) => void;
  onBack: () => void;
  language: Language;
}

const SelectorView: React.FC<SelectorViewProps> = ({ category, onCharacterSelected, onBack, language }) => {
  let chars: string[] = [];
  if (category === Category.LETTERS) chars = LETTERS;
  else if (category === Category.NUMBERS) chars = NUMBERS;
  else if (category === Category.SHAPES) chars = SHAPES;

  const t = LOCALIZATION[language];

  const handleSelect = async (char: string) => {
    await speak(t.selected(char));
    onCharacterSelected(char);
  };

  const getCategoryName = () => {
    if (language === Language.GERMAN) {
      if (category === Category.LETTERS) return "Buchstaben";
      if (category === Category.NUMBERS) return "Zahl";
      return "Form";
    }
    return category.toLowerCase().slice(0, -1);
  };

  return (
    <div className="min-h-screen p-6 bg-blue-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="bg-white p-4 rounded-full shadow-lg text-blue-500 hover:text-blue-700 active:scale-90"
          >
            <i className="fas fa-arrow-left text-2xl"></i>
          </button>
          <h2 className="text-3xl font-black text-blue-600 uppercase">
            {t.pick(getCategoryName())}
          </h2>
          <div className="w-12"></div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
          {chars.map((char, index) => (
            <button
              key={char}
              onClick={() => handleSelect(char)}
              className={`${COLORS[index % COLORS.length]} text-white text-4xl font-black rounded-2xl aspect-square flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform border-b-4 border-black/10 p-2`}
            >
              {category === Category.SHAPES ? (
                <i className={`${SHAPE_ICONS[char]} text-5xl`}></i>
              ) : (
                char
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectorView;