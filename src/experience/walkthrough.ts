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
    weightVh: 300,
    acts: [
      {
        at: 0,
        hold: 0.22,
        eyebrow: 'Bangalore · Architecture & Interiors',
        title: 'A home should feel unmistakably yours.',
        sub: 'Scroll to step inside.',
      },
      {
        at: 0.55,
        hold: 0.2,
        eyebrow: 'Designed from the outside in',
        title: 'Every arrival sets the tone.',
        sub: 'Light, proportion and material move as one.',
      },
    ],
  },
  {
    id: 'interior-sweep',
    src: '/videos/segments/interior-sweep-desktop.mp4',
    mobileSrc: '/videos/segments/interior-sweep-mobile.mp4',
    poster: '/videos/segments/interior-sweep-desktop.jpg',
    mobilePoster: '/videos/segments/interior-sweep-mobile.jpg',
    weightVh: 300,
    acts: [
      {
        at: 0.42,
        hold: 0.28,
        eyebrow: 'Foyer · Living · Kitchen',
        title: 'Now, let’s discover how you want to live.',
        sub: 'Your style story starts next.',
      },
    ],
  },
];
