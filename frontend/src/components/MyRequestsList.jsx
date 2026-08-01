import React, { useState } from 'react'
import {
  Search,
  Plus,
  CheckCircle2,
  Clock3,
  XCircle,
  QrCode,
  Eye,
  FileQuestion,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react'

export default function MyRequestsList({
  requests,
  onSelectRequest,
  onNewRequest
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock3 className="w-3.5 h-3.5" />
            Pending
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            My Visit Requests
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track and manage your submitted visitor authorization requests.
          </p>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="auth-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Request ID, Host, Purpose..."
            className="w-full auth-input text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / List Card */}
      <div className="auth-card rounded-[24px] border border-slate-800 overflow-hidden shadow-xl">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Request ID</th>
                  <th className="py-4 px-6">Student Name & Department</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Purpose</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Request ID */}
                    <td className="py-4 px-6 font-mono font-semibold text-indigo-300">
                      {req.id}
                    </td>

                    {/* Host */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{req.host}</div>
                      <div className="text-xs text-slate-400">{req.hostDepartment}</div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-6 text-slate-200">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {req.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {req.time}
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="py-4 px-6">
                      <span className="inline-block bg-slate-800 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-700/60">
                        {req.purpose}
                      </span>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-4 px-6">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Action Icon - matches Admin Dashboard Eye button style */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'Approved' && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mr-1">
                            <QrCode className="w-4 h-4" /> Pass Ready
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectRequest(req)}
                          title="View Details"
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State Illustration */
          <div className="py-16 px-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
              <FileQuestion className="w-10 h-10 text-indigo-400/60" />
            </div>
            <h3 className="text-xl font-bold text-white">No Visitor Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2 mb-6">
              {requests.length === 0
                ? "You haven't submitted any visitor requests yet. Click below to create your first registration."
                : `No requests match the status filter "${statusFilter}" or search term "${searchTerm}".`}
            </p>
            {requests.length === 0 ? (
              <button
                type="button"
                onClick={onNewRequest}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create First Visit Request
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('All')
                }}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
