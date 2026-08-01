import React, { useState } from 'react'
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  Calendar,
  Clock,
  Eye,
  Check,
  X,
  RefreshCw,
  Users,
  AlertCircle,
  Download,
  LogIn,
  LogOut,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  RotateCcw,
  Timer
} from 'lucide-react'
import CustomDatePicker from './CustomDatePicker'

export default function AdminDashboard({
  requests,
  onOpenApproveModal,
  onRejectRequest,
  onSelectRequestDetails,
  onResetDemoData,
  user
}) {
  // Main Sub-Tabs: 'requests' | 'audit-logs' | 'pass-validity'
  const [activeSubTab, setActiveSubTab] = useState('requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Date Filter State: 'all' | custom YYYY-MM-DD
  const [dateFilter, setDateFilter] = useState('all')

  // Date Match Helper
  const matchesDateFilter = (itemDate) => {
    if (dateFilter === 'all') return true
    return itemDate === dateFilter
  }

  // Filter 1: Visit Requests Table (ONLY Approved, Rejected, and Pending)
  const visitRequestRecords = requests
    .filter((r) => ['Pending', 'Approved', 'Rejected'].includes(r.status))
    .filter((r) => matchesDateFilter(r.date))

  const filteredRequests = visitRequestRecords.filter((req) => {
    const matchesSearch =
      req.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.studentName && req.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.hostDepartment.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Filter 2: Entry & Exit Audit Logs (ONLY Checked-In and Checked-Out)
  const entryExitRecords = requests
    .filter((r) => ['Checked-In', 'Checked-Out'].includes(r.status))
    .filter((r) => matchesDateFilter(r.date))
    .filter((req) => {
      return (
        req.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.studentName && req.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.hostDepartment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

  // Filter 3: Approved Passes List (ONLY Passes Approved by Admin)
  const approvedPassesOnly = requests
    .filter((r) => r.status === 'Approved' || r.status === 'Checked-In' || r.status === 'Checked-Out')
    .filter((r) => matchesDateFilter(r.date))

  const filteredApprovedPasses = approvedPassesOnly.filter((req) => {
    return (
      req.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.studentName && req.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.hostDepartment.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Live Pass Expiry Calculation Helper
  const calculatePassValidityStatus = (req) => {
    const now = new Date()
    const reqDate = req.date
    let endTimeStr = req.endTime || '17:00'

    // Parse time range if present (e.g. "10:00 AM - 11:55 PM")
    if (req.time && req.time.includes('-')) {
      const parts = req.time.split('-')
      const endPart = parts[1].trim()
      const timeBits = endPart.split(' ')
      if (timeBits.length >= 2) {
        const [h, m] = timeBits[0].split(':')
        let hours = parseInt(h, 10)
        if (timeBits[1] === 'PM' && hours < 12) hours += 12
        if (timeBits[1] === 'AM' && hours === 12) hours = 0
        endTimeStr = `${hours < 10 ? '0' + hours : hours}:${m}`
      }
    } else if (endTimeStr.includes('AM') || endTimeStr.includes('PM')) {
      const parts = endTimeStr.trim().split(' ')
      const [h, m] = parts[0].split(':')
      let hours = parseInt(h, 10)
      if (parts[1] === 'PM' && hours < 12) hours += 12
      if (parts[1] === 'AM' && hours === 12) hours = 0
      endTimeStr = `${hours < 10 ? '0' + hours : hours}:${m}`
    }

    const endDateTime = new Date(`${reqDate}T${endTimeStr}:00`)
    if (isNaN(endDateTime.getTime())) {
      return 'Active'
    }

    return now > endDateTime ? 'Expired' : 'Active'
  }

  // Metrics for Visit Requests
  const totalRequestsCount = visitRequestRecords.length
  const pendingCount = visitRequestRecords.filter((r) => r.status === 'Pending').length
  const approvedCount = visitRequestRecords.filter((r) => r.status === 'Approved').length
  const rejectedCount = visitRequestRecords.filter((r) => r.status === 'Rejected').length

  // Metrics for Entry & Exit Logs
  const checkedInCount = entryExitRecords.filter((r) => r.status === 'Checked-In').length
  const checkedOutCount = entryExitRecords.filter((r) => r.status === 'Checked-Out').length
  const totalGateActivity = entryExitRecords.length

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        )
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
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock3 className="w-3.5 h-3.5" /> Pending
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

  // Export CSV function
  const handleExportCSV = () => {
    const isAudit = activeSubTab === 'audit-logs'
    const isPassValidity = activeSubTab === 'pass-validity'
    const targetData = isAudit ? entryExitRecords : isPassValidity ? filteredApprovedPasses : filteredRequests
    const headers = isAudit
      ? ['Request ID', 'Visitor Name', 'Student Name', 'Department', 'Status', 'Check-In Time', 'Checked-In By', 'Check-Out Time', 'Checked-Out By', 'Duration (Mins)']
      : isPassValidity
      ? ['Request ID', 'Visitor Name', 'Student Name', 'Department', 'Visit Date', 'Visit Time', 'Purpose', 'Pass Status']
      : ['Request ID', 'Visitor Name', 'Student Name', 'Department', 'Visit Date', 'Visit Time', 'Status', 'Submitted At']

    const rows = targetData.map((r) =>
      isAudit
        ? [
            r.id,
            `"${r.visitorName}"`,
            `"${r.studentName || r.host}"`,
            `"${r.hostDepartment}"`,
            r.status,
            `"${r.checkInTime || ''}"`,
            `"${r.checkedInBy || r.securityOfficer || 'Officer Marcus Vance'}"`,
            `"${r.checkOutTime || ''}"`,
            `"${r.checkedOutBy || r.securityOfficer || 'Officer Sarah Jenkins'}"`,
            r.durationMinutes || 'Active'
          ]
        : isPassValidity
        ? [
            r.id,
            `"${r.visitorName}"`,
            `"${r.studentName || r.host}"`,
            `"${r.hostDepartment}"`,
            r.date,
            r.time,
            `"${r.purpose}"`,
            calculatePassValidityStatus(r)
          ]
        : [
            r.id,
            `"${r.visitorName}"`,
            `"${r.studentName || r.host}"`,
            `"${r.hostDepartment}"`,
            r.date,
            r.time,
            r.status,
            `"${r.submittedAt || ''}"`
          ]
    )

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeSubTab}_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              Campus Administration Management
            </span>
            {user?.name && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Logged in as {user.name} ({user.email})
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            System Administration & Analytics
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {requests.length === 0 && (
            <button
              type="button"
              onClick={onResetDemoData}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo
            </button>
          )}
        </div>
      </div>

      {/* TOP BAR: Main Sub-Tabs & Calendar Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Visit Requests ({visitRequestRecords.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit-logs')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'audit-logs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" /> Entry & Exit Log ({entryExitRecords.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('pass-validity')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'pass-validity'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Timer className="w-4 h-4 text-amber-400" /> Pass Status ({approvedPassesOnly.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {dateFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Show All Dates
            </button>
          )}

          <div className="w-52">
            <CustomDatePicker
              value={dateFilter}
              onChange={(newDate) => setDateFilter(newDate)}
              allowPastDates={true}
            />
          </div>
        </div>
      </div>

      {/* DYNAMIC SUMMARY METRICS CARDS */}
      {activeSubTab === 'requests' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">Total Requests</div>
              <div className="text-white font-bold text-xl">{totalRequestsCount}</div>
            </div>
          </div>

          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">Pending Requests</div>
              <div className="text-amber-300 font-bold text-xl">{pendingCount}</div>
            </div>
          </div>

          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">Approved</div>
              <div className="text-emerald-300 font-bold text-xl">{approvedCount}</div>
            </div>
          </div>

          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">Rejected</div>
              <div className="text-rose-300 font-bold text-xl">{rejectedCount}</div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'audit-logs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">Total Gate Activity</div>
              <div className="text-white font-bold text-xl">{totalGateActivity}</div>
            </div>
          </div>

          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">Checked-In Count</div>
              <div className="text-emerald-300 font-bold text-xl">{checkedInCount}</div>
            </div>
          </div>

          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">Checked-Out Count</div>
              <div className="text-indigo-300 font-bold text-xl">{checkedOutCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN DATA TABLES */}
      {activeSubTab === 'requests' && (
        <>
          <div className="auth-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search visitor, student name, department..."
                className="w-full auth-input text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="auth-card rounded-[24px] border border-slate-800 overflow-hidden shadow-2xl">
            {filteredRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-5">Visitor Name</th>
                      <th className="py-4 px-5">Student Name</th>
                      <th className="py-4 px-5">Department</th>
                      <th className="py-4 px-5">Visit Date / Time</th>
                      <th className="py-4 px-5">Purpose</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-semibold text-white">{req.visitorName}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-indigo-300 text-[11px]">{req.id}</span>
                          </div>
                        </td>

                        <td className="py-4 px-5 font-medium text-slate-200">
                          <div>{req.studentName || req.host}</div>
                          {req.studentRegisterNo && (
                            <span className="text-[11px] font-mono text-indigo-400 block">
                              Reg: {req.studentRegisterNo}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <span className="inline-block text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            {req.hostDepartment}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-200">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {req.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {req.time}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-xs text-slate-300">{req.purpose}</td>

                        <td className="py-4 px-5">{getStatusBadge(req.status)}</td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectRequestDetails(req)}
                              title="View Details"
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {req.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onOpenApproveModal(req)}
                                  title="Approve Request"
                                  className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all cursor-pointer"
                                >
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRejectRequest(req.id)}
                                  title="Reject Request"
                                  className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                                >
                                  <X className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 px-6 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-500 mb-3" />
                <h3 className="text-lg font-bold text-white">No Visitor Found</h3>
              </div>
            )}
          </div>
        </>
      )}

      {activeSubTab === 'audit-logs' && (
        <div className="auth-card rounded-[24px] border border-slate-800 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Entry & Exit Log
              </h3>
            </div>

            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter logs by visitor name..."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {entryExitRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Visitor</th>
                    <th className="py-3.5 px-4">Student & Dept</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Check-In Time</th>
                    <th className="py-3.5 px-4">Checked-In By</th>
                    <th className="py-3.5 px-4">Check-Out Time</th>
                    <th className="py-3.5 px-4">Checked-Out By</th>
                    <th className="py-3.5 px-4">Visit Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {entryExitRecords.map((r) => (
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
                          {r.checkedInBy || r.securityOfficer || 'Officer Marcus Vance'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-indigo-300">
                        {r.checkOutTime || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {r.checkOutTime ? (
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                            {r.checkedOutBy || r.securityOfficer || 'Officer Sarah Jenkins'}
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
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-white">No active Check-In or Check-Out logs recorded</p>
            </div>
          )}
        </div>
      )}

      {/* NEW SUB-TAB 3: APPROVED PASS STATUS & LIVE VALIDITY (ACTIVE vs EXPIRED) IN ADMIN DASH */}
      {activeSubTab === 'pass-validity' && (
        <div className="auth-card rounded-[24px] border border-slate-800 p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" /> Pass Status
              </h3>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search visitor, student, department..."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {filteredApprovedPasses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-4 px-5">Visitor Name</th>
                    <th className="py-4 px-5">Student Name</th>
                    <th className="py-4 px-5">Department</th>
                    <th className="py-4 px-5">Visit Date / Time</th>
                    <th className="py-4 px-5">Purpose</th>
                    <th className="py-4 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200 text-sm">
                  {filteredApprovedPasses.map((req) => {
                    const passState = calculatePassValidityStatus(req)
                    return (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5 font-semibold text-white">
                          {req.visitorName}
                          <span className="block text-[11px] font-mono text-indigo-300 mt-0.5">{req.id}</span>
                        </td>

                        <td className="py-4 px-5 font-medium text-slate-200">
                          <div>{req.studentName || req.host}</div>
                          {req.studentRegisterNo && (
                            <span className="text-[11px] font-mono text-indigo-400 block mt-0.5">
                              Reg: {req.studentRegisterNo}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <span className="inline-block text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            {req.hostDepartment}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-200">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {req.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {req.time}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-xs text-slate-300">{req.purpose}</td>

                        <td className="py-4 px-5">
                          {passState === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <XCircle className="w-3.5 h-3.5" /> Expired
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-500 mb-3" />
              <h4 className="text-base font-bold text-white">No Admin-Approved Passes Found</h4>
              <p className="text-xs text-slate-500 mt-1">Passes approved by admin will automatically display here with active/expired status evaluation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
