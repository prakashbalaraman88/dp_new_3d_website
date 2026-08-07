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

// Retained only for the legacy, unmounted ChoiceSection module. Practical
// questions now live exclusively in LeadForm and are not part of ROUNDS.
export interface ChoiceRound extends RoundBase {
  kind: 'choice';
  why?: string;
  options: ChoiceOption[];
}

export type ImageRound = QuadRound;
export type Round = QuadRound;

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
  kind: 'quad';
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
  if (options.length !== 4) {
    throw new Error(`Quiz round ${round.id} must be a quad with exactly four images.`);
  }
  return { kind: 'quad', id: round.id, kicker: round.kicker, question: round.question, options };
});

export const ROUNDS: Round[] = IMAGE_ROUNDS;
