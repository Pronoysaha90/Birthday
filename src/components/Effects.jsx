import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { LOW } from '../lib/device'
import { heartShape } from '../lib/shared'

export function Fireworks({ rate = 0.8, area = [14, 6], z = -8, y = 4 }) {
  const B = LOW ? 40 : 70, SLOTS = LOW ? 8 : 12, N = B * SLOTS, LIFE = 1.8
  const d = useMemo(() => {
    const pos = new Float32Array(N * 3).fill(0); for (let i = 0; i < N; i++) pos[i * 3 + 1] = -999
    return { pos, vel: new Float32Array(N * 3), base: new Float32Array(N * 3), col: new Float32Array(N * 3), life: new Float32Array(N), t: 0, next: 0 }
  }, [N])
  const geo = useRef()
  useFrame((_, dt) => {
    d.t += dt
    if (d.t > rate) {
      d.t = 0
      const cx = (Math.random() - 0.5) * area[0], cy = y + (Math.random() - 0.5) * area[1]
      const c = new THREE.Color().setHSL(Math.random(), 1, 0.65), s0 = d.next * B
      d.next = (d.next + 1) % SLOTS
      for (let k = 0; k < B; k++) {
        const i = s0 + k, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1), sp = 2 + Math.random() * 3
        d.pos.set([cx, cy, z], i * 3)
        d.vel.set([Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp, Math.sin(ph) * Math.sin(th) * sp], i * 3)
        d.base.set([c.r, c.g, c.b], i * 3); d.life[i] = LIFE
      }
    }
    for (let i = 0; i < N; i++) {
      if (d.life[i] <= 0) continue
      d.life[i] -= dt; const j = i * 3
      if (d.life[i] <= 0) { d.pos[j + 1] = -999; continue }
      d.vel[j + 1] -= 2.2 * dt
      d.pos[j] += d.vel[j] * dt; d.pos[j + 1] += d.vel[j + 1] * dt; d.pos[j + 2] += d.vel[j + 2] * dt
      const f = d.life[i] / LIFE
      d.col[j] = d.base[j] * f; d.col[j + 1] = d.base[j + 1] * f; d.col[j + 2] = d.base[j + 2] * f
    }
    geo.current.attributes.position.needsUpdate = true; geo.current.attributes.color.needsUpdate = true
  })
  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[d.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[d.col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.14} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

export function ShootingStars({ count = 4 }) {
  const refs = useRef([])
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({ o: i * 1.3, y: 2 + Math.random() * 5 })), [count])
  useFrame(({ clock }) => {
    seeds.forEach((s, i) => {
      const p = ((clock.elapsedTime + s.o) % 4) / 4, m = refs.current[i]
      m.position.set(12 - p * 28, s.y - p * 6, -10); m.visible = p < 0.5 || true
      m.material.opacity = Math.sin(p * Math.PI)
    })
  })
  return seeds.map((_, i) => (
    <mesh key={i} ref={(r) => (refs.current[i] = r)} rotation={[0, 0, 0.2]}>
      <boxGeometry args={[1.6, 0.03, 0.03]} /><meshBasicMaterial color="#fff6d0" transparent />
    </mesh>))
}

export function FloatingHearts({ count = 14 }) {
  const refs = useRef([])
  const geo = useMemo(() => { const x = new THREE.ExtrudeGeometry(heartShape(0.5), { depth: 0.1, bevelEnabled: false }); x.center(); return x }, [])
  const seeds = useMemo(() => Array.from({ length: count }, () => ({ x: (Math.random() - 0.5) * 12, o: Math.random() * 8, s: 0.4 + Math.random() * 0.6 })), [count])
  useFrame(({ clock }) => seeds.forEach((s, i) => {
    const p = ((clock.elapsedTime * 0.6 + s.o) % 8) / 8, m = refs.current[i]
    m.position.set(s.x + Math.sin(clock.elapsedTime + s.o) * 0.4, -5 + p * 11, -4 - s.o * 0.2); m.rotation.y = clock.elapsedTime
  }))
  return seeds.map((s, i) => (
    <mesh key={i} ref={(r) => (refs.current[i] = r)} geometry={geo} scale={s.s}>
      <meshStandardMaterial color="#ff5c9a" emissive="#ff2f7a" emissiveIntensity={0.8} />
    </mesh>))
}

// Hearts of light gathering into a heart shape (finale)
export function HeartOfLights({ position = [0, 3.6, -9], scale = 5 }) {
  const n = LOW ? 70 : 140, ref = useRef(), age = useRef(0)
  const o = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() => Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3 * scale / 16, y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale / 16
    return { x, y, sx: (Math.random() - 0.5) * 24, sy: (Math.random() - 0.5) * 12 + 3, ph: Math.random() * 6 }
  }), [n, scale])
  useFrame(({ clock }, dt) => {
    age.current += dt
    const p = Math.min(1, Math.max(0, (age.current - 2) / 6)), e = p * p * (3 - 2 * p)
    pts.forEach((q, i) => {
      o.position.set(q.sx + (q.x - q.sx) * e, q.sy + (q.y - q.sy) * e, 0)
      o.scale.setScalar(0.09 * (1 + Math.sin(clock.elapsedTime * 3 + q.ph) * 0.4)); o.updateMatrix(); ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group position={position}>
      <instancedMesh ref={ref} args={[null, null, n]}>
        <sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#ffd6ec" toneMapped={false} />
      </instancedMesh>
    </group>)
}
