import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Cam } from '../lib/shared'
import { LOW } from '../lib/device'

export const SLICES = 8
const DA = (Math.PI * 2) / SLICES
const TIERS = [{ r: 1.5, h: 0.8 }, { r: 1.1, h: 0.7 }, { r: 0.75, h: 0.6 }]
const CORE = 0.25, FROST = 0.06, BASE = 0.2

// Annular wedge, extruded upward: closed solid with flat cut faces
function wedge(r0, r, h) {
  const s = new THREE.Shape()
  s.moveTo(r0, 0); s.lineTo(r, 0); s.absarc(0, 0, r, 0, DA, false)
  s.lineTo(r0 * Math.cos(DA), r0 * Math.sin(DA)); s.absarc(0, 0, r0, DA, 0, true)
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 })
  g.rotateX(-Math.PI / 2); return g
}

export default function InteractiveBirthdayCake({ cut, onCut }) {
  const slices = useRef([]), flames = useRef([]), root = useRef(), cutRef = useRef(cut)
  cutRef.current = cut
  const { tiers, total } = useMemo(() => {
    let y = BASE
    const tiers = TIERS.map(({ r, h }) => {
      const t = { r, h, y, sponge: wedge(CORE, r, h * 0.42), cream: wedge(CORE, r - 0.01, h * 0.16), top: wedge(CORE, r + 0.03, FROST) }
      y += h + FROST; return t
    })
    return { tiers, total: y }
  }, [])
  const berry = useMemo(() => new THREE.SphereGeometry(0.1, 12, 10), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, k = 1 - Math.exp(-5 * dt)
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, 1, 3, dt))
    root.current.position.y = 0.1 + Math.sin(t * 0.8) * 0.03
    slices.current.forEach((g, i) => {
      const a = (i + 0.5) * DA, on = cutRef.current[i], d = on ? 1.1 : 0
      g.position.x += (Math.cos(a) * d - g.position.x) * k
      g.position.z += (-Math.sin(a) * d - g.position.z) * k
      g.position.y += ((on ? 0.12 : 0) - g.position.y) * k
    })
    flames.current.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 12 + i) * 0.12, 1 + Math.sin(t * 17 + i * 2) * 0.25, 1); f.position.x = Math.sin(t * 9 + i) * 0.005 })
  })
  const handle = (i) => (e) => { e.stopPropagation(); if (e.type === 'pointerdown' || e.buttons > 0) onCut(i) }
  const mats = useMemo(() => ({
    sponge: new THREE.MeshStandardMaterial({ color: '#f1d3a0', roughness: 0.9 }),
    cream: new THREE.MeshStandardMaterial({ color: '#ff9fc4', roughness: 0.5 }),
    frost: new THREE.MeshStandardMaterial({ color: '#fff0f6', roughness: 0.35 }),
    berry: new THREE.MeshStandardMaterial({ color: '#d6203a', roughness: 0.35, emissive: '#5a0010', emissiveIntensity: 0.3 }),
  }), [])
  return (<>
    <Cam pos={[0, 3.1, 6.5]} look={[0, 1.5, 0]} />
    <color attach="background" args={['#0d0720']} />
    <ambientLight intensity={0.7} /><directionalLight position={[3, 6, 4]} intensity={1.6} color="#ffe6cf" />
    <pointLight position={[-3, 3, 2]} intensity={25} color="#ff9ac8" />
    <group ref={root} scale={0.01}>
      {/* stand */}
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[2.0, 2.0, 0.1, 48]} /><meshStandardMaterial color="#f3e6ff" metalness={0.4} roughness={0.25} /></mesh>
      <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.25, 0.4, 1.1, 24]} /><meshStandardMaterial color="#e6d3ff" metalness={0.4} roughness={0.3} /></mesh>
      <mesh position={[0, -1.05, 0]}><cylinderGeometry args={[0.9, 1, 0.12, 36]} /><meshStandardMaterial color="#f3e6ff" metalness={0.4} roughness={0.25} /></mesh>
      {/* core column (never cut) */}
      <mesh position={[0, BASE + (total - BASE) / 2, 0]}><cylinderGeometry args={[CORE, CORE, total - BASE, 24]} /><meshStandardMaterial color="#f1d3a0" /></mesh>
      {/* slices */}
      {Array.from({ length: SLICES }, (_, i) => (
        <group key={i} ref={(r) => (slices.current[i] = r)} onPointerDown={handle(i)} onPointerOver={handle(i)}>
          <group rotation-y={i * DA}>
            {tiers.map((t, j) => (
              <group key={j} position-y={t.y}>
                <mesh geometry={t.sponge} material={mats.sponge} />
                <mesh geometry={t.cream} material={mats.cream} position-y={t.h * 0.42} />
                <mesh geometry={t.sponge} material={mats.sponge} position-y={t.h * 0.58} />
                <mesh geometry={t.top} material={mats.frost} position-y={t.h} />
                <mesh geometry={berry} material={mats.berry} position={[(t.r - 0.25) * Math.cos(DA / 2), t.h + FROST + 0.05, -(t.r - 0.25) * Math.sin(DA / 2)]} scale={[1, 1.15, 1]} />
              </group>))}
          </group>
        </group>))}
      {/* candles */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2, x = Math.cos(a) * 0.12, z = Math.sin(a) * 0.12
        return (<group key={i} position={[x, total, z]}>
          <mesh position-y={0.18}><cylinderGeometry args={[0.035, 0.035, 0.36, 10]} /><meshStandardMaterial color={['#ff9ac8', '#9ad0ff', '#ffe27a'][i]} /></mesh>
          <mesh ref={(r) => (flames.current[i] = r)} position-y={0.42}><sphereGeometry args={[0.045, 10, 10]} /><meshBasicMaterial color="#ffcf5a" toneMapped={false} /></mesh>
          <pointLight position-y={0.45} color="#ffb347" intensity={0.8} distance={2.5} />
        </group>)
      })}
    </group>
    {cut.some(Boolean) && <Sparkles key={cut.filter(Boolean).length} count={LOW ? 30 : 70} scale={[4, 3, 4]} position={[0, 2, 0]} size={6} speed={1.2} color="#ffd0e8" />}
  </>)
}
