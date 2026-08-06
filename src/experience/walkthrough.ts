export type Act = {
  at: number;
  hold: number;
  eyebrow?: string;
  title: string;
  sub?: string;
};

export type Segment = {
  id: string;
  src: string;
  mobileSrc: string;
  poster: string;
  mobilePoster: string;
  weightVh: number;
  acts: Act[];
};

export const walkthroughSegments: Segment[] = [
  {
    id: 'exterior-approach',
    src: '/videos/segments/exterior-approach-desktop.mp4',
    mobileSrc: '/videos/segments/exterior-approach-mobile.mp4',
    poster: '/videos/segments/exterior-approach-desktop.jpg',
    mobilePoster: '/videos/segments/exterior-approach-mobile.jpg',
    weightVh: 600,
    acts: [
      {
        at: 0,
        hold: 0.1,
        eyebrow: 'Bangalore · Architecture & Interiors',
        title: 'A home should feel unmistakably yours.',
        sub: 'Scroll to step inside.',
      },
      {
        at: 0.2,
        hold: 0.08,
        eyebrow: 'Designed from the outside in',
        title: 'Every arrival sets the tone.',
        sub: 'Light, proportion and material move as one.',
      },
      {
        at: 0.46,
        hold: 0.08,
        eyebrow: 'The threshold',
        title: 'Some doors open to more than rooms.',
        sub: 'Step through.',
      },
      {
        at: 0.74,
        hold: 0.08,
        eyebrow: 'The social heart',
        title: 'Where every evening finds its centre.',
        sub: 'Kitchen · Dining · Island',
      },
      {
        at: 0.93,
        hold: 0.07,
        eyebrow: 'Now, let’s design yours',
        title: 'Discover how you want to live.',
        sub: 'Your style story starts next.',
      },
    ],
  },
];
