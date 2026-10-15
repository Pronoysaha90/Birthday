import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { content } from '../data/content'
import { hover, usePhoto } from '../lib/shared'

function Frame({ photo, i, n, active, anyActive, onPick }) {
  const g = useRef(), tex = usePhoto(photo.src)
  const mid = (n - 1) / 2
  useFrame(({ clock, camera }, dt) => {
    const t = clock.elapsedTime
    let tx = (i - mid) * 2.1, ty = 2.1 + Math.sin(t * 0.8 + i) * 0.12, tz = -9 + Math.abs(i - mid) * 0.5, s = 1
    let ry = Math.sin(t * 0.5 + i) * 0.15 + (i - mid) * -0.12
    if (active) { tx = camera.position.x; ty = camera.position.y + 0.15; tz = camera.position.z - 3.2; s = 1.7; ry = 0 }
    else if (anyActive) { tz -= 2; s = 0.8 }
    const k = 1 - Math.exp(-4 * dt), p = g.current.position
    p.x += (tx - p.x) * k; p.y += (ty - p.y) * k; p.z += (tz - p.z) * k
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k)
    g.current.rotation.y += (ry - g.current.rotation.y) * k
  })
  return (
    <group ref={g} position={[(i - mid) * 2.1, 2.1, -9]} onClick={(e) => { e.stopPropagation(); onPick(i) }}
      onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
      <mesh><boxGeometry args={[1.2, 1.45, 0.05]} /><meshStandardMaterial color="#fff7ef" roughness={0.5} emissive="#ffe9d2" emissiveIntensity={0.25} /></mesh>
      <mesh position={[0, 0.12, 0.03]}>
        <planeGeometry args={[1.02, 1.02]} />
        {tex ? <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.25} /> : <meshStandardMaterial color="#6c4a8f" emissive="#8b5fbf" emissiveIntensity={0.4} />}
      </mesh>
      <pointLight color="#ffd9a8" intensity={1.5} distance={3} position={[0, 0, 0.6]} />
    </group>)
}

export default function FloatingMemoryGallery({ index, setIndex }) {
  const n = content.photos.length
  return content.photos.map((p, i) => (
    <Frame key={i} photo={p} i={i} n={n} active={index === i} anyActive={index >= 0} onPick={setIndex} />))
}
