import React, { useState, useEffect } from 'react'
import AuthCard from './components/AuthCard'
import Navbar from './components/Navbar'
import NewVisitRequestForm from './components/NewVisitRequestForm'
import MyRequestsList from './components/MyRequestsList'
import SecurityScannerDashboard from './components/SecurityScannerDashboard'
import AdminDashboard from './components/AdminDashboard'
import VisitorPassModal from './components/VisitorPassModal'
import ApproveRequestModal from './components/ApproveRequestModal'
import { API_BASE_URL } from './config'

// Error Boundary Guard to prevent dark blank screens on uncaught errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto mt-20 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-6">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl cursor-pointer"
          >
            Reload Dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Initial Requests List (Clean, Populated by Live Registration)
const initialRequestsFallback = []

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  // Active view tab state: 'requests' | 'new-request' | 'security' | 'admin'
  const [activeTab, setActiveTab] = useState('requests')

  // Visitor Requests list state
  const [requests, setRequests] = useState(initialRequestsFallback)

  // Currently expanded request for details/QR pass modal
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Approval modal state
  const [approveModalRequest, setApproveModalRequest] = useState(null)

  // Notifications Feed (Role-Scoped & User-Targeted)
  const [notifications, setNotifications] = useState([])

  // Toast notification message
  const [toastMessage, setToastMessage] = useState(null)

  // SCOPED NOTIFICATION DISPATCHER ENGINE
  const addNotification = ({ title, targetRole, targetEmail }) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      title,
      targetRole, // 'visitor' | 'admin' | 'security'
      targetEmail: targetEmail ? targetEmail.toLowerCase() : null,
      time: 'Just now'
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  const showToast = (msg, options = {}) => {
    setToastMessage(msg)
    if (options.targetRole || options.targetEmail) {
      addNotification({
        title: msg,
        targetRole: options.targetRole,
        targetEmail: options.targetEmail
      })
    }
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Fetch requests from backend when user logs in (Filtered for Assigned Admin, Full for Security)
  const fetchRequests = async (currentUser) => {
    try {
      const u = currentUser || user
      const roleParam = u?.role || 'visitor'
      const emailParam = u?.email || ''
      const res = await fetch(`${API_BASE_URL}/api/requests?role=${roleParam}&email=${encodeURIComponent(emailParam)}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (err) {
      console.warn('Backend unavailable, using local memory state:', err)
    }
  }

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchRequests(user)
    }
  }, [isLoggedIn, user])

  // Handle successful login or registration (Role-Specific Welcome Notifications)
  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    fetchRequests(userData)

    if (userData.role === 'security') {
      setActiveTab('security')
      addNotification({
        title: `Welcome Officer ${userData.name}! Signed in to Security Gate Access Control.`,
        targetRole: 'security',
        targetEmail: userData.email
      })
    } else if (userData.role === 'admin') {
      setActiveTab('admin')
      addNotification({
        title: `Welcome Admin ${userData.name}! Signed in to System Administration Portal.`,
        targetRole: 'admin',
        targetEmail: userData.email
      })
    } else {
      setActiveTab('requests')
      addNotification({
        title: `Welcome back, ${userData.name}! Signed in to Visitor Management Portal.`,
        targetRole: 'visitor',
        targetEmail: userData.email
      })
    }
    setToastMessage(`Signed in as ${userData.name} (${userData.role.toUpperCase()})`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  // Submit New Visit Request -> Sends target notification to Admin and to the specific Visitor!
  const handleCreateNewRequest = async (newRequestData) => {
    let createdReq = null
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequestData),
      })
      if (res.ok) {
        createdReq = await res.json()
      }
    } catch (err) {
      console.warn('Backend unavailable, creating locally:', err)
    }

    if (!createdReq) {
      createdReq = {
        ...newRequestData,
        approvedBy: null,
        approvedAt: null,
        checkInTime: null,
        checkOutTime: null,
      }
    }

    setRequests((prev) => {
      if (prev.some((r) => r.id === createdReq.id)) return prev
      return [createdReq, ...prev]
    })
    setActiveTab('requests')

    // 1. Send notification to ADMIN DASHBOARD ONLY
    addNotification({
      title: `New Visit Request (${createdReq.id}) submitted by ${createdReq.visitorName} for ${createdReq.studentName || createdReq.host} (${createdReq.hostDepartment}).`,
      targetRole: 'admin'
    })

    // 2. Send notification to THIS VISITOR'S DASHBOARD ONLY
    addNotification({
      title: `Your Visit Request (${createdReq.id}) was submitted successfully. Awaiting Admin review.`,
      targetRole: 'visitor',
      targetEmail: createdReq.email
    })

    showToast(`Request ${createdReq.id} submitted successfully!`)
  }

  // Admin Approve Request -> Sends notification to Visitor's Dashboard ONLY!
  const handleConfirmApprove = async (requestId, timestamp) => {
    const passPin = Math.floor(100000 + Math.random() * 900000).toString()
    const targetReq = requests.find((r) => r.id === requestId)

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp, passPin }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)))
      }
    } catch (err) {
      console.warn('Backend unavailable, approving locally:', err)
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: 'Approved',
                approvedAt: timestamp,
                passPin,
              }
            : req
        )
      )
    }

    setApproveModalRequest(null)

    // 1. Send notification ONLY to the specific Visitor who owns this request
    addNotification({
      title: `🎉 Great news! Your visit request (${requestId}) was APPROVED by Admin! Your QR Pass and OTP PIN (${passPin}) are ready.`,
      targetRole: 'visitor',
      targetEmail: targetReq?.email
    })

    // 2. Send notification to ADMIN
    addNotification({
      title: `Approved visit pass (${requestId}) for ${targetReq?.visitorName || 'Visitor'}.`,
      targetRole: 'admin'
    })

    showToast(`Pass ${requestId} approved successfully!`)
  }

  // Admin Reject Request -> Sends notification to Visitor's Dashboard ONLY!
  const handleRejectRequest = async (requestId) => {
    const targetReq = requests.find((r) => r.id === requestId)

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/reject`, {
        method: 'PATCH',
      })
      if (res.ok) {
        const updated = await res.json()
        setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)))
      }
    } catch (err) {
      console.warn('Backend unavailable, rejecting locally:', err)
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'Rejected', approvedBy: null, approvedAt: null }
            : req
        )
      )
    }

    // 1. Send notification ONLY to the specific Visitor who owns this request
    addNotification({
      title: `Notice: Your visit request (${requestId}) was REJECTED by Admin. Campus entry is denied.`,
      targetRole: 'visitor',
      targetEmail: targetReq?.email
    })

    // 2. Send notification to ADMIN
    addNotification({
      title: `Rejected visit pass (${requestId}) for ${targetReq?.visitorName || 'Visitor'}.`,
      targetRole: 'admin'
    })

    showToast(`Request ${requestId} rejected.`)
  }

  // Security Check-In Endpoint -> Sends notification to Security, Admin, and Visitor!
  const handleCheckIn = async (requestId) => {
    const officerName = user?.name || 'Officer Marcus Vance'
    const targetReq = requests.find((r) => r.id === requestId)
    const timestamp = new Date().toLocaleString()

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName }),
      })
      if (res.ok) {
        const data = await res.json()
        setRequests((prev) => prev.map((r) => (r.id === requestId ? data.request : r)))
      }
    } catch (err) {
      console.warn('Backend check-in unavailable, local fallback:', err)
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'Checked-In', checkInTime: timestamp, checkedInBy: officerName }
            : r
        )
      )
    }

    // 1. Security Officer Notification
    addNotification({
      title: `Authorized Check-In for Visitor (${targetReq?.visitorName || requestId}) at Gate 1.`,
      targetRole: 'security'
    })

    // 2. Visitor Notification
    addNotification({
      title: `Checked-In successfully at Campus Gate 1 (${timestamp}). Welcome!`,
      targetRole: 'visitor',
      targetEmail: targetReq?.email
    })

    // 3. Admin Audit Notification
    addNotification({
      title: `Visitor (${targetReq?.visitorName || requestId}) Checked-In at Gate 1 by ${officerName}.`,
      targetRole: 'admin'
    })

    showToast(`Visitor Checked-In by ${officerName}`)
  }

  // Security Check-Out Endpoint -> Sends notification to Security, Admin, and Visitor!
  const handleCheckOut = async (requestId) => {
    const officerName = user?.name || 'Officer Marcus Vance'
    const targetReq = requests.find((r) => r.id === requestId)
    const timestamp = new Date().toLocaleString()

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName }),
      })
      if (res.ok) {
        const data = await res.json()
        setRequests((prev) => prev.map((r) => (r.id === requestId ? data.request : r)))
      }
    } catch (err) {
      console.warn('Backend check-out unavailable, local fallback:', err)
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === requestId) {
            const inTime = new Date(r.checkInTime || timestamp)
            const outTime = new Date(timestamp)
            let durationMinutes = 1
            if (!isNaN(inTime.getTime()) && !isNaN(outTime.getTime())) {
              const diffMs = outTime.getTime() - inTime.getTime()
              durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)))
            }
            return {
              ...r,
              status: 'Checked-Out',
              checkOutTime: timestamp,
              checkedOutBy: officerName,
              durationMinutes,
            }
          }
          return r
        })
      )
    }

    // 1. Security Officer Notification
    addNotification({
      title: `Recorded Check-Out for Visitor (${targetReq?.visitorName || requestId}) at Gate 1.`,
      targetRole: 'security'
    })

    // 2. Visitor Notification
    addNotification({
      title: `Checked-Out successfully from campus at ${timestamp}. Thank you for visiting!`,
      targetRole: 'visitor',
      targetEmail: targetReq?.email
    })

    // 3. Admin Audit Notification
    addNotification({
      title: `Visitor (${targetReq?.visitorName || requestId}) Checked-Out at Gate 1 by ${officerName}.`,
      targetRole: 'admin'
    })

    showToast(`Visitor Checked-Out by ${officerName}`)
  }

  const handleResetDemoData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/requests/reset', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests)
        showToast('Demo data reloaded.')
        return
      }
    } catch (err) {
      console.warn('Backend reset unavailable:', err)
    }

    setRequests(initialRequestsFallback)
    showToast('Sample requests data reloaded.')
  }

  if (!isLoggedIn) {
    return <AuthCard onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[160px] pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        notifications={notifications}
      />



      {/* Main Content Body - Wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 z-10">
          {(user?.role?.toLowerCase() === 'admin') && (
            <AdminDashboard
              requests={requests}
              onOpenApproveModal={(req) => setApproveModalRequest(req)}
              onRejectRequest={handleRejectRequest}
              onSelectRequestDetails={(req) => setSelectedRequest(req)}
              user={user}
            />
          )}

          {(user?.role?.toLowerCase() === 'security') && (
            <SecurityScannerDashboard
              requests={requests}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onSelectRequestDetails={(req) => setSelectedRequest(req)}
              user={user}
              onBack={handleLogout}
            />
          )}

          {(user?.role?.toLowerCase() === 'visitor' || (!['admin', 'security'].includes(user?.role?.toLowerCase() || ''))) && (
            activeTab === 'new-request' ? (
              <NewVisitRequestForm
                onSubmitSuccess={handleCreateNewRequest}
                onCancel={() => setActiveTab('requests')}
              />
            ) : (
              <MyRequestsList
                requests={requests}
                onSelectRequest={(req) => setSelectedRequest(req)}
                onNewRequest={() => setActiveTab('new-request')}
              />
            )
          )}
        </main>
      </ErrorBoundary>

      {/* Expanded Details & Digital QR Pass Modal */}
      {selectedRequest && (
        <VisitorPassModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* Approve Confirmation Modal */}
      {approveModalRequest && (
        <ApproveRequestModal
          request={approveModalRequest}
          onConfirmApprove={handleConfirmApprove}
          onClose={() => setApproveModalRequest(null)}
        />
      )}
    </div>
  )
}
