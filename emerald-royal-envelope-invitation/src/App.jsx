import { useState, useEffect, useRef } from 'react'
import initialWedData from './data/weddata.json'

export default function App() {
  const [wedData] = useState(initialWedData)
  const [isOpen, setIsOpen] = useState(false)
  const [cur, setCur] = useState(0)

  // Photos loaded from public folder (defined in weddata.json) with fallback
  const defaultGroomPhoto = wedData.couple?.groom?.photo || '/grm.jpg'
  const defaultBridePhoto = wedData.couple?.bride?.photo || '/brd.jpg'

  const [groomPhoto, setGroomPhoto] = useState(defaultGroomPhoto)
  const [bridePhoto, setBridePhoto] = useState(defaultBridePhoto)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const audioControllerRef = useRef(null)

  const pagesCount = 8
  const { groom, bride, connector } = wedData.couple
  const groomName = groom.fullName || `${groom.prefix} ${groom.name}`
  const brideName = bride.fullName || `${bride.prefix} ${bride.name}`
  const dateLine = wedData.weddingDate.formatted
  const venueName = wedData.venue.name
  const venueLines = wedData.venue.lines || []
  const contactNumber = wedData.contact.phone
  const countryCode = wedData.contact.countryCode || '+91'
  const whatsappGreeting = wedData.contact.whatsappGreeting || `નમસ્તે ${wedData.meta?.branding?.name || 'AJ Invitation'}, ${groomName} ${connector} ${brideName}ના લગ્ન પ્રસંગે હાર્દિક શુભકામનાઓ!`

  // Update document title from weddata.json
  useEffect(() => {
    if (wedData.meta?.invitationTitle) {
      document.title = wedData.meta.invitationTitle
    }
  }, [wedData])

  // Load photos from localStorage if customized, else keep default from public folder
  useEffect(() => {
    try {
      const g = localStorage.getItem('wed_emerald_standalone_groom')
      if (g) setGroomPhoto(g)
      const b = localStorage.getItem('wed_emerald_standalone_bride')
      if (b) setBridePhoto(b)
    } catch (e) {}
  }, [])

  const handlePhotoUpload = (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const m = 700
        const sc = Math.min(1, m / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = img.width * sc
        canvas.height = img.height * sc
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        if (type === 'groom') {
          setGroomPhoto(dataUrl)
          try { localStorage.setItem('wed_emerald_standalone_groom', dataUrl) } catch (err) {}
        } else {
          setBridePhoto(dataUrl)
          try { localStorage.setItem('wed_emerald_standalone_bride', dataUrl) } catch (err) {}
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const openEnvelope = () => {
    setIsOpen(true)
  }

  const closeEnvelope = () => {
    setIsOpen(false)
    setCur(0)
  }

  const go = (n) => {
    setCur(Math.max(0, Math.min(pagesCount - 1, n)))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') openEnvelope()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        go(cur + 1)
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        go(cur - 1)
      }
      if (e.key === 'Home') go(0)
      if (e.key === 'End') go(pagesCount - 1)
      if (e.key === 'Escape') closeEnvelope()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, cur])

  // Scroll-based animation (Mouse Wheel / Trackpad turns pages)
  const lastWheelTime = useRef(0)
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isOpen) return
      const now = Date.now()
      if (now - lastWheelTime.current < 450) return
      if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
        if (delta > 0) {
          go(cur + 1)
          lastWheelTime.current = now
        } else if (delta < 0) {
          go(cur - 1)
          lastWheelTime.current = now
        }
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isOpen, cur, pagesCount])

  // Mobile Touch Swipe navigation
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (!isOpen || e.touches.length !== 1) return
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }
    const handleTouchEnd = (e) => {
      if (!isOpen || e.changedTouches.length !== 1) return
      const diffY = touchStartY.current - e.changedTouches[0].clientY
      const diffX = touchStartX.current - e.changedTouches[0].clientX
      const diff = Math.abs(diffY) > Math.abs(diffX) ? diffY : diffX
      if (Math.abs(diff) > 35) {
        if (diff > 0) {
          go(cur + 1)
        } else {
          go(cur - 1)
        }
      }
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, cur, pagesCount])

  // Auspicious Shehnai wedding melody synthesizer
  const toggleAudio = () => {
    if (isAudioPlaying) {
      if (audioControllerRef.current) {
        audioControllerRef.current.stop()
        audioControllerRef.current = null
      }
      setIsAudioPlaying(false)
    } else {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        if (ctx.state === 'suspended') ctx.resume()

        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25]
        let active = true
        let step = 0
        const melody = [
          { n: 2, d: 0.7 }, { n: 3, d: 0.6 }, { n: 4, d: 0.9 },
          { n: 3, d: 0.5 }, { n: 2, d: 0.6 }, { n: 0, d: 1.1 },
          { n: 2, d: 0.7 }, { n: 4, d: 0.8 }, { n: 5, d: 1.0 },
          { n: 4, d: 0.6 }, { n: 2, d: 0.7 }, { n: 1, d: 0.9 }
        ]

        const interval = setInterval(() => {
          if (!active) return
          const item = melody[step % melody.length]
          step++
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()

          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(notes[item.n], ctx.currentTime)

          // gentle vibrato to mimic shehnai reed
          const lfo = ctx.createOscillator()
          const lfoGain = ctx.createGain()
          lfo.frequency.value = 5.5
          lfoGain.gain.value = 7
          lfo.connect(osc.frequency)
          lfo.start()

          gain.gain.setValueAtTime(0, ctx.currentTime)
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.12)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + item.d)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start()
          osc.stop(ctx.currentTime + item.d)
          lfo.stop(ctx.currentTime + item.d)
        }, 700)

        audioControllerRef.current = {
          stop: () => {
            active = false
            clearInterval(interval)
            ctx.close()
          }
        }
        setIsAudioPlaying(true)
      } catch (err) {
        console.warn('Audio play restricted:', err)
      }
    }
  }

  const DividerSVG = (
    <svg className="div-svg" viewBox="0 0 190 20">
      <path d="M4 10C32 2 62 18 84 10" />
      <path d="M186 10C158 2 128 18 106 10" />
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="95"
            cy="4"
            rx="2.2"
            ry="5"
            transform={`rotate(${i * 45} 95 10)`}
          />
        ))}
      </g>
    </svg>
  )

  const BranchSVG = ({ className }) => (
    <svg className={`bot ${className}`} viewBox="0 0 120 130">
      <path className="st" d="M0 0Q70 10 20 125" />
      {Array.from({ length: 7 }, (_, k) => {
        const t = 0.12 + k * 0.13
        const u = 1 - t
        const x = u * u * 0 + 2 * u * t * 70 + t * t * 20
        const y = u * u * 0 + 2 * u * t * 10 + t * t * 125
        const side = k % 2 ? 1 : -1
        const ang = (k % 2 ? -35 : 35) + t * 40
        return (
          <path
            key={k}
            className={`lf ${k % 3 === 2 ? 'g' : ''}`}
            d="M0 0C6-9 18-9 25 0C18 9 6 9 0 0Z"
            transform={`translate(${x} ${y}) rotate(${ang + (side > 0 ? 0 : -80)}) scale(${1.1 - t * 0.4})`}
          />
        )
      })}
      <circle className="lf g" cx="20" cy="125" r="4" />
    </svg>
  )

  const renderBotanicals = () => (
    <>
      <BranchSVG className="tl" />
      <BranchSVG className="tr" />
      <BranchSVG className="bl" />
      <BranchSVG className="br" />
    </>
  )

  const fallingColors = ['#0f5a46', '#c79a35', '#e08a8f', '#2f8f6f']
  const petals = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 8) % 100}%`,
    dur: `${8 + (i % 5) * 2}s`,
    del: `-${(i * 1.5) % 12}s`,
    col: fallingColors[i % fallingColors.length],
  }))

  const {
    cover = {},
    sanskar = {},
    haldi = {},
    lagnotsav = {},
    premRaas = {},
    jaanPrasthan = {},
    family = {},
    invitation = {}
  } = wedData.pages || {}

  return (
    <div className="emerald-theme fixed inset-0 z-50 overflow-hidden font-['Hind_Vadodara',sans-serif] select-none">
      <style>{`
        .emerald-theme {
          --gold: #b8892b;
          --ink: #23382d;
          --h1: #0f5a46;
          --h2: #c79a35;
          --paper: #fbf5e6;
          --tint: #f3ecd4;
          background: radial-gradient(circle at 50% 40%, #0f4a3a, #041a14 75%);
        }
        .emerald-theme #stage {
          position: fixed; inset: 0; perspective: 1800px;
        }

        /* Envelope intro */
        .emerald-theme #env {
          position: fixed; inset: 0; z-index: 50; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 32px;
          background: radial-gradient(circle at 50% 40%, #0f4a3a, #041a14 75%);
          transition: opacity 1s ease .2s;
        }
        .emerald-theme #env.gone { opacity: 0; pointer-events: none; }
        .emerald-theme .env {
          position: relative; width: min(88vw, 390px); height: min(60vw, 260px); perspective: 900px;
        }
        .emerald-theme .env > * { position: absolute; left: 0; right: 0; }
        .emerald-theme .back { top: 0; bottom: 0; background: #7a1f33; border-radius: 10px; box-shadow: 0 30px 60px rgba(0,0,0,.6); }
        .emerald-theme .letter {
          left: 6%; right: 6%; top: 6%; height: 88%; background: #fbf5e6; border-radius: 6px;
          display: flex; align-items: flex-start; justify-content: center; padding-top: 18px;
          font-family: 'Noto Serif Gujarati', serif; font-weight: 800; font-size: 1.35rem; color: #7a1f33;
          transition: transform 1.2s cubic-bezier(.5,0,.2,1) 0.8s; border: 2px solid var(--gold);
        }
        .emerald-theme .front {
          top: 0; bottom: 0; background: linear-gradient(135deg, #8e2840, #6a1829);
          clip-path: polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%); border-radius: 10px;
        }
        .emerald-theme .flap {
          top: 0; height: 58%; background: linear-gradient(#a03550, #7a1f33);
          clip-path: polygon(0 0, 100% 0, 50% 100%); transform-origin: top;
          transition: transform .9s ease, z-index 0s .45s; z-index: 4;
        }
        .emerald-theme .seal {
          position: absolute; left: 50%; top: 44%; width: 66px; height: 66px; margin: -8px 0 0 -33px;
          z-index: 6; border: none; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #f5d98b, #b8892b 60%, #7d5a14);
          color: #5a0f22; font-size: 1.7rem; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.5);
          animation: epulse 1.6s ease-in-out infinite; transition: opacity .4s;
          display: flex; align-items: center; justify-content: center;
        }
        @keyframes epulse { 50% { transform: scale(1.14); box-shadow: 0 0 30px rgba(245,217,139,.95); } }
        .emerald-theme #env.open .seal { opacity: 0; pointer-events: none; }
        .emerald-theme #env.open .flap { transform: rotateX(180deg); z-index: 1; }
        .emerald-theme #env.open .letter { transform: translateY(-64%) scale(1.06); }
        .emerald-theme #env p { font-family: 'Noto Serif Gujarati', serif; color: #f5d98b; font-size: 1rem; }

        /* Book pages */
        .emerald-theme .page {
          --ink: #23382d; --h1: #0f5a46; --h2: #c79a35; --paper: #fbf5e6; --tint: #f3ecd4;
          position: absolute; inset: 0; display: flex; overflow-y: auto; padding: 42px 14px 84px; color: var(--ink);
          background: radial-gradient(circle at 50% 0, var(--tint), transparent 70%), var(--paper);
          transform-origin: left center; backface-visibility: hidden; opacity: 0; pointer-events: none;
          transition: transform 1.1s cubic-bezier(.6,.05,.2,1), opacity .9s ease;
          box-shadow: inset 0 0 90px rgba(120,90,30,.14);
        }
        .emerald-theme .page.before { transform: rotateY(-105deg); }
        .emerald-theme .page.after { transform: translateX(7%) scale(.96); }
        .emerald-theme .page.active { transform: none; opacity: 1; pointer-events: auto; z-index: 2; }

        .emerald-theme .p2 { --paper: #eef6ec; --tint: #d9ecd6; }
        .emerald-theme .p3 { --paper: #fdf1d2; --tint: #f8dd96; }
        .emerald-theme .p4 { --paper: #e8f3f1; --tint: #c4e3de; }
        .emerald-theme .p5 { --ink: #f5ecd2; --h1: #f5d98b; --h2: #fff3c0; --paper: #0b2a24; --tint: #17483c; }
        .emerald-theme .p6 { --paper: #f1f6e4; --tint: #dbe8b4; }
        .emerald-theme .p7 { --paper: #fbece4; --tint: #f2cdb8; }
        .emerald-theme .p8 { --paper: #f9eaee; --tint: #efc3cf; }

        .emerald-theme .page::before {
          content: ""; position: absolute; inset: 12px; border: 1px solid var(--gold); pointer-events: none; z-index: 1; border-radius: 6px;
        }
        .emerald-theme .page::after {
          content: ""; position: absolute; inset: 18px; border: 3px double rgba(184,137,43,.55); pointer-events: none; z-index: 1; border-radius: 4px;
        }
        .emerald-theme .arch {
          position: relative; z-index: 3; width: min(92vw, 420px); margin: auto; padding: 20px 14px; text-align: center;
        }

        .emerald-theme h2, .emerald-theme h3, .emerald-theme .names, .emerald-theme .hl, .emerald-theme .pw b {
          background: linear-gradient(100deg, var(--h1) 25%, var(--h2) 50%, var(--h1) 75%);
          background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: foil 6s linear infinite; font-family: 'Noto Serif Gujarati', serif;
        }
        @keyframes foil { to { background-position: -250% 0; } }
        .emerald-theme h2 { font-weight: 800; font-size: 1.95rem; line-height: 1.4; }
        .emerald-theme h3 { font-weight: 600; font-size: 1.15rem; margin: 12px 0 2px; }
        .emerald-theme .names { font-weight: 800; font-size: 2rem; line-height: 1.35; }
        .emerald-theme .sang { display: block; font-size: 1rem; color: var(--ink); -webkit-text-fill-color: var(--ink); font-family: 'Noto Serif Gujarati', serif; }
        .emerald-theme .hl { font-weight: 700; display: inline-block; }
        .emerald-theme .shloka, .emerald-theme .small, .emerald-theme li { font-family: 'Noto Serif Gujarati', serif; }
        .emerald-theme .shloka { font-size: .92rem; }
        .emerald-theme .small { font-size: .9rem; }
        .emerald-theme li { font-size: .92rem; }

        .emerald-theme .div-svg { display: block; width: 190px; height: 20px; margin: 6px auto 10px; overflow: visible; }
        .emerald-theme .div-svg path { stroke: var(--gold); fill: none; stroke-width: 1.5; stroke-linecap: round; }
        .emerald-theme .div-svg g { fill: var(--gold); transform-origin: 95px 10px; animation: spin 9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .emerald-theme .ganesh { display: block; font-size: 2.2rem; color: var(--gold); animation: sway 4s ease-in-out infinite; }
        @keyframes sway { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

        .emerald-theme .bot { position: absolute; width: min(34vw, 140px); z-index: 2; pointer-events: none; overflow: visible; }
        .emerald-theme .bot.tl { top: 12px; left: 12px; }
        .emerald-theme .bot.tr { top: 12px; right: 12px; transform: scaleX(-1); }
        .emerald-theme .bot.bl { bottom: 12px; left: 12px; transform: scaleY(-1); }
        .emerald-theme .bot.br { bottom: 12px; right: 12px; transform: scale(-1); }
        .emerald-theme .bot .st { fill: none; stroke: var(--h1); stroke-width: 1.6; stroke-linecap: round; }
        .emerald-theme .bot .lf { fill: var(--h1); opacity: .85; }
        .emerald-theme .bot .lf.g { fill: var(--gold); }

        .emerald-theme .couple { display: flex; justify-content: center; gap: 8px; margin: 6px 0 4px; }
        .emerald-theme .pw { flex: 1; max-width: 130px; }
        .emerald-theme .pw b { display: block; font-weight: 800; font-size: 1rem; margin-top: 7px; }
        .emerald-theme .amp { align-self: center; font-family: 'Noto Serif Gujarati', serif; font-size: .95rem; padding-bottom: 22px; }
        .emerald-theme .amp::before { content: "♥"; display: block; color: #c8374f; font-size: 1.25rem; animation: beat 1.6s infinite; }
        @keyframes beat { 50% { transform: scale(1.25); } }

        .emerald-theme .ph {
          position: relative; display: block; width: 100%; aspect-ratio: 3/4; cursor: pointer;
          border-radius: 65px 65px 6px 6px; overflow: hidden; border: 3px solid var(--gold);
          background: linear-gradient(160deg, #e8dcb4, #cdbb82);
          box-shadow: 0 0 0 4px var(--paper), 0 0 0 5px var(--gold), 0 10px 24px rgba(80,60,10,.3);
        }
        .emerald-theme .ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: ken 14s ease-in-out infinite alternate; }
        @keyframes ken { to { transform: scale(1.12); } }
        .emerald-theme .add { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 1.6rem; line-height: 1.3; color: var(--h1); }

        .emerald-theme .fx { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .emerald-theme .fx i {
          position: absolute; top: -6%; width: 11px; height: 15px; border-radius: 0 100% 0 100%;
          opacity: .7; animation: emeraldFall linear infinite;
        }
        @keyframes emeraldFall { to { transform: translate(50px, 115vh) rotate(500deg); } }
      `}</style>

      {/* Envelope Intro Screen */}
      <div id="env" className={isOpen ? 'open gone' : ''}>
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <img src={wedData.meta?.branding?.logo || '/aj-logo.png'} alt="Brand Logo" className="h-9 w-9 object-contain rounded-full shadow" />
            <span className="font-['Cinzel',serif] tracking-widest text-[#f5d98b] text-sm font-bold">
              {wedData.meta?.branding?.name || 'AJ INVITATION'}
            </span>
          </div>
          <p className="text-xs text-[#a3d9c9] tracking-wide">
            {groomName} {connector} {brideName}
          </p>
        </div>

        <div className="env">
          <div className="back"></div>
          <div className="letter">{cover.title || 'શુભ વિવાહ'} કંકોતરી</div>
          <div className="front"></div>
          <div className="flap"></div>
          <button className="seal" onClick={openEnvelope} aria-label="Open wedding invitation envelope">
            ♥
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="animate-bounce">✨ Click to Open</p>
          <button
            onClick={openEnvelope}
            className="rounded-full border border-[var(--gold)] bg-[#b8892b]/20 hover:bg-[#b8892b] hover:text-[#041a14] px-6 py-2 text-xs font-bold text-[#f5d98b] transition shadow backdrop-blur"
          >
            Open Invitation →
          </button>
        </div>
      </div>

      {/* Top Header Bar when opened */}
      <header className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-[#041a14]/85 backdrop-blur-md border-b border-[rgba(184,137,43,0.3)] transition-opacity duration-700 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-2.5">
          <img src={wedData.meta?.branding?.logo || '/aj-logo.png'} alt="Brand Logo" className="h-8 w-8 object-contain rounded-full shadow" />
          <div>
            <h1 className="text-xs font-black tracking-widest text-[#f5d98b] uppercase font-['Cinzel',serif]">
              {wedData.meta?.branding?.name || 'AJ INVITATION'}
            </h1>
            <p className="text-[10px] text-[#a3d9c9] truncate max-w-[190px] sm:max-w-none">
              {groomName} {connector} {brideName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow ${
              isAudioPlaying
                ? 'bg-amber-500 text-stone-900 animate-pulse'
                : 'bg-[#0f4a3a] text-[#f5d98b] border border-[#b8892b]/60 hover:bg-[#165f4b]'
            }`}
          >
            <span>{isAudioPlaying ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">
              {isAudioPlaying
                ? (wedData.meta?.audio?.playingText || 'સંગીત ચાલુ')
                : (wedData.meta?.audio?.playText || 'સંગીત વગાડો')}
            </span>
          </button>

          {/* Re-close Envelope */}
          <button
            onClick={closeEnvelope}
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#0f4a3a] text-[#f5d98b] border border-[#b8892b]/40 hover:bg-[#165f4b] transition flex items-center gap-1"
            title="એન્વેલપ બંધ કરો"
          >
            <span>✉️</span>
            <span className="hidden sm:inline">કવર બંધ કરો</span>
          </button>
        </div>
      </header>

      {/* 3D Book Stage */}
      <div id="stage">
        {/* Page 1 : કવર */}
        <section className={`page p1 ${cur === 0 ? 'active' : cur > 0 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            <span className="ganesh">{cover.ganeshSymbol || 'ॐ'}</span>
            {cover.shloka && (
              <p className="shloka whitespace-pre-line">{cover.shloka}</p>
            )}
            <h2 className="mt-2">{cover.title || 'શુભ વિવાહ'}</h2>
            <div className="couple">
              <div className="pw">
                <label className="ph">
                  {groomPhoto ? <img alt={groomName} src={groomPhoto} /> : (
                    <span className="add">📷<small className="text-[0.68rem]">વરરાજા ફોટો</small></span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'groom')} />
                </label>
                <b>{groomName}</b>
              </div>
              <div className="amp">{connector}</div>
              <div className="pw">
                <label className="ph">
                  {bridePhoto ? <img alt={brideName} src={bridePhoto} /> : (
                    <span className="add">📷<small className="text-[0.68rem]">કન્યા ફોટો</small></span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'bride')} />
                </label>
                <b>{brideName}</b>
              </div>
            </div>
            <p className="hl mt-2">{dateLine}</p>
            {cover.inviter && (
              <>
                <h3>{cover.inviter.title || 'નિમંત્રક'}</h3>
                <div className="small space-y-0.5">
                  {(cover.inviter.lines || []).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </>
            )}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#b8892b] animate-pulse">
              <span>📖</span>
              <span>{cover.scrollHint || 'નીચે સ્ક્રોલ કરો ⌄'}</span>
            </div>
          </div>
        </section>

        {/* Page 2 : વિવાહ સંસ્કાર */}
        <section className={`page p2 ${cur === 1 ? 'active' : cur > 1 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            {sanskar.topInvocation && (
              <span className="text-sm font-bold text-[var(--gold)]">{sanskar.topInvocation}</span>
            )}
            <h2 className="mt-2">{sanskar.title || 'વિવાહ સંસ્કાર'}</h2>
            {DividerSVG}
            {sanskar.intro && (
              <p className="small mt-2">{sanskar.intro}</p>
            )}
            <div className="names my-3 text-[1.85rem]">
              {groomName}<span className="sang">{connector}</span>{brideName}
            </div>
            {sanskar.blessing && (
              <p className="small">{sanskar.blessing}</p>
            )}
            {sanskar.shloka && (
              <p className="hl mt-3 text-sm whitespace-pre-line">{sanskar.shloka}</p>
            )}
          </div>
        </section>

        {/* Page 3 : હલ્દી રસમ */}
        <section className={`page p3 ${cur === 2 ? 'active' : cur > 2 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            <h2>{haldi.title || 'હલ્દી રસમ'}</h2>
            {DividerSVG}
            {haldi.ceremony && (
              <>
                <h3 className="mt-1">{haldi.ceremony.title}</h3>
                <p className="small mt-1">
                  {haldi.ceremony.dayText}<br />
                  {haldi.ceremony.invitationText}
                </p>
              </>
            )}
            {haldi.meal && (
              <>
                <h3>{haldi.meal.title}</h3>
                <p className="hl text-amber-800 mt-1">{haldi.meal.timing}</p>
              </>
            )}
            <h3>{haldi.venue?.title || 'શુભ સ્થળ'}</h3>
            <p className="mt-1 font-semibold">{venueName},<br />{venueLines.join(', ')}</p>
          </div>
        </section>

        {/* Page 4 : લગ્નોત્સવ */}
        <section className={`page p4 ${cur === 3 ? 'active' : cur > 3 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            <h2>{lagnotsav.title || 'લગ્નોત્સવ'}</h2>
            {DividerSVG}
            {lagnotsav.quote && (
              <p className="small whitespace-pre-line">{lagnotsav.quote}</p>
            )}
            {(lagnotsav.events || []).map((ev, idx) => (
              <div key={idx}>
                <h3>{ev.title}</h3>
                <p className="mt-1">
                  {ev.date}<br />
                  <span className="hl">{ev.timeHighlight}</span><br />
                  {ev.venue}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Page 5 : પ્રેમ રાસ */}
        <section className={`page p5 ${cur === 4 ? 'active' : cur > 4 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            <h2>{premRaas.title || 'પ્રેમ રાસ'}</h2>
            {DividerSVG}
            {premRaas.meal && (
              <>
                <h3>{premRaas.meal.title}</h3>
                <p className="mt-1">
                  {premRaas.meal.date}<br />
                  {premRaas.meal.note}<br />
                  <span className="hl text-amber-300">{premRaas.meal.timing}</span>
                </p>
              </>
            )}
            {premRaas.garba && (
              <>
                <h3>{premRaas.garba.title}</h3>
                <p className="mt-1">
                  {premRaas.garba.timePrefix} <span className="hl text-amber-300">{premRaas.garba.timeHighlight}</span>
                </p>
              </>
            )}
            <h3>શુભ સ્થળ</h3>
            <p className="mt-1 text-[#f5ecd2]">{venueName},<br />{venueLines.join(', ')}</p>
          </div>
        </section>

        {/* Page 6 : જાન પ્રસ્થાન */}
        <section className={`page p6 ${cur === 5 ? 'active' : cur > 5 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            {jaanPrasthan.departure && (
              <>
                <h3 className="mt-0">{jaanPrasthan.departure.title}</h3>
                <p className="mt-1">
                  {jaanPrasthan.departure.date}<br />
                  {jaanPrasthan.departure.timePrefix} <span className="hl">{jaanPrasthan.departure.timeHighlight}</span><br />
                  {jaanPrasthan.departure.location}
                </p>
              </>
            )}
            {jaanPrasthan.hastMelap && (
              <>
                <h3>{jaanPrasthan.hastMelap.title}</h3>
                <p className="mt-1">
                  {jaanPrasthan.hastMelap.date}<br />
                  {jaanPrasthan.hastMelap.timePrefix} <span className="hl">{jaanPrasthan.hastMelap.timeHighlight}</span>
                </p>
              </>
            )}
            {jaanPrasthan.note && (
              <>
                <h3>{jaanPrasthan.note.title}</h3>
                <p className="small mt-2">{jaanPrasthan.note.text}</p>
                <p className="small hl mt-2">{jaanPrasthan.note.signoff}</p>
              </>
            )}
          </div>
        </section>

        {/* Page 7 : સ્નેહાધીન & દર્શનાભિલાષી */}
        <section className={`page p7 ${cur === 6 ? 'active' : cur > 6 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            {family.snehadhin && (
              <>
                <h2 className="text-[1.4rem]">{family.snehadhin.title}</h2>
                <ul className="list-none space-y-1 my-2">
                  {(family.snehadhin.members || []).map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </>
            )}
            {family.darshanabhilashi && (
              <>
                <h2 className="text-[1.4rem] mt-3">{family.darshanabhilashi.title}</h2>
                <ul className="list-none space-y-1 my-2">
                  {(family.darshanabhilashi.members || []).map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Page 8 : મોસાળ / આમંત્રણ */}
        <section className={`page p8 ${cur === 7 ? 'active' : cur > 7 ? 'before' : 'after'}`}>
          {renderBotanicals()}
          <div className="fx">
            {petals.map((p) => (
              <i key={p.id} style={{ left: p.left, background: p.col, animationDuration: p.dur, animationDelay: p.del }} />
            ))}
          </div>
          <div className="arch">
            {invitation.mosal && (
              <>
                <h3 className="mt-0">{invitation.mosal.title}</h3>
                <p className="small">{invitation.mosal.text}</p>
              </>
            )}
            {invitation.banej && (
              <>
                <h3>{invitation.banej.title}</h3>
                <p className="small">{invitation.banej.text}</p>
              </>
            )}
            {invitation.firm && (
              <>
                <h3>{invitation.firm.title}</h3>
                <p className="small">{invitation.firm.text}</p>
              </>
            )}
            {invitation.invitationMessage && (
              <>
                <h3>{invitation.invitationMessage.title}</h3>
                <p className="small">{invitation.invitationMessage.template}</p>
              </>
            )}
            <p className="hl mt-1.5 text-xs">સ્થળ : {venueName}, {wedData.venue.city || 'જૂનાગઢ'}</p>

            {/* Interactive Venue Route & WhatsApp RSVP */}
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(venueName + ', ' + venueLines.join(', '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--gold)] bg-[rgba(184,137,43,.18)] px-4 py-2 text-xs font-bold text-[#23382d] hover:bg-[var(--gold)] hover:text-white transition shadow"
              >
                <span>📍</span>
                <span>{invitation.actions?.mapText || 'ગૂગલ મેપ પર લોકેશન જુઓ'}</span>
              </a>
              <a
                href={`https://wa.me/${countryCode.replace('+', '')}${contactNumber}?text=${encodeURIComponent(whatsappGreeting)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition"
              >
                <span>💬</span>
                <span>{invitation.actions?.whatsappText || 'વોટ્સએપ પર શુભેચ્છા પાઠવો (RSVP)'}</span>
              </a>
              {invitation.actions?.callPrefix && (
                <a
                  href={`tel:${countryCode}${contactNumber}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-800 bg-white/70 hover:bg-white px-4 py-1.5 text-xs font-semibold text-emerald-950 shadow-sm transition"
                >
                  <span>📞</span>
                  <span>{invitation.actions.callPrefix} {contactNumber}</span>
                </a>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Nav Dots & Buttons */}
      <footer className={`fixed inset-x-0 bottom-5 z-40 flex items-center justify-center gap-3 px-4 transition-opacity duration-700 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => go(cur - 1)}
          disabled={cur === 0}
          aria-label="previous page"
          className="h-10 w-10 rounded-full border border-[var(--gold)] bg-[#fbf5e6]/95 text-xl font-bold text-[#0f5a46] shadow-lg transition disabled:opacity-35 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
        >
          ‹
        </button>
        <div className="flex items-center gap-2 bg-[#041a14]/80 px-3.5 py-2 rounded-full border border-[rgba(184,137,43,.35)] backdrop-blur shadow-lg">
          {Array.from({ length: pagesCount }, (_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === cur ? 'w-5 bg-[var(--gold)]' : 'w-2 bg-[var(--gold)]/40 hover:bg-[var(--gold)]/80'}`}
            />
          ))}
          <span className="text-[11px] font-bold text-[#f5d98b] ml-1.5 tracking-wider">
            {cur + 1}/{pagesCount}
          </span>
        </div>
        <button
          onClick={() => go(cur + 1)}
          disabled={cur === pagesCount - 1}
          aria-label="next page"
          className="h-10 w-10 rounded-full border border-[var(--gold)] bg-[#fbf5e6]/95 text-xl font-bold text-[#0f5a46] shadow-lg transition disabled:opacity-35 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
        >
          ›
        </button>
      </footer>
    </div>
  )
}
