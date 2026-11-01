import { useState, useEffect } from 'react'
import { exportDataAsJSON, parseImportedJSON } from '../utils/dataManager'

export default function DataManagerModal({
  isOpen,
  onClose,
  currentData,
  onSaveData,
  onResetData,
}) {
  const [activeTab, setActiveTab] = useState('quick') // 'quick' | 'json'
  const [formData, setFormData] = useState(currentData)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData(currentData)
      setJsonText(JSON.stringify(currentData, null, 2))
      setJsonError(null)
    }
  }, [isOpen, currentData])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  if (!isOpen) return null

  // Handle Quick Form Updates
  const handleQuickChange = (path, value) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))
      let curr = copy
      const keys = path.split('.')
      for (let i = 0; i < keys.length - 1; i++) {
        curr = curr[keys[i]]
      }
      curr[keys[keys.length - 1]] = value
      return copy
    })
  }

  // Handle Raw JSON Changes
  const handleJsonChange = (e) => {
    const text = e.target.value
    setJsonText(text)
    try {
      const parsed = JSON.parse(text)
      setJsonError(null)
      setFormData(parsed)
    } catch (err) {
      setJsonError(err.message)
    }
  }

  // File upload for JSON
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        const result = parseImportedJSON(content)
        if (result.success) {
          setFormData(result.data)
          setJsonText(JSON.stringify(result.data, null, 2))
          setJsonError(null)
          showToast('JSON ફાઇલ સફળતાપૂર્વક લોડ થઈ ગઈ!')
        } else {
          setJsonError(`JSON ફાઇલ અમાન્ય છે: ${result.error}`)
        }
      }
    }
    reader.readAsText(file)
  }

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      showToast('JSON ક્લિપબોર્ડ પર કોપી થઈ ગયો!')
    } catch (err) {
      showToast('કોપી કરવામાં ક્ષતિ આવી')
    }
  }

  const handleSave = () => {
    if (activeTab === 'json') {
      const result = parseImportedJSON(jsonText)
      if (!result.success) {
        setJsonError(`અમાન્ય JSON: ${result.error}`)
        return
      }
      onSaveData(result.data)
    } else {
      onSaveData(formData)
    }
    onClose()
  }

  const handleReset = () => {
    if (window.confirm('શું તમે ડિફોલ્ટ ઓરિજિનલ ડેટા રીસેટ કરવા માંગો છો?')) {
      onResetData()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border-2 border-[var(--gold)] bg-[#20050c] text-[#fff6e2] shadow-2xl overflow-hidden font-['Hind_Vadodara',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--gold)]/30 px-5 py-3.5 bg-[#2c0812]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#f7d070]">
                સેન્ટ્રલાઇઝ્ડ કંકોતરી ડેટા મેનેજર (JSON)
              </h2>
              <p className="text-[11px] text-amber-200/70">
                બધા પેજની વિગતો સરળતાથી એડિટ કરો અથવા JSON ડાઉનલોડ/અપલોડ કરો
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full w-8 h-8 flex items-center justify-center border border-[var(--gold)]/40 hover:bg-[var(--gold)] hover:text-black transition text-sm font-bold text-[#f7d070]"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--gold)]/20 bg-[#170308] px-4 pt-2 gap-2 text-xs sm:text-sm">
          <button
            onClick={() => {
              setActiveTab('quick')
              setJsonText(JSON.stringify(formData, null, 2))
            }}
            className={`px-4 py-2 font-bold rounded-t-lg transition border-t border-x ${
              activeTab === 'quick'
                ? 'bg-[#20050c] text-[#f7d070] border-[var(--gold)]/40 -mb-[1px]'
                : 'text-amber-200/60 border-transparent hover:text-amber-100'
            }`}
          >
            ✏️ ઝડપી વિગતો (Quick Form)
          </button>
          <button
            onClick={() => {
              setActiveTab('json')
              setJsonText(JSON.stringify(formData, null, 2))
            }}
            className={`px-4 py-2 font-bold rounded-t-lg transition border-t border-x ${
              activeTab === 'json'
                ? 'bg-[#20050c] text-[#f7d070] border-[var(--gold)]/40 -mb-[1px]'
                : 'text-amber-200/60 border-transparent hover:text-amber-100'
            }`}
          >
            📄 સંપૂર્ણ JSON કોડ (Full Schema)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {activeTab === 'quick' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Couple Info */}
              <div className="space-y-1.5 bg-[#2c0812]/60 p-3.5 rounded-xl border border-[var(--gold)]/20">
                <label className="block font-bold text-[#f7d070]">વરરાજાનું નામ (Groom Name)</label>
                <input
                  type="text"
                  value={formData.couple?.groom?.fullName || ''}
                  onChange={(e) => handleQuickChange('couple.groom.fullName', e.target.value)}
                  className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] focus:border-[var(--gold)] focus:outline-none"
                />
                <label className="block text-[11px] font-semibold text-amber-200/80 pt-1">વરરાજા ફોટો (Groom Photo)</label>
                <input
                  type="text"
                  value={formData.couple?.groom?.photo || ''}
                  onChange={(e) => handleQuickChange('couple.groom.photo', e.target.value)}
                  placeholder="/grm.jpg"
                  className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] text-xs focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 bg-[#2c0812]/60 p-3.5 rounded-xl border border-[var(--gold)]/20">
                <label className="block font-bold text-[#f7d070]">કન્યાનું નામ (Bride Name)</label>
                <input
                  type="text"
                  value={formData.couple?.bride?.fullName || ''}
                  onChange={(e) => handleQuickChange('couple.bride.fullName', e.target.value)}
                  className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] focus:border-[var(--gold)] focus:outline-none"
                />
                <label className="block text-[11px] font-semibold text-amber-200/80 pt-1">કન્યા ફોટો (Bride Photo)</label>
                <input
                  type="text"
                  value={formData.couple?.bride?.photo || ''}
                  onChange={(e) => handleQuickChange('couple.bride.photo', e.target.value)}
                  placeholder="/brd.jpg"
                  className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] text-xs focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              {/* Wedding Date */}
              <div className="space-y-1.5 sm:col-span-2 bg-[#2c0812]/60 p-3.5 rounded-xl border border-[var(--gold)]/20">
                <label className="block font-bold text-[#f7d070]">લગ્ન તારીખ લાઇન (Date & Day)</label>
                <input
                  type="text"
                  value={formData.weddingDate?.formatted || ''}
                  onChange={(e) => handleQuickChange('weddingDate.formatted', e.target.value)}
                  className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] focus:border-[var(--gold)] focus:outline-none"
                  placeholder="તા. ૧૩-૦૨-૨૦૨૫, ગુરુવાર"
                />
              </div>

              {/* Venue Name */}
              <div className="space-y-1.5 bg-[#2c0812]/60 p-3.5 rounded-xl border border-[var(--gold)]/20">
                <label className="block font-bold text-[#f7d070]">શુભ સ્થળ નામ (Venue Name)</label>
                <input
                  type="text"
                  value={formData.venue?.name || ''}
                  onChange={(e) => handleQuickChange('venue.name', e.target.value)}
                  className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5 bg-[#2c0812]/60 p-3.5 rounded-xl border border-[var(--gold)]/20">
                <label className="block font-bold text-[#f7d070]">સંપર્ક નંબર (Phone Number)</label>
                <input
                  type="text"
                  value={formData.contact?.phone || ''}
                  onChange={(e) => handleQuickChange('contact.phone', e.target.value)}
                  className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] focus:border-[var(--gold)] focus:outline-none"
                  placeholder="9687336426"
                />
              </div>

              {/* Venue Lines */}
              <div className="space-y-1.5 sm:col-span-2 bg-[#2c0812]/60 p-3.5 rounded-xl border border-[var(--gold)]/20">
                <label className="block font-bold text-[#f7d070]">સ્થળ સરનામું (Venue Address Lines)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.venue?.lines?.[0] || ''}
                    onChange={(e) => {
                      const lines = [...(formData.venue?.lines || ['', ''])]
                      lines[0] = e.target.value
                      handleQuickChange('venue.lines', lines)
                    }}
                    placeholder="સરનામું લાઇન ૧"
                    className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] focus:border-[var(--gold)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.venue?.lines?.[1] || ''}
                    onChange={(e) => {
                      const lines = [...(formData.venue?.lines || ['', ''])]
                      lines[1] = e.target.value
                      handleQuickChange('venue.lines', lines)
                    }}
                    placeholder="સરનામું લાઇન ૨"
                    className="w-full rounded-lg bg-[#140206] border border-[var(--gold)]/40 px-3 py-1.5 text-[#fff6e2] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="sm:col-span-2 text-xs text-amber-200/70 italic bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                💡 અન્ય તમામ વિગતો (જેમ કે શ્લોક, મંડપ મુહૂર્ત, પ્રેમ રાસ, સ્નેહાધીન યાદી) એડિટ કરવા માટે ઉપરના <b>"સંપૂર્ણ JSON કોડ"</b> ટેબ પર ક્લિક કરો.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportDataAsJSON(formData)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--gold)]/60 bg-[var(--gold)]/20 hover:bg-[var(--gold)] hover:text-black px-3 py-1 text-xs font-bold text-[#f7d070] transition"
                  >
                    <span>📥</span>
                    <span>JSON ડાઉનલોડ</span>
                  </button>

                  <label className="inline-flex items-center gap-1 rounded-lg border border-[var(--gold)]/60 bg-[var(--gold)]/20 hover:bg-[var(--gold)] hover:text-black px-3 py-1 text-xs font-bold text-[#f7d070] cursor-pointer transition">
                    <span>📤</span>
                    <span>JSON અપલોડ</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-black/40 hover:border-[var(--gold)] px-2.5 py-1 text-xs font-bold text-amber-200 transition"
                  >
                    <span>📋</span>
                    <span>કોપી</span>
                  </button>
                </div>

                {jsonError ? (
                  <span className="text-xs text-rose-400 font-semibold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                    ⚠️ અમાન્ય JSON: {jsonError}
                  </span>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    ✓ માન્ય JSON
                  </span>
                )}
              </div>

              {/* JSON Textarea */}
              <textarea
                value={jsonText}
                onChange={handleJsonChange}
                rows={16}
                className="w-full font-mono text-xs sm:text-[13px] leading-relaxed bg-[#120205] text-amber-100 p-3 rounded-xl border border-[var(--gold)]/40 focus:border-[var(--gold)] focus:outline-none resize-y selection:bg-amber-400 selection:text-black"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-emerald-700 border border-emerald-400 text-white text-xs px-4 py-1.5 rounded-full shadow-lg animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[var(--gold)]/30 px-5 py-3 bg-[#2c0812]">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-amber-300/80 hover:text-rose-300 underline font-medium transition"
          >
            🔄 ડિફોલ્ટ ડેટા રીસેટ કરો
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/30 bg-black/40 px-4 py-1.5 text-xs font-bold text-amber-100 hover:bg-white/10 transition"
            >
              રદ કરો
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={Boolean(jsonError)}
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-black px-5 py-1.5 text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-lg disabled:opacity-50"
            >
              ✓ સાચવો અને લાગુ કરો
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

