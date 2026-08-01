import React, { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  QrCode,
  KeyRound,
  Search,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Calendar,
  Clock,
  Building,
  Camera,
  ArrowLeft,
  X,
  RotateCcw,
  Upload
} from 'lucide-react'

export default function SecurityScannerDashboard({
  requests,
  onCheckIn,
  onCheckOut,
  onSelectRequestDetails,
  user,
  onBack
}) {
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [scannedRequest, setScannedRequest] = useState(null)
  const [scanError, setScanError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [actionSuccessMsg, setActionSuccessMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const html5QrCodeRef = useRef(null)
  const fileInputRef = useRef(null)

  // Filter entry/exit records for the table
  const entryExitRecords = requests.filter((r) =>
    ['Checked-In', 'Checked-Out'].includes(r.status)
  )

  const filteredEntryExit = entryExitRecords.filter((req) =>
    req.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.studentName && req.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (req.host && req.host.toLowerCase().includes(searchTerm.toLowerCase())) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.hostDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pass Expiry Evaluation Helper
  const evaluatePassValidity = (req) => {
    if (!req) return { isValid: false, reason: 'Visitor pass record not found in database.' }
    if (req.status === 'Rejected') {
      return { isValid: false, reason: 'Invalid Pass: Request was REJECTED by Admin.' }
    }
    if (req.status === 'Pending') {
      return { isValid: false, reason: 'Invalid Pass: Request is still PENDING Admin approval.' }
    }

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    if (req.date && req.date < todayStr) {
      return {
        isValid: false,
        reason: `Pass Expired: Scheduled visit date (${req.date}) has passed.`
      }
    }

    if (req.date === todayStr && req.time && req.time.includes('-')) {
      const parts = req.time.split('-')
      const endStr = parts[1].trim()
      let hours = 0, minutes = 0
      if (endStr.includes('AM') || endStr.includes('PM')) {
        const timeParts = endStr.split(' ')
        const [h, m] = timeParts[0].split(':')
        hours = parseInt(h, 10)
        minutes = parseInt(m, 10) || 0
        if (timeParts[1] === 'PM' && hours < 12) hours += 12
        if (timeParts[1] === 'AM' && hours === 12) hours = 0
      } else if (endStr.includes(':')) {
        const [h, m] = endStr.split(':')
        hours = parseInt(h, 10)
        minutes = parseInt(m, 10) || 0
      }

      const endDateTime = new Date()
      endDateTime.setHours(hours, minutes, 0, 0)

      if (now > endDateTime) {
        return {
          isValid: false,
          reason: `Pass Expired: Scheduled visit time (${req.time}) has passed.`
        }
      }
    }

    return { isValid: true }
  }

  // ULTRA-FAST & ROBUST QR / OTP VERIFICATION HANDLER
  const handleVerifyQuery = (queryVal) => {
    setScanError('')
    setActionSuccessMsg('')
    if (!queryVal) return

    const raw = String(queryVal).trim()
    console.log('Decoded Scanned Payload:', raw)
    const query = raw.toLowerCase()

    let extractedReqId = null
    let extractedPin = null

    // 1. Try JSON parsing (handles JSON QR payloads)
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.id) extractedReqId = String(parsed.id)
        if (parsed.pin) extractedPin = String(parsed.pin)
      } catch (e) {
        console.warn('JSON parsing error:', e)
      }
    }

    // 2. Extract REQ-XXXX via Regex
    if (!extractedReqId) {
      const reqIdMatch = raw.match(/REQ-\d+/i)
      if (reqIdMatch) extractedReqId = reqIdMatch[0]
    }

    // 3. Extract 6-Digit PIN via Regex
    if (!extractedPin) {
      const pinMatch = raw.match(/pin=(\d+)/i) || raw.match(/\b\d{6}\b/)
      if (pinMatch) extractedPin = pinMatch[1] || pinMatch[0]
    }

    const found = requests.find((r) => {
      if (extractedReqId && r.id.toLowerCase() === extractedReqId.toLowerCase()) return true
      if (extractedPin && r.passPin && String(r.passPin).trim() === extractedPin.trim()) return true
      if (r.id.toLowerCase() === query) return true
      if (r.passPin && String(r.passPin).trim() === raw) return true
      if (query.includes(r.id.toLowerCase())) return true
      return false
    })

    if (!found) {
      setScannedRequest(null)
      setScanError(`Invalid Pass QR Code / OTP: No matching visitor pass found.`)
      return
    }

    const validity = evaluatePassValidity(found)
    if (!validity.isValid) {
      setScanError(validity.reason)
      setScannedRequest({ ...found, isExpiredOrInvalid: true, invalidReason: validity.reason })
    } else {
      setScanError('')
      setScannedRequest(found)
    }
  }

  // FOOLPROOF REAL CAMERA QR SCANNER ENGINE (ENUMERATES SYSTEM CAMERAS)
  useEffect(() => {
    if (!isScannerOpen || scannedRequest || showOtpInput) {
      stopCamera()
      return
    }

    let isMounted = true

    const startCamera = async () => {
      setCameraError('')
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode('qr-reader-target')
        }

        const qrCodeSuccessCallback = (decodedText) => {
          if (isMounted) {
            console.log('QR Code Scanned from Camera:', decodedText)
            handleVerifyQuery(decodedText)
            stopCamera()
          }
        }

        const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
          const qrboxSize = Math.floor(minEdgeSize * 0.85)
          return { width: qrboxSize, height: qrboxSize }
        }

        const scanConfig = {
          fps: 20,
          qrbox: qrboxFunction,
          aspectRatio: 1.0,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        }

        // Try getCameras to get exact system camera ID (prevents OverconstrainedError)
        try {
          const devices = await Html5Qrcode.getCameras()
          if (devices && devices.length > 0 && isMounted) {
            const backCam = devices.find(d =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('environment') ||
              d.label.toLowerCase().includes('rear')
            )
            const targetCameraId = backCam ? backCam.id : devices[0].id

            await html5QrCodeRef.current.start(
              targetCameraId,
              scanConfig,
              qrCodeSuccessCallback,
              () => {}
            )
            if (isMounted) setCameraActive(true)
            return
          }
        } catch (deviceErr) {
          console.warn('Html5Qrcode.getCameras failed, falling back to facingMode:', deviceErr)
        }

        // Fallback to simple facingMode constraints
        if (isMounted && html5QrCodeRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: 'user' },
            scanConfig,
            qrCodeSuccessCallback,
            () => {}
          )
          if (isMounted) setCameraActive(true)
        }

      } catch (err) {
        console.error('Camera initialization error:', err)
        if (isMounted) {
          setCameraActive(false)
          setCameraError('Camera unavailable or permission denied. Please allow camera permissions, use OTP, or upload a QR pass image file below.')
        }
      }
    }

    const timer = setTimeout(() => {
      startCamera()
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timer)
      stopCamera()
    }
  }, [isScannerOpen, scannedRequest, showOtpInput])

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        setCameraActive(false)
      } catch (err) {
        console.error('Error stopping camera:', err)
      }
    }
  }

  // Handle QR Pass Image File Scan
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setScanError('')
      await stopCamera()

      const html5QrCodeFile = new Html5Qrcode('qr-file-reader-target')
      const decodedText = await html5QrCodeFile.scanFile(file, false)
      console.log('Decoded QR from image file:', decodedText)
      handleVerifyQuery(decodedText)
      html5QrCodeFile.clear()
    } catch (err) {
      console.error('File scan error:', err)
      setScanError('Failed to read QR code from image file. Make sure the image contains a clear visitor pass QR code or enter OTP below.')
    }
  }

  // Perform Check-In -> Completes verification & returns directly to Homepage
  const handlePerformCheckIn = (reqId) => {
    onCheckIn(reqId)
    const timestamp = new Date().toLocaleString()
    setActionSuccessMsg(`✅ Visitor (${reqId}) successfully CHECKED-IN at ${timestamp}!`)
    resetScannerState()
    setIsScannerOpen(false)
  }

  // Perform Check-Out -> Completes verification & returns directly to Homepage
  const handlePerformCheckOut = (reqId) => {
    onCheckOut(reqId)
    const timestamp = new Date().toLocaleString()
    setActionSuccessMsg(`✅ Visitor (${reqId}) successfully CHECKED-OUT at ${timestamp}!`)
    resetScannerState()
    setIsScannerOpen(false)
  }

  const resetScannerState = () => {
    stopCamera()
    setScannedRequest(null)
    setScanError('')
    setShowOtpInput(false)
    setOtpInput('')
  }

  // Top-Left Back Button Handler -> Always closes scanner & returns directly to Homepage
  const handleBackToHome = () => {
    resetScannerState()
    setIsScannerOpen(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked-In':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <LogIn className="w-3.5 h-3.5" /> Checked-In
          </span>
        )
      case 'Checked-Out':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <LogOut className="w-3.5 h-3.5" /> Checked-Out
          </span>
        )
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved / Active Pass
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">


      {/* Main Header Bar (Homepage Title & Actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
            Security Gate Access Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
            Entry and Exit Activity
          </h2>
        </div>

        {/* Right Action: Open Scanner & Officer Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetScannerState()
              setIsScannerOpen(true)
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Camera className="w-5 h-5 text-amber-300" />
            Scan / OTP
          </button>

          <div className="hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                {user?.name || 'Officer Marcus Vance'}
              </div>
              <div className="text-[10px] text-slate-400">
                {user?.gate || 'Gate 1 / Main Entrance'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION SUCCESS BANNER */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg('')}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN HOMEPAGE MODULE: ENTRY AND EXIT ACTIVITY TABLE */}
      <div className="auth-card rounded-[24px] border border-slate-800 p-6 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Entry and Exit Activity
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by visitor, student, dept..."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                resetScannerState()
                setIsScannerOpen(true)
              }}
              className="sm:hidden p-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" /> Scan / OTP
            </button>
          </div>
        </div>

        {filteredEntryExit.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Visitor</th>
                  <th className="py-3.5 px-4">Student Name &amp; Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Check-In Time</th>
                  <th className="py-3.5 px-4">Checked-In By</th>
                  <th className="py-3.5 px-4">Check-Out Time</th>
                  <th className="py-3.5 px-4">Checked-Out By</th>
                  <th className="py-3.5 px-4">Visit Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredEntryExit.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {r.visitorName}
                      <span className="block text-[10px] font-mono text-indigo-300 mt-0.5">{r.id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{r.studentName || r.host}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{r.hostDepartment}</span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>

                    <td className="py-3.5 px-4 font-mono text-emerald-300">
                      {r.checkInTime || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {r.checkedInBy || r.securityOfficer || '—'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-indigo-300">
                      {r.checkOutTime || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {r.checkOutTime ? (
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          {r.checkedOutBy || r.securityOfficer || '—'}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {(() => {
                        if (!r.checkInTime) return <span className="text-slate-500">—</span>
                        const inTime = new Date(r.checkInTime)
                        if (isNaN(inTime.getTime())) {
                          return r.durationMinutes ? (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                              {r.durationMinutes} mins
                            </span>
                          ) : <span className="text-slate-500">—</span>
                        }
                        const outTime = r.checkOutTime ? new Date(r.checkOutTime) : new Date()
                        const diffMs = outTime.getTime() - inTime.getTime()
                        const diffMins = Math.max(1, Math.round(diffMs / (1000 * 60)))

                        if (!r.checkOutTime) {
                          return (
                            <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                              {diffMins} mins (Active)
                            </span>
                          )
                        }
                        return (
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono">
                            {diffMins} mins
                          </span>
                        )
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-white">No gate activity recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">Check-In or Check-Out entries will appear here.</p>
          </div>
        )}
      </div>

      {/* FULL-SCREEN REAL CAMERA QR SCANNER OVERLAY */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
          
          {/* Hidden File Input & Container for QR Image Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div id="qr-file-reader-target" className="hidden"></div>

          {/* Center Content: Camera Viewfinder, OTP Entry Form, or Verified Pass Details */}
          <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4 my-auto">
            
            {!scannedRequest ? (
              <>
                {/* SINGLE CLEAN TOP BAR ABOVE SCANNER / OTP VIEWS */}
                <div className="w-full flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-indigo-400" />
                    <span>Back</span>
                  </button>

                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Pass Verification
                  </span>
                </div>

                {/* INVALID SCAN / OTP ERROR ALERT MESSAGE */}
                {scanError && (
                  <div className="w-full p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-white block">INVALID OTP / PASS CODE</span>
                      {scanError}
                    </div>
                  </div>
                )}

                {/* REAL CAMERA SCANNER VIEWFINDER BOX */}
                {!showOtpInput && (
                  <div className="relative w-full aspect-square max-w-xs sm:max-w-sm bg-black rounded-3xl overflow-hidden flex flex-col items-center justify-center border border-slate-900 shadow-2xl">
                    
                    {/* HTML5 QR Code Real Camera Video Container */}
                    <div id="qr-reader-target" className="w-full h-full object-cover"></div>

                    {/* SINGLE SET OF 4 SHARP WHITE CORNER L-BRACKETS */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg pointer-events-none z-10"></div>
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg pointer-events-none z-10"></div>
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg pointer-events-none z-10"></div>
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg pointer-events-none z-10"></div>

                    {/* Sweeping Purple Laser Scanning Beam Line */}
                    <div className="absolute inset-x-8 h-0.5 bg-purple-500 shadow-[0_0_15px_#a855f7] animate-laser-scan pointer-events-none z-10"></div>

                    {/* Fallback info when camera access unavailable */}
                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
                        <Camera className="w-10 h-10 text-slate-500" />
                        <p className="text-xs text-slate-300 font-medium">{cameraError}</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload QR Image File
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!showOtpInput && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs text-slate-300 font-medium text-center">
                      Position QR code within the frame to scan
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Scan QR from Image File
                    </button>
                  </div>
                )}

                {/* USE OTP PILL BUTTON */}
                {!showOtpInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setScanError('')
                      setShowOtpInput(true)
                    }}
                    className="px-8 py-3 rounded-full border border-white/80 hover:bg-white/10 text-white font-bold text-sm tracking-wide transition-all cursor-pointer active:scale-95 mt-4"
                  >
                    Use OTP
                  </button>
                ) : (
                  /* OTP Input Form directly inside Scanner overlay */
                  <div className="w-full bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 animate-in fade-in duration-200 shadow-2xl">
                    <div className="flex items-center justify-center border-b border-slate-800 pb-3">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4" /> Enter 6-Digit Gate OTP
                      </label>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleVerifyQuery(otpInput)
                      }}
                      className="space-y-3"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="Enter 6-digit OTP..."
                          className="flex-1 bg-slate-950 border border-slate-800 text-amber-200 text-sm rounded-xl px-4 py-3 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500 placeholder:text-slate-600 placeholder:font-normal"
                        />
                        <button
                          type="submit"
                          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-500/20"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              /* SCANNED / VERIFIED PASS DETAILS & ACTION PANEL */
              <div className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 animate-in fade-in duration-200 shadow-2xl">
                
                {/* Header with Top-Left Back Button */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBackToHome}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer border border-slate-700"
                    >
                      <ArrowLeft className="w-4 h-4 text-indigo-400" />
                      <span>Back</span>
                    </button>
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold block">
                        ID: {scannedRequest.id}
                      </span>
                      <h4 className="text-xl font-bold text-white mt-0.5">
                        {scannedRequest.visitorName}
                      </h4>
                    </div>
                  </div>
                  <div>
                    {scannedRequest.isExpiredOrInvalid ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-4 h-4" /> EXPIRED / INVALID
                      </span>
                    ) : (
                      getStatusBadge(scannedRequest.status)
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block font-medium">Student Name</span>
                    <span className="text-white font-bold block mt-0.5">
                      {scannedRequest.studentName || scannedRequest.host}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Department</span>
                    <span className="text-slate-200 font-semibold block mt-0.5">
                      {scannedRequest.hostDepartment}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Visit Time</span>
                    <span className="text-indigo-300 font-semibold block mt-0.5">
                      {scannedRequest.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Pass OTP</span>
                    <span className="text-amber-300 font-mono font-bold block mt-0.5">
                      {scannedRequest.passPin || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS (CHECK-IN / CHECK-OUT) */}
                <div className="pt-2">
                  {scannedRequest.isExpiredOrInvalid ? (
                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3">
                      <div className="text-rose-300 font-bold text-sm flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5 text-rose-400" /> Access Denied — Pass Expired / Invalid
                      </div>
                      <p className="text-xs text-rose-400/80">
                        {scannedRequest.invalidReason || 'This pass cannot be authorized.'}
                      </p>
                    </div>
                  ) : scannedRequest.status === 'Approved' ? (
                    <button
                      type="button"
                      onClick={() => handlePerformCheckIn(scannedRequest.id)}
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <LogIn className="w-5 h-5" /> AUTHORIZE &amp; CHECK-IN VISITOR
                    </button>
                  ) : scannedRequest.status === 'Checked-In' ? (
                    <button
                      type="button"
                      onClick={() => handlePerformCheckOut(scannedRequest.id)}
                      className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-5 h-5" /> RECORD CHECK-OUT FOR VISITOR
                    </button>
                  ) : (
                    /* VISIT ALREADY COMPLETED SCREEN */
                    <div className="p-4 rounded-xl bg-slate-800 text-center text-slate-300 font-semibold text-xs border border-slate-700">
                      Visit Already Completed (Checked-Out)
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Footer branding */}
          <div className="py-2 text-[10px] text-slate-600 font-mono">
            Campus Gate Security Scanner
          </div>

        </div>
      )}

    </div>
  )
}
