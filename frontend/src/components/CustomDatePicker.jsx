import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CustomDatePicker({ label, value, onChange, required = false, allowPastDates = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)

  // Current today date (midnight)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Current view month/year state for calendar grid
  const initialDate = value && value !== 'all' ? new Date(value) : today
  const [viewDate, setViewDate] = useState(initialDate)

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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const formatDisplayDate = (dateStr) => {
    if (!dateStr || dateStr === 'all') return 'Select Date'
    if (dateStr === 'today') return 'Today'
    if (dateStr === 'yesterday') return 'Yesterday'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Calendar Grid Calculations
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Can we navigate to previous month? (Only if allowPastDates is false and before current month/year)
  const isMinMonth =
    !allowPastDates &&
    (currentYear < today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth <= today.getMonth()))

  const handlePrevMonth = () => {
    if (!isMinMonth) {
      setViewDate(new Date(currentYear, currentMonth - 1, 1))
    }
  }

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleSelectDay = (day) => {
    const cellDate = new Date(currentYear, currentMonth, day)
    cellDate.setHours(0, 0, 0, 0)
    
    // Prevent selecting past dates if allowPastDates is false
    if (!allowPastDates && cellDate < today) return

    const mStr = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`
    const dStr = day < 10 ? `0${day}` : `${day}`
    const formatted = `${currentYear}-${mStr}-${dStr}`
    onChange(formatted)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={popoverRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Input Display Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full auth-input text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 cursor-pointer flex items-center justify-between group hover:border-indigo-500/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-indigo-400 group-hover:scale-105 transition-transform" />
          <span className="font-medium tracking-wide">
            {formatDisplayDate(value)}
          </span>
        </div>
      </div>

      {/* Clean Calendar Grid Popover */}
      {isOpen && (
        <div className="absolute right-0 top-[108%] z-50 bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in duration-150">
          <div className="space-y-4">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between px-2 pt-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isMinMonth}
                className={`p-1.5 rounded-lg transition-colors ${
                  isMinMonth
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-white tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const cellDate = new Date(currentYear, currentMonth, day)
                cellDate.setHours(0, 0, 0, 0)
                const isPast = !allowPastDates && cellDate < today

                const mStr = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`
                const dStr = day < 10 ? `0${day}` : `${day}`
                const cellDateStr = `${currentYear}-${mStr}-${dStr}`
                const isSelected = value === cellDateStr

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectDay(day)}
                    className={`p-2 rounded-xl font-semibold transition-all ${
                      isPast
                        ? 'text-slate-600 line-through opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'hover:bg-slate-800 text-slate-300 cursor-pointer'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
