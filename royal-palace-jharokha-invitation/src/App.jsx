import { useState, useEffect, useRef } from 'react'
import {
  loadWeddingData,
  saveWeddingData,
  resetWeddingData,
} from './utils/dataManager'
import { generateWeddingPDF } from './utils/pdfExport'
import DataManagerModal from './components/DataManagerModal'
import { PrintablePages } from './components/PrintablePages'

export default function App() {
  const [weddingData, setWeddingData] = useState(() => loadWeddingData())
  const defaultGroom = weddingData.couple?.groom?.photo || '/grm.jpg'
  const defaultBride = weddingData.couple?.bride?.photo || '/brd.jpg'
  const [groomPhoto, setGroomPhoto] = useState(defaultGroom)
  const [bridePhoto, setBridePhoto] = useState(defaultBride)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [activePageIndex, setActivePageIndex] = useState(0)

  // PDF Export and Data Management state
  const [isDataModalOpen, setIsDataModalOpen] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 8, message: '' })
  const [exportSuccessMessage, setExportSuccessMessage] = useState('')

  const containerRef = useRef(null)
  const audioControllerRef = useRef(null)
  const printableRef = useRef(null)

  const pagesCount = 8

  // Centralized values extracted from weddingData
  const groomName = weddingData.couple?.groom?.fullName || 'ચિ. દર્શન'
  const brideName = weddingData.couple?.bride?.fullName || 'ચિ. ઈશિતા'
  const dateLine = weddingData.weddingDate?.formatted || 'તા. ૧૩-૦૨-૨૦૨૫, ગુરુવાર'
  const venueName = weddingData.venue?.name || 'નીલકંઠ ફાર્મ પાર્ટી પ્લોટ'
  const venueLines = weddingData.venue?.lines || ['જૂનાગઢ બાયપાસ રોડ', 'કાંકરડા ચોકડી, જૂનાગઢ.']
  const contactNumber = weddingData.contact?.phone || '9687336426'

  // Page specific data objects
  const p1 = weddingData.pages?.cover || {}
  const p2 = weddingData.pages?.sanskar || {}
  const p3 = weddingData.pages?.haldi || {}
  const p4 = weddingData.pages?.lagnotsav || {}
  const p5 = weddingData.pages?.premRaas || {}
  const p6 = weddingData.pages?.jaanPrasthan || {}
  const p7 = weddingData.pages?.family || {}
  const p8 = weddingData.pages?.invitation || {}

  // Load photos from public folder / localStorage
  useEffect(() => {
    try {
      const synced = localStorage.getItem('wed_royal_photos_synced_v2')
      if (!synced) {
        localStorage.removeItem('wed_royal_groom_photo')
        localStorage.removeItem('wed_royal_bride_photo')
        localStorage.setItem('wed_royal_photos_synced_v2', 'true')
        setGroomPhoto(weddingData.couple?.groom?.photo || '/grm.jpg')
        setBridePhoto(weddingData.couple?.bride?.photo || '/brd.jpg')
        return
      }
      const g = localStorage.getItem('wed_royal_groom_photo')
      setGroomPhoto(g || weddingData.couple?.groom?.photo || '/grm.jpg')
      const b = localStorage.getItem('wed_royal_bride_photo')
      setBridePhoto(b || weddingData.couple?.bride?.photo || '/brd.jpg')
    } catch (e) {
      setGroomPhoto(weddingData.couple?.groom?.photo || '/grm.jpg')
      setBridePhoto(weddingData.couple?.bride?.photo || '/brd.jpg')
    }
  }, [weddingData.couple?.groom?.photo, weddingData.couple?.bride?.photo])

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
          try { localStorage.setItem('wed_royal_groom_photo', dataUrl) } catch (err) { }
        } else {
          setBridePhoto(dataUrl)
          try { localStorage.setItem('wed_royal_bride_photo', dataUrl) } catch (err) { }
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  // Intersection observer for animating cards as user scrolls vertically
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            const idx = parseInt(e.target.getAttribute('data-idx') || '0', 10)
            setActivePageIndex(idx)
          }
        })
      },
      { threshold: 0.3 }
    )
    const pages = containerRef.current?.querySelectorAll('.page')
    pages?.forEach((p) => io.observe(p))
    return () => io.disconnect()
  }, [])

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
          if (!active || ctx.state === 'suspended') return
          const m = melody[step % melody.length]
          step++

          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          const filter = ctx.createBiquadFilter()

          osc.type = 'triangle'
          osc.frequency.setValueAtTime(notes[m.n % notes.length], ctx.currentTime)

          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(1250, ctx.currentTime)

          gain.gain.setValueAtTime(0.001, ctx.currentTime)
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + m.d)

          osc.connect(filter)
          filter.connect(gain)
          gain.connect(ctx.destination)

          osc.start(ctx.currentTime)
          osc.stop(ctx.currentTime + m.d + 0.05)
        }, 750)

        audioControllerRef.current = {
          stop: () => {
            active = false
            clearInterval(interval)
            try { ctx.close() } catch (e) { }
          }
        }
        setIsAudioPlaying(true)
      } catch (err) {
        console.error('Audio init error', err)
      }
    }
  }

  const scrollToPage = (idx) => {
    const page = containerRef.current?.querySelector(`[data-idx="${idx}"]`)
    if (page) {
      page.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Save updated data from Modal
  const handleSaveData = (newData) => {
    setWeddingData(newData)
    saveWeddingData(newData)
    if (newData.couple?.groom?.photo) {
      setGroomPhoto(newData.couple.groom.photo)
      try { localStorage.setItem('wed_royal_groom_photo', newData.couple.groom.photo) } catch (e) { }
    }
    if (newData.couple?.bride?.photo) {
      setBridePhoto(newData.couple.bride.photo)
      try { localStorage.setItem('wed_royal_bride_photo', newData.couple.bride.photo) } catch (e) { }
    }
  }

  // Reset to original JSON data
  const handleResetData = () => {
    const def = resetWeddingData()
    setWeddingData(def)
    try {
      localStorage.removeItem('wed_royal_groom_photo')
      localStorage.removeItem('wed_royal_bride_photo')
    } catch (e) { }
    setGroomPhoto(def.couple?.groom?.photo || '/grm.jpg')
    setBridePhoto(def.couple?.bride?.photo || '/brd.jpg')
  }

  // One-Click PDF Export Handler
  const handleDownloadPDF = async () => {
    if (isExportingPDF) return
    setIsExportingPDF(true)
    setExportSuccessMessage('')
    setExportProgress({ current: 0, total: pagesCount, message: 'પીડીએફ જનરેટ થઈ રહી છે...' })

    try {
      const pageElements = Array.from(
        printableRef.current?.querySelectorAll('.pdf-page-card') || []
      )

      if (pageElements.length === 0) {
        throw new Error('પેજ એલિમેન્ટ્સ ઉપલબ્ધ નથી')
      }

      // Safe, cross-platform ASCII filename to prevent browser tab character corruption
      const fileName = 'Lagna_Kankotri_Darshan_Ishita.pdf'

      await generateWeddingPDF({
        pageElements,
        fileName,
        onProgress: (current, total, message) => {
          setExportProgress({ current, total, message })
        },
      })

      setExportSuccessMessage('કંકોતરી પીડીએફ સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ!')
      setTimeout(() => {
        setIsExportingPDF(false)
        setExportSuccessMessage('')
      }, 2000)
    } catch (err) {
      console.error('PDF Export Error:', err)
      alert(`પીડીએફ એક્સપોર્ટ કરવામાં ક્ષતિ: ${err.message}`)
      setIsExportingPDF(false)
    }
  }

  // Floating gold dust
  const dustList = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 13 + 5) % 100}%`,
    dur: `${7 + (i % 6) * 1.5}s`,
    del: `-${(i * 1.8) % 12}s`,
  }))

  const CrestSVG = (
    <div className="crest">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#5a0f22" stroke="#e6bd5c" strokeWidth="3" />
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="26"
            rx="8"
            ry="22"
            transform={`rotate(${i * 45} 50 50)`}
            fill="#e6bd5c"
          />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="30"
            rx="5"
            ry="13"
            transform={`rotate(${i * 45 + 22.5} 50 50)`}
            fill="#fff0b8"
          />
        ))}
        <circle cx="50" cy="50" r="9" fill="#fff0b8" />
      </svg>
    </div>
  )

  const RangoliSVG = (
    <svg className="rangoli" viewBox="0 0 100 100" fill="none" stroke="#fff0b8" strokeWidth="0.3">
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="22"
          rx="6"
          ry="30"
          transform={`rotate(${(i * 360) / 16} 50 50)`}
          stroke="#fff0b8"
          strokeWidth="0.3"
        />
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="10"
          rx="3"
          ry="12"
          transform={`rotate(${(i * 360) / 24} 50 50)`}
          stroke="#fff0b8"
          strokeWidth="0.3"
        />
      ))}
      <circle cx="50" cy="50" r="48" />
      <circle cx="50" cy="30" />
    </svg>
  )

  const DividerSVG = (
    <svg className="div-svg" viewBox="0 0 180 18">
      <path d="M2 9H72" />
      <path d="M178 9H108" />
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="90"
            cy="3.5"
            rx="2"
            ry="4.5"
            transform={`rotate(${i * 45} 90 9)`}
          />
        ))}
      </g>
    </svg>
  )

  const renderLanternsAndDiyas = () => (
    <>
      <div className="lantern" style={{ left: '6%', '--h': '20px', animationDelay: '0s' }}><i></i></div>
      <div className="lantern" style={{ left: '18%', '--h': '52px', animationDelay: '-1s' }}><i></i></div>
      <div className="lantern" style={{ left: '82%', '--h': '40px', animationDelay: '-2s' }}><i></i></div>
      <div className="lantern" style={{ left: '94%', '--h': '16px', animationDelay: '-3s' }}><i></i></div>
      <div className="diyas">
        <span className="diya" /><span className="diya" /><span className="diya" /><span className="diya" />
      </div>
    </>
  )

  return (
    <>
      {/* Interactive Royal Web View */}
      <div
        ref={containerRef}
        className="royal-theme fixed inset-0 z-50 overflow-y-auto overflow-x-hidden font-['Hind_Vadodara',sans-serif] text-[#fff6e2] select-none scroll-smooth"
      >
        <style>{`
        .royal - theme {
          --gold: #e6bd5c;
        --g2: #fff0b8;
        --ivory: #fff6e2;
        background: #1c0509;
          }
        .royal-theme .page {
          min - height: 100vh; min-height: 100svh;
        scroll-snap-align: start; display: flex; align-items: center; justify-content: center;
        padding: 80px 14px 90px; position: relative; overflow: hidden;
          }
        .royal-theme .p1 {background: radial-gradient(circle at 50% 35%, #7a1a2c, #2a0710 70%); }
        .royal-theme .p2 {background: radial-gradient(circle at 50% 35%, #0f6b52, #04251c 70%); }
        .royal-theme .p3 {background: radial-gradient(circle at 50% 35%, #c4651a, #4a1f08 70%); }
        .royal-theme .p4 {background: radial-gradient(circle at 50% 35%, #1f4fa0, #08183a 70%); }
        .royal-theme .p5 {background: radial-gradient(circle at 50% 35%, #4b2a86, #140a2e 70%); }
        .royal-theme .p6 {background: radial-gradient(circle at 50% 35%, #0f6b52, #04251c 70%); }
        .royal-theme .p7 {background: radial-gradient(circle at 50% 35%, #7a1a2c, #2a0710 70%); }
        .royal-theme .p8 {background: radial-gradient(circle at 50% 35%, #8c1f4a, #2e0a1c 70%); }

        .royal-theme .rangoli {
          position: absolute; left: 50%; top: 50%; width: 150vmin; height: 150vmin;
        margin: -75vmin 0 0 -75vmin; opacity: .14; animation: spin 90s linear infinite; pointer-events: none;
          }
        @keyframes spin {to {transform: rotate(360deg); } }

        .royal-theme .arch {
          position: relative; z-index: 2; width: min(94vw, 430px); padding: 65px 22px 45px; text-align: center;
        border-radius: 220px 220px 14px 14px / 150px 150px 14px 14px;
        background: linear-gradient(rgba(60,10,22,.78), rgba(25,5,12,.88)), radial-gradient(circle, rgba(230,189,92,.2) 1.5px, transparent 2px) 0 0/16px 16px;
        border: 3px solid var(--gold);
        box-shadow: 0 0 0 5px rgba(20,5,10,.7), 0 0 0 8px var(--gold), 0 0 50px rgba(230,189,92,.4), 0 30px 60px rgba(0,0,0,.6);
        opacity: 0; transform: translateY(50px) scale(.92);
        transition: all 1s cubic-bezier(.2,.8,.2,1);
          }
        .royal-theme .page.in .arch {opacity: 1; transform: none; }
        .royal-theme .arch::before {
          content: ""; position: absolute; inset: 9px; border: 1px solid rgba(255,240,184,.55); border-radius: inherit; pointer-events: none;
          }
        .royal-theme .arch::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
        background: linear-gradient(115deg, transparent 40%, rgba(255,240,184,.22) 50%, transparent 60%);
        background-size: 300% 100%; animation: sheen 5s ease-in-out infinite;
          }
        @keyframes sheen {from {background - position: 120% 0; } to {background - position: -120% 0; } }

        .royal-theme .crest {
          position: absolute; top: -34px; left: 50%; margin-left: -34px; width: 68px; height: 68px; z-index: 3;
        filter: drop-shadow(0 0 12px rgba(255,220,120,.9));
          }
        .royal-theme .crest svg {width: 100%; height: 100%; animation: spin 20s linear infinite; }

        .royal-theme h2, .royal-theme h3, .royal-theme .names, .royal-theme .hl, .royal-theme .pw b {
          background: linear-gradient(100deg, #c79a2e 10%, #fff3c0 35%, #e6bd5c 50%, #fff3c0 65%, #c79a2e 90%);
        background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: foil 5s linear infinite; font-family: 'Noto Serif Gujarati', serif;
          }
        @keyframes foil {to {background - position: -250% 0; } }
        .royal-theme h2 {font - weight: 800; font-size: 1.85rem; letter-spacing: .05em; line-height: 1.5; }
        .royal-theme h3 {font - weight: 600; font-size: 1.2rem; margin: 16px 0 2px; }
        .royal-theme .names {font - weight: 800; font-size: 2.1rem; line-height: 1.4; }
        .royal-theme .sang {display: block; font-size: 1.1rem; color: var(--ivory); -webkit-text-fill-color: var(--ivory); font-family: 'Noto Serif Gujarati', serif; }
        .royal-theme .hl {font - weight: 600; display: inline-block; }
        .royal-theme .shloka, .royal-theme .small, .royal-theme li {font - family: 'Noto Serif Gujarati', serif; }
        .royal-theme .shloka {font - size: .95rem; line-height: 1.9; }
        .royal-theme .small {font - size: .92rem; line-height: 1.8; }
        .royal-theme li {font - size: .95rem; }

        .royal-theme .div-svg {display: block; width: 180px; height: 18px; margin: 6px auto 12px; overflow: visible; }
        .royal-theme .div-svg path {stroke: var(--gold); fill: none; stroke-width: 1.5; }
        .royal-theme .div-svg g {transform - origin: 90px 9px; animation: spin 8s linear infinite; fill: var(--g2); }

        .royal-theme .ganesh {display: block; font-size: 2.3rem; color: var(--g2); text-shadow: 0 0 16px var(--gold); animation: sway 4s ease-in-out infinite; }
        @keyframes sway {50 % { transform: rotate(6deg) scale(1.08); }}

        .royal-theme .couple {display: flex; align-items: flex-start; justify-content: center; gap: 8px; margin: 6px 0 4px; }
        .royal-theme .pw {flex: 1; max-width: 140px; }
        .royal-theme .pw b {display: block; font-weight: 800; font-size: 1.1rem; margin-top: 8px; }
        .royal-theme .amp {align - self: center; font-size: 1rem; padding-bottom: 26px; animation: beat 1.6s ease-in-out infinite; }
        .royal-theme .amp::before {content: "♥"; display: block; color: #ff6b86; font-size: 1.3rem; text-shadow: 0 0 12px #ff6b86; }
        @keyframes beat {50 % { transform: scale(1.18); }}

        .royal-theme .ph {
          position: relative; display: block; width: 100%; aspect-ratio: 3/4; cursor: pointer;
        border-radius: 70px 70px 8px 8px; overflow: hidden; border: 3px solid var(--gold);
        background: linear-gradient(160deg, #4a1020, #1a0510);
        box-shadow: 0 0 0 4px rgba(20,5,10,.7), 0 0 0 6px var(--gold), 0 0 24px rgba(230,189,92,.55);
          }
        .royal-theme .ph img {position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: ken 14s ease-in-out infinite alternate; }
        @keyframes ken {to {transform: scale(1.12); } }
        .royal-theme .add {position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 1.7rem; color: var(--g2); line-height: 1.4; }

        .royal-theme .lantern {
          position: absolute; top: 0; z-index: 3; transform-origin: top center; animation: swing 4s ease-in-out infinite; pointer-events: none;
          }
        .royal-theme .lantern::before {content: ""; display: block; width: 2px; margin: 0 auto; background: var(--gold); height: var(--h); }
        .royal-theme .lantern i {
          display: block; width: 34px; height: 46px; margin-left: -16px; border-radius: 12px 12px 18px 18px;
        background: radial-gradient(circle at 50% 55%, #fff3b0, #ffb21e 55%, #c4560f);
        border: 2px solid var(--gold); box-shadow: 0 0 28px 8px rgba(255,170,40,.65); animation: glow 2.4s ease-in-out infinite;
          }
        @keyframes swing {0 %, 100 % { transform: rotate(7deg); } 50% {transform: rotate(-7deg); } }
        @keyframes glow {50 % { box- shadow: 0 0 38px 14px rgba(255,170,40,.85); } }

        .royal-theme .diyas {
          position: absolute; bottom: 18px; left: 0; right: 0; display: flex; justify-content: center;
        gap: clamp(18px, 8vw, 46px); z-index: 3; pointer-events: none;
          }
        .royal-theme .diya {position: relative; width: 34px; height: 15px; border-radius: 0 0 34px 34px; background: linear-gradient(#f3cf6d, #b07a1c); }
        .royal-theme .diya::before {
          content: ""; position: absolute; left: 10px; top: -24px; width: 14px; height: 26px;
        border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
        background: radial-gradient(#fff6c8 20%, #ffb21e 60%, #e0521a);
        box-shadow: 0 0 20px 8px rgba(255,170,40,.7); transform-origin: bottom; animation: flick .5s ease-in-out infinite alternate;
          }
        @keyframes flick {from {transform: scale(1, .9) rotate(-4deg); } to {transform: scale(.9, 1.12) rotate(4deg); } }

        .royal-theme .fx {position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
        .royal-theme .fx i {
          position: absolute; bottom: -4%; width: 5px; height: 5px; border-radius: 50%; background: var(--g2);
        box-shadow: 0 0 8px 2px rgba(255,220,120,.9); animation: rise linear infinite;
          }
      @keyframes rise {to {transform: translate(30px, -110vh); opacity: 0; } }

        .royal-theme .cover-hint {
          position: absolute; bottom: 50px; left: 0; right: 0; text-align: center;
        font-size: .85rem; color: var(--g2); animation: bob 1.8s infinite; z-index: 3;
          }
        @keyframes bob {50 % { transform: translateY(6px); }}

          /* Print styles for native Ctrl+P / Save as PDF */
          @media print {
            body, html {
            background: #1c0509 !important;
          height: auto !important;
          overflow: visible !important;
            }
          .royal-theme {
            position: static !important;
          overflow: visible !important;
          height: auto !important;
            }
          .page {
            page -break-after: always !important;
          break-after: page !important;
          min-height: 100vh !important;
          height: 100vh !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
            }
          .arch {
            opacity: 1 !important;
          transform: none !important;
            }
          header, aside, .cover-hint, .fixed-action-bar, #pdf-export-host {
            display: none !important;
            }
          }
        `}</style>

        {/* Fixed Top Bar with AJ Branding, PDF Export, JSON Data Editor, & Music Player */}
        <header className="fixed top-3 inset-x-3 z-50 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-[var(--gold)] bg-[#2a0710]/90 px-3.5 py-1 text-xs sm:text-sm font-bold text-[#fff3c0] shadow-lg backdrop-blur">
            <img
              src={weddingData.meta?.branding?.logo || '/aj-logo.png'}
              alt="AJ"
              className="h-5 w-auto object-contain"
            />
            <span>{weddingData.meta?.branding?.name || 'AJ INVITATION'}</span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* One-Click PDF Export Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-[var(--gold)] bg-[#2a0710]/90 hover:bg-[var(--gold)] hover:text-black px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-bold text-[#fff3c0] shadow-lg backdrop-blur active:scale-95 transition disabled:opacity-50"
              title="એક ક્લિકમાં પીડીએફ કંકોતરી ડાઉનલોડ કરો"
            >
              <span>{isExportingPDF ? '⏳' : '📥'}</span>
              <span className="hidden sm:inline">પીડીએફ ડાઉનલોડ</span>
              <span className="inline sm:hidden">PDF</span>
            </button>

            {/* Centralized JSON Data Editor Button */}
            {/* <button
              onClick={() => setIsDataModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-[var(--gold)] bg-[#2a0710]/90 hover:bg-[var(--gold)] hover:text-black px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-bold text-[#fff3c0] shadow-lg backdrop-blur active:scale-95 transition"
              title="કંકોતરી ડેટા મેનેજર (JSON)"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">ડેટા મેનેજ</span>
              <span className="inline sm:hidden">ડેટા</span>
            </button> */}

            {/* Music Player Button */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full border border-[var(--gold)] px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-bold shadow-lg backdrop-blur active:scale-95 transition ${isAudioPlaying
                ? 'bg-emerald-800 text-[#fff3c0]'
                : 'bg-[#2a0710]/90 text-[#fff3c0]'
                }`}
            >
              <span>{isAudioPlaying ? '🔊' : '🎵'}</span>
              <span className="hidden sm:inline">
                {isAudioPlaying
                  ? weddingData.meta?.audio?.playingText || 'સંગીત ચાલુ'
                  : weddingData.meta?.audio?.playText || 'સંગીત વગાડો'}
              </span>
            </button>
          </div>
        </header>

        {/* Floating Vertical Page Navigation HUD */}
        < aside className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 bg-[#2a0710]/80 border border-[var(--gold)]/40 p-1.5 rounded-full backdrop-blur shadow-lg" >
          {
            Array.from({ length: pagesCount }, (_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                aria-label={`Jump to page ${i + 1}`}
                className={`w-2.5 rounded-full transition-all duration-300 ${i === activePageIndex
                  ? 'h-6 bg-[#e6bd5c] shadow-[0_0_8px_#e6bd5c]'
                  : 'h-2.5 bg-white/30 hover:bg-white/60'
                  }`}
              />
            ))
          }
        </aside>

        {/* Page 1 : કવર */}
        <section className="page p1 in" data-idx="0">
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <span className="ganesh">{p1.ganeshSymbol || 'ॐ'}</span>
            <p className="shloka whitespace-pre-line">{p1.shloka}</p>
            <h2 className="mt-3">{p1.title || 'શુભ વિવાહ'}</h2>
            <div className="couple">
              <div className="pw">
                <label className="ph" title="વરરાજાનો ફોટો (બદલવા માટે ક્લિક કરો)">
                  {groomPhoto ? <img alt="Groom" src={groomPhoto} /> : (
                    <span className="add">📷<small className="text-[0.72rem]">ફોટો ઉમેરો</small></span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'groom')} />
                </label>
                <b>{groomName}</b>
              </div>
              <div className="amp">{weddingData.couple?.connector || 'સંગ'}</div>
              <div className="pw">
                <label className="ph" title="કન્યાનો ફોટો (બદલવા માટે ક્લિક કરો)">
                  {bridePhoto ? <img alt="Bride" src={bridePhoto} /> : (
                    <span className="add">📷<small className="text-[0.72rem]">ફોટો ઉમેરો</small></span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'bride')} />
                </label>
                <b>{brideName}</b>
              </div>
            </div>
            <p className="hl mt-2">{dateLine}</p>
            <h3>{p1.inviter?.title || 'નિમંત્રક'}</h3>
            <p className="small">
              {p1.inviter?.lines?.map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
              મો. {contactNumber}
            </p>
          </div>
          <div className="cover-hint cursor-pointer" onClick={() => scrollToPage(1)}>
            {p1.scrollHint || 'નીચે સ્ક્રોલ કરો ⌄'}
          </div>
        </section>

        {/* Page 2 : વિવાહ સંસ્કાર */}
        <section className="page p2" data-idx="1">
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <span className="text-sm font-bold text-[var(--g2)]">{p2.topInvocation || '॥ શ્રી ગણેશાય નમઃ ॥'}</span>
            <h2 className="mt-2">{p2.title || 'વિવાહ સંસ્કાર'}</h2>
            {DividerSVG}
            <p className="shloka text-[var(--g2)] my-1 whitespace-pre-line">{p2.shloka}</p>
            <p className="small mt-2">{p2.intro}</p>
            <div className="names my-3 text-[1.9rem]">
              {groomName}<span className="sang">{weddingData.couple?.connector || 'સંગ'}</span>{brideName}
            </div>
            <p className="small">{p2.blessing}</p>
          </div>
        </section>

        {/* Page 3 : હલ્દી રસમ */}
        <section className="page p3" data-idx="2">
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <h2>{p3.title || 'હલ્દી રસમ'}</h2>
            {DividerSVG}
            <h3>{p3.ceremony?.title || 'પીઠી ચોળવાનો સમય'}</h3>
            <p className="mt-1">
              {p3.ceremony?.dayText || 'બુધવાર, તા. ૧૨-૦૨-૨૦૨૫ ના રોજ'}<br />
              {p3.ceremony?.invitationText || 'આપની પધારવા વિનંતી.'}
            </p>
            <h3>{p3.meal?.title || 'સ્વરુચી ભોજન'}</h3>
            <p className="mt-1"><span className="hl">{p3.meal?.timing || '(ભોજન : બપોરે ૧૨:૦૦ કલાકે)'}</span></p>
            <h3>{p3.venue?.title || 'શુભ સ્થળ'}</h3>
            <p className="mt-1">{venueName},<br />{venueLines.join(', ')}</p>
          </div>
        </section>

        {/* Page 4 : લગ્નોત્સવ */}
        <section className="page p4" idx="3" >
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <h2>{p4.title || 'લગ્નોત્સવ'}</h2>
            {DividerSVG}
            <p className="small whitespace-pre-line">{p4.quote}</p>
            {p4.events?.map((ev, i) => (
              <div key={i}>
                <h3>{ev.title}</h3>
                <p>
                  {ev.date}<br />
                  <span className="hl">{ev.timeHighlight}</span><br />
                  {ev.venue}
                </p>
              </div>
            ))}
          </div >
        </section >

        {/* Page 5 : પ્રેમ રાસ */}
        <section className="page p5" data-idx="4">
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <h2>{p5.title || 'પ્રેમ રાસ'}</h2>
            {DividerSVG}
            <h3>{p5.meal?.title || 'સ્વરુચી ભોજન'}</h3>
            <p className="mt-1">
              {p5.meal?.date || 'બુધવાર, તા. ૧૨-૦૨-૨૦૨૫ ના રોજ'}<br />
              {p5.meal?.note || 'આપની પધારવા વિનંતી.'}<br />
              <span className="hl">{p5.meal?.timing || '(ભોજન : સાંજે ૭:૦૦ કલાકે)'}</span>
            </p>
            <h3>{p5.garba?.title || 'રાસ-ગરબા'}</h3>
            <p className="mt-1">
              {p5.garba?.timePrefix || 'રાત્રે'} <span className="hl">{p5.garba?.timeHighlight || '૮:૩૦ કલાકે'}</span><br />
              {venueName}, {venueLines.join(', ')}
            </p>
          </div>
        </section>

        {/* Page 6 : જાન પ્રસ્થાન */}
        <section className="page p6" data-idx="5">
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <h3 className="mt-0">{p6.departure?.title || 'જાન પ્રસ્થાન'}</h3>
            <p>
              {p6.departure?.date || 'ગુરુવાર, તા. ૧૩-૦૨-૨૦૨૫'}<br />
              {p6.departure?.timePrefix || 'બપોરે'} <span className="hl">{p6.departure?.timeHighlight || '૨:૩૦ કલાકે'}</span><br />
              {p6.departure?.location || '(સ્થળ : સુરત)'}
            </p>
            <h3>{p6.hastMelap?.title || 'હસ્ત મેળાપ'}</h3>
            <p>
              {p6.hastMelap?.date || 'ગુરુવાર, તા. ૧૩-૦૨-૨૦૨૫'}<br />
              {p6.hastMelap?.timePrefix || 'સાંજે'} <span className="hl">{p6.hastMelap?.timeHighlight || '૫:૧૫ કલાકે (શુભ ચોઘડિયે)'}</span>
            </p>
            <h3>{p6.note?.title || 'મધુર કલરવ'}</h3>
            <p className="small">{p6.note?.text}</p>
            <p className="small hl mt-2">{p6.note?.signoff || '– સાદર, સમસ્ત પરિવાર'}</p>
          </div>
        </section>

        {/* Page 7 : સ્નેહાધીન */}
        <section className="page p7" data-idx="6">
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <h2 className="text-[1.4rem]">{p7.snehadhin?.title || 'લિ. સ્નેહાધીન'}</h2>
            <ul className="list-none space-y-1 my-2">
              {p7.snehadhin?.members?.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <h2 className="text-[1.4rem] mt-4">{p7.darshanabhilashi?.title || 'લિ. દર્શનાભિલાષી'}</h2>
            <ul className="list-none space-y-1 my-2">
              {p7.darshanabhilashi?.members?.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </section >

        {/* Page 8 : મોસાળ / આમંત્રણ */}
        <section className="page p8" data-idx="7">
          {RangoliSVG}
          {renderLanternsAndDiyas()}
          <div className="fx">
            {dustList.map((d) => (
              <i key={d.id} style={{ left: d.left, animationDuration: d.dur, animationDelay: d.del }} />
            ))}
          </div>
          <div className="arch">
            {CrestSVG}
            <h3 className="mt-0">{p8.mosal?.title || 'મોસાળ પક્ષ'}</h3>
            <p className="small">{p8.mosal?.text}</p>
            <h3>{p8.banej?.title || 'બાણેજ પક્ષ'}</h3>
            <p className="small">{p8.banej?.text}</p>
            <h3>{p8.firm?.title || 'ફર્મ'}</h3>
            <p className="small">{p8.firm?.text}</p>
            <h3>{p8.invitationMessage?.title || 'આમંત્રણ'}</h3>
            <p className="small">
              {(p8.invitationMessage?.template || '').replace(
                '{groomName}',
                groomName.replace('ચિ. ', '')
              )}
            </p>
            <p className="hl mt-2">સ્થળ : {venueName}, {venueLines.join(', ')}</p>

            {/* Action Buttons for Venue Route, WhatsApp Wishes, Call & PDF Export */}
            <div className="mt-4 flex flex-col gap-2">
              {/* One-Click PDF Download Button on Page 8 */}
              <button
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--gold)] bg-gradient-to-r from-amber-600/40 via-amber-500/30 to-amber-600/40 px-4 py-2 text-xs font-bold text-[#fff3c0] hover:bg-[var(--gold)] hover:text-black transition shadow disabled:opacity-50"
              >
                <span>📥</span>
                <span>
                  {isExportingPDF
                    ? 'પીડીએફ બની રહી છે...'
                    : p8.actions?.pdfText || 'ડાઉનલોડ પીડીએફ કંકોતરી (PDF Export)'}
                </span>
              </button>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(venueName + ', ' + venueLines.join(', '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--gold)] bg-[var(--gold)]/20 px-4 py-2 text-xs font-bold text-[#fff3c0] hover:bg-[var(--gold)] hover:text-black transition shadow"
              >
                <span>📍</span>
                <span>{p8.actions?.mapText || 'ગૂગલ મેપ પર લોકેશન જુઓ'}</span>
              </a>
              <a
                href={`https://wa.me/91${contactNumber}?text=${encodeURIComponent(
                  weddingData.contact?.whatsappGreeting ||
                  `નમસ્તે AJ Invitation, ${groomName} સંગ ${brideName} ના લગ્ન પ્રસંગે હાર્દિક શુભકામનાઓ!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow transition"
              >
                <span>💬</span>
                <span>{p8.actions?.whatsappText || 'વોટ્સએપ પર શુભેચ્છા પાઠવો (RSVP)'}</span>
              </a>
              <a
                href={`tel:+91${contactNumber}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-[11px] font-bold text-[#fff3c0] hover:border-[var(--gold)] transition"
              >
                <span>📞</span>
                <span>{p8.actions?.callPrefix || 'સંપર્ક: +91'} {contactNumber}</span>
              </a>
            </div>
          </div>
        </section>

        {/* Centralized JSON Data Manager Modal */}
        <DataManagerModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          currentData={weddingData}
          onSaveData={handleSaveData}
          onResetData={handleResetData}
        />

        {/* PDF Export Progress Royal Overlay */}
        {isExportingPDF && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl border-2 border-[var(--gold)] bg-[#24060f] p-6 text-center text-[#fff6e2] shadow-[0_0_50px_rgba(230,189,92,0.4)]">
              <div className="text-4xl animate-bounce mb-3">👑</div>
              <h3 className="text-lg font-bold text-[#f7d070] font-['Noto_Serif_Gujarati',serif]">
                રાજવી કંકોતરી પીડીએફ બની રહી છે...
              </h3>
              <p className="text-xs text-amber-200/80 mt-1 mb-4">
                {exportProgress.message || 'ઉચ્ચ ગુણવત્તાવાળા રંગો અને સુલેખન સાથે એક્સપોર્ટ થઈ રહ્યું છે...'}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-[#120205] border border-[var(--gold)]/40 rounded-full h-3.5 overflow-hidden p-0.5 mb-2">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(((exportProgress.current || 0) / (exportProgress.total || 8)) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#f7d070]/80">
                <span>પેજ {exportProgress.current} / {exportProgress.total}</span>
                <span>{Math.round(((exportProgress.current || 0) / (exportProgress.total || 8)) * 100)}%</span>
              </div>

              {exportSuccessMessage && (
                <div className="mt-4 p-2 bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs rounded-lg font-bold">
                  ✓ {exportSuccessMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Off-Screen Printable Pages Container (Completely outside .royal-theme) */}
      <div
        id="pdf-export-host"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '640px',
          pointerEvents: 'none',
          zIndex: -999,
        }}
      >
        <PrintablePages
          ref={printableRef}
          data={weddingData}
          groomPhoto={groomPhoto}
          bridePhoto={bridePhoto}
        />
      </div>
    </>
  )
}
