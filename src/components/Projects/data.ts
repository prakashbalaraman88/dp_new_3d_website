export interface ProjectImage {
  src: string;
  preview: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectFilm {
  src: string;
  poster: string;
  label?: string;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  title: string;
  community: string;
  category: string;
  summary: string;
  story: string;
  designNotes: string[];
  accent: string;
  images: ProjectImage[];
  teaser: number[];
  film?: ProjectFilm;
}

const projectImage = (
  folder: string,
  fileName: string,
  width: number,
  height: number,
  alt: string,
): ProjectImage => ({
  src: `/images/projects/${folder}/${fileName}.webp`,
  preview: `/images/projects/${folder}/${fileName}-preview.webp`,
  alt,
  width,
  height,
});

export const projects: Project[] = [
  {
    id: 'after-the-rain',
    title: 'After the Rain',
    community: 'Total Environment',
    category: 'Warm modern residence',
    summary: 'Crafted timber, patterned surfaces and amber light give this family home a quietly layered character.',
    story: 'A warm, tactile home shaped around crafted timber, patterned surfaces and pools of amber light. Quiet private rooms open into generous family spaces, giving the residence an intimate rhythm without losing its sense of occasion.',
    designNotes: ['Warm timber detailing', 'Layered ambient light', 'Pattern-led accents'],
    accent: '#b79a69',
    teaser: [0, 2, 1],
    film: {
      src: '/videos/projects/after-the-rain-montage.mp4',
      poster: '/images/projects/after-the-rain/after-the-rain-montage-poster.webp',
      label: 'After the Rain project film',
      width: 720,
      height: 960,
    },
    images: [
      projectImage('after-the-rain', 'after-the-rain-formal-living-room', 2400, 1792, 'Formal living room with tufted seating, warm lighting and an adjoining dining space'),
      projectImage('after-the-rain', 'after-the-rain-indoor-courtyard', 1792, 2400, 'Indoor courtyard with patterned tile, timber-framed doors and abundant planting'),
      projectImage('after-the-rain', 'after-the-rain-garden-bedroom', 1856, 2304, 'Garden-facing bedroom with a crafted timber headboard and soft neutral textiles'),
      projectImage('after-the-rain', 'after-the-rain-family-lounge', 1792, 2400, 'Family lounge with sculptural seating and a minimal television wall'),
      projectImage('after-the-rain', 'after-the-rain-galley-kitchen', 1792, 2400, 'Warm timber galley kitchen with layered work lighting'),
      projectImage('after-the-rain', 'after-the-rain-tv-lounge', 1792, 2400, 'Compact television lounge with integrated storage and a window seat'),
      projectImage('after-the-rain', 'after-the-rain-dressing-niche', 1792, 2400, 'Illuminated dressing niche with a full-height mirror and display shelving'),
      projectImage('after-the-rain', 'after-the-rain-vanity-console', 1792, 2400, 'Fluted vanity console framed by a softly illuminated arched mirror'),
      projectImage('after-the-rain', 'after-the-rain-pooja-niche', 1792, 2400, 'Pooja niche with an illuminated decorative screen and warm brass accents'),
    ],
  },
  {
    id: 'century-ethos',
    title: 'Century Ethos',
    community: 'Century Ethos',
    category: 'Contemporary monochrome',
    summary: 'A crisp monochrome foundation is softened with walnut, tailored upholstery and pools of warm light.',
    story: 'A contemporary home with a crisp monochrome foundation, softened by walnut, upholstery and warm light. Each room has its own character—from the charcoal bedroom to the sculptural stair—while a precise material language keeps the residence coherent.',
    designNotes: ['Graphic contrast', 'Tailored wall panelling', 'Warm walnut accents'],
    accent: '#9e896d',
    teaser: [0, 1, 2, 4],
    film: {
      src: '/videos/projects/century-ethos-montage.mp4',
      poster: '/images/projects/century-ethos/century-ethos-montage-poster.webp',
      label: 'Century Ethos project film',
      width: 720,
      height: 960,
    },
    images: [
      projectImage('century-ethos', 'century-ethos-living-room', 2400, 1792, 'Contemporary living room with walnut detailing and a layered stone television wall'),
      projectImage('century-ethos', 'century-ethos-kitchen', 1856, 2304, 'Monochrome kitchen with a sculptural island and pendant lighting'),
      projectImage('century-ethos', 'century-ethos-dining-room', 1801, 1013, 'Warm dining room with wall mouldings, upholstered chairs and a crystal pendant'),
      projectImage('century-ethos', 'century-ethos-charcoal-bedroom', 2400, 1792, 'Charcoal bedroom with vertical wall panelling and warm linear lighting'),
      projectImage('century-ethos', 'century-ethos-staircase', 1856, 2304, 'Sculptural staircase landing with a geometric feature wall'),
      projectImage('century-ethos', 'century-ethos-neutral-bedroom', 1760, 1328, 'Neutral bedroom with walnut wardrobes and restrained modern artwork'),
    ],
  },
  {
    id: 'kolte-patil',
    title: 'Kolte Patil',
    community: 'Kolte Patil',
    category: 'Soft tailored living',
    summary: 'Calm neutrals, generous storage and crisp navy joinery bring comfort and clarity to everyday family life.',
    story: 'A calm, practical family home where tailored storage and everyday comfort lead the design. Soft neutral rooms are lifted with navy joinery, subtle panelling and carefully framed zones for work, rest and gathering.',
    designNotes: ['Purpose-built storage', 'Soft neutral palette', 'Navy joinery accents'],
    accent: '#ac936e',
    teaser: [0, 1, 2],
    film: {
      src: '/videos/projects/kolte-patil-montage.mp4',
      poster: '/images/projects/kolte-patil/kolte-patil-montage-poster.webp',
      label: 'Kolte Patil project film',
      width: 720,
      height: 960,
    },
    images: [
      projectImage('kolte-patil', 'kolte-patil-living-room', 2752, 1536, 'Warm living room with a textured television wall and balcony light'),
      projectImage('kolte-patil', 'kolte-patil-home-office', 1536, 2752, 'Window-side home office with integrated storage and warm timber slats'),
      projectImage('kolte-patil', 'kolte-patil-kitchen', 2605, 1454, 'Blue and white kitchen with illuminated glass cabinetry and a central island'),
      projectImage('kolte-patil', 'kolte-patil-bedroom-wardrobe', 2752, 1536, 'Neutral bedroom with a full wardrobe wall and integrated dressing mirror'),
      projectImage('kolte-patil', 'kolte-patil-panelled-bedroom', 1536, 2752, 'Panelled bedroom with layered bedside lighting and blue textile accents'),
      projectImage('kolte-patil', 'kolte-patil-mirrored-bedroom', 1152, 2048, 'Soft neutral bedroom with mirrored wardrobe shutters and warm bedside lighting'),
    ],
  },
  {
    id: 'prestige-lakeridge',
    title: 'Prestige Lakeridge',
    community: 'Prestige Lakeridge',
    category: 'Quietly personal residence',
    summary: 'Tailored neutrals meet playful, personal rooms in a home designed to feel polished and deeply lived-in.',
    story: 'A quietly elegant residence balancing tailored neutrals with deeply personal rooms. The restrained living areas, playful children’s room and illuminated pooja alcove create a home that feels polished, welcoming and distinctly lived-in.',
    designNotes: ['Personalised rooms', 'Restrained warm neutrals', 'Integrated display lighting'],
    accent: '#b4976c',
    teaser: [0, 1, 4],
    film: {
      src: '/videos/projects/prestige-lakeridge-montage.mp4',
      poster: '/images/projects/prestige-lakeridge/prestige-lakeridge-montage-poster.webp',
      label: 'Prestige Lakeridge project film',
      width: 720,
      height: 960,
    },
    images: [
      projectImage('prestige-lakeridge', 'prestige-lakeridge-living-room', 2560, 1440, 'Elegant living room with warm wall lighting and full-height sheer curtains'),
      projectImage('prestige-lakeridge', 'prestige-lakeridge-kitchen', 1536, 2752, 'Dark contemporary kitchen with timber upper cabinets and patterned flooring'),
      projectImage('prestige-lakeridge', 'prestige-lakeridge-kids-bedroom', 5504, 3072, 'Playful children’s bedroom with a space-themed mural and integrated storage'),
      projectImage('prestige-lakeridge', 'prestige-lakeridge-primary-bedroom', 5504, 3072, 'Soft primary bedroom with layered neutrals and a window-side reading chair'),
      projectImage('prestige-lakeridge', 'prestige-lakeridge-entry-console', 1792, 2400, 'Tailored entry console set against a softly textured leaf-pattern feature wall'),
      projectImage('prestige-lakeridge', 'prestige-lakeridge-pooja-alcove', 1746, 982, 'Illuminated pooja alcove with crafted timber screens and integrated storage'),
    ],
  },
  {
    id: 'sun-and-sanctum',
    title: 'Sun and Sanctum',
    community: 'Private Residence',
    category: 'Warm contemporary sanctuary',
    summary: 'Soft ivory rooms, muted blush joinery and an illuminated sanctum shape a home grounded in light and everyday ritual.',
    story: 'Sun and Sanctum is shaped by warm ivory, walnut notes and gentle illumination. A calm living and dining spine leads from a sculpted foyer to the pooja alcove, while tailored bedrooms introduce muted blush cabinetry and deeply comfortable layers.',
    designNotes: ['Layered warm illumination', 'Blush and walnut accents', 'Integrated pooja sanctum'],
    accent: '#c1a06b',
    teaser: [0, 1, 4],
    film: {
      src: '/videos/projects/sun-and-sanctum-montage.mp4',
      poster: '/images/projects/sun-and-sanctum/sun-and-sanctum-montage-poster.webp',
      label: 'Sun and Sanctum project film',
      width: 720,
      height: 960,
    },
    images: [
      projectImage('sun-and-sanctum', 'sun-and-sanctum-living-room', 2752, 1536, 'Warm ivory living room with tailored wall mouldings, layered lighting and soft plum accents'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-foyer', 1856, 2304, 'Sculpted foyer console with arched mirrors, pendant lights and warm walnut detailing'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-kitchen', 1856, 2304, 'Light-filled galley kitchen with taupe cabinetry, patterned backsplash and integrated appliances'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-dining', 1856, 2304, 'Dining passage framed by tailored cabinetry, warm light and a softly patterned runner'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-pooja', 2400, 1792, 'Illuminated pooja sanctum with a decorative screen, warm brass accents and integrated storage'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-primary-bedroom', 2400, 1792, 'Primary bedroom with a framed upholstered headboard and layered neutral textiles'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-primary-bedroom-angle', 2400, 1792, 'Angled view of the primary bedroom with an arched mirror and warm bedside lighting'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-kids-bedroom', 2752, 1536, 'Softly tailored bedroom with muted blush bedside joinery and an integrated study niche'),
      projectImage('sun-and-sanctum', 'sun-and-sanctum-kids-bedroom-detail', 928, 1152, 'Bedroom study and vanity detail with blush cabinetry, fluted panelling and an arched mirror'),
    ],
  },
];

export const findProject = (id?: string) => projects.find((project) => project.id === id);

export const getNextProject = (id: string) => {
  const currentIndex = projects.findIndex((project) => project.id === id);
  return projects[(currentIndex + 1 + projects.length) % projects.length];
};
