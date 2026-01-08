
export enum GameMode {
  HOME = 'HOME',
  SELECTOR = 'SELECTOR',
  GAME = 'GAME',
  REWARD = 'REWARD'
}

export enum Category {
  LETTERS = 'LETTERS',
  NUMBERS = 'NUMBERS',
  SHAPES = 'SHAPES'
}

export enum Language {
  ENGLISH = 'en',
  GERMAN = 'de'
}

export interface Bubble {
  id: string;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isTarget: boolean;
  isPopping: boolean;
}

export type DifficultyLevel = 1 | 2 | 3;

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const NUMBERS = "0123456789".split("");
export const SHAPES = ["Circle", "Square", "Triangle", "Star", "Heart"];

export const SHAPE_ICONS: Record<string, string> = {
  "Circle": "fas fa-circle",
  "Square": "fas fa-square",
  "Triangle": "fas fa-play -rotate-90",
  "Star": "fas fa-star",
  "Heart": "fas fa-heart"
};

export const COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
  'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-teal-400'
];

export const STICKERS = ["🦄", "🚀", "🦖", "🌈", "🍦", "🐶", "🎈", "🦁", "🐢", "🎨"];

// Localization mapping
export const LOCALIZATION: Record<Language, any> = {
  [Language.ENGLISH]: {
    selected: (x: string) => `You have selected ${x}`,
    win: (x: string) => `That is ${x}, well done! You found them all!`,
    foundOne: (x: string) => `Found one ${x}! Can you find the others?`,
    incorrect: (inc: string, tar: string) => `That is ${inc}. Can you find the ${tar}?`,
    find: "Find",
    pick: (cat: string) => `Pick a ${cat}!`,
    volume: "Turn up the volume!",
    amazing: "Amazing!",
    sticker: "You got a sticker! 🌈",
    keepPlaying: "Keep Playing!"
  },
  [Language.GERMAN]: {
    selected: (x: string) => `Du hast ${x} ausgewählt`,
    win: (x: string) => `Das ist ${x}, gut gemacht! Du hast alle gefunden!`,
    foundOne: (x: string) => `Ein ${x} gefunden! Kannst du die anderen finden?`,
    incorrect: (inc: string, tar: string) => `Das ist ${inc}. Kannst du ${tar} finden?`,
    find: "Finde",
    pick: (cat: string) => `Wähle ein ${cat}!`,
    volume: "Lautstärke aufdrehen!",
    amazing: "Toll gemacht!",
    sticker: "Du hast einen Aufkleber! 🌈",
    keepPlaying: "Weiter spielen!"
  }
};
