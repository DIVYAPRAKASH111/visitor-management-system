import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  UserCheck,
  Building,
  FileText,
  ChevronDown,
  ArrowLeft,
  IdCard
} from 'lucide-react'
import CustomTimePicker from './CustomTimePicker'
import CustomDatePicker from './CustomDatePicker'

const collegeDepartments = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Master of Business Administration (MBA)',
  'Basic Sciences & Humanities'
]

export default function NewVisitRequestForm({ onSubmitSuccess, onCancel }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Student Details
  const [studentName, setStudentName] = useState('')
  const [studentRegisterNo, setStudentRegisterNo] = useState('')
  const [department, setDepartment] = useState(collegeDepartments[0])

  // Purpose & Timings
  const [purpose, setPurpose] = useState('')
  const todayStr = new Date().toISOString().split('T')[0]
  const [visitDate, setVisitDate] = useState(todayStr)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('12:30')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Format 24h string to 12h AM/PM label
  const format12Hour = (time24) => {
    if (!time24) return ''
    const [h, m] = time24.split(':')
    let hours = parseInt(h, 10)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${m} ${suffix}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLoading) return

    if (!phone || phone.length !== 10) {
      setErrorMsg('Phone number must contain exactly 10 numeric digits.')
      return
    }
    if (!studentName.trim()) {
      setErrorMsg('Please enter the name of the student.')
      return
    }
    if (!studentRegisterNo.trim()) {
      setErrorMsg('Please enter the student register number.')
      return
    }
    if (!purpose.trim()) {
      setErrorMsg('Please enter the purpose of your visit.')
      return
    }

    // Past time validation for today's visit
    if (visitDate === todayStr) {
      const now = new Date()
      const [sH, sM] = startTime.split(':')
      const startObj = new Date()
      startObj.setHours(parseInt(sH, 10), parseInt(sM, 10), 0, 0)

      if (startObj < now) {
        setErrorMsg('Start time cannot be in the past for today\'s visit. Please select an upcoming time.')
        return
      }
    }

    // End time must be after start time
    if (startTime >= endTime) {
      setErrorMsg('End time must be after start time.')
      return
    }

    setErrorMsg('')
    setIsLoading(true)

    // Construct new request object
    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      visitorName: fullName,
      email,
      phone,
      host: studentName,
      studentName,
      studentRegisterNo,
      hostDepartment: department,
      date: visitDate,
      time: `${format12Hour(startTime)} - ${format12Hour(endTime)}`,
      startTime,
      endTime,
      purpose,
      status: 'Pending',
      submittedAt: new Date().toLocaleString(),
    }

    // Immediately trigger submission and close form to prevent duplicates
    onSubmitSuccess(newRequest)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Requests
        </button>

        <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Campus Visitor Registration
        </span>
      </div>

      {/* Main Glassmorphic Form Card */}
      <div className="auth-card rounded-[24px] p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="border-b border-slate-800/80 pb-6 mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            New Visitor Registration
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Fill out the form below to request access authorization for your campus visit.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visitor Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Visitor Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Visitor Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full auth-input text-white text-sm rounded-xl pl-11 pr-4 py-3 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="visitor@example.com"
                  className="w-full auth-input text-white text-sm rounded-xl pl-11 pr-4 py-3 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone Number (Strictly 10 Digits Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Phone Number (10 Digits) <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full auth-input text-white text-sm rounded-xl pl-11 pr-4 py-3 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/80 my-2" />

          {/* Student Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Student Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <UserCheck className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter name of the student"
                  className="w-full auth-input text-white text-sm rounded-xl pl-11 pr-4 py-3 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Student Register No. */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Student Register No. <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <IdCard className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={studentRegisterNo}
                  onChange={(e) => setStudentRegisterNo(e.target.value)}
                  placeholder="e.g. 21CS045 / 717822P101"
                  className="w-full auth-input text-white text-sm rounded-xl pl-11 pr-4 py-3 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* College Department Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Department Selection <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <Building className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full auth-input text-white text-sm rounded-xl pl-11 pr-8 py-3 appearance-none focus:outline-none cursor-pointer"
                >
                  {collegeDepartments.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#111827] text-white">
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/80 my-2" />

          {/* Visit Purpose & Timings */}
          <div className="space-y-5">
            {/* Purpose of Visit (Typed Input) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Purpose of Visit <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <FileText className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Enter purpose (e.g. Fee Payment, Project Discussion, Parent Meeting)..."
                  className="w-full auth-input text-white text-sm rounded-xl pl-11 pr-4 py-3 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Visit Date, Start Time & End Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Custom Date Picker (Disallows past dates) */}
              <CustomDatePicker
                label="Visit Date"
                value={visitDate}
                onChange={setVisitDate}
                required
              />

              {/* Custom Start Time Picker (Scrolling Wheel Columns, prevents past time) */}
              <CustomTimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                selectedDate={visitDate}
                required
              />

              {/* Custom End Time Picker (Scrolling Wheel Columns, prevents past time) */}
              <CustomTimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                selectedDate={visitDate}
                required
              />
            </div>
          </div>

          {/* Full Width Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base tracking-wide shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting Campus Visit Request...
                </>
              ) : (
                'Submit Visit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
