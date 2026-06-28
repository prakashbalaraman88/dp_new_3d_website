import MeshGold from './backgrounds/MeshGold';
import PortoroMarble from './backgrounds/PortoroMarble';
import VenetianPlaster from './backgrounds/VenetianPlaster';
import Arches from './backgrounds/Arches';

export const BG_VARIANTS = ['mesh', 'marble', 'plaster', 'arches'] as const;
export type BgVariant = (typeof BG_VARIANTS)[number];
export const BG_LABELS: Record<BgVariant, string> = {
  mesh: 'Liquid Gold',
  marble: 'Portoro Marble',
  plaster: 'Venetian Plaster',
  arches: 'Arches',
};

export default function AmbientBackground({ variant = 'mesh' }: { variant?: BgVariant }) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ transform: 'translateZ(0)', isolation: 'isolate' }}>
      <div className="absolute inset-0 bg-main" />

      {variant === 'mesh' && <MeshGold />}
      {variant === 'marble' && <PortoroMarble />}
      {variant === 'plaster' && <VenetianPlaster />}
      {variant === 'arches' && <Arches />}

      {/* Fine film grain for premium texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.09]" aria-hidden="true">
        <filter id="dpGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dpGrain)" />
      </svg>

      {/* Centre scrim + vignette keep the copy readable */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(58% 40% at 50% 46%, rgba(18,22,23,0.5) 0%, rgba(18,22,23,0.08) 55%, transparent 78%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(125% 100% at 50% 32%, transparent 52%, rgba(0,0,0,0.6) 100%)' }}
      />
    </div>
  );
}
