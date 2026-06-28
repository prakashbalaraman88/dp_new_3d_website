import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, RoundedBox, ContactShadows, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { makeWoodTexture, makeMarbleTexture, makeRoughnessNoise } from './textures';

export type Progress = { current: number };

interface SceneProps {
  progress: Progress;
  quality: 'high' | 'low';
  reducedMotion: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ---------- Backdrop ---------- */
function GradientBackdrop({ reducedMotion }: { reducedMotion: boolean }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTop: { value: new THREE.Color('#2f3635') },
      uMid: { value: new THREE.Color('#3a4040') },
      uBot: { value: new THREE.Color('#141819') },
      uGlow: { value: new THREE.Color('#6e5a2c') },
    }),
    []
  );
  useFrame((_, dt) => {
    if (!reducedMotion) uniforms.uTime.value += dt;
  });
  return (
    <mesh scale={48}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          varying vec2 vUv; uniform float uTime; uniform vec3 uTop,uMid,uBot,uGlow;
          void main(){
            float t=vUv.y;
            vec3 col=mix(uBot,uMid,smoothstep(0.0,0.55,t));
            col=mix(col,uTop,smoothstep(0.55,1.0,t));
            float a=0.5+0.5*sin(uTime*0.25+vUv.x*6.2831853);
            col+=uGlow*(0.05*a)*smoothstep(0.25,0.9,t);
            gl_FragColor=vec4(col,1.0);
          }`}
      />
    </mesh>
  );
}

/* ---------- Parts model ---------- */
interface Part {
  k: 'rbox' | 'box' | 'cyl' | 'sph' | 'tor' | 'cone';
  args: number[];
  pos: [number, number, number];
  from: [number, number, number];
  rot?: [number, number, number];
  role: string;
  a: number;
  d: number;
}

const BZ = -1.1; // back run depth (z)

function buildParts(): Part[] {
  const P: Part[] = [];
  const add = (p: Part) => P.push(p);

  // ---- Shell ----
  add({ k: 'box', args: [11, 0.12, 9], pos: [0, -0.06, 0], from: [0, -1, 0], role: 'floor', a: 0.0, d: 0.1 });
  add({ k: 'box', args: [11, 4.4, 0.12], pos: [0, 2.2, -1.9], from: [0, 0, -2], role: 'wall', a: 0.02, d: 0.1 });
  add({ k: 'box', args: [0.12, 4.4, 9], pos: [-3.9, 2.2, 0], from: [-2, 0, 0], role: 'wall', a: 0.03, d: 0.1 });
  add({ k: 'box', args: [11, 0.12, 9], pos: [0, 3.45, 0], from: [0, 1, 0], role: 'ceiling', a: 0.04, d: 0.1 });
  add({ k: 'box', args: [3.6, 0.03, 2.3], pos: [0, 0.015, 0.7], from: [0, -0.5, 0], role: 'rug', a: 0.07, d: 0.1 });

  // ---- Window (daylight) on back wall ----
  add({ k: 'box', args: [1.7, 1.2, 0.04], pos: [-1.05, 2.45, -1.86], from: [0, 0, -1], role: 'daylight', a: 0.06, d: 0.12 });
  add({ k: 'box', args: [1.85, 0.08, 0.1], pos: [-1.05, 3.07, -1.83], from: [0, 0, -1], role: 'cabinetDark', a: 0.08, d: 0.12 });
  add({ k: 'box', args: [1.85, 0.08, 0.1], pos: [-1.05, 1.83, -1.83], from: [0, 0, -1], role: 'cabinetDark', a: 0.08, d: 0.12 });
  add({ k: 'box', args: [0.08, 1.3, 0.1], pos: [-1.95, 2.45, -1.83], from: [0, 0, -1], role: 'cabinetDark', a: 0.08, d: 0.12 });
  add({ k: 'box', args: [0.08, 1.3, 0.1], pos: [-0.15, 2.45, -1.83], from: [0, 0, -1], role: 'cabinetDark', a: 0.08, d: 0.12 });
  add({ k: 'box', args: [0.06, 1.3, 0.1], pos: [-1.05, 2.45, -1.83], from: [0, 0, -1], role: 'cabinetDark', a: 0.1, d: 0.12 });

  // ---- Toe kick ----
  add({ k: 'box', args: [4.7, 0.12, 0.5], pos: [0, 0.07, -1.0], from: [0, -1, 0], role: 'cabinetDark', a: 0.13, d: 0.12 });

  // ---- Base cabinets: body + shaker panel + vertical handle ----
  const baseXs = [-1.75, -0.6, 0.6, 1.75];
  baseXs.forEach((x, i) => {
    const t = 0.14 + i * 0.03;
    add({ k: 'rbox', args: [1.08, 0.86, 0.6], pos: [x, 0.5, BZ], from: [0, -1.8, 0], role: 'cabinet', a: t, d: 0.16 });
    add({ k: 'box', args: [0.84, 0.66, 0.02], pos: [x, 0.5, BZ + 0.3], from: [0, -1.8, 0], role: 'cabinetDark', a: t + 0.02, d: 0.16 });
    add({ k: 'box', args: [0.028, 0.42, 0.05], pos: [x + 0.37, 0.5, BZ + 0.31], from: [0, -1.8, 0], role: 'gold', a: t + 0.05, d: 0.14 });
  });

  // ---- Countertop (marble) ----
  add({ k: 'rbox', args: [4.8, 0.09, 0.7], pos: [0, 0.95, BZ], from: [0, 1.5, 0], role: 'counter', a: 0.4, d: 0.12 });

  // ---- Undermount sink + gold faucet ----
  add({ k: 'box', args: [0.74, 0.22, 0.44], pos: [-1.5, 0.86, BZ], from: [0, 0.6, 0], role: 'steel', a: 0.44, d: 0.12 });
  add({ k: 'cyl', args: [0.03, 0.03, 0.34, 16], pos: [-1.5, 1.13, BZ - 0.12], from: [0, 0.6, 0], role: 'gold', a: 0.48, d: 0.12 });
  add({ k: 'tor', args: [0.14, 0.025, 10, 20, Math.PI * 0.95], pos: [-1.5, 1.28, BZ - 0.02], from: [0, 0.6, 0], rot: [Math.PI / 2, 0, 0], role: 'gold', a: 0.5, d: 0.12 });

  // ---- Cooktop (dark glass + burners) ----
  add({ k: 'box', args: [0.82, 0.03, 0.5], pos: [0.6, 0.995, BZ], from: [0, 0.6, 0], role: 'darkglass', a: 0.45, d: 0.12 });
  [[-0.18, -0.1], [0.18, -0.1], [-0.18, 0.12], [0.18, 0.12]].forEach(([dx, dz], i) => {
    add({ k: 'cyl', args: [0.075, 0.075, 0.012, 20], pos: [0.6 + dx, 1.012, BZ + dz], from: [0, 0.6, 0], role: 'cabinetDark', a: 0.47 + i * 0.005, d: 0.1 });
  });

  // ---- Backsplash + LED ----
  add({ k: 'box', args: [4.8, 0.95, 0.05], pos: [0, 1.52, BZ - 0.33], from: [0, 0, -1], role: 'sage', a: 0.44, d: 0.12 });
  add({ k: 'box', args: [4.3, 0.025, 0.03], pos: [0, 2.04, BZ - 0.31], from: [0, 0, 0], role: 'led', a: 0.52, d: 0.1 });

  // ---- Tall pantry + handle ----
  add({ k: 'rbox', args: [0.92, 2.1, 0.6], pos: [2.75, 1.07, BZ], from: [0, -2.2, 0], role: 'cabinet', a: 0.3, d: 0.16 });
  add({ k: 'box', args: [0.72, 1.9, 0.02], pos: [2.75, 1.07, BZ + 0.3], from: [0, -2.2, 0], role: 'cabinetDark', a: 0.33, d: 0.16 });
  add({ k: 'box', args: [0.028, 0.5, 0.05], pos: [2.4, 1.4, BZ + 0.31], from: [0, -2.2, 0], role: 'gold', a: 0.36, d: 0.14 });

  // ---- Upper cabinets (two solid) ----
  [-1.6, 1.7].forEach((x, i) => {
    add({ k: 'rbox', args: [1.02, 0.7, 0.35], pos: [x, 2.25, BZ - 0.15], from: [0, 1.5, 0], role: 'cabinet', a: 0.5 + i * 0.03, d: 0.14 });
    add({ k: 'box', args: [0.8, 0.5, 0.02], pos: [x, 2.25, BZ + 0.02], from: [0, 1.5, 0], role: 'cabinetDark', a: 0.52 + i * 0.03, d: 0.14 });
  });

  // ---- Glass-front upper cabinet (center-left) ----
  add({ k: 'rbox', args: [1.0, 0.7, 0.34], pos: [-0.5, 2.25, BZ - 0.15], from: [0, 1.5, 0], role: 'cabinet', a: 0.56, d: 0.14 });
  add({ k: 'box', args: [0.82, 0.56, 0.02], pos: [-0.5, 2.25, BZ + 0.03], from: [0, 1.5, 0], role: 'glass', a: 0.6, d: 0.14 });

  // ---- Range hood ----
  add({ k: 'rbox', args: [0.84, 0.42, 0.46], pos: [0.6, 2.2, BZ - 0.15], from: [0, 1.3, 0], role: 'cabinetDark', a: 0.58, d: 0.12 });
  add({ k: 'box', args: [0.32, 0.6, 0.24], pos: [0.6, 2.68, BZ - 0.3], from: [0, 1.3, 0], role: 'cabinetDark', a: 0.6, d: 0.12 });

  // ---- Open shelf (right of window) + props ----
  add({ k: 'box', args: [1.0, 0.04, 0.3], pos: [-2.7, 2.05, BZ - 0.18], from: [0, 1.2, 0], role: 'wood', a: 0.54, d: 0.12 });
  add({ k: 'box', args: [1.0, 0.04, 0.3], pos: [-2.7, 2.5, BZ - 0.18], from: [0, 1.2, 0], role: 'wood', a: 0.56, d: 0.12 });
  // books standing on lower shelf
  [['book1', -2.95], ['book2', -2.87], ['book3', -2.79]].forEach(([role, x], i) => {
    add({ k: 'box', args: [0.05, 0.26, 0.2], pos: [x as number, 2.2, BZ - 0.18], from: [0, 1.2, 0], role: role as string, a: 0.58 + i * 0.01, d: 0.1 });
  });
  // vase on lower shelf
  add({ k: 'cyl', args: [0.06, 0.08, 0.22, 18], pos: [-2.5, 2.18, BZ - 0.18], from: [0, 1.2, 0], role: 'ceramic', a: 0.6, d: 0.1 });

  // ---- Island: wood body + marble top + handle ----
  add({ k: 'rbox', args: [1.95, 0.9, 1.05], pos: [0, 0.48, 0.7], from: [0, 0, 2.2], role: 'wood', a: 0.62, d: 0.16 });
  add({ k: 'box', args: [1.4, 0.6, 0.02], pos: [0, 0.46, 1.26], from: [0, 0, 2.2], role: 'cabinetDark', a: 0.64, d: 0.16 });
  add({ k: 'rbox', args: [2.2, 0.09, 1.25], pos: [0, 0.95, 0.7], from: [0, 1.0, 0], role: 'counter', a: 0.72, d: 0.12 });
  add({ k: 'box', args: [0.028, 0.4, 0.05], pos: [0, 0.5, 1.27], from: [0, 0, 2.2], role: 'gold', a: 0.66, d: 0.14 });

  // ---- Stools ----
  [-0.55, 0.55].forEach((x, i) => {
    add({ k: 'cyl', args: [0.19, 0.19, 0.08, 24], pos: [x, 0.64, 1.55], from: [0, -1.2, 0], role: 'cabinetDark', a: 0.76 + i * 0.03, d: 0.12 });
    add({ k: 'cyl', args: [0.04, 0.04, 0.62, 14], pos: [x, 0.31, 1.55], from: [0, -1.2, 0], role: 'gold', a: 0.76 + i * 0.03, d: 0.12 });
  });

  // ---- Island styling: cutting board, fruit bowl + fruit, plant ----
  add({ k: 'box', args: [0.42, 0.03, 0.26], pos: [-0.5, 1.01, 0.6], from: [0, 0.4, 0], role: 'wood', a: 0.8, d: 0.1 });
  add({ k: 'cyl', args: [0.19, 0.13, 0.09, 24], pos: [0.45, 1.04, 0.6], from: [0, 0.4, 0], role: 'ceramic', a: 0.82, d: 0.1 });
  [[0.38, 0.55], [0.5, 0.62], [0.45, 0.68]].forEach(([x, z], i) => {
    add({ k: 'sph', args: [0.055, 16, 16], pos: [x, 1.1, z], from: [0, 0.4, 0], role: i === 1 ? 'gold' : 'leaf', a: 0.84 + i * 0.01, d: 0.08 });
  });
  // plant: pot + foliage
  add({ k: 'cyl', args: [0.12, 0.1, 0.2, 18], pos: [0.78, 1.07, 0.78], from: [0, 0.4, 0], role: 'ceramic', a: 0.85, d: 0.1 });
  [[0, 0.32, 0], [0.12, 0.26, 0.06], [-0.1, 0.28, -0.05]].forEach(([dx, dy, dz], i) => {
    add({ k: 'sph', args: [0.16, 12, 12], pos: [0.78 + dx, 1.17 + dy, 0.78 + dz], from: [0, 0.4, 0], rot: [0.3, i, 0.2], role: 'leaf', a: 0.86 + i * 0.01, d: 0.1 });
  });

  return P;
}

function PartMesh({ data, mat }: { data: Part; mat: THREE.Material }) {
  const noCast = ['floor', 'wall', 'ceiling', 'rug', 'daylight', 'led'].includes(data.role);
  const shadow = { castShadow: !noCast, receiveShadow: true };
  if (data.k === 'rbox') {
    const r = Math.min(0.045, Math.min(data.args[0], data.args[1], data.args[2]) * 0.32);
    return <RoundedBox args={data.args as [number, number, number]} radius={r} smoothness={3} material={mat} {...shadow} />;
  }
  return (
    <mesh material={mat} {...shadow}>
      {data.k === 'box' && <boxGeometry args={data.args as [number, number, number]} />}
      {data.k === 'cyl' && <cylinderGeometry args={data.args as [number, number, number, number]} />}
      {data.k === 'sph' && <sphereGeometry args={data.args as [number, number, number]} />}
      {data.k === 'cone' && <coneGeometry args={data.args as [number, number, number]} />}
      {data.k === 'tor' && <torusGeometry args={data.args as [number, number, number, number, number]} />}
    </mesh>
  );
}

function Kitchen({ progress, reducedMotion }: { progress: Progress; reducedMotion: boolean }) {
  const parts = useMemo(buildParts, []);
  const refs = useRef<(THREE.Group | null)[]>([]);

  const mats = useMemo<Record<string, THREE.MeshStandardMaterial>>(() => {
    const wood = makeWoodTexture();
    const marble = makeMarbleTexture();
    marble.repeat.set(2, 1);
    const rough = makeRoughnessNoise();
    return {
      counter: new THREE.MeshStandardMaterial({ map: marble, roughness: 0.18, metalness: 0.0, envMapIntensity: 1.7 }),
      wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5, metalness: 0.0, roughnessMap: rough }),
      cabinet: new THREE.MeshPhysicalMaterial({ color: '#2f3635', roughness: 0.45, metalness: 0.0, clearcoat: 0.35, clearcoatRoughness: 0.5, roughnessMap: rough }),
      cabinetDark: new THREE.MeshPhysicalMaterial({ color: '#242b2c', roughness: 0.4, clearcoat: 0.3 }),
      gold: new THREE.MeshStandardMaterial({ color: '#D4AF37', roughness: 0.2, metalness: 1, emissive: new THREE.Color('#3a2a0a'), emissiveIntensity: 0.4, envMapIntensity: 1.8 }),
      steel: new THREE.MeshStandardMaterial({ color: '#c8ccce', roughness: 0.25, metalness: 1, envMapIntensity: 1.8 }),
      darkglass: new THREE.MeshPhysicalMaterial({ color: '#0d0f10', roughness: 0.12, metalness: 0.3, clearcoat: 1 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#dfeee9', roughness: 0.08, metalness: 0, transmission: 0.92, thickness: 0.4, ior: 1.45, transparent: true }),
      sage: new THREE.MeshStandardMaterial({ color: '#92a188', roughness: 0.7 }),
      led: new THREE.MeshStandardMaterial({ color: '#2a2410', emissive: new THREE.Color('#ffd98a'), emissiveIntensity: 2.2, roughness: 0.5 }),
      floor: new THREE.MeshStandardMaterial({ color: '#1b1f20', roughness: 0.38, metalness: 0.4, envMapIntensity: 1.3 }),
      wall: new THREE.MeshStandardMaterial({ color: '#2c3332', roughness: 0.95 }),
      ceiling: new THREE.MeshStandardMaterial({ color: '#222829', roughness: 1 }),
      rug: new THREE.MeshStandardMaterial({ color: '#6f7d6a', roughness: 0.98 }),
      ceramic: new THREE.MeshStandardMaterial({ color: '#e8e3d8', roughness: 0.35 }),
      leaf: new THREE.MeshStandardMaterial({ color: '#6f8f5e', roughness: 0.6 }),
      daylight: new THREE.MeshStandardMaterial({ color: '#bcd2e0', emissive: new THREE.Color('#cfe0ec'), emissiveIntensity: 1.6 }),
      book1: new THREE.MeshStandardMaterial({ color: '#7d671b', roughness: 0.7 }),
      book2: new THREE.MeshStandardMaterial({ color: '#51564a', roughness: 0.7 }),
      book3: new THREE.MeshStandardMaterial({ color: '#8a6a3a', roughness: 0.7 }),
    };
  }, []);

  useEffect(
    () => () =>
      Object.values(mats).forEach((m) => {
        if (m.map) m.map.dispose();
        if ((m as THREE.MeshStandardMaterial).roughnessMap) (m as THREE.MeshStandardMaterial).roughnessMap!.dispose();
        m.dispose();
      }),
    [mats]
  );

  useFrame(() => {
    const p = reducedMotion ? 1 : progress.current;
    for (let i = 0; i < parts.length; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const d = parts[i];
      const e = easeOutCubic(clamp01((p - d.a) / d.d));
      g.position.set(d.pos[0] + d.from[0] * (1 - e), d.pos[1] + d.from[1] * (1 - e), d.pos[2] + d.from[2] * (1 - e));
      g.scale.setScalar(e <= 0 ? 0.0001 : 0.9 + 0.1 * e);
      g.visible = e > 0.002;
    }
  });

  return (
    <group>
      {parts.map((d, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)} rotation={d.rot}>
          <PartMesh data={d} mat={mats[d.role]} />
        </group>
      ))}
      <Pendant progress={progress} x={-0.6} reducedMotion={reducedMotion} />
      <Pendant progress={progress} x={0} reducedMotion={reducedMotion} />
      <Pendant progress={progress} x={0.6} reducedMotion={reducedMotion} />
      <PendantLights progress={progress} reducedMotion={reducedMotion} />
    </group>
  );
}

/* ---------- Real GLB model loader (drop a file in /public/models/) ---------- */
// Set to '/models/kitchen.glb' once a real model is in place; '' uses the procedural kitchen.
const MODEL_URL: string = '';

interface EBProps {
  fallback: ReactNode;
  children: ReactNode;
}
class ModelErrorBoundary extends Component<EBProps, { failed: boolean }> {
  constructor(props: EBProps) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function KitchenModel({ url, progress, reducedMotion }: { url: string; progress: Progress; reducedMotion: boolean }) {
  const grp = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const s = 2.6 / (size.y || 1); // normalise to ~kitchen height
    root.scale.setScalar(s);
    root.position.set(-center.x * s, -box.min.y * s, -center.z * s); // center + sit on floor
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        (Array.isArray(mat) ? mat : [mat]).forEach((mm) => {
          if (mm) mm.envMapIntensity = 1.2;
        });
      }
    });
    return root;
  }, [scene]);

  useFrame(() => {
    const p = reducedMotion ? 1 : progress.current;
    if (grp.current) {
      grp.current.scale.setScalar(0.6 + 0.4 * easeOutCubic(clamp01(p / 0.3)));
      grp.current.rotation.y = reducedMotion ? 0 : -0.3 + p * 0.5;
    }
  });

  return (
    <group ref={grp}>
      <primitive object={model} />
    </group>
  );
}

/* ---------- Pendant: drops + switches on ---------- */
function Pendant({ progress, x, reducedMotion }: { progress: Progress; x: number; reducedMotion: boolean }) {
  const grp = useRef<THREE.Group>(null);
  const bulb = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const p = reducedMotion ? 1 : progress.current;
    const e = easeOutCubic(clamp01((p - 0.8) / 0.15));
    if (grp.current) {
      grp.current.position.y = 2.55 + (1 - e) * 1.4;
      grp.current.visible = e > 0.002;
    }
    if (bulb.current) bulb.current.emissiveIntensity = clamp01((p - 0.84) / 0.12) * 3.6;
  });
  return (
    <group ref={grp} position={[x, 2.55, 0.7]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.0, 8]} />
        <meshStandardMaterial color="#1a1d1c" />
      </mesh>
      <mesh castShadow>
        <coneGeometry args={[0.16, 0.2, 24, 1, true]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.07, 18, 18]} />
        <meshStandardMaterial ref={bulb} color="#3a2c10" emissive="#ffcf7a" emissiveIntensity={0} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------- Pendant pool-of-light that ramps on ---------- */
function PendantLights({ progress, reducedMotion }: { progress: Progress; reducedMotion: boolean }) {
  const refs = useRef<(THREE.PointLight | null)[]>([]);
  useFrame(() => {
    const p = reducedMotion ? 1 : progress.current;
    const it = clamp01((p - 0.84) / 0.12) * 1.1;
    refs.current.forEach((l) => {
      if (l) l.intensity = it;
    });
  });
  return (
    <>
      {[-0.6, 0, 0.6].map((x, i) => (
        <pointLight
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={[x, 2.4, 0.7]}
          color="#ffd9a0"
          intensity={0}
          distance={6}
          decay={2}
        />
      ))}
    </>
  );
}

/* ---------- Dust motes ---------- */
function ParticleField({ progress, quality, reducedMotion }: SceneProps) {
  void progress;
  const groupRef = useRef<THREE.Group>(null);
  const count = quality === 'high' ? 500 : 200;

  const sprite = useMemo(() => {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,233,192,0.8)');
    g.addColorStop(1, 'rgba(255,233,192,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }, []);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = Math.random() * 4 + 0.4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (groupRef.current && !reducedMotion) groupRef.current.rotation.y += dt * 0.02;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={sprite} color="#ffe9c0" size={0.04} sizeAttenuation transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

/* ---------- Camera rig ---------- */
function Rig({ progress, reducedMotion }: { progress: Progress; reducedMotion: boolean }) {
  useFrame((state) => {
    if (reducedMotion) {
      state.camera.position.set(4.4, 2.2, 5.4);
      state.camera.lookAt(0, 1.05, 0.4);
      return;
    }
    const p = progress.current;
    const r = 7.2 - p * 2.7;
    const ang = -0.16 + p * 0.44 + state.pointer.x * 0.28;
    const ty = 3.0 - p * 1.35 + state.pointer.y * 0.28;
    state.camera.position.x += (Math.sin(ang) * r - state.camera.position.x) * 0.05;
    state.camera.position.y += (ty - state.camera.position.y) * 0.05;
    state.camera.position.z += (Math.cos(ang) * r - state.camera.position.z) * 0.05;
    state.camera.lookAt(0, 1.05, 0.4);
  });
  return null;
}

export default function Scene({ progress, quality, reducedMotion }: SceneProps) {
  const high = quality === 'high';
  return (
    <>
      <color attach="background" args={['#141819']} />
      <fog attach="fog" args={['#141819', 12, 26]} />

      <GradientBackdrop reducedMotion={reducedMotion} />

      <hemisphereLight args={['#ffe9cf', '#20262a', 0.5]} />
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[-2, 6, 1]}
        intensity={0.85}
        color="#fff0d6"
        castShadow={high}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[6, 3, 4]} intensity={0.35} color="#9fb38f" />

      {MODEL_URL ? (
        <ModelErrorBoundary fallback={<Kitchen progress={progress} reducedMotion={reducedMotion} />}>
          <Suspense fallback={<Kitchen progress={progress} reducedMotion={reducedMotion} />}>
            <KitchenModel url={MODEL_URL} progress={progress} reducedMotion={reducedMotion} />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        <Kitchen progress={progress} reducedMotion={reducedMotion} />
      )}
      <ParticleField progress={progress} quality={quality} reducedMotion={reducedMotion} />

      <ContactShadows position={[0, 0.02, 0.4]} scale={14} blur={2.6} far={4.5} opacity={0.5} resolution={high ? 1024 : 512} color="#0a0c0d" />

      <Environment preset="apartment" environmentIntensity={0.9} />

      <Rig progress={progress} reducedMotion={reducedMotion} />

      <EffectComposer>
        <Bloom intensity={high ? 0.7 : 0.5} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur radius={0.65} />
        {high && <DepthOfField target={[0, 1.05, 0.5]} focalLength={0.018} bokehScale={1.6} height={480} />}
        <Vignette offset={0.26} darkness={0.82} />
      </EffectComposer>
    </>
  );
}
