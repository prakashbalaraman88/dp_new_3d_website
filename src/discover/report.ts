import { STEPS } from './data';
import { sendEmail } from '../utils/emailjs';

export type Answers = Record<string, string>; // stepId -> optionId

export interface Contact {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface RoomPick {
  room: string;
  philosophy: string;
  title: string;
  traits: string[];
}

export interface Detail {
  label: string;
  value: string;
}

export interface DesignReport {
  label: string;
  tagline: string;
  picks: RoomPick[];
  details: Detail[];
  philosophies: string[];
  materials: string[];
  emailText: string;
}

export function buildReport(answers: Answers, contact?: Partial<Contact>, floorPlanNote?: string): DesignReport {
  const picks: RoomPick[] = [];
  const details: Detail[] = [];
  const philosophyCount: Record<string, number> = {};
  const materials = new Set<string>();

  for (const step of STEPS) {
    const ansId = answers[step.id];
    if (!ansId) continue;
    if (step.kind === 'visual') {
      const opt = step.options.find((o) => o.id === ansId);
      if (opt) {
        picks.push({ room: step.room, philosophy: opt.philosophy, title: opt.title, traits: opt.traits });
        philosophyCount[opt.philosophy] = (philosophyCount[opt.philosophy] || 0) + 1;
        opt.traits.forEach((t) => materials.add(t));
      }
    } else {
      const opt = step.options.find((o) => o.id === ansId);
      if (opt) details.push({ label: step.kicker, value: opt.label });
    }
  }

  const ranked = Object.entries(philosophyCount).sort((a, b) => b[1] - a[1]);
  const philosophies = ranked.map(([p]) => p);

  let label = 'Your Design DNA';
  let tagline = '';
  if (ranked.length === 1) {
    label = ranked[0][0];
    tagline = `A clear, consistent love for ${ranked[0][0].toLowerCase()} design.`;
  } else if (ranked.length >= 2 && ranked[0][1] > 1) {
    label = `${ranked[0][0]} with ${ranked[1][0]} accents`;
    tagline = `Grounded in ${ranked[0][0].toLowerCase()}, with a taste for ${ranked[1][0].toLowerCase()}.`;
  } else if (ranked.length >= 2) {
    label = 'An Eclectic Blend';
    tagline = `A curated mix of ${philosophies.slice(0, 3).join(', ')}.`;
  }

  const lines: string[] = [];
  lines.push('--- DESIGN DISCOVERY BRIEF ---', '');
  lines.push(`Design DNA: ${label}`);
  if (tagline) lines.push(tagline);
  lines.push('');
  if (details.length) {
    lines.push('Project details:');
    details.forEach((d) => lines.push(`  - ${d.label}: ${d.value}`));
    lines.push('');
  }
  if (picks.length) {
    lines.push('Style preferences:');
    picks.forEach((p) => lines.push(`  - ${p.room}: ${p.philosophy} (${p.title}) - ${p.traits.join(', ')}`));
    lines.push('');
  }
  if (materials.size) lines.push(`Materials & cues: ${Array.from(materials).join(', ')}`, '');
  if (floorPlanNote) lines.push(`Floor plan: ${floorPlanNote}`, '');
  if (contact?.notes) lines.push(`Client note: ${contact.notes}`, '');
  if (contact?.name || contact?.email || contact?.phone) {
    lines.push('Client:', `  ${contact?.name || ''} | ${contact?.email || ''} | ${contact?.phone || ''}`);
  }

  return { label, tagline, picks, details, philosophies, materials: Array.from(materials), emailText: lines.join('\n') };
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
