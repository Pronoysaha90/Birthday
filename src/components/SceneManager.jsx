import React, { useRef, useState } from 'react'
import CandleCountdown from './CandleCountdown'
import BirthdayCard from './BirthdayCard'

export default function SceneManager() {
  const [currentScene, setCurrentScene] = useState('candle')
  const [isPlayingSong, setIsPlayingSong] = useState(false)
  const ytPlayerRef = useRef()

  // Start YouTube song immediately
  const startSong = () => {
    setIsPlayingSong(true)
    const yt = ytPlayerRef.current
    if (yt && yt.contentWindow) {
      yt.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
    }
  }

  // Toggle song play/pause
  const toggleSong = () => {
    const yt = ytPlayerRef.current
    if (isPlayingSong) {
      setIsPlayingSong(false)
      if (yt && yt.contentWindow) {
        yt.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
      }
    } else {
      setIsPlayingSong(true)
      if (yt && yt.contentWindow) {
        yt.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
      }
    }
  }

  // When candle countdown finishes, transition to card and IMMEDIATELY play the song
  const handleCandleComplete = () => {
    setCurrentScene('card')
    startSong()
  }

  const handleReplayCandle = () => {
    // Pause song when replaying candle countdown
    setIsPlayingSong(false)
    const yt = ytPlayerRef.current
    if (yt && yt.contentWindow) {
      yt.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
    }
    setCurrentScene('candle')
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      {/* ── Preloaded YouTube Player: Buffers in background during countdown for 0ms delay playback ── */}
      <div
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          opacity: 0.001,
          pointerEvents: 'none',
        }}
      >
        <iframe
          ref={ytPlayerRef}
          id="yt-music-player"
          title="Nakash Aziz - I Wish U Happy Happy Birthday"
          width="100"
          height="100"
          src="https://www.youtube-nocookie.com/embed/uxhZMF6dvPM?enablejsapi=1&autoplay=0&loop=1&playlist=uxhZMF6dvPM"
          allow="autoplay; encrypted-media"
        />
      </div>

      {currentScene === 'candle' ? (
        <CandleCountdown onComplete={handleCandleComplete} />
      ) : (
        <BirthdayCard
          onReplayCandle={handleReplayCandle}
          isMusicPlaying={isPlayingSong}
          onToggleMusic={toggleSong}
        />
      )}
    </div>
  )
}
