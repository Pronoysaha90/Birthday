import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'
import Butterfly from './Butterfly'
import { content } from '../data/content'
import { LOW } from '../lib/device'
import { hover, usePhoto } from '../lib/shared'

export const pathX = (z) => Math.sin(z * 0.25) * 1.35
const ANIME_PALETTE = ['#ff4081', '#f06292', '#e040fb', '#ba68c8', '#ff80ab', '#ffd54f', '#4fc3f7']

/* ── Glowing Anime Fairy Rose ── */
function AnimeRose({ position, color = '#ff4081', scale = 1, onPick, interactive = false }) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.rotation.y = Math.sin(t * 0.7 + position[0]) * 0.15
  })

  return (
    <Float speed={interactive ? 2.5 : 1.2} floatIntensity={interactive ? 0.4 : 0.1}>
      <group
        ref={groupRef}
        position={position}
        scale={hovered ? scale * 1.35 : scale}
        onClick={(e) => {
          if (interactive) {
            e.stopPropagation()
            onPick()
          }
        }}
        onPointerOver={() => {
          if (interactive) {
            setHovered(true)
            hover(true)
          }
        }}
        onPointerOut={() => {
          if (interactive) {
            setHovered(false)
            hover(false)
          }
        }}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        {/* Luminous anime rose core */}
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={interactive ? 1.2 : 0.8}
            roughness={0.15}
            clearcoat={1}
            transmission={0.2}
          />
        </mesh>

        {/* 6 Curving sculpted petals */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.16, 0.23, Math.sin(angle) * 0.16]}
              rotation={[0.35, angle, 0]}
              scale={[1, 0.85, 1]}
            >
              <sphereGeometry args={[0.15, 14, 14]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.65}
                roughness={0.2}
                clearcoat={0.8}
                transmission={0.15}
              />
            </mesh>
          )
        })}

        {/* Outer petal ring */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2 + 0.3
          return (
            <mesh
              key={`outer-${i}`}
              position={[Math.cos(angle) * 0.26, 0.16, Math.sin(angle) * 0.26]}
              rotation={[0.6, angle, 0]}
              scale={[1.1, 0.7, 1.1]}
            >
              <sphereGeometry args={[0.13, 12, 12]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.45}
                roughness={0.25}
                clearcoat={0.7}
              />
            </mesh>
          )
        })}

        {/* Stem & Leaves */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.025, 0.04, 0.22, 8]} />
          <meshStandardMaterial color="#1b4d2e" roughness={0.6} />
        </mesh>
        <mesh position={[0.1, 0.1, 0]} rotation={[0, 0, -0.6]} scale={[0.14, 0.04, 0.08]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#2d6a3e" roughness={0.5} />
        </mesh>

        {/* Interactive glow aura & fairy sparkles */}
        {interactive && (
          <>
            <pointLight color={color} distance={4} decay={2} intensity={2.8} />
            <Sparkles count={12} scale={[1.2, 1.2, 1.2]} size={3} speed={0.8} color="#fff" />
          </>
        )}
      </group>
    </Float>
  )
}

/* ── Drifting Anime Sakura Petals ── */
function SakuraPetals() {
  const count = LOW ? 35 : 90
  const ref = useRef()
  const obj = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 18,
    y: Math.random() * 9,
    z: 6 - Math.random() * 30,
    size: 0.09 + Math.random() * 0.11,
    speedY: 0.38 + Math.random() * 0.5,
    speedX: (Math.random() - 0.5) * 0.7,
    rotSpeedX: Math.random() * 2.2,
    rotSpeedY: Math.random() * 2.5,
    phase: Math.random() * Math.PI * 2,
  })), [count])

  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    data.forEach((p, i) => {
      p.y -= p.speedY * dt
      if (p.y < -0.5) p.y = 9.2

      obj.position.set(
        p.x + Math.sin(t * 0.8 + p.phase) * 0.9,
        p.y,
        p.z + Math.cos(t * 0.6 + p.phase) * 0.5
      )
      obj.rotation.set(t * p.rotSpeedX, t * p.rotSpeedY, p.phase)
      obj.scale.set(p.size, p.size * 0.6, p.size)
      obj.updateMatrix()
      ref.current.setMatrixAt(i, obj.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial color="#ff9ec6" side={THREE.DoubleSide} transparent opacity={0.88} />
    </instancedMesh>
  )
}

/* ── 5-Pointed Glowing Anime Star ── */
function GlowingAnimeStar({ position, onPick }) {
  const ref = useRef()
  const starShape = useMemo(() => {
    const s = new THREE.Shape()
    const points = 5
    const outer = 0.35
    const inner = 0.15
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      if (i === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    }
    s.closePath()
    return s
  }, [])

  const geo = useMemo(() => new THREE.ShapeGeometry(starShape), [starShape])

  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 1.8
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.15
  })

  return (
    <Float speed={3.2} floatIntensity={0.65}>
      <group
        ref={ref}
        position={position}
        onClick={(e) => {
          e.stopPropagation()
          onPick()
        }}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        style={{ cursor: 'pointer' }}
      >
        <mesh geometry={geo}>
          <meshBasicMaterial color="#fffbe6" side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <mesh geometry={geo} scale={1.25}>
          <meshBasicMaterial color="#ffd54f" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <pointLight color="#ffe082" distance={4} decay={2} intensity={3.0} />
      </group>
    </Float>
  )
}

/* Lantern Light Emitters matching the lamps in garden.png */
function AnimeLampGlow({ position, finale }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    // Warm gentle lantern breath
    ref.current.intensity = 16 + Math.sin(t * 5 + position[0]) * 2
  })
  return (
    <group position={position}>
      <pointLight ref={ref} color="#ffb03b" distance={10} decay={2} intensity={16} />
      {/* Soft warm optical flare */}
      <mesh>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color="#ffe8aa" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

const INTERACTIVE_ROSES = [
  [-1.8, 0.7, 1.2],
  [2.1, 0.9, -2.8],
  [-2.2, 0.8, -8.5],
  [2.1, 1.0, -13.5],
]

const INTERACTIVE_STARS = [
  [-0.9, 2.2, -0.8],
  [1.9, 2.8, -5.2],
  [-2.0, 2.7, -7.8],
  [1.2, 1.9, -12.0],
  [-0.4, 3.2, -15.8],
]

/* ═══════════════════════════════════════════════
   MAIN FAIRYTALE GARDEN SCENE (Pure Anime Aesthetic)
   ═══════════════════════════════════════════════ */
export default function FairytaleGarden({ finale = false, interactive = false, onStar, onMsg }) {
  const { camera, pointer, size } = useThree()
  const bg = usePhoto('/garden.png')
  const [gotStars, setGotStars] = useState([])
  const portrait = size.width < size.height
  const startZ = useRef(portrait ? 12 : 8.5)

  useLayoutEffect(() => {
    camera.position.set(0, 1.7, startZ.current)
  }, [camera])

  useFrame((_, dt) => {
    const p = camera.position
    p.z = THREE.MathUtils.damp(p.z, -3, 0.45, dt) // smooth cinematic glide forward
    p.x = THREE.MathUtils.damp(p.x, pathX(p.z) * 0.45 + pointer.x * 0.5, 2, dt)
    p.y = THREE.MathUtils.damp(p.y, 1.7 + pointer.y * 0.22, 2, dt)
    camera.lookAt(pathX(p.z - 10) * 0.5, 1.8, p.z - 12)
  })

  // Lantern positions matching the lanterns in garden.png
  const lampPositions = useMemo(() => [
    [-2.3, 2.8, -1],
    [2.3, 3.2, -5],
    [-2.5, 2.6, -11],
    [2.2, 2.7, -16]
  ], [])

  // Decorative glowing anime roses along the borders of the path
  const pathRoses = useMemo(() => {
    const list = []
    for (let i = 0; i < 28; i++) {
      const z = 4.5 - i * 0.95
      const side = i % 2 === 0 ? 1 : -1
      const x = pathX(z) + side * (1.6 + (i % 3) * 0.3)
      const color = ANIME_PALETTE[i % ANIME_PALETTE.length]
      list.push({ position: [x, 0.4 + (i % 3) * 0.1, z], color, scale: 0.65 + (i % 4) * 0.1 })
    }
    return list
  }, [])

  return (
    <>
      <color attach="background" args={['#110822']} />
      <fog attach="fog" args={['#150a29', 14, 38]} />

      {/* Atmospheric anime lighting */}
      <ambientLight intensity={0.85} color="#b39ddb" />
      <directionalLight position={[-4, 8, 4]} intensity={0.9} color="#e0d4ff" />

      {/* Panoramic anime backdrop positioned seamlessly without ground cutoff */}
      {bg && (
        <mesh position={[0, 4.5, -24]}>
          <planeGeometry args={[56, 42]} />
          <meshBasicMaterial map={bg} fog={false} toneMapped={false} />
        </mesh>
      )}

      {/* Warm lantern illumination matching garden.png */}
      {lampPositions.map((p, i) => (
        <AnimeLampGlow key={i} position={p} finale={finale} />
      ))}

      {/* Glowing Anime Fairy Roses along the pathway */}
      {pathRoses.map((r, i) => (
        <AnimeRose key={i} position={r.position} color={r.color} scale={r.scale} />
      ))}

      {/* Fluttering anime fairy butterflies with curved glowing wings */}
      <Butterfly seed={0} color="#c084fc" center={[-0.8, 2.4, -2.5]} range={2.8} scale={0.9} />
      <Butterfly seed={2} color="#f472b6" center={[1.8, 2.6, -6.5]} range={3.2} scale={0.85} />
      <Butterfly seed={4} color="#60a5fa" center={[-0.5, 2.2, -11]} range={2.6} scale={0.8} />
      {!LOW && (
        <>
          <Butterfly seed={6} color="#fbbf24" center={[-1.8, 2.5, -5.5]} range={2.9} scale={0.85} />
          <Butterfly seed={8} color="#e879f9" center={[1.2, 2.8, -14]} range={3.2} scale={0.8} />
        </>
      )}

      {/* Floating fireflies & magical sparkle dust */}
      <Sparkles
        count={LOW ? 60 : 150}
        scale={[16, 6, 28]}
        position={[0, 2.5, -7]}
        size={5.5}
        speed={0.4}
        color="#ffd700"
      />
      <Sparkles
        count={LOW ? 35 : 90}
        scale={[14, 5, 26]}
        position={[0, 2.0, -5]}
        size={4.2}
        speed={0.5}
        color="#f472b6"
      />

      {/* Drifting cherry blossom petals */}
      <SakuraPetals />

      {/* Interactive roses & stars */}
      {interactive && (
        <>
          {INTERACTIVE_ROSES.map((pos, i) => (
            <AnimeRose
              key={`rose-${i}`}
              position={pos}
              color={ANIME_PALETTE[i % ANIME_PALETTE.length]}
              scale={1.25}
              interactive={true}
              onPick={() => {
                onMsg(content.flowerMessages[i % content.flowerMessages.length])
              }}
            />
          ))}

          {INTERACTIVE_STARS.map((pos, i) => (
            !gotStars.includes(i) && (
              <GlowingAnimeStar
                key={`star-${i}`}
                position={pos}
                onPick={() => {
                  setGotStars((prev) => [...prev, i])
                  onStar(gotStars.length + 1)
                }}
              />
            )
          ))}
        </>
      )}
    </>
  )
}
