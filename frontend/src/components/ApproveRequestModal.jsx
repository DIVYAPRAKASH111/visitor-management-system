import React, { useState } from 'react'
import { X, CheckCircle2, ShieldCheck, User, Calendar, Clock, Building, FileText, IdCard } from 'lucide-react'

export default function ApproveRequestModal({ request, onConfirmApprove, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!request) return null

  const handleApprove = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const timestamp = new Date().toLocaleString()

    setTimeout(() => {
      setIsSubmitting(false)
      onConfirmApprove(request.id, timestamp)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg auth-card rounded-[24px] p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">
              Approve Visit Request
            </h3>
            <p className="text-xs text-slate-400">
              Request ID: <span className="font-mono text-indigo-300 font-semibold">{request.id}</span>
            </p>
          </div>
        </div>

        {/* Visitor Summary Box */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800/80 space-y-4 mb-6">
          {/* Top Row: Visitor Info & Visitor Name Top-Right Badge */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Visitor
              </span>
              <div className="text-white font-bold text-lg flex items-center gap-1.5 mt-0.5">
                <User className="w-4 h-4 text-indigo-400" /> {request.visitorName}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{request.email}</div>
            </div>

            {/* Top-Right Badge displaying Visitor Name */}
            <span className="bg-indigo-600/30 text-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/30 shadow-sm max-w-[160px] truncate">
              {request.visitorName}
            </span>
          </div>

          {/* Details Grid: Student Name, Register No, Department, Purpose, Scheduled Visit */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/60 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Student Name</span>
              <span className="text-white font-bold text-sm block mt-0.5">
                {request.studentName || request.host}
              </span>
              {request.studentRegisterNo && request.studentRegisterNo !== 'N/A' && (
                <span className="text-indigo-300 block text-[11px] font-mono mt-0.5">
                  Reg: {request.studentRegisterNo}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5 text-xs">
                <Building className="w-3.5 h-3.5 text-indigo-400" /> {request.hostDepartment}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Purpose of Visit</span>
              <span className="text-indigo-200 font-semibold flex items-center gap-1 mt-0.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> {request.purpose}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Scheduled Visit</span>
              <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {request.date}
              </span>
              <span className="text-slate-400 flex items-center gap-1 text-[11px] mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" /> {request.time}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <form onSubmit={handleApprove}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Authorization Pass...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Approve & Generate Pass
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
