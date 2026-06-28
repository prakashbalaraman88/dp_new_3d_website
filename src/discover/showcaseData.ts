import { buildReport, type Answers } from './report';

export interface ShowcaseProject {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  video?: string;
  styles: string[]; // quiz philosophies this project represents (for personalization)
}

// Reuses the existing project assets; `styles` map each project to quiz philosophies.
export const PROJECTS: ShowcaseProject[] = [
  { id: 'phoenix-kessaku', title: 'Phoenix Kessaku', category: 'Luxury 3BHK · Japandi', description: 'Japanese-minimalist calm — warm woods, soft light, clean lines.', image: '/assets/images/project-1.png', video: '/assets/videos/project-1.mp4', styles: ['Scandinavian', 'Scandinavian Calm', 'Handleless Minimal'] },
  { id: 'brigade-exotica', title: 'Brigade Exotica', category: 'Modern 3BHK', description: 'Sophisticated handleless minimalism with panoramic light.', image: '/assets/images/project-2.png', video: '/assets/videos/project-2.mp4', styles: ['Modern Contemporary', 'Handleless Minimal'] },
  { id: 'prestige-golf-view', title: 'Prestige Golf View', category: '4BHK Villa', description: 'Eco-conscious luxury — premium stone, brass and warm timber.', image: '/assets/images/project-3.png', video: '/assets/videos/project-3.mp4', styles: ['Luxe Italian', 'Modern Contemporary', 'Warm Wood'] },
  { id: 'urban-oasis', title: 'Urban Oasis', category: 'Contemporary Home', description: 'Seamless indoor-outdoor flow in a warm contemporary palette.', image: '/assets/images/project-4.png', video: '/assets/videos/project-4.mp4', styles: ['Modern Contemporary', 'Indian Contemporary'] },
  { id: 'skyline-retreat', title: 'Skyline Retreat', category: 'Penthouse', description: 'Urban luxury — glass, metal and statement lighting.', image: '/assets/images/project-5.png', video: '/assets/videos/project-5.mp4', styles: ['Luxe Italian', 'Luxe Glass', 'Modern Contemporary', 'Italian Modular'] },
  { id: 'serenity-haven', title: 'Serenity Haven', category: 'Classic Villa', description: 'Timeless elegance — paneling, warm woods and heirloom detail.', image: '/assets/images/project-6.png', video: '/assets/videos/project-6.mp4', styles: ['Classic European', 'Indian Contemporary', 'Warm Wood'] },
];

export interface ShowcaseTestimonial {
  name: string;
  role: string;
  content: string;
}

export const TESTIMONIALS: ShowcaseTestimonial[] = [
  { name: 'Srinivas Rao', role: 'Homeowner', content: 'A fantastic job with our home interiors — professional throughout and they delivered exactly what we wanted. Special thanks to Kishan for the creative inputs.' },
  { name: 'Santhosh Kumar', role: 'Property Owner', content: 'One of the best interior designers in Bangalore. Very professional, excellent quality, and completed on time with great attention to detail.' },
  { name: 'Pradeep Nair', role: 'Homeowner', content: 'Excellent work — they transformed our space beautifully, understood our requirements perfectly and were very cooperative. Highly recommended!' },
  { name: 'Ramya Krishnan', role: 'Apartment Owner', content: 'A great team of designers — creative and professional. The execution was smooth and the result exceeded our expectations.' },
  { name: 'Arun Prakash', role: 'Villa Owner', content: 'Outstanding design with a keen eye for detail. The team was always available for discussions and modifications.' },
  { name: 'Meera Suresh', role: 'Residential Client', content: 'An amazing job with our home interiors — professional, high quality, and finished within the timeline.' },
];

export const WHATSAPP_NUMBER = '917892434663';
export const STUDIO_PHONE = '+917892434663';
export const STUDIO_EMAIL = 'info@dezignpool.com';
export const STUDIO_INSTAGRAM = 'https://www.instagram.com/dezignpool';

export function rankProjects(answers: Answers): { matched: ShowcaseProject[]; rest: ShowcaseProject[] } {
  const set = new Set(buildReport(answers).philosophies);
  const scored = PROJECTS.map((p) => ({ p, score: p.styles.filter((s) => set.has(s)).length }));
  const matched = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.p);
  const rest = scored.filter((x) => x.score === 0).map((x) => x.p);
  return { matched, rest };
}

export function whatsappLink(answers: Answers): string {
  const label = buildReport(answers).label;
  const msg = `Hi DezignPool! I just completed your style quiz — my design style is "${label}". I'd love to talk about my home.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
