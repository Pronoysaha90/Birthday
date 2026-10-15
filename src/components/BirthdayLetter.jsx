import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { content } from '../data/content'
import { REDUCED } from '../lib/device'
import { sfx } from '../lib/audio'

export default function BirthdayLetter({ onDone }) {
  const [open, setOpen] = useState(false), [done, setDone] = useState(false)
  const box = useRef(), flap = useRef()
  useEffect(() => {
    if (!open) return
    sfx('chime')
    const lines = box.current.querySelectorAll('.l-line')
    const tl = gsap.timeline()
    tl.fromTo(box.current, { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: REDUCED ? 0.01 : 0.9, ease: 'back.out(1.4)' })
      .fromTo(lines, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: REDUCED ? 0.01 : 0.8, stagger: REDUCED ? 0 : 1 })
      .call(() => setDone(true))
    return () => tl.kill()
  }, [open])
  const open3d = () => {
    sfx('pop')
    gsap.to(flap.current, { rotateX: 180, duration: REDUCED ? 0.01 : 0.8, ease: 'power2.inOut', onComplete: () => setOpen(true) })
  }
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/55 p-4 overflow-y-auto">
      {!open ? (
        <button onClick={open3d} aria-label="Open the secret letter" className="relative w-72 h-48 rounded-md shadow-2xl cursor-pointer"
          style={{ background: 'linear-gradient(160deg,#f6dcc4,#e8bfa0)', perspective: 600 }}>
          <div ref={flap} className="absolute top-0 left-0 w-full h-24 origin-top"
            style={{ background: '#e0b08f', clipPath: 'polygon(0 0,100% 0,50% 100%)', transformStyle: 'preserve-3d' }} />
          <span className="absolute left-1/2 top-[70px] -translate-x-1/2 text-3xl text-rose-600 drop-shadow">♥</span>
          <span className="absolute -bottom-10 left-0 w-full text-center text-pink-100">Tap to open</span>
        </button>
      ) : (
        <div ref={box} className="max-w-xl w-full rounded-lg p-6 md:p-10 text-stone-800 shadow-2xl" style={{ background: 'linear-gradient(#fffaf0,#f5e6d0)', opacity: 0 }}>
          {content.letter.map((l, i) => (
            <p key={i} className="l-line script text-2xl md:text-3xl leading-snug my-2" style={{ opacity: 0 }}>{l.replace('{name}', content.name)}</p>))}
          {content.voice && <audio controls src={content.voice} className="w-full mt-4" aria-label="Voice message" />}
          {done && <div className="text-center mt-6"><button className="btn !text-stone-800 !border-rose-400" onClick={onDone}>Continue</button></div>}
        </div>)}
    </div>)
}
