import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { REDUCED } from './device'

export function heartShape(scale = 1) {
  const s = new THREE.Shape()
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    i ? s.lineTo(x * scale / 16, y * scale / 16) : s.moveTo(x * scale / 16, y * scale / 16)
  }
  return s
}
export const heartPoint = (t, scale = 1) => [
  16 * Math.sin(t) ** 3 * scale / 16,
  (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale / 16,
]
export function usePhoto(src) {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    let dead = false
    if (!src) return
    new THREE.TextureLoader().load(src, (t) => { if (!dead) { t.colorSpace = THREE.SRGBColorSpace; setTex(t) } }, undefined, () => {})
    return () => { dead = true }
  }, [src])
  return tex
}
export function Cam({ pos, look = [0, 0, 0] }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const portrait = size.width < size.height
    camera.fov = portrait ? 70 : 55; camera.updateProjectionMatrix()
    camera.position.set(pos[0], pos[1], pos[2] * (portrait ? 1.3 : 1)); camera.lookAt(...look)
  }, [camera, size.width, size.height]) // eslint-disable-line
  return null
}
export const hover = (on) => { document.body.style.cursor = on ? 'pointer' : '' }
export function FadeIn({ delay = 0, children, className = '' }) {
  const r = useRef()
  useEffect(() => {
    const t = gsap.fromTo(r.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: REDUCED ? 0.01 : 1.2, delay: REDUCED ? 0 : delay, ease: 'power2.out' })
    return () => t.kill()
  }, []) // eslint-disable-line
  return <div ref={r} className={className} style={{ opacity: 0 }}>{children}</div>
}
