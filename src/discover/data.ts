export interface StyleOption {
  id: string;
  philosophy: string;
  title: string;
  blurb: string;
  image: string;
  palette: [string, string, string];
  traits: string[];
}

export interface ChoiceOption {
  id: string;
  label: string;
  hint?: string;
}

export interface VisualStep {
  kind: 'visual';
  id: string;
  room: string;
  question: string;
  options: StyleOption[];
}

export interface ChoiceStep {
  kind: 'choice';
  id: string;
  kicker: string;
  question: string;
  why?: string;
  options: ChoiceOption[];
}

export type Step = VisualStep | ChoiceStep;

const KITCHEN: StyleOption[] = [
  { id: 'kitchen-contemporary', philosophy: 'Modern Contemporary', title: 'Bold & Grounded', blurb: 'Charcoal cabinetry, warm wood, confident lines.', image: '/images/discover/kitchen-contemporary.jpg', palette: ['#3A4040', '#6B4F2F', '#D4AF37'], traits: ['charcoal', 'walnut', 'matte black', 'statement island'] },
  { id: 'kitchen-italian', philosophy: 'Italian Modular', title: 'Sleek & Sculptural', blurb: 'Handleless lacquer, stone, and quiet luxury.', image: '/images/discover/kitchen-italian.jpg', palette: ['#2C2C2E', '#C9A24B', '#E9E3D4'], traits: ['handleless', 'quartz', 'high-gloss', 'gold accents'] },
  { id: 'kitchen-scandinavian', philosophy: 'Scandinavian', title: 'Light & Uncluttered', blurb: 'Pale woods, soft white, and room to breathe.', image: '/images/discover/kitchen-scandinavian.jpg', palette: ['#EDE8DF', '#D8C7A8', '#A98B6A'], traits: ['light oak', 'matte white', 'clean lines', 'natural light'] },
  { id: 'kitchen-indian', philosophy: 'Indian Contemporary', title: 'Warm & Functional', blurb: 'Rich woods, a smart utility zone, made for real cooking.', image: '/images/discover/kitchen-indian.jpg', palette: ['#C9B79C', '#7A6A55', '#3A3A36'], traits: ['warm wood', 'utility area', 'ample storage', 'chimney'] },
];

const WARDROBE: StyleOption[] = [
  { id: 'wardrobe-minimal', philosophy: 'Handleless Minimal', title: 'Seamless & Serene', blurb: 'Floor-to-ceiling calm — not a handle in sight.', image: '/images/discover/wardrobe-minimal.jpg', palette: ['#E7E2D8', '#B9AE9B', '#6E6354'], traits: ['handleless', 'push-to-open', 'matte', 'full height'] },
  { id: 'wardrobe-luxe', philosophy: 'Luxe Glass', title: 'Mirror & Metal', blurb: 'Tinted glass, profile shutters, dressing-room glamour.', image: '/images/discover/wardrobe-luxe.jpg', palette: ['#2B2B2D', '#8A8D8F', '#C9A24B'], traits: ['glass shutters', 'profile handles', 'mirror', 'integrated lighting'] },
  { id: 'wardrobe-european', philosophy: 'Classic European', title: 'Paneled & Timeless', blurb: 'Shaker doors, soft moldings, an heirloom feel.', image: '/images/discover/wardrobe-european.jpg', palette: ['#EDEAE3', '#9FB38F', '#5B4631'], traits: ['shaker panels', 'moldings', 'soft neutrals', 'brass knobs'] },
  { id: 'wardrobe-wood', philosophy: 'Warm Wood', title: 'Rich & Tactile', blurb: 'Full-grain timber that ages beautifully.', image: '/images/discover/wardrobe-wood.jpg', palette: ['#6B4F2F', '#A47B4E', '#E2C79B'], traits: ['full-grain wood', 'tactile', 'warm', 'laminate'] },
];

const LIVING: StyleOption[] = [
  { id: 'living-contemporary', philosophy: 'Modern Contemporary', title: 'Sleek Statement', blurb: 'Clean volumes, a hero TV wall, curated restraint.', image: '/images/discover/living-contemporary.jpg', palette: ['#3A4040', '#D4AF37', '#E9E3D4'], traits: ['feature wall', 'clean volumes', 'curated', 'low profile'] },
  { id: 'living-italian', philosophy: 'Luxe Italian', title: 'Opulent Calm', blurb: 'Marble, brass, velvet — understated opulence.', image: '/images/discover/living-italian.jpg', palette: ['#2C2A28', '#C9A24B', '#7D6B57'], traits: ['marble', 'brass', 'velvet', 'statement lighting'] },
  { id: 'living-indian', philosophy: 'Indian Contemporary', title: 'Rooted & Layered', blurb: 'Ethnic art, warm textures, and collected soul.', image: '/images/discover/living-indian.jpg', palette: ['#A86B4C', '#9FB38F', '#E2C79B'], traits: ['ethnic art', 'jaali', 'warm textures', 'crockery unit'] },
  { id: 'living-scandinavian', philosophy: 'Scandinavian Calm', title: 'Soft & Light', blurb: 'Airy neutrals, soft forms, gentle light.', image: '/images/discover/living-scandinavian.jpg', palette: ['#EDE8DF', '#C9BBA8', '#9AA79A'], traits: ['airy neutrals', 'soft forms', 'light wood', 'cozy'] },
];

export const STEPS: Step[] = [
  {
    kind: 'choice', id: 'home', kicker: 'Your home', question: 'What kind of home are we designing?', why: 'So we plan around your building’s structure and possibilities.',
    options: [
      { id: 'apartment', label: 'Apartment', hint: 'Flat / gated community' },
      { id: 'villa', label: 'Villa', hint: 'Villa or row house' },
      { id: 'independent', label: 'Independent house' },
      { id: 'builder', label: 'Builder floor' },
    ],
  },
  { kind: 'visual', id: 'kitchen', room: 'Kitchen', question: 'Which kitchen would you want to wake up to?', options: KITCHEN },
  {
    kind: 'choice', id: 'bhk', kicker: 'Configuration', question: 'How many bedrooms?',
    options: [
      { id: '1bhk', label: '1 BHK' },
      { id: '2bhk', label: '2 BHK' },
      { id: '3bhk', label: '3 BHK' },
      { id: '4bhk', label: '4 BHK +' },
    ],
  },
  { kind: 'visual', id: 'wardrobe', room: 'Wardrobe', question: 'How should your wardrobe feel?', options: WARDROBE },
  {
    kind: 'choice', id: 'budget', kicker: 'Investment', question: 'What budget feels right for your interiors?', why: 'It helps us match materials and finishes to your range — no obligation.',
    options: [
      { id: 'b1', label: 'Under ₹6 Lakh', hint: 'Essentials' },
      { id: 'b2', label: '₹6 – 12 Lakh', hint: 'Comfort' },
      { id: 'b3', label: '₹12 – 20 Lakh', hint: 'Premium' },
      { id: 'b4', label: '₹20 Lakh +', hint: 'Luxury' },
    ],
  },
  { kind: 'visual', id: 'living', room: 'Living Room', question: 'Your living room should say…', options: LIVING },
  {
    kind: 'choice', id: 'timeline', kicker: 'Timeline', question: 'When do you need it ready?', why: 'So we sequence the work around your move-in.',
    options: [
      { id: 't1', label: 'Moving in soon' },
      { id: 't2', label: 'In 1 – 3 months' },
      { id: 't3', label: 'In 3 – 6 months' },
      { id: 't4', label: 'Just exploring' },
    ],
  },
  {
    kind: 'choice', id: 'vastu', kicker: 'Vastu', question: 'How important is Vastu to you?', why: 'If it matters, we align entrances, kitchen and layouts accordingly.',
    options: [
      { id: 'v1', label: 'Very important' },
      { id: 'v2', label: 'Somewhat' },
      { id: 'v3', label: 'Not a priority' },
    ],
  },
];
