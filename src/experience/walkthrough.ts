export type WalkthroughIcon = 'trees' | 'door-open' | 'sofa' | 'chef-hat' | 'sparkles';

export type Act = {
  at: number;
  hold: number;
  eyebrow?: string;
  title: string;
  sub?: string;
  accentWord: string;
  card: {
    label: string;
    blurb: string;
    icons: WalkthroughIcon[];
  };
};

export type Segment = {
  id: string;
  src: string;
  mobileSrc: string;
  poster: string;
  mobilePoster: string;
  acts: Act[];
};

export const walkthroughSegments: Segment[] = [
  {
    id: 'exterior-approach',
    src: '/videos/segments/exterior-approach-desktop.mp4',
    mobileSrc: '/videos/segments/exterior-approach-mobile.mp4',
    poster: '/videos/segments/exterior-approach-desktop.jpg',
    mobilePoster: '/videos/segments/exterior-approach-mobile.jpg',
    acts: [
      {
        at: 0,
        hold: 0.1,
        eyebrow: 'Bangalore · Architecture & Interiors',
        title: 'A home should feel\nunmistakably yours.',
        sub: 'Scroll to step inside.',
        accentWord: 'yours',
        card: {
          label: 'The exterior',
          blurb: 'Architecture composed around light, landscape and arrival.',
          icons: ['trees', 'sparkles'],
        },
      },
      {
        at: 0.2,
        hold: 0.08,
        eyebrow: 'Designed from the outside in',
        title: 'Every arrival\nsets the tone.',
        sub: 'Light, proportion and material move as one.',
        accentWord: 'arrival',
        card: {
          label: 'The approach',
          blurb: 'A measured sequence from garden edge to sheltered entry.',
          icons: ['trees', 'door-open'],
        },
      },
      {
        at: 0.46,
        hold: 0.08,
        eyebrow: 'The threshold',
        title: 'Some doors open\nto more than rooms.',
        sub: 'Step through.',
        accentWord: 'doors',
        card: {
          label: 'The threshold',
          blurb: 'Material warmth turns a doorway into a moment of pause.',
          icons: ['door-open', 'sofa'],
        },
      },
      {
        at: 0.74,
        hold: 0.08,
        eyebrow: 'The social heart',
        title: 'Where every evening\nfinds its centre.',
        accentWord: 'centre',
        card: {
          label: 'The social heart',
          blurb: 'Living, dining and kitchen flow as one generous room.',
          icons: ['sofa', 'chef-hat'],
        },
        sub: 'Kitchen · Dining · Island',
      },
      {
        at: 0.93,
        hold: 0.07,
        eyebrow: 'Now, let’s design yours',
        title: 'Discover how\nyou want to live.',
        sub: 'Your style story starts next.',
        accentWord: 'live',
        card: {
          label: 'Your story',
          blurb: 'A home shaped around your rituals, taste and way of living.',
          icons: ['chef-hat', 'sparkles'],
        },
      },
    ],
  },
];
