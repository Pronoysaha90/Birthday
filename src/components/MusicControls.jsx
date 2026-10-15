import { useState } from 'react'
import { music, setSfx } from '../lib/audio'

export default function MusicControls() {
  const [playing, setPlaying] = useState(music.playing)
  const [muted, setMuted] = useState(false)
  const [vol, setVol] = useState(0.5)
  const [fx, setFx] = useState(true)
  const b = 'icon glass'
  return (
    <div className="fixed top-3 right-3 z-30 flex items-center gap-2 glass p-1.5" role="group" aria-label="Audio controls">
      <button className={b} aria-label={playing ? 'Pause music' : 'Play music'} onClick={() => { playing ? music.pause() : music.start(); setPlaying(!playing) }}>{playing ? '❚❚' : '▶'}</button>
      <button className={b} aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => { music.setMuted(!muted); setMuted(!muted) }}>{muted ? '🔇' : '🔊'}</button>
      <input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={vol} className="w-16 sm:w-24 accent-pink-300"
        onChange={(e) => { setVol(+e.target.value); music.setVolume(+e.target.value) }} />
      <button className={b} aria-label={fx ? 'Turn sound effects off' : 'Turn sound effects on'} aria-pressed={fx} onClick={() => { setSfx(!fx); setFx(!fx) }}>{fx ? '✨' : '∅'}</button>
    </div>)
}
