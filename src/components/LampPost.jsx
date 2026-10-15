import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function LampPost({ position, finale = false, light = true }) {
  const lightRef = useRef()
  const glassRef = useRef()
  const coreRef = useRef()
  const age = useRef(0)
  const seed = useRef(Math.random() * 10)

  useFrame(({ clock }, dt) => {
    age.current += dt
    const t = clock.elapsedTime
    const f = finale ? Math.min(1, Math.max(0, (age.current - 1) / 6)) : 1
    // Gentle warm candle flicker
    const flicker = 1 + Math.sin(t * 8 + seed.current) * 0.05 + Math.sin(t * 19 + seed.current) * 0.03
    if (lightRef.current) lightRef.current.intensity = 18 * flicker * f
    if (glassRef.current) glassRef.current.emissiveIntensity = (0.6 + 1.2 * f) * flicker
    if (coreRef.current) coreRef.current.emissiveIntensity = (1.5 + 2.0 * f) * flicker
  })

  return (
    <group position={position}>
      {/* Stone / wrought-iron pedestal base */}
      <mesh position-y={0.15}>
        <cylinderGeometry args={[0.22, 0.32, 0.3, 12]} />
        <meshStandardMaterial color="#1a1423" roughness={0.7} />
      </mesh>

      {/* Slender tapered lamppost pole */}
      <mesh position-y={1.6}>
        <cylinderGeometry args={[0.045, 0.075, 2.7, 12]} />
        <meshStandardMaterial color="#22182b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Decorative post ring */}
      <mesh position-y={2.85}>
        <torusGeometry args={[0.08, 0.025, 8, 16]} />
        <meshStandardMaterial color="#3b2b48" metalness={0.8} />
      </mesh>

      {/* Lantern support collar */}
      <mesh position-y={3.0}>
        <cylinderGeometry args={[0.18, 0.06, 0.15, 8]} />
        <meshStandardMaterial color="#22182b" metalness={0.7} />
      </mesh>

      {/* Hexagonal glowing warm crystal glass lantern chamber */}
      <mesh position-y={3.35}>
        <cylinderGeometry args={[0.22, 0.16, 0.55, 6]} />
        <meshPhysicalMaterial
          ref={glassRef}
          color="#ffd580"
          emissive="#ff9e3b"
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
          roughness={0.1}
          transmission={0.4}
        />
      </mesh>

      {/* Inner bright burning flame / glowing crystal */}
      <mesh ref={coreRef} position-y={3.35}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Lantern pagoda roof & spire */}
      <mesh position-y={3.7}>
        <coneGeometry args={[0.28, 0.22, 6]} />
        <meshStandardMaterial color="#1f1429" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position-y={3.88}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ffd580" emissive="#ffaa33" emissiveIntensity={0.5} />
      </mesh>

      {/* Warm volumetric point light */}
      {light && (
        <pointLight
          ref={lightRef}
          position-y={3.35}
          color="#ffb347"
          distance={12}
          decay={2}
          intensity={16}
        />
      )}
    </group>
  )
}
