import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/* A brilliant-cut diamond the way jewelers photograph them: hard black/white facet contrast from bright softboxes in a
   dark studio (reflections), plus faint warm/cool "fire". Mirror facets render reliably on the software GPU, where glass
   transmission came out milky. */

/** black studio with softbox panels → PMREM environment */
const Studio: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const s = new THREE.Scene();
    s.background = new THREE.Color('#34373f');
    const panel = (w: number, h: number, pos: [number, number, number], color: string, intensity = 1) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide}));
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      s.add(m);
    };
    panel(6, 2, [0, 6, 2], '#ffffff', 3);
    panel(2, 5, [-6, 1, 3], '#ffffff', 2);
    panel(2, 5, [6, 0, -2], '#ffffff', 1.6);
    panel(3, 1, [2, -5, 4], '#ffffff', 1.2);
    panel(1.5, 1.5, [-3, -3, -5], '#9fc4ff', 1.5);
    panel(1.5, 1.5, [4, 3, -5], '#ffc890', 1.5);
    panel(1, 3, [0, 0, 7], '#ffffff', 1.4);
    // a ring of strip lights all around, so every facet angle catches something
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      panel(0.8, 3.2, [Math.cos(a) * 6.5, (i % 3) * 2.2 - 2, Math.sin(a) * 6.5], i % 4 === 1 ? '#bcd6ff' : i % 4 === 3 ? '#ffd9b0' : '#ffffff', 2.2);
    }
    panel(8, 8, [0, -7, 0], '#0b0b0d', 1);
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(s, 0).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

/** faceted brilliant: rings (radius, height, angular offset) zig-zag triangulated into kite/star facets */
const brilliant = (N = 16) => {
  const rings: [number, number, number][] = [
    [0.0, -0.86, 0], // culet
    [0.5, -0.45, 0.5],
    [0.995, -0.03, 0],
    [1.0, 0.0, 0.5], // girdle
    [0.995, 0.03, 0],
    [0.82, 0.19, 0.5],
    [0.6, 0.35, 0], // table edge
    [0.0, 0.36, 0], // table center
  ];
  const pts = rings.map(([r, y, o]) => Array.from({length: N}, (_, i) => {
    const a = ((i + o) / N) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
  }));
  const pos: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let k = 0; k < rings.length - 1; k++) {
    const A = pts[k];
    const B = pts[k + 1];
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      // two triangles per quad, split so offset rings give diamond-shaped facets
      tri(A[i], B[i], A[j]);
      tri(A[j], B[i], B[j]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals(); // non-indexed → per-facet normals (flat)
  return g;
};

const Gem: React.FC<{rotY: number; tilt: number; color: string}> = ({rotY, tilt, color}) => {
  const geo = useMemo(() => brilliant(16), []);
  return (
    <mesh geometry={geo} rotation={[tilt, rotY, 0.08]}>
      <meshPhysicalMaterial color={color} metalness={1} roughness={0.06} envMapIntensity={2.6} clearcoat={1} clearcoatRoughness={0} side={THREE.DoubleSide} flatShading />
    </mesh>
  );
};

/** a brilliant-cut diamond in its own transparent canvas */
export const Diamond3D: React.FC<{size: number; rotY: number; tilt?: number; color?: string}> = ({size, rotY, tilt = 0.32, color = '#f4f8ff'}) => (
  <ThreeCanvas width={size} height={size} gl={{antialias: true, alpha: true}} style={{background: 'transparent'}} camera={{fov: 28, position: [0, 0.25, 4.6]}}>
    <Studio />
    <ambientLight intensity={0.05} />
    <Gem rotY={rotY} tilt={tilt} color={color} />
  </ThreeCanvas>
);
