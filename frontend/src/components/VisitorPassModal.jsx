import React, { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import {
  X,
  User,
  Clock,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
  KeyRound,
  Download
} from 'lucide-react'

export default function VisitorPassModal({ request, onClose, onPrintPass }) {
  if (!request) return null

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Pending Review
          </span>
        )
    }
  }

  // INSTANT 1-PAGE WHITE THEME PDF GENERATOR
  const handleDownloadPdf = async () => {
    if (!request) return

    try {
      if (onPrintPass) onPrintPass(request)

      // Convert QR Code SVG to PNG Data URL
      let qrDataUrl = null
      const svgEl = document.getElementById('visitor-qr-code-svg')
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl)
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 400
        const ctx = canvas.getContext('2d')
        const img = new Image()

        qrDataUrl = await new Promise((resolve) => {
          img.onload = () => {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, 400, 400)
            ctx.drawImage(img, 0, 0, 400, 400)
            resolve(canvas.toDataURL('image/png'))
          }
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
        })
      }

      // Create pure single-page PDF in WHITE THEME (A4: 210mm x 297mm)
      const pdf = new jsPDF('portrait', 'mm', 'a4')

      // White Page Background (Single Page)
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, 210, 297, 'F')

      // Light Outer Card Container
      pdf.setFillColor(248, 250, 252) // Slate 50
      pdf.setDrawColor(226, 232, 240) // Slate 200
      pdf.setLineWidth(0.5)
      pdf.roundedRect(15, 15, 180, 265, 6, 6, 'FD')

      // Header Title
      pdf.setTextColor(15, 23, 42) // Slate 900
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.text('CAMPUS VISITOR GATE PASS', 105, 32, { align: 'center' })

      pdf.setTextColor(79, 70, 229) // Indigo 600
      pdf.setFontSize(11)
      pdf.text(`PASS ID: ${request.id}`, 105, 40, { align: 'center' })

      // Visitor Info Table Box
      pdf.setFillColor(241, 245, 249) // Slate 100
      pdf.setDrawColor(203, 213, 225)
      pdf.roundedRect(25, 48, 160, 68, 4, 4, 'FD')

      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Visitor: ${request.visitorName}`, 32, 60)

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(51, 65, 85) // Slate 700
      pdf.text(`Student Name: ${request.studentName || request.host}`, 32, 70)
      pdf.text(`Department: ${request.hostDepartment}`, 32, 78)
      pdf.text(`Visit Date: ${request.date}`, 32, 86)
      pdf.text(`Time Window: ${request.time}`, 32, 94)

      if (request.purpose) {
        pdf.text(`Purpose of Visit: ${request.purpose}`, 32, 102)
      }

      // White Box for QR Code
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(99, 102, 241) // Indigo 500 border
      pdf.setLineWidth(1)
      pdf.roundedRect(65, 124, 80, 80, 4, 4, 'FD')
      if (qrDataUrl) {
        pdf.addImage(qrDataUrl, 'PNG', 70, 129, 70, 70)
      }

      // Gate Verification PIN / OTP Amber Box
      pdf.setFillColor(254, 243, 199) // Amber 100
      pdf.setDrawColor(251, 191, 36) // Amber 400
      pdf.setLineWidth(0.5)
      pdf.roundedRect(45, 212, 120, 25, 4, 4, 'FD')

      pdf.setTextColor(180, 83, 9) // Amber 700
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('GATE VERIFICATION OTP PIN', 105, 220, { align: 'center' })

      pdf.setFontSize(18)
      pdf.setTextColor(217, 119, 6) // Amber 600
      pdf.text(String(request.passPin || '241280'), 105, 231, { align: 'center' })

      // Footer
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Official Campus Visitor Management System • Valid for Single Gate Entry', 105, 268, { align: 'center' })

      // Trigger direct download instantly
      pdf.save(`Visitor_Gate_Pass_${request.id}.pdf`)
    } catch (err) {
      console.error('Instant PDF error:', err)
      window.print()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="auth-card w-full max-w-lg rounded-[28px] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold block">
                {request.id}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Visitor Gate Pass
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visitor Info Card */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">{request.visitorName}</span>
            </div>
            {getStatusBadge(request.status)}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block font-medium">Student Name</span>
              <span className="text-slate-200 font-semibold block mt-0.5">
                {request.studentName || request.host}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="text-slate-200 font-semibold block mt-0.5">
                {request.hostDepartment}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Visit Date</span>
              <span className="text-slate-200 font-semibold block mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" /> {request.date}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Time Window</span>
              <span className="text-slate-200 font-semibold block mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" /> {request.time}
              </span>
            </div>
          </div>

          {request.purpose && (
            <div className="pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 block font-medium">Purpose of Visit</span>
              <p className="text-slate-300 italic mt-0.5">{request.purpose}</p>
            </div>
          )}
        </div>

        {/* If Approved: Display Digital Visitor QR Pass Badge */}
        {request.status === 'Approved' && (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/30 text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" /> Official Campus Visitor Pass
            </div>

            {/* ULTRA-CRISP LOW-DENSITY QR CODE */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl mb-4 border-4 border-indigo-500/50">
              <QRCodeSVG
                id="visitor-qr-code-svg"
                value={request.id}
                size={200}
                level="L"
                marginSize={2}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            {/* 6-Digit OTP PIN */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block flex items-center justify-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Gate Verification PIN / OTP
              </span>
              <div className="inline-block bg-slate-950 border border-amber-500/40 text-amber-300 px-6 py-2 rounded-xl text-2xl font-mono font-bold tracking-widest shadow-inner">
                {request.passPin || '241280'}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS: SIMPLE INSTANT DOWNLOAD PASS (PDF) BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">
            Pass ID: <span className="text-indigo-400 font-bold">{request.id}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {request.status === 'Approved' && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-amber-300" />
                Download Pass (PDF)
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
