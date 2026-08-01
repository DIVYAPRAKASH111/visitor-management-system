import React, { useState, useRef, useEffect } from 'react'
import { Clock, ChevronDown, Check } from 'lucide-react'

export default function CustomTimePicker({ label, value, onChange, required = false, selectedDate }) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)

  // Parse 24h format (HH:mm) into 12h components
  const parseTime24 = (time24Str) => {
    if (!time24Str) return { hour: '09', minute: '30', period: 'AM' }
    const [hStr, mStr] = time24Str.split(':')
    let h = parseInt(hStr, 10) || 9
    const period = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    const hour = h < 10 ? `0${h}` : `${h}`
    const minute = mStr || '00'
    return { hour, minute, period }
  }

  const { hour, minute, period } = parseTime24(value)

  // Check if selected time is in the past for today's date
  const isTimeInPast = (hStr, mStr, pStr) => {
    if (!selectedDate) return false
    const todayStr = new Date().toISOString().split('T')[0]
    if (selectedDate !== todayStr) return false // Not today, so valid

    const now = new Date()
    let hNum = parseInt(hStr, 10) || 12
    if (pStr === 'PM' && hNum < 12) hNum += 12
    if (pStr === 'AM' && hNum === 12) hNum = 0
    const mNum = parseInt(mStr, 10) || 0

    const timeDate = new Date()
    timeDate.setHours(hNum, mNum, 0, 0)

    return timeDate < now
  }

  // Convert 12h components back to HH:mm 24h string
  const update24Time = (hStr, mStr, pStr) => {
    let hNum = parseInt(hStr, 10) || 12
    if (pStr === 'PM' && hNum < 12) hNum += 12
    if (pStr === 'AM' && hNum === 12) hNum = 0
    const mNum = parseInt(mStr, 10) || 0

    const h24 = hNum < 10 ? `0${hNum}` : `${hNum}`
    const m24 = mNum < 10 ? `0${mNum}` : `${mNum}`
    onChange(`${h24}:${m24}`)
  }

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

  return (
    <div className="relative" ref={popoverRef}>
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      {/* Input Display Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full auth-input text-white text-sm rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between group hover:border-indigo-500/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-400 group-hover:scale-105 transition-transform" />
          <span className="font-semibold tracking-wide">
            {hour}:{minute} {period}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </div>

      {/* Scroll Wheel Column Time Picker Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[108%] z-50 bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl p-4 animate-in fade-in duration-150">
          <div className="space-y-3">
            {/* Top Selected Values Highlight Header Row (matching user screenshot) */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
              <div className="bg-indigo-600 text-white py-2 rounded-xl shadow-md">
                {hour}
              </div>
              <div className="bg-indigo-600 text-white py-2 rounded-xl shadow-md">
                {minute}
              </div>
              <div className="bg-indigo-600 text-white py-2 rounded-xl shadow-md">
                {period}
              </div>
            </div>

            {/* Scrollable Columns Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              {/* Hours Column */}
              <div className="h-44 overflow-y-auto space-y-1 pr-1 border-r border-slate-800/80">
                {hoursList.map((hStr) => {
                  const isPast = isTimeInPast(hStr, minute, period)
                  return (
                    <button
                      key={hStr}
                      type="button"
                      disabled={isPast}
                      onClick={() => update24Time(hStr, minute, period)}
                      className={`w-full py-2 text-xs font-semibold rounded-lg text-center transition-colors ${
                        isPast
                          ? 'text-slate-600 line-through opacity-40 cursor-not-allowed'
                          : hour === hStr
                          ? 'bg-slate-800 text-indigo-400 font-bold'
                          : 'hover:bg-slate-800/60 text-slate-300 cursor-pointer'
                      }`}
                    >
                      {hStr}
                    </button>
                  )
                })}
              </div>

              {/* Minutes Column */}
              <div className="h-44 overflow-y-auto space-y-1 pr-1 border-r border-slate-800/80">
                {minutesList.map((mStr) => {
                  const isPast = isTimeInPast(hour, mStr, period)
                  return (
                    <button
                      key={mStr}
                      type="button"
                      disabled={isPast}
                      onClick={() => update24Time(hour, mStr, period)}
                      className={`w-full py-2 text-xs font-semibold rounded-lg text-center transition-colors ${
                        isPast
                          ? 'text-slate-600 line-through opacity-40 cursor-not-allowed'
                          : minute === mStr
                          ? 'bg-slate-800 text-indigo-400 font-bold'
                          : 'hover:bg-slate-800/60 text-slate-300 cursor-pointer'
                      }`}
                    >
                      {mStr}
                    </button>
                  )
                })}
              </div>

              {/* AM / PM Column */}
              <div className="flex flex-col justify-start space-y-2 pt-1">
                {['AM', 'PM'].map((pStr) => {
                  const isPast = isTimeInPast(hour, minute, pStr)
                  return (
                    <button
                      key={pStr}
                      type="button"
                      disabled={isPast}
                      onClick={() => update24Time(hour, minute, pStr)}
                      className={`py-3.5 rounded-xl text-xs font-bold transition-all ${
                        isPast
                          ? 'text-slate-600 opacity-40 cursor-not-allowed'
                          : period === pStr
                          ? 'bg-slate-800 text-indigo-400 font-bold border border-indigo-500/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer'
                      }`}
                    >
                      {pStr}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Set Time Done Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Confirm Time
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
