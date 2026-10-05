import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {siCocacola} from 'simple-icons';

export type CanKind = 'new' | 'classic';

/** label texture drawn on a canvas: the real Coca-Cola script (simple-icons path) or the 1985 "NEW Coke" layout */
const makeLabel = (kind: CanKind) => {
  // canvas aspect = circumference : label height, so nothing stretches when wrapped
  const W = 2048;
  const H = Math.round((W * BODY_H) / (2 * Math.PI * R));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#b00510');
  grad.addColorStop(0.5, '#e8101e');
  grad.addColorStop(1, '#a5040e');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  // the white "dynamic ribbon" wave, twice around
  g.fillStyle = '#ffffff';
  for (const off of [0, W / 2]) {
    g.beginPath();
    g.moveTo(off, H * 0.72);
    g.bezierCurveTo(off + W * 0.12, H * 0.52, off + W * 0.3, H * 0.95, off + W * 0.5, H * 0.7);
    g.lineTo(off + W * 0.5, H * 0.79);
    g.bezierCurveTo(off + W * 0.3, H * 1.02, off + W * 0.12, H * 0.62, off, H * 0.81);
    g.closePath();
    g.fill();
  }
  const path = new Path2D(siCocacola.path);
  for (const cx of [W * 0.25, W * 0.75]) {
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    if (kind === 'classic') {
      const k = 30; // 24-unit icon → 720 px wide
      g.save();
      g.translate(cx - 12 * k, H * 0.36 - 12 * k);
      g.scale(k, k);
      g.fill(path);
      g.restore();
      g.font = 'bold 96px "Oswald", sans-serif';
      g.fillText('CLASSIC', cx, H * 0.6);
    } else {
      g.font = 'bold 120px "Oswald", sans-serif';
      g.fillText('NEW', cx, H * 0.28);
      g.font = '900 250px "Archivo Black", sans-serif';
      g.fillText('Coke', cx, H * 0.55);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const R = 0.98;
const BODY_H = 2.9;
/** realistic 12 oz can silhouette (≈1.85:1): domed base, straight body, necked shoulder, rim */
const canProfile = () => {
  const pts: [number, number][] = [
    [0, -1.86], [0.62, -1.86], [0.86, -1.78], [0.95, -1.66], [0.98, -1.54], [0.98, 1.4], [0.92, 1.58], [0.8, 1.74], [0.78, 1.81], [0.8, 1.84], [0.74, 1.86], [0, 1.81],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
};

const CanMesh: React.FC<{kind: CanKind; rotY: number; tilt: number}> = ({kind, rotY, tilt}) => {
  const label = useMemo(() => makeLabel(kind), [kind]);
  const lathe = useMemo(() => new THREE.LatheGeometry(canProfile(), 96), []);
  const body = useMemo(() => new THREE.CylinderGeometry(R + 0.005, R + 0.005, BODY_H, 128, 1, true), []);
  return (
    <group rotation={[tilt, rotY + Math.PI / 2, 0.06]}>
      {/* aluminium shell (top, bottom, neck) */}
      <mesh geometry={lathe}>
        <meshPhysicalMaterial color="#d9dde3" metalness={1} roughness={0.22} clearcoat={0.6} />
      </mesh>
      {/* printed label */}
      <mesh geometry={body} position={[0, -0.07, 0]}>
        <meshPhysicalMaterial map={label} metalness={0.45} roughness={0.28} clearcoat={1} clearcoatRoughness={0.12} side={THREE.FrontSide} />
      </mesh>
      {/* pull tab */}
      <mesh position={[0.18, 1.83, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.035, 12, 32]} />
        <meshStandardMaterial color="#c9ced6" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
};

/** a hero can in its own transparent canvas; place it with CSS */
export const Can3D: React.FC<{kind: CanKind; size: number; rotY: number; tilt?: number; light?: number}> = ({kind, size, rotY, tilt = 0.12, light = 1}) => (
  <ThreeCanvas width={size} height={size * 1.25} gl={{antialias: true, alpha: true}} style={{background: 'transparent'}} camera={{fov: 30, position: [0, 0.15, 9.4]}}>
    <ambientLight intensity={0.35 * light} />
    <directionalLight position={[3.5, 4, 5]} intensity={2.4 * light} />
    <directionalLight position={[-4, 1, 2]} intensity={1.1 * light} color="#ffd6c0" />
    <pointLight position={[-2.5, 0.5, -3]} intensity={30 * light} color="#ff9c8a" />
    <pointLight position={[2.6, -1, -2.5]} intensity={26 * light} color="#bcd4ff" />
    <CanMesh kind={kind} rotY={rotY} tilt={tilt} />
  </ThreeCanvas>
);
