import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import gsap from 'gsap'
import ErrorBoundary from './ErrorBoundary'

/* ── Hand-drawn pink-white spiral striped texture for candle ── */
function useCandyStripeTexture() {
  return useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    // Pure clean white wax base
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 512)

    // Vibrant pink spiral stripes matching user image
    ctx.fillStyle = '#ff2a7a'
    const w = 64
    for (let x = -512; x < 1024; x += w * 2) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + 512, 512)
      ctx.lineTo(x + 512 + w, 512)
      ctx.lineTo(x + w, 0)
      ctx.closePath()
      ctx.fill()
    }

    // Clean outline stroke on each stripe like user drawing
    ctx.strokeStyle = '#4a1528'
    ctx.lineWidth = 4
    for (let x = -512; x < 1024; x += w * 2) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + 512, 512)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + w, 0)
      ctx.lineTo(x + 512 + w, 512)
      ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 2)
    tex.needsUpdate = true
    return tex
  }, [])
}

/* ── 3D Teardrop flame lathe geometry ── */
function useFlameGeometry() {
  return useMemo(() => {
    const points = []
    for (let i = 0; i <= 24; i++) {
      const t = i / 24
      const y = t * 0.85
      const r = Math.sin(t * Math.PI) * Math.pow(1 - t, 0.42) * 0.26
      points.push(new THREE.Vector2(Math.max(0, r), y))
    }
    return new THREE.LatheGeometry(points, 28)
  }, [])
}

/* ── Rising smoke particles after candle is blown ── */
function SmokePuff({ active }) {
  const count = 30
  const pointsRef = useRef()
  const [data] = useState(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.16,
      y: 0.85 + Math.random() * 0.1,
      z: (Math.random() - 0.5) * 0.16,
      vy: 0.8 + Math.random() * 1.1,
      vx: (Math.random() - 0.5) * 0.25,
      life: 0,
      maxLife: 1.4 + Math.random() * 0.6,
    }))
  )

  const positions = useMemo(() => new Float32Array(count * 3), [count])

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position
    data.forEach((p, i) => {
      p.life += delta
      if (p.life < p.maxLife) {
        p.y += p.vy * delta
        p.x += p.vx * delta
      }
      pos.setXYZ(i, p.x, p.y, p.z)
    })
    pos.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        color="#7d6a74"
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Shorter, beautifully proportioned Candle with smooth, realistic flame ── */
function CandleMesh({ blown }) {
  const stripeTex = useCandyStripeTexture()
  const flameGeo = useFlameGeometry()
  const flameGroupRef = useRef()
  const lightRef = useRef()

  // Smooth, calming, organic flame animation (NO rapid jumping / lafalafi)
  useFrame(({ clock }) => {
    if (blown) return
    const t = clock.elapsedTime
    if (flameGroupRef.current) {
      // Gentle, slow organic sway (frequency 1.8 to 2.5 rad/s, tiny smooth angle)
      flameGroupRef.current.rotation.z = Math.sin(t * 2.0) * 0.025 + Math.sin(t * 3.5) * 0.012
      flameGroupRef.current.rotation.x = Math.cos(t * 1.8) * 0.015
      // Very smooth, subtle breathing
      flameGroupRef.current.scale.y = 0.72 + Math.sin(t * 2.8) * 0.025
      flameGroupRef.current.scale.x = 0.72 + Math.cos(t * 2.2) * 0.018
      flameGroupRef.current.scale.z = flameGroupRef.current.scale.x
    }
    if (lightRef.current) {
      // Warm, steady glow with subtle breathing
      lightRef.current.intensity = 1.5 + Math.sin(t * 2.5) * 0.06
    }
  })

  // Flame extinguish animation
  useEffect(() => {
    if (blown && flameGroupRef.current) {
      gsap.to(flameGroupRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.25,
        ease: 'power2.in',
      })
      if (lightRef.current) {
        gsap.to(lightRef.current, { intensity: 0, duration: 0.25 })
      }
    }
  }, [blown])

  return (
    <group position={[0, -0.22, 0]}>
      {/* ── Candle Body: Shorter proportioned cylinder (height: 1.25) ── */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.26, 1.25, 36]} />
        <meshStandardMaterial
          map={stripeTex || undefined}
          color="#ffffff"
          roughness={0.28}
          metalness={0.02}
        />
      </mesh>

      {/* Top rounded wax cap */}
      <mesh position={[0, 0.625, 0]}>
        <cylinderGeometry args={[0.23, 0.24, 0.05, 36]} />
        <meshStandardMaterial color="#fff0f5" roughness={0.4} />
      </mesh>

      {/* Top wax edge ring */}
      <mesh position={[0, 0.61, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.025, 16, 36]} />
        <meshStandardMaterial color="#ff4081" roughness={0.3} />
      </mesh>

      {/* ── Wick ── */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.16, 12]} />
        <meshStandardMaterial color="#24161b" roughness={0.9} />
      </mesh>

      {/* ── 3D FLAME (Warm, Glowing, Layered, Smooth) ── */}
      <group ref={flameGroupRef} position={[0, 0.82, 0]} scale={[0.72, 0.72, 0.72]}>
        {/* Outer Warm Golden-Orange Flame */}
        <mesh geometry={flameGeo}>
          <meshBasicMaterial
            color="#ff6d00"
            transparent
            opacity={0.92}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner Brilliant Yellow Core Flame */}
        <mesh geometry={flameGeo} scale={[0.62, 0.76, 0.62]} position={[0, 0.03, 0]}>
          <meshBasicMaterial
            color="#fff59d"
            transparent
            opacity={0.98}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Base soft blue glow */}
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshBasicMaterial color="#29b6f6" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Candle flame warm glow */}
      <pointLight
        ref={lightRef}
        position={[0, 0.95, 0.3]}
        color="#ffa726"
        intensity={1.5}
        distance={6}
        decay={2}
      />

      {/* Wispy smoke puff when blown */}
      <SmokePuff active={blown} />

      {/* Ambient warm embers */}
      {!blown && (
        <Sparkles
          count={14}
          scale={[0.8, 1.1, 0.8]}
          position={[0, 1.05, 0]}
          size={2.2}
          speed={0.5}
          color="#ffd54f"
          opacity={0.7}
        />
      )}
    </group>
  )
}

/* ═══════════════════════════════════════════════
   CANDLE COUNTDOWN SCREEN
   - Shorter candle that never touches text
   - Smooth, gentle flame animation (no lafalafi)
   - ONLY candle and countdown on screen
   - ZERO music on candle screen (plays on main wish page)
   - Measured steady countdown pace
   - 100% responsive, never overflows
   ═══════════════════════════════════════════════ */
export default function CandleCountdown({ onComplete }) {
  const [count, setCount] = useState(5)
  const [blown, setBlown] = useState(false)
  const containerRef = useRef()
  const titleRef = useRef()
  const countdownBadgeRef = useRef()

  // Initial entry animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(titleRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
    tl.fromTo(countdownBadgeRef.current, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, '-=0.4')
    return () => tl.kill()
  }, [])

  // Blow candle action: NO MUSIC HERE (music starts when main wish page mounts)
  const triggerBlow = () => {
    if (blown) return
    setBlown(true)

    // Transition to main birthday wish page after pleasant visual pause
    gsap.delayedCall(1.8, () => {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.03,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          if (onComplete) onComplete()
        },
      })
    })
  }

  // 5, 4, 3, 2, 1 Steady Countdown timer (1200ms per step)
  useEffect(() => {
    if (blown) return
    if (count > 1) {
      const timer = setTimeout(() => {
        setCount(prev => prev - 1)
        gsap.fromTo(
          countdownBadgeRef.current,
          { scale: 1.25 },
          { scale: 1, duration: 0.45, ease: 'back.out(1.8)' }
        )
      }, 1200)
      return () => clearTimeout(timer)
    } else if (count === 1) {
      const timer = setTimeout(() => {
        setCount(0)
        triggerBlow()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [count, blown])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between select-none"
      style={{
        background: 'linear-gradient(180deg, #fff2f6 0%, #ffe4ee 55%, #fed5e5 100%)',
        overflow: 'hidden',
        padding: 'clamp(1rem, 3vh, 2.5rem) 1rem',
        boxSizing: 'border-box',
      }}
    >
      {/* ── TOP: Clean title "blow the candle" (Generous space above flame) ── */}
      <div
        ref={titleRef}
        className="w-full text-center z-20 pointer-events-none"
        style={{ marginTop: 'clamp(0.5rem, 2vh, 1.5rem)' }}
      >
        <div className="inline-block relative">
          <h1
            style={{
              fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif",
              fontSize: 'clamp(2.3rem, 6.2vw, 4.0rem)',
              color: '#2a1420',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '0.04em',
              fontWeight: 700,
              textShadow: '0 2px 10px rgba(255, 64, 129, 0.25)',
            }}
          >
            blow the candle
          </h1>

          <span
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-28px',
              fontSize: '1.5rem',
              animation: 'spinSlow 6s linear infinite',
            }}
          >
            ✨
          </span>
          <span
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '-26px',
              fontSize: '1.4rem',
            }}
          >
            🌸
          </span>
        </div>
      </div>

      {/* ── CENTER: 3D THREE.JS CANDLE & SMOOTH FLAME ── */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <ErrorBoundary>
          <Canvas
            camera={{ position: [0, 0.15, 5.0], fov: 38 }}
            gl={{ antialias: true, alpha: true }}
            style={{ pointerEvents: 'auto' }}
          >
            <ambientLight intensity={0.95} />
            <directionalLight position={[3, 5, 4]} intensity={0.8} color="#ffffff" />
            <directionalLight position={[-3, -2, -2]} intensity={0.35} color="#ffb6c1" />

            <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.08}>
              <CandleMesh blown={blown} />
            </Float>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* ── BOTTOM: ONLY THE COUNTDOWN BADGE ── */}
      <div
        className="w-full text-center z-20"
        style={{ marginBottom: 'clamp(0.8rem, 2.5vh, 2.0rem)' }}
      >
        <div
          ref={countdownBadgeRef}
          className="inline-flex items-center justify-center cursor-pointer"
          onClick={triggerBlow}
          title="Click to blow immediately!"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '2.5rem',
            padding: 'clamp(0.6rem, 1.8vw, 0.95rem) clamp(1.8rem, 4vw, 2.8rem)',
            boxShadow: '0 14px 40px rgba(255, 64, 129, 0.28), 0 0 0 2px rgba(255, 255, 255, 0.95)',
            userSelect: 'none',
          }}
        >
          {!blown ? (
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: "'Changa One', cursive, sans-serif",
                  fontSize: 'clamp(2.5rem, 6.2vw, 4.0rem)',
                  color: '#ff2a7a',
                  lineHeight: 1,
                  textShadow: '0 3px 14px rgba(255, 42, 122, 0.4)',
                }}
              >
                {count}
              </span>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.05rem, 2.4vw, 1.4rem)',
                  color: '#40182c',
                }}
              >
                Seconds to Blow! 🎂
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: "'Changa One', cursive, sans-serif",
                  fontSize: 'clamp(1.6rem, 3.8vw, 2.4rem)',
                  color: '#e91e63',
                  lineHeight: 1.15,
                }}
              >
                ✨ Make a Wish! 🌸
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
