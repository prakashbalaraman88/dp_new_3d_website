import { ROUNDS, STYLE_ORDER, STYLE_PROFILES, type ImageOption } from './data';
import { sendEmail } from '../utils/emailjs';

export type Answer = string;
export type Answers = Record<string, Answer | undefined>;

export interface Contact {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Detail {
  label: string;
  value: string;
}

export interface SelectedImage {
  id: string;
  room: string;
  style: string;
  styleLabel: string;
}

export interface StyleResult {
  id: string;
  label: string;
  score: number;
  essence: string;
  palette: string[];
  montage: string[];
}

export interface DesignReport {
  label: string;
  tagline: string;
  primaryStyle: StyleResult;
  secondaryStyle: StyleResult;
  styles: StyleResult[];
  picks: SelectedImage[];
  details: Detail[];
  philosophies: string[];
  materials: string[];
  motifs: string[];
  emailText: string;
}

function addCount(counts: Map<string, number>, values: string[]) {
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
}

function rankedCounts(counts: Map<string, number>): string[] {
  return [...counts.entries()]
    .sort(([aLabel, aCount], [bLabel, bCount]) => bCount - aCount || aLabel.localeCompare(bLabel))
    .map(([label]) => label);
}

function styleResult(id: string, score: number): StyleResult {
  const profile = STYLE_PROFILES[id];
  return {
    id,
    label: profile?.label || id.replaceAll('-', ' '),
    score,
    essence: profile?.essence || '',
    palette: profile?.palette || [],
    montage: profile?.montage || [],
  };
}

function positivePick(image: ImageOption, picks: SelectedImage[], materialCounts: Map<string, number>, motifCounts: Map<string, number>) {
  picks.push({
    id: image.id,
    room: image.room,
    style: image.style,
    styleLabel: STYLE_PROFILES[image.style]?.label || image.style.replaceAll('-', ' '),
  });
  addCount(materialCounts, image.materials);
  addCount(motifCounts, image.motifs);
}

export function buildReport(answers: Answers, contact?: Partial<Contact>, floorPlanNote?: string): DesignReport {
  const scores = new Map(STYLE_ORDER.map((style) => [style, 0]));
  const details: Detail[] = [];
  const picks: SelectedImage[] = [];
  const materialCounts = new Map<string, number>();
  const motifCounts = new Map<string, number>();

  const addScore = (style: string, weight: number) => {
    scores.set(style, (scores.get(style) || 0) + weight);
  };

  for (const round of ROUNDS) {
    const answer = answers[round.id];
    if (!answer) continue;

    const image = round.options.find((candidate) => candidate.id === answer);
    if (!image) continue;
    addScore(image.style, 2);
    positivePick(image, picks, materialCounts, motifCounts);
  }

  // Stable sort plus the manifest's style order makes ties deterministic.
  const styles = STYLE_ORDER
    .map((style, order) => ({ id: style, score: scores.get(style) || 0, order }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((style) => styleResult(style.id, style.score));
  const primaryStyle = styles[0] || styleResult('art-deco', 0);
  const secondaryStyle = styles[1] || primaryStyle;
  const materials = rankedCounts(materialCounts);
  const motifs = rankedCounts(motifCounts);
  const philosophies = styles.filter((style) => style.score > 0).map((style) => style.label);

  const lines: string[] = ['--- DESIGN DISCOVERY BRIEF ---', ''];
  lines.push(`Primary style: ${primaryStyle.label} (${primaryStyle.score.toFixed(1)} points)`);
  lines.push(`Secondary style: ${secondaryStyle.label} (${secondaryStyle.score.toFixed(1)} points)`);
  if (primaryStyle.essence) lines.push(primaryStyle.essence);
  lines.push('');
  if (details.length) {
    lines.push('Project details:');
    details.forEach((detail) => lines.push(`  - ${detail.label}: ${detail.value}`));
    lines.push('');
  }
  if (picks.length) {
    lines.push('Positive image choices:');
    picks.forEach((pick) => lines.push(`  - ${pick.room}: ${pick.styleLabel} [${pick.id}]`));
    lines.push('');
  }
  if (materials.length) lines.push(`Material signals: ${materials.slice(0, 8).join(', ')}`, '');
  if (motifs.length) lines.push(`Motif signals: ${motifs.slice(0, 8).join(', ')}`, '');
  if (floorPlanNote) lines.push(`Floor plan: ${floorPlanNote}`, '');
  if (contact?.notes) lines.push(`Client note: ${contact.notes}`, '');
  if (contact?.name || contact?.email || contact?.phone) {
    lines.push('Client:', `  ${contact?.name || ''} | ${contact?.email || ''} | ${contact?.phone || ''}`);
  }

  return {
    label: primaryStyle.label,
    tagline: primaryStyle.essence,
    primaryStyle,
    secondaryStyle,
    styles,
    picks,
    details,
    philosophies: philosophies.length > 0 ? philosophies : [primaryStyle.label],
    materials,
    motifs,
    emailText: lines.join('\n'),
  };
}

// Cloudinary delivery of the actual floor-plan file. Set an UNSIGNED upload
// preset name (created in the DezignPool Cloudinary account) to have the file
// itself reach the team; otherwise only its name is included in the brief.
const CLOUDINARY_CLOUD = 'dnu3ijmha';
const CLOUDINARY_UNSIGNED_PRESET = '';

export async function uploadFloorPlan(file: File): Promise<string | null> {
  if (!CLOUDINARY_UNSIGNED_PRESET) return null;
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UNSIGNED_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`, { method: 'POST', body: fd });
    if (!res.ok) return null;
    const json = await res.json();
    return (json && json.secure_url) || null;
  } catch {
    return null;
  }
}

export async function submitDiscovery(report: DesignReport, contact: Contact, floorPlanUrl?: string | null): Promise<void> {
  const message = floorPlanUrl ? `${report.emailText}\n\nFloor plan file: ${floorPlanUrl}` : report.emailText;
  await sendEmail({
    template_id: 'template_g0npg5i',
    service_id: 'service_s4zfuyo',
    user_id: '98i8Pncvl-khTXgn5',
    template_params: {
      from_name: contact.name,
      from_email: contact.email,
      phone: contact.phone,
      message,
      to_name: 'DezignPool Team',
      reply_to: contact.email,
      form_type: 'Design Discovery Quiz',
    },
  });
}
