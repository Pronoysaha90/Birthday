import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import gsap from 'gsap'
import { content } from '../data/content'
import { sfx } from '../lib/audio'
import { LOW, REDUCED } from '../lib/device'
import { heartShape } from '../lib/shared'
import ErrorBoundary from './ErrorBoundary'

/* ═══════════════════════════════════════════════
   THREE.JS BACKGROUND – Authentic Round Party Balloons
   ═══════════════════════════════════════════════ */

/* ── Authentic Slender Party Balloon Geometry (Never Squashed/Chapta) ── */
function useClassicBalloonGeo() {
  return useMemo(() => {
    // 36x36 sphere with slender width and tall height ratio (1.65:1)
    const baseRadius = 0.38
    const geo = new THREE.SphereGeometry(baseRadius, 36, 36)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const x = pos.getX(i)
      const z = pos.getZ(i)
      if (y < 0) {
        // Lower half: smooth graceful cone taper down towards knot
        const t = Math.abs(y) / baseRadius
        const taper = 1.0 - Math.pow(t, 1.35) * 0.68
        pos.setX(i, x * taper)
        pos.setZ(i, z * taper)
        pos.setY(i, y * 1.55) // Tall taper downward
      } else {
        // Upper dome: graceful tall egg dome
        const t = y / baseRadius
        const domePlump = 1.0 + Math.sin(t * Math.PI) * 0.1
        pos.setX(i, x * domePlump)
        pos.setZ(i, z * domePlump)
        pos.setY(i, y * 1.45) // Tall upper dome
      }
    }
    geo.computeVertexNormals()
    return geo
  }, [])
}

/* ── Floating classic party balloon with knot & string ── */
function ClassicBalloon({ position, color, delay = 0, scale = 0.72, swaySpeed = 1 }) {
  const groupRef = useRef()
  const balloonGeo = useClassicBalloonGeo()
  const startY = useRef(position[1] - 8)

  // Realistic natural hanging string
  const stringCurve = useMemo(() => {
    const pts = []
    const count = 16
    for (let i = 0; i <= count; i++) {
      const t = i / count
      const y = -0.65 - t * 2.2
      const x = Math.sin(t * Math.PI * 2.2) * 0.08 * (1 - t * 0.25)
      const z = Math.cos(t * Math.PI * 1.5) * 0.05 * t
      pts.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(pts)
  }, [])

  const stringGeo = useMemo(() => {
    return new THREE.TubeGeometry(stringCurve, 20, 0.009, 6, false)
  }, [stringCurve])

  useEffect(() => {
    if (REDUCED) return
    gsap.fromTo(
      groupRef.current.position,
      { y: startY.current },
      { y: position[1], duration: 2.2, delay, ease: 'elastic.out(1, 0.45)' }
    )
  }, [delay, position])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * swaySpeed
    if (!groupRef.current) return
    groupRef.current.position.x = position[0] + Math.sin(t * 0.6 + delay * 2) * 0.22
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + delay) * 0.26
    groupRef.current.rotation.z = Math.sin(t * 0.5 + delay) * 0.07
    groupRef.current.rotation.x = Math.cos(t * 0.4 + delay) * 0.05
  })

  return (
    <group ref={groupRef} position={[position[0], startY.current, position[2]]} scale={scale}>
      <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.3}>
        {/* Main Balloon: smooth, glossy, slender latex teardrop */}
        <mesh geometry={balloonGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.16}
            roughness={0.14}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            transmission={0.05}
            reflectivity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Small neat tied knot at bottom base */}
        <mesh position={[0, -0.60, 0]}>
          <cylinderGeometry args={[0.045, 0.02, 0.06, 12]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.63, 0]}>
          <coneGeometry args={[0.065, 0.06, 12]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>

        {/* Delicate hanging string */}
        <mesh geometry={stringGeo}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      </Float>
    </group>
  )
}

/* ── Floating pastel 3D hearts ── */
function PastelHearts({ count = 38 }) {
  const refs = useRef([])
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(heartShape(0.32), {
      depth: 0.06,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 3,
      curveSegments: 20,
    })
    g.center()
    return g
  }, [])

  const seeds = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 19,
    speed: 0.22 + Math.random() * 0.38,
    offset: Math.random() * 30,
    scale: 0.16 + Math.random() * 0.35,
    rotSpeed: (Math.random() - 0.5) * 1.5,
    zDepth: -1.5 - Math.random() * 3.5,
    color: ['#ff80ab', '#ff4081', '#ffb3d0', '#ffa0c8', '#ff6b9d', '#e040fb', '#ea80fc', '#ffd54f'][Math.floor(Math.random() * 8)],
  })), [count])

  useFrame(({ clock }) => seeds.forEach((s, i) => {
    const m = refs.current[i]
    if (!m) return
    const t = clock.elapsedTime
    const y = ((t * s.speed + s.offset) % 15) - 7.5
    m.position.set(s.x + Math.sin(t * 0.45 + s.offset) * 1.1, y, s.zDepth)
    m.rotation.z = Math.sin(t * s.rotSpeed + s.offset) * 0.35
    m.rotation.y = t * 0.45
    m.material.opacity = 0.38 + Math.sin(t * 1.5 + s.offset) * 0.16
  }))

  return seeds.map((s, i) => (
    <mesh key={i} ref={r => (refs.current[i] = r)} geometry={geo} scale={s.scale}>
      <meshStandardMaterial
        color={s.color}
        emissive={s.color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.45}
        side={THREE.DoubleSide}
      />
    </mesh>
  ))
}

/* ── Twinkling star field ── */
function TwinklingStars({ count = 55 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 22
      p[i * 3 + 1] = (Math.random() - 0.5) * 14
      p[i * 3 + 2] = -4 - Math.random() * 4
    }
    return p
  }, [count])

  const sizes = useMemo(() => new Float32Array(count).fill(0).map(() => 2 + Math.random() * 4), [count])
  const phases = useMemo(() => new Float32Array(count).fill(0).map(() => Math.random() * Math.PI * 2), [count])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    const s = ref.current.geometry.attributes.size
    for (let i = 0; i < count; i++) {
      s.array[i] = sizes[i] * (0.5 + Math.sin(t * 2 + phases[i]) * 0.5)
    }
    s.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[new Float32Array(sizes), 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        color="#ffe8f0"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Gift box with ribbon ── */
function GiftBox({ position, color = '#ff8ab4' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * 1.6)) * 0.25
    ref.current.rotation.y = t * 0.45
  })
  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.44, 0.07, 0.44]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.07, 0.44, 0.44]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

/* ── 3D Scene with Authentic Balloons and Love Hearts ── */
function CardScene() {
  return (
    <>
      <color attach="background" args={['#fff4f8']} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[6, 8, 5]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-6, 4, 4]} intensity={25} color="#ffd4eb" />
      <pointLight position={[6, 4, 4]} intensity={25} color="#d4b5ff" />
      <pointLight position={[0, -4, 4]} intensity={15} color="#ffe8c2" />

      {/* Floating love hearts in background */}
      <PastelHearts count={LOW ? 20 : 40} />

      {/* Twinkling stars */}
      <TwinklingStars count={LOW ? 25 : 55} />

      {/* LEFT SIDE BALLOONS (Authentic round party balloon shape) */}
      <ClassicBalloon position={[-6.2, 2.3, -0.6]} color="#ff4081" delay={0.1} scale={0.72} />
      <ClassicBalloon position={[-5.3, 3.2, -1.0]} color="#ab47bc" delay={0.3} scale={0.65} />
      <ClassicBalloon position={[-6.6, 0.9, -0.8]} color="#42a5f5" delay={0.5} scale={0.68} />
      <ClassicBalloon position={[-5.6, -0.6, -0.7]} color="#ffca28" delay={0.7} scale={0.62} />
      <ClassicBalloon position={[-4.5, 3.8, -1.5]} color="#f06292" delay={0.2} scale={0.55} />

      {/* RIGHT SIDE BALLOONS (Authentic round party balloon shape) */}
      <ClassicBalloon position={[6.2, 2.3, -0.6]} color="#ff5252" delay={0.2} scale={0.72} />
      <ClassicBalloon position={[5.3, 3.2, -1.0]} color="#f06292" delay={0.4} scale={0.65} />
      <ClassicBalloon position={[6.6, 0.9, -0.8]} color="#26a69a" delay={0.6} scale={0.68} />
      <ClassicBalloon position={[5.6, -0.6, -0.7]} color="#ffa726" delay={0.8} scale={0.62} />
      <ClassicBalloon position={[4.5, 3.8, -1.5]} color="#b388ff" delay={0.3} scale={0.55} />

      {/* Gift boxes */}
      <GiftBox position={[-6.2, -3.2, -1.2]} color="#ff4081" />
      <GiftBox position={[6.2, -3.2, -1.2]} color="#7c4dff" />

      {/* Dreamy sparkle layer */}
      <Sparkles count={LOW ? 35 : 90} scale={[18, 12, 4]} size={3.2} speed={0.5} color="#ffb3d0" />
      <Sparkles count={LOW ? 20 : 50} scale={[16, 10, 3]} size={4.5} speed={0.3} color="#ffe082" />

      {/* Bloom glow */}
      {!LOW && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.45} luminanceThreshold={0.82} radius={0.55} />
        </EffectComposer>
      )}
    </>
  )
}

/* ── Top festive bunting flags ── */
function Bunting() {
  const flags = ['#ff4081', '#ff80ab', '#ffd54f', '#80d8ff', '#b388ff', '#ff80ab', '#a7ffeb', '#ff4081', '#ffd54f', '#ff80ab', '#80d8ff', '#b388ff', '#ff4081', '#ffd54f']
  return (
    <svg
      width="100%"
      height="44"
      viewBox="0 0 1000 44"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        filter: 'drop-shadow(0 3px 5px rgba(255,64,129,0.25))',
        pointerEvents: 'none',
      }}
    >
      <path d="M0,8 Q250,18 500,8 Q750,18 1000,8" fill="none" stroke="#ff80ab" strokeWidth="2.2" opacity="0.8" />
      {flags.map((c, i) => {
        const x = (i / flags.length) * 1000
        const w = 1000 / flags.length
        const mid = x + w / 2
        const ropeY = 8 + Math.sin((i / flags.length) * Math.PI * 2) * 4
        return (
          <polygon
            key={i}
            points={`${x + 3},${ropeY} ${x + w - 3},${ropeY} ${mid},${ropeY + 24}`}
            fill={c}
            opacity="0.85"
            style={{ animation: `flagSway ${2 + (i % 5) * 0.2}s ease-in-out infinite alternate` }}
          />
        )
      })}
    </svg>
  )
}

/* ── Interactive Floating Bubu Dudu GIF Character ── */
function BubuGifCharacter({ src, alt, tag, positionStyle, animClass, size = '110px' }) {
  const [popped, setPopped] = useState(false)

  const handleCharClick = () => {
    sfx('pop')
    setPopped(true)
    setTimeout(() => setPopped(false), 600)
  }

  return (
    <div
      className={`bubu-char-container ${animClass} ${popped ? 'bubu-pop' : ''}`}
      style={{
        position: 'absolute',
        ...positionStyle,
        zIndex: 15,
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        userSelect: 'none',
      }}
      onClick={handleCharClick}
      title="Click me for a cute bounce! 💕"
    >
      {tag && (
        <div className="bubu-speech-bubble">
          {tag}
        </div>
      )}

      <div className="bubu-gif-wrapper" style={{ width: size, height: 'auto' }}>
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 6px 16px rgba(255, 64, 129, 0.25))',
            borderRadius: '16px',
          }}
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN BIRTHDAY CARD COMPONENT
   ═══════════════════════════════════════════════ */
export default function BirthdayCard({ onReplayCandle, isMusicPlaying, onToggleMusic }) {
  const cardRef = useRef()
  const titleRef = useRef()
  const bannerWrapperRef = useRef()

  useEffect(() => {
    if (REDUCED) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(cardRef.current, { y: 35, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 1.1 })
    tl.fromTo(titleRef.current, { y: -25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
    tl.fromTo(bannerWrapperRef.current, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.4)' }, '-=0.5')
    return () => tl.kill()
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {/* ── 3D Canvas with realistic balloons & particles ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ErrorBoundary>
          <Canvas
            dpr={LOW ? [1, 1.5] : [1, 2]}
            gl={{ antialias: !LOW, alpha: false }}
            camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 8] }}
          >
            <CardScene />
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* ── Top festive bunting ── */}
      <Bunting />

      {/* ── TOP-RIGHT CONTROLS: Re-blow Candle & Audio Mic Toggle ── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {onReplayCandle && (
          <button
            onClick={onReplayCandle}
            className="music-mic-btn"
            title="Blow Candle Again 🎂🕯️"
            aria-label="Blow Candle Again"
          >
            <span className="mic-icon-symbol">🕯️</span>
          </button>
        )}
        <button
          onClick={onToggleMusic}
          className="music-mic-btn"
          title={isMusicPlaying ? 'Mute Music' : 'Play Birthday Song'}
          aria-label={isMusicPlaying ? 'Mute Music' : 'Play Birthday Song'}
        >
          <span className="mic-icon-symbol">{isMusicPlaying ? '🎙️' : '🎵'}</span>
          {isMusicPlaying && <span className="mic-pulse-ring" />}
        </button>
      </div>

      {/* ── 4 ORIGINAL BUBU DUDU CORNER CHARACTERS ── */}
      {/* 1. TOP-LEFT */}
      <BubuGifCharacter
        src="/bubu/bubu-friday.gif"
        alt="Bubu Dudu celebration"
        tag="Party Time! 🥳✨"
        positionStyle={{ top: 'clamp(46px, 6.8vh, 72px)', left: 'clamp(10px, 2.5vw, 32px)' }}
        animClass="anim-float-bounce"
        size="clamp(78px, 9.2vw, 118px)"
      />

      {/* 2. TOP-RIGHT */}
      <BubuGifCharacter
        src="/bubu/bubu-cuddle.gif"
        alt="Bubu Dudu cuddle"
        tag="Sending Hugs! 🥰💖"
        positionStyle={{ top: 'clamp(46px, 6.8vh, 72px)', right: 'clamp(10px, 2.5vw, 32px)' }}
        animClass="anim-float-sway"
        size="clamp(82px, 9.6vw, 122px)"
      />

      {/* 3. BOTTOM-LEFT */}
      <BubuGifCharacter
        src="/bubu/bubu-loverun.gif"
        alt="Bubu Dudu running with love"
        tag="For Devi! 🌸🏃"
        positionStyle={{ bottom: 'clamp(14px, 2.5vh, 28px)', left: 'clamp(10px, 2.5vw, 32px)' }}
        animClass="anim-float-gentle"
        size="clamp(78px, 9.2vw, 115px)"
      />

      {/* 4. BOTTOM-RIGHT */}
      <BubuGifCharacter
        src="/bubu/dudu-dancing.gif"
        alt="Dudu dancing happily"
        tag="Dance Dance! 💃🎶"
        positionStyle={{ bottom: 'clamp(14px, 2.5vh, 28px)', right: 'clamp(10px, 2.5vw, 32px)' }}
        animClass="anim-float-dance"
        size="clamp(78px, 9.2vw, 118px)"
      />

      {/* ── CENTER STAGE: DEVI BIRTHDAY BANNER & CARD ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(0.4rem, 1.2vw, 1.0rem)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        <div
          ref={cardRef}
          style={{
            pointerEvents: 'auto',
            opacity: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 'clamp(1.2rem, 2.2vw, 1.8rem)',
            padding: 'clamp(0.6rem, 1.2vw, 0.95rem) clamp(0.8rem, 2vw, 1.6rem)',
            maxWidth: 'min(720px, 86vw)',
            width: '100%',
            boxShadow:
              '0 18px 55px rgba(255, 64, 129, 0.22), 0 6px 20px rgba(0,0,0,0.06), inset 0 2px 0 rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            position: 'relative',
          }}
        >
          {/* 5. CARD ACCENT: Bubu Happy Sticker */}
          <div
            className="bubu-center-sticker"
            style={{
              position: 'absolute',
              top: 'clamp(-24px, -2.6vw, -32px)',
              right: 'clamp(10px, 2.5vw, 24px)',
              zIndex: 20,
              cursor: 'pointer',
            }}
            onClick={() => sfx('pop')}
            title="Happy Birthday Devi! 🌸"
          >
            <img
              src="/bubu/bubu-happy.gif"
              alt="Bubu Dudu happy sticker"
              draggable={false}
              style={{
                width: 'clamp(50px, 5.8vw, 70px)',
                height: 'auto',
                filter: 'drop-shadow(0 5px 12px rgba(255, 64, 129, 0.35))',
              }}
            />
          </div>

          {/* ── HEADER: Colorful Happy Birthday Devi in Changa One Font ── */}
          <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 'clamp(0.2rem, 0.6vw, 0.4rem)' }}>
            <h1 className="birthday-title-changa">
              <span className="word-happy">
                <span className="char-h">H</span>
                <span className="char-a1">a</span>
                <span className="char-p1">p</span>
                <span className="char-p2">p</span>
                <span className="char-y">y</span>
              </span>
              <span className="title-spacer">&nbsp;</span>
              <span className="word-birthday">
                <span className="char-b">B</span>
                <span className="char-i">i</span>
                <span className="char-r">r</span>
                <span className="char-t">t</span>
                <span className="char-h2">h</span>
                <span className="char-d">d</span>
                <span className="char-a2">a</span>
                <span className="char-y2">y</span>
              </span>
              <span className="title-spacer">&nbsp;</span>
              <span className="char-devi">Devi! 💖</span>
            </h1>
          </div>

          {/* ── CENTER BANNER: FIXED PROPORTION & PERFECT RESPONSIVE FIT ── */}
          <div
            ref={bannerWrapperRef}
            className="devi-banner-frame"
            style={{
              width: '100%',
              maxWidth: '650px',
              aspectRatio: '2752 / 1536',
              borderRadius: 'clamp(0.8rem, 1.4vw, 1.2rem)',
              overflow: 'hidden',
              boxShadow:
                '0 10px 30px rgba(220, 80, 130, 0.28), 0 4px 15px rgba(0,0,0,0.1), 0 0 0 2.5px rgba(255, 230, 180, 0.85)',
              position: 'relative',
              backgroundColor: '#1a0b1e',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease',
            }}
          >
            <img
              src="/banner.jpg"
              alt="Happy Birthday Devi Banner"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'contain',
              }}
            />
            {/* Elegant glass sheen overlay */}
            <div className="banner-sheen" />
          </div>
        </div>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        /* Changa One Colorful Birthday Title */
        .birthday-title-changa {
          font-family: 'Changa One', cursive, sans-serif;
          font-size: clamp(1.6rem, 3.8vw, 2.9rem);
          font-weight: 400;
          letter-spacing: 0.02em;
          margin: 0;
          line-height: 1.15;
          text-shadow: 0 4px 10px rgba(233, 30, 99, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .title-spacer {
          display: inline-block;
          width: 0.35em;
        }

        /* Colorful rainbow letters */
        .char-h  { color: #ff3366; }
        .char-a1 { color: #ff6600; }
        .char-p1 { color: #ffaa00; }
        .char-p2 { color: #00c853; }
        .char-y  { color: #00b0ff; }
        .char-b  { color: #aa00ff; }
        .char-i  { color: #ff1744; }
        .char-r  { color: #ff6d00; }
        .char-t  { color: #ffd600; }
        .char-h2 { color: #00e676; }
        .char-d  { color: #2979ff; }
        .char-a2 { color: #d500f9; }
        .char-y2 { color: #ff4081; }
        .char-devi {
          background: linear-gradient(135deg, #ff1744, #e91e63, #ff4081, #ff9100);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-left: 0.1em;
          filter: drop-shadow(0 2px 6px rgba(255,23,68,0.3));
        }

        /* Center banner frame hover */
        .devi-banner-frame:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 16px 45px rgba(220, 80, 130, 0.4), 0 0 0 3.5px rgba(255, 235, 190, 0.95);
        }

        .banner-sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 40%, rgba(255,255,255,0.08) 100%);
          pointer-events: none;
        }

        /* Compact Mic / Music Icon Button */
        .music-mic-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 64, 129, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 64, 129, 0.2);
          transition: all 0.25s ease;
          position: fixed;
        }

        .music-mic-btn:hover {
          transform: scale(1.12);
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(255, 64, 129, 0.6);
          box-shadow: 0 6px 20px rgba(255, 64, 129, 0.35);
        }

        .mic-icon-symbol {
          font-size: 1.05rem;
          line-height: 1;
        }

        .mic-pulse-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 64, 129, 0.5);
          animation: micPulse 1.8s infinite;
          pointer-events: none;
        }

        @keyframes micPulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* Surprise Button */
        .surprise-button {
          color: #ffffff;
          border: none;
          border-radius: 999px;
          padding: clamp(0.42rem, 1vw, 0.6rem) clamp(1.4rem, 2.8vw, 2.2rem);
          font-family: 'Outfit', 'Quicksand', sans-serif;
          font-size: clamp(0.85rem, 1.4vw, 1.02rem);
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          user-select: none;
        }

        /* Bubu Dudu Speech Bubbles */
        .bubu-speech-bubble {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255, 64, 129, 0.25);
          border-radius: 999px;
          padding: 0.16rem 0.55rem;
          font-family: 'Quicksand', sans-serif;
          font-size: clamp(0.62rem, 1vw, 0.76rem);
          font-weight: 800;
          color: #d81b60;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(255, 64, 129, 0.18);
          pointer-events: none;
        }

        /* Pop animation on click */
        .bubu-pop {
          animation: popScale 0.5s ease-out;
        }

        @keyframes popScale {
          0% { transform: scale(1); }
          40% { transform: scale(1.28) rotate(6deg); }
          75% { transform: scale(0.95) rotate(-3deg); }
          100% { transform: scale(1); }
        }

        /* Bubu Floating Animations */
        .anim-float-bounce {
          animation: floatBounce 3.8s ease-in-out infinite alternate;
        }
        .anim-float-sway {
          animation: floatSway 4.2s ease-in-out infinite alternate;
        }
        .anim-float-gentle {
          animation: floatGentle 3.5s ease-in-out infinite alternate;
        }
        .anim-float-dance {
          animation: floatDance 3.2s ease-in-out infinite alternate;
        }

        @keyframes floatBounce {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
          100% { transform: translateY(-5px) rotate(-2deg); }
        }

        @keyframes floatSway {
          0% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(-3px) rotate(-1deg); }
        }

        @keyframes floatGentle {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
          100% { transform: translateY(-2px) scale(1); }
        }

        @keyframes floatDance {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-3deg); }
          75% { transform: translateY(-12px) rotate(3deg); }
          100% { transform: translateY(-4px) rotate(0deg); }
        }

        .bubu-char-container:hover {
          transform: scale(1.15) !important;
        }

        @keyframes flagSway {
          0% { transform: rotate(-1.5deg); }
          100% { transform: rotate(1.5deg); }
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .bubu-speech-bubble {
            display: none;
          }
          .devi-banner-frame {
            box-shadow: 0 8px 25px rgba(220, 80, 130, 0.25), 0 0 0 2px rgba(255, 230, 180, 0.7);
          }
        }
      `}</style>
    </div>
  )
}
