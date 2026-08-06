import quizAssetsSource from './quizAssets.json';

export interface ChoiceOption {
  id: string;
  label: string;
  hint?: string;
}

export interface ImageOption {
  id: string;
  image: string;
  style: string;
  room: string;
  materials: string[];
  motifs: string[];
}

interface RoundBase {
  id: string;
  kicker: string;
  question: string;
}

export interface QuadRound extends RoundBase {
  kind: 'quad';
  options: ImageOption[];
}

export interface DuelRound extends RoundBase {
  kind: 'duel';
  options: ImageOption[];
}

export interface BoardRound extends RoundBase {
  kind: 'board';
  images: ImageOption[];
}

export interface ChoiceRound extends RoundBase {
  kind: 'choice';
  why?: string;
  options: ChoiceOption[];
}

export type ImageRound = QuadRound | DuelRound | BoardRound;
export type Round = ImageRound | ChoiceRound;

export interface QuizAssetImage {
  id: string;
  path: string;
  style: string;
  room: string;
  materials: string[];
  motifs: string[];
}

export interface StyleProfile {
  label: string;
  essence: string;
  palette: string[];
  montage: string[];
}

interface AssetRound {
  kind: 'quad' | 'duel' | 'board';
  id: string;
  kicker: string;
  question: string;
  imageIds: string[];
}

export interface QuizAssetManifest {
  version: number;
  seed: string;
  styleOrder: string[];
  styles: Record<string, StyleProfile>;
  images: Record<string, QuizAssetImage>;
  rounds: AssetRound[];
}

export const QUIZ_ASSETS = quizAssetsSource as unknown as QuizAssetManifest;
export const STYLE_ORDER = QUIZ_ASSETS.styleOrder;
export const STYLE_PROFILES = QUIZ_ASSETS.styles;

function imageOption(id: string): ImageOption {
  const asset = QUIZ_ASSETS.images[id];
  if (!asset) throw new Error(`Quiz asset manifest references unknown image id: ${id}`);
  return {
    id: asset.id,
    image: asset.path,
    style: asset.style,
    room: asset.room,
    materials: asset.materials,
    motifs: asset.motifs,
  };
}

export const IMAGE_ROUNDS: ImageRound[] = QUIZ_ASSETS.rounds.map((round) => {
  const options = round.imageIds.map(imageOption);
  if (round.kind === 'board') {
    return { kind: 'board', id: round.id, kicker: round.kicker, question: round.question, images: options };
  }
  if (round.kind === 'quad') {
    return { kind: 'quad', id: round.id, kicker: round.kicker, question: round.question, options };
  }
  return { kind: 'duel', id: round.id, kicker: round.kicker, question: round.question, options };
});

const CHOICE_ROUNDS: ChoiceRound[] = [
  {
    kind: 'choice',
    id: 'home',
    kicker: 'Your home',
    question: 'What kind of home are we designing?',
    why: 'So we plan around your building’s structure and possibilities.',
    options: [
      { id: 'apartment', label: 'Apartment', hint: 'Flat / gated community' },
      { id: 'villa', label: 'Villa', hint: 'Villa or row house' },
      { id: 'independent', label: 'Independent house' },
      { id: 'builder', label: 'Builder floor' },
    ],
  },
  {
    kind: 'choice',
    id: 'bhk',
    kicker: 'Configuration',
    question: 'How many bedrooms?',
    options: [
      { id: '1bhk', label: '1 BHK' },
      { id: '2bhk', label: '2 BHK' },
      { id: '3bhk', label: '3 BHK' },
      { id: '4bhk', label: '4 BHK +' },
    ],
  },
  {
    kind: 'choice',
    id: 'budget',
    kicker: 'Investment',
    question: 'What budget feels right for your interiors?',
    why: 'It helps us match materials and finishes to your range — no obligation.',
    options: [
      { id: 'b1', label: 'Under ₹6 Lakh', hint: 'Essentials' },
      { id: 'b2', label: '₹6 – 12 Lakh', hint: 'Comfort' },
      { id: 'b3', label: '₹12 – 20 Lakh', hint: 'Premium' },
      { id: 'b4', label: '₹20 Lakh +', hint: 'Luxury' },
    ],
  },
  {
    kind: 'choice',
    id: 'timeline',
    kicker: 'Timeline',
    question: 'When do you need it ready?',
    why: 'So we sequence the work around your move-in.',
    options: [
      { id: 't1', label: 'Moving in soon' },
      { id: 't2', label: 'In 1 – 3 months' },
      { id: 't3', label: 'In 3 – 6 months' },
      { id: 't4', label: 'Just exploring' },
    ],
  },
];

// Interleave practical questions with image rounds so the deck keeps a visual rhythm.
export const ROUNDS: Round[] = [
  CHOICE_ROUNDS[0],
  ...IMAGE_ROUNDS.slice(0, 3),
  CHOICE_ROUNDS[1],
  ...IMAGE_ROUNDS.slice(3, 6),
  CHOICE_ROUNDS[2],
  ...IMAGE_ROUNDS.slice(6, 9),
  CHOICE_ROUNDS[3],
  ...IMAGE_ROUNDS.slice(9, 12),
];
