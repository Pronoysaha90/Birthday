import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { content } from '../data/content'
import { REDUCED } from '../lib/device'

export default function BirthdayBanner({ compact = false }) {
  const r = useRef()
  useEffect(() => {
    const t = gsap.fromTo(r.current, { scale: 0.6, opacity: 0, rotateX: -50 }, { scale: 1, opacity: 1, rotateX: 0, duration: REDUCED ? 0.01 : 1.6, ease: 'elastic.out(1,0.6)' })
    return () => t.kill()
  }, [])
  return (
    <div ref={r} className="text-center px-4 max-w-full" style={{ opacity: 0 }}>
      {content.bannerImage
        ? <img src={content.bannerImage} alt={content.bannerText} className="mx-auto max-w-[90vw] max-h-[30vh]" />
        : <>
            <h1 className={`script leading-tight ${compact ? 'text-5xl md:text-7xl' : 'text-6xl md:text-8xl'}`}
              style={{ background: 'linear-gradient(90deg,#ffd28a,#ff9bd0,#b79bff)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 18px rgba(255,160,220,.6))' }}>
              {content.bannerText}
            </h1>
            <p className="script text-3xl md:text-5xl text-pink-100 mt-1">{content.name}</p>
          </>}
    </div>)
}
