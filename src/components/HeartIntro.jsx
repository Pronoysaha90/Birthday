import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Cam, heartShape, hover } from '../lib/shared'
import { LOW } from '../lib/device'

export default function HeartIntro({ onOpen }) {
  const g = useRef()
  const geo = useMemo(() => {
    const x = new THREE.ExtrudeGeometry(heartShape(3), { depth: 0.6, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.15, bevelSegments: 6, curveSegments: 32 })
    x.center(); return x
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, beat = 1 + Math.max(0, Math.sin(t * 3)) ** 6 * 0.12 + Math.sin(t * 1.5) * 0.02
    g.current.scale.setScalar(beat); g.current.rotation.y = Math.sin(t * 0.6) * 0.45
    g.current.position.y = Math.sin(t * 0.9) * 0.15
  })
  return (<>
    <Cam pos={[0, 0, 6]} />
    <color attach="background" args={['#05030f']} />
    <ambientLight intensity={0.5} /><pointLight position={[3, 3, 4]} intensity={60} color="#ffb6d9" /><pointLight position={[-3, -2, 3]} intensity={30} color="#9a7bff" />
    <Stars radius={50} depth={40} count={LOW ? 1500 : 4000} factor={3} fade speed={1} />
    <mesh ref={g} geometry={geo} onClick={onOpen} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
      <meshPhysicalMaterial color="#ff3d7f" emissive="#ff1f6b" emissiveIntensity={0.5} roughness={0.25} clearcoat={1} />
    </mesh>
    <Sparkles count={LOW ? 40 : 100} scale={[5, 5, 3]} size={4} speed={0.5} color="#ffc0e0" />
  </>)
}
