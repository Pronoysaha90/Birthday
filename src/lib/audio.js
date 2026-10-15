import { content } from '../data/content'
import userBirthdaySong from '../img/I Wish U Happy Happy Birthday.mp3'

let bgm = null
let sfxOn = true
let ctx = null
let isPlaying = false

function getAudio() {
  if (typeof document !== 'undefined') {
    const el = document.getElementById('bgm-audio')
    if (el) return el
  }
  if (!bgm && typeof window !== 'undefined') {
    const initialSrc = '/audio/birthday-song.wav'
    bgm = new Audio(initialSrc)
    bgm.loop = true
    bgm.volume = 0.85
    bgm.preload = 'auto'
  }
  return bgm
}

export const music = {
  start() {
    isPlaying = true
    const a = getAudio()
    if (!a) return Promise.reject(new Error('No audio element'))

    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
      if (ctx.state === 'suspended') ctx.resume()
    } catch { /* ignore */ }

    a.volume = 0.85
    const playPromise = a.play()
    if (playPromise !== undefined) {
      return playPromise.catch((err) => {
        console.warn('Primary audio play blocked or error, retrying directly with wav:', err)
        a.src = '/audio/birthday-song.wav'
        a.load()
        return a.play().catch(e => console.warn('Audio retry failed:', e))
      })
    }
    return Promise.resolve()
  },
  pause() {
    isPlaying = false
    const a = getAudio()
    if (a) a.pause()
  },
  get playing() {
    const a = getAudio()
    return isPlaying && (a ? !a.paused : false)
  },
  setVolume(v) {
    const a = getAudio()
    if (a) a.volume = v
  },
  setMuted(m) {
    const a = getAudio()
    if (a) a.muted = m
  },
}

export const setSfx = (v) => { sfxOn = v }

export function sfx(type = 'pop') {
  if (!sfxOn) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    const t = ctx.currentTime
    const f = { pop: 540, whoosh: 260, chime: 880, cut: 200, sparkle: 1100 }[type] || 520
    o.frequency.setValueAtTime(f, t)
    o.frequency.exponentialRampToValueAtTime(f * 1.8, t + 0.15)
    g.gain.setValueAtTime(0.08, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
    o.connect(g).connect(ctx.destination)
    o.start(t)
    o.stop(t + 0.3)
  } catch { /* ignore */ }
}

// Procedural music box chime player as reliable fallback
function startProceduralMusicBox() {
  if (synthTimer) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  } catch { return }

  const freqs = [
    392, 392, 440, 392, 523, 493.88,
    392, 392, 440, 392, 587.33, 523,
    392, 392, 783.99, 659.25, 523, 493.88, 440,
    698.46, 698.46, 659.25, 523, 587.33, 523
  ]
  const times = [
    0.6, 0.3, 0.8, 0.8, 0.8, 1.6,
    0.6, 0.3, 0.8, 0.8, 0.8, 1.6,
    0.6, 0.3, 0.8, 0.8, 0.8, 0.8, 1.6,
    0.6, 0.3, 0.8, 0.8, 0.8, 2.2
  ]

  let step = 0
  function playNext() {
    if (!isPlaying) return
    const f = freqs[step]
    const dur = times[step]
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(f * 2, now)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 1.5)

      osc.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc2.start(now)
      osc.stop(now + dur * 1.5)
      osc2.stop(now + dur * 1.5)
    } catch { /* ignore */ }

    step = (step + 1) % freqs.length
    synthTimer = setTimeout(playNext, dur * 1000)
  }
  playNext()
}

function stopProceduralMusicBox() {
  if (synthTimer) {
    clearTimeout(synthTimer)
    synthTimer = null
  }
}
