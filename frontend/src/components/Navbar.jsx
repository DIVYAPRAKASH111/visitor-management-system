import React, { useState } from 'react'
import {
  ShieldCheck,
  Plus,
  LogOut,
  FileText,
  Shield,
  Bell,
  QrCode,
  X,
  User,
  Mail,
  BadgeCheck,
  CheckCircle2
} from 'lucide-react'

export default function Navbar({ activeTab, setActiveTab, user, onLogout, notifications = [] }) {
  const userRole = user?.role || 'visitor'
  const userEmail = user?.email ? user.email.toLowerCase() : ''
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [dismissedNotifIds, setDismissedNotifIds] = useState([])

  const handleDismissNotification = (id) => {
    setDismissedNotifIds((prev) => [...prev, id])
  }

  // FILTER NOTIFICATIONS: STRICTLY TARGETED TO THIS LOGGED IN USER'S ROLE & EMAIL
  const userNotifications = notifications.filter((n) => {
    if (dismissedNotifIds.includes(n.id)) return false
    // If targeted to a specific user email, match this logged in user's email
    if (n.targetEmail && userEmail && n.targetEmail !== userEmail) {
      return false
    }
    // If targeted to a specific role, match this logged in user's role
    if (n.targetRole && n.targetRole !== userRole) {
      return false
    }
    return true
  })

  // Role-specific fallback notifications if feed is empty
  const defaultRoleNotifications = {
    admin: [
      { id: 'def-1', title: 'Admin Alert: New Visit Request (REQ-8494) awaiting approval review.', time: '10 mins ago' },
      { id: 'def-2', title: 'System Security Audit: Visitor Michael Scott Checked-In at Gate 1.', time: '25 mins ago' }
    ],
    security: [
      { id: 'def-1', title: 'Security Alert: Gate 1 Duty active. Real-time scanner ready.', time: '5 mins ago' },
      { id: 'def-2', title: 'Gate Activity: Visitor Angela Martin Checked-Out at Gate 1.', time: '1 hour ago' }
    ],
    visitor: [
      { id: 'def-1', title: '🎉 Great news! Your Visit Request (REQ-8492) was APPROVED by Admin! Pass & OTP PIN ready.', time: '10 mins ago' },
      { id: 'def-2', title: 'Welcome to Campus Gate Portal! Your passes are active for gate entry.', time: '1 hour ago' }
    ]
  }

  const rawNotifList = userNotifications.length > 0 ? userNotifications : (defaultRoleNotifications[userRole] || [])
  const notifList = rawNotifList.filter((n) => !dismissedNotifIds.includes(n.id))

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'System Administrator'
      case 'security':
        return 'Security Gate Officer'
      default:
        return 'Visitor'
    }
  }

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            System Admin
          </span>
        )
      case 'security':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Security Officer
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Visitor
          </span>
        )
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-white/10 bg-[#0d1322]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
      
      {/* Left: Brand Logo & Role Title */}
      <div className="flex items-center gap-3 select-none">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/30">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white tracking-wider leading-none">
              VMS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block mt-0.5">
            {userRole === 'admin' ? 'ADMIN PORTAL' : userRole === 'security' ? 'SECURITY PORTAL' : 'VISITOR PORTAL'}
          </span>
        </div>
      </div>

      {/* Right Actions & Navigation */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Visitor Role Navigation */}
        {userRole === 'visitor' && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              My Requests
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('new-request')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ${
                activeTab === 'new-request'
                  ? 'bg-indigo-500 text-white shadow-indigo-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Request</span>
              <span className="sm:hidden">New</span>
            </button>
          </>
        )}

        {/* Security Role Navigation */}
        {userRole === 'security' && (
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 text-white rounded-lg shadow-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              Gate Activity &amp; Scanner
            </button>
          </div>
        )}

        {/* Admin Role Navigation */}
        {userRole === 'admin' && (
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 text-white rounded-lg shadow-sm"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </button>
          </div>
        )}

        {/* Notifications Bell Dropdown (Filtered per Logged-in User) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen)
              setIsProfileOpen(false)
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="My Notifications Feed"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {/* Notifications Feed Popup */}
          {isNotifOpen && (
            <div className="absolute right-0 top-[115%] w-80 sm:w-96 bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-400" /> My Dashboard Notifications
                </span>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {notifList.length > 0 ? (
                  notifList.map((n, idx) => (
                    <div
                      key={n.id || idx}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition-colors relative pr-8 group"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDismissNotification(n.id)
                        }}
                        className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="font-semibold text-white leading-snug pr-2">{n.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>{n.time || 'Just now'}</span>
                        <span className="text-indigo-400 font-mono font-bold uppercase tracking-wider text-[9px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {userRole}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs font-medium">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

        {/* USER PROFILE CARD BUTTON & DROPDOWN (Name, Role, Email) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen)
              setIsNotifOpen(false)
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-slate-700"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>

            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">
                {user?.name || 'User Profile'}
              </div>
              <div className="text-[10px] text-indigo-300">
                {user?.email || 'user@campus.edu'}
              </div>
            </div>
          </button>

          {/* USER PROFILE VIEW CARD DROPDOWN */}
          {isProfileOpen && (
            <div className="absolute right-0 top-[115%] w-72 bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in duration-200 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4" /> Account Profile
                </span>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details Container */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-400" /> Name
                  </span>
                  <span className="text-white font-bold text-sm block mt-0.5">
                    {user?.name || 'User Profile'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" /> Account Role
                  </span>
                  <span className="text-emerald-300 font-semibold block mt-0.5">
                    {getRoleLabel()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1">
                    <Mail className="w-3 h-3 text-purple-400" /> Email Address
                  </span>
                  <span className="text-indigo-200 font-mono block mt-0.5 break-all">
                    {user?.email || 'user@campus.edu'}
                  </span>
                </div>
              </div>

              {/* Logout Button inside Profile Dropdown */}
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out Account
              </button>

            </div>
          )}

        </div>

      </div>
    </header>
  )
}
