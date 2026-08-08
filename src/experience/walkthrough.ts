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
        hold: 0.08,
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
        at: 0.44,
        hold: 0.07,
        eyebrow: 'The threshold',
        title: 'Some doors open\nto more than rooms.',
        sub: 'Step through.',
        accentWord: 'doors',
        card: {
          label: 'The threshold',
          blurb: 'Carved wood, brass and mist mark a moment of pause.',
          icons: ['door-open', 'sparkles'],
        },
      },
      {
        at: 0.6,
        hold: 0.07,
        eyebrow: 'The social heart',
        title: 'Where every evening\nfinds its centre.',
        sub: 'Kitchen · Island · Stone',
        accentWord: 'centre',
        card: {
          label: 'The social heart',
          blurb: 'Marble, timber and cove light gather the day together.',
          icons: ['chef-hat', 'sofa'],
        },
      },
      {
        at: 0.81,
        hold: 0.07,
        eyebrow: 'The living court',
        title: 'Calm, sculpted\ninto every corner.',
        sub: 'Lounge · Stair · Light',
        accentWord: 'Calm',
        card: {
          label: 'The lounge',
          blurb: 'A sunken seat wrapped in warm light and quiet curves.',
          icons: ['sofa', 'sparkles'],
        },
      },
      {
        at: 0.93,
        hold: 0.06,
        eyebrow: 'Now, let’s design yours',
        title: 'A home with room\nfor every ritual.',
        sub: 'Your style story starts next.',
        accentWord: 'ritual',
        card: {
          label: 'The sanctum',
          blurb: 'Craft, devotion and light meet at the heart of the home.',
          icons: ['sparkles', 'door-open'],
        },
      },
    ],
  },
];
