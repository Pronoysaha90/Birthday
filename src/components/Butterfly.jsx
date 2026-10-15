import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

function createWingShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  // Forewing (upper anime wing curve)
  s.bezierCurveTo(0.15, 0.1, 0.45, 0.35, 0.65, 0.75)
  s.bezierCurveTo(0.68, 0.95, 0.42, 1.1, 0.22, 1.05)
  s.bezierCurveTo(0.08, 0.95, 0.04, 0.65, 0, 0.35)
  // Hindwing (lower graceful scalloped curve)
  s.bezierCurveTo(0.08, 0.3, 0.35, 0.22, 0.45, 0.05)
  s.bezierCurveTo(0.5, -0.22, 0.28, -0.45, 0.12, -0.4)
  s.bezierCurveTo(0.04, -0.35, 0.01, -0.15, 0, 0)
  return s
}

export default function Butterfly({ seed = 0, color = '#c084fc', center = [0, 2, -6], range = 3.5, scale = 0.85 }) {
  const g = useRef()
  const l = useRef()
  const r = useRef()
  const glowRef = useRef()

  const wingGeo = useMemo(() => {
    const shape = createWingShape()
    const geo = new THREE.ShapeGeometry(shape, 16)
    // Rotate so wing extends along X and Y
    return geo
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.45 + seed
    if (!g.current) return

    // Natural undulating anime flight path (flight loops, floating bobs)
    const posX = center[0] + Math.sin(t * 1.3) * range + Math.cos(t * 0.7) * 0.8
    const posY = center[1] + Math.sin(t * 2.2 + seed) * 0.7 + Math.cos(t * 1.1) * 0.3
    const posZ = center[2] + Math.cos(t * 1.0) * range

    g.current.position.set(posX, posY, posZ)

    // Heading angle (butterfly faces movement direction)
    const vx = Math.cos(t * 1.3) * 1.3 * range - Math.sin(t * 0.7) * 0.56
    const vz = -Math.sin(t * 1.0) * range
    const heading = Math.atan2(vx, vz)
    g.current.rotation.y = heading
    g.current.rotation.x = Math.sin(t * 3.5) * 0.15 // pitch
    g.current.rotation.z = Math.cos(t * 2.5) * 0.2  // roll

    // Fast flutter flap with soft elastic return
    const flap = Math.sin(clock.elapsedTime * 18 + seed * 3) * 0.85
    if (l.current) l.current.rotation.y = flap
    if (r.current) r.current.rotation.y = -flap

    if (glowRef.current) {
      glowRef.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 5 + seed) * 0.4
    }
  })

  return (
    <group ref={g} scale={scale}>
      {/* Left wing */}
      <group ref={l} position={[-0.02, 0, 0]}>
        <mesh geometry={wingGeo} scale={[-0.7, 0.7, 0.7]}>
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.2}
            clearcoat={1}
            transmission={0.3}
            side={THREE.DoubleSide}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>

      {/* Right wing */}
      <group ref={r} position={[0.02, 0, 0]}>
        <mesh geometry={wingGeo} scale={[0.7, 0.7, 0.7]}>
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.2}
            clearcoat={1}
            transmission={0.3}
            side={THREE.DoubleSide}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>

      {/* Slender butterfly body */}
      <mesh position={[0, 0.1, 0]}>
        <capsuleGeometry args={[0.025, 0.28, 4, 8]} />
        <meshStandardMaterial color="#2d1537" roughness={0.4} />
      </mesh>

      {/* Subtle fairy glow around butterfly */}
      <pointLight ref={glowRef} color={color} distance={2.5} decay={2} intensity={1.5} />
    </group>
  )
}
