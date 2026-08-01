import express from 'express'
import VisitorRequest from '../models/VisitorRequest.js'
import GateLog from '../models/GateLog.js'
const liveRequestsStore = []
const liveLogsStore = []

const router = express.Router()

// DELETE /api/requests/wipe-all - Wipe out all old test data from MongoDB
router.delete('/wipe-all', async (req, res) => {
  try {
    await VisitorRequest.deleteMany({})
    await GateLog.deleteMany({})
    liveRequestsStore.length = 0
    liveLogsStore.length = 0
    console.log('🧹 Wiped all old visitor requests & gate logs from MongoDB!')
    return res.json({ message: 'All old visitor data successfully deleted.' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// GET /api/requests - Get all requests (or filtered by email/role)
router.get('/', async (req, res) => {
  const { email, role } = req.query

  try {
    let query = {}
    if (role === 'visitor' && email) {
      query.email = new RegExp(`^${email}$`, 'i')
    } else if (role === 'admin' && email && email.toLowerCase() !== 'admin@campus.edu') {
      // Filter requests assigned specifically to this Admin (admin1=Reqs 1-20, admin2=Reqs 21-40, admin3=Reqs 41+)
      query.assignedAdminEmail = new RegExp(`^${email}$`, 'i')
    }
    // Security role gets query = {} (All records across campus!)

    const dbRequests = await VisitorRequest.find(query).sort({ createdAt: -1 })
    const cleanRequests = (dbRequests || []).filter(r => !['REQ-8492','REQ-8493','REQ-8494','REQ-8495','REQ-8496'].includes(r.id))
    return res.json(cleanRequests)
  } catch (err) {
    console.warn('MongoDB GET requests fallback:', err.message)
  }

  // Fallback to memory
  if (role === 'visitor' && email) {
    const userRequests = liveRequestsStore.filter(
      (r) => r.email.toLowerCase() === email.toLowerCase() && !['REQ-8492','REQ-8493','REQ-8494','REQ-8495','REQ-8496'].includes(r.id)
    )
    return res.json(userRequests)
  } else if (role === 'admin' && email && email.toLowerCase() !== 'admin@campus.edu') {
    const adminRequests = liveRequestsStore.filter(
      (r) => r.assignedAdminEmail && r.assignedAdminEmail.toLowerCase() === email.toLowerCase()
    )
    return res.json(adminRequests)
  }
  return res.json(liveRequestsStore.filter(r => !['REQ-8492','REQ-8493','REQ-8494','REQ-8495','REQ-8496'].includes(r.id)))
})

// GET /api/requests/verify/:id - Real-time QR / OTP Verification
router.get('/verify/:id', async (req, res) => {
  const { id } = req.params
  const cleanId = id.includes(':') ? id.split(':')[1] : id

  try {
    const request = await VisitorRequest.findOne({
      id: new RegExp(`^${cleanId}$`, 'i')
    })
    if (request) return res.json(request)
  } catch (err) {
    console.warn('MongoDB verify request fallback:', err.message)
  }

  const fallback = liveRequestsStore.find((r) => r.id.toLowerCase() === cleanId.toLowerCase())
  if (!fallback) {
    return res.status(404).json({ error: 'Invalid or unrecognized Visitor Pass QR code / ID.' })
  }
  return res.json(fallback)
})

// POST /api/requests - Submit Visitor Registration Request (Saves to MongoDB with Admin Assignment)
router.post('/', async (req, res) => {
  const { visitorName, email, phone, studentName, studentRegisterNo, host, hostDepartment, date, time, startTime, endTime, purpose } = req.body

  if (!visitorName || !email || (!studentName && !host) || !date || !time) {
    return res.status(400).json({ error: 'Missing required visit registration fields.' })
  }

  const sName = studentName || host
  const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`

  // Dynamically assign Admin based on submission sequence:
  // First 20 -> admin1@gmail.com (Prakash)
  // Next 20  -> admin2@gmail.com (Gobi)
  // Rest     -> admin3@gmail.com (Abhi)
  let currentCount = 0
  try {
    currentCount = await VisitorRequest.countDocuments()
  } catch (err) {
    currentCount = liveRequestsStore.length
  }

  let assignedEmail = 'admin1@gmail.com'
  let assignedName = 'Prakash'
  if (currentCount >= 20 && currentCount < 40) {
    assignedEmail = 'admin2@gmail.com'
    assignedName = 'Gobi'
  } else if (currentCount >= 40) {
    assignedEmail = 'admin3@gmail.com'
    assignedName = 'Abhi'
  }

  const newRequestData = {
    id: reqId,
    visitorName,
    email,
    phone: phone || '',
    host: sName,
    studentName: sName,
    studentRegisterNo: studentRegisterNo || 'N/A',
    hostDepartment: hostDepartment || 'Computer Science & Engineering (CSE)',
    date,
    time,
    startTime: startTime || '10:00',
    endTime: endTime || '12:30',
    purpose: purpose || 'General Visit',
    status: 'Pending',
    approvedBy: null,
    approvedAt: null,
    checkInTime: null,
    checkedInBy: null,
    checkOutTime: null,
    checkedOutBy: null,
    durationMinutes: null,
    assignedAdminEmail: assignedEmail,
    assignedAdminName: assignedName,
    submittedAt: new Date().toLocaleString()
  }

  try {
    const created = await VisitorRequest.create(newRequestData)
    liveRequestsStore.unshift(created.toObject())
    console.log(`💾 Saved new Visitor Request (${created.id}) assigned to Admin ${assignedName} (${assignedEmail})!`)
    return res.status(201).json(created)
  } catch (err) {
    console.warn('MongoDB save fallback:', err.message)
    liveRequestsStore.unshift(newRequestData)
    return res.status(201).json(newRequestData)
  }
})

// PATCH /api/requests/:id/approve - Approve Request (Generates 6-Digit OTP)
router.patch('/:id/approve', async (req, res) => {
  const { id } = req.params
  const { timestamp, passPin } = req.body
  const approvedAt = timestamp || new Date().toLocaleString()
  const pin = passPin || Math.floor(100000 + Math.random() * 900000).toString()

  try {
    const updated = await VisitorRequest.findOneAndUpdate(
      { id: new RegExp(`^${id}$`, 'i') },
      { status: 'Approved', approvedBy: 'Admin Portal', approvedAt, passPin: pin },
      { new: true }
    )
    if (updated) {
      console.log(`✅ Approved Pass (${updated.id}) in MongoDB. OTP PIN: ${pin}`)
      return res.json(updated)
    }
  } catch (err) {
    console.warn('MongoDB approve fallback:', err.message)
  }

  const reqObj = fallbackRequests.find((r) => r.id.toLowerCase() === id.toLowerCase())
  if (!reqObj) return res.status(404).json({ error: 'Request not found.' })

  reqObj.status = 'Approved'
  reqObj.approvedBy = 'Admin Portal'
  reqObj.approvedAt = approvedAt
  reqObj.passPin = pin
  return res.json(reqObj)
})

// PATCH /api/requests/:id/reject - Reject Request
router.patch('/:id/reject', async (req, res) => {
  const { id } = req.params
  try {
    const updated = await VisitorRequest.findOneAndUpdate(
      { id: new RegExp(`^${id}$`, 'i') },
      { status: 'Rejected', approvedBy: null, approvedAt: null },
      { new: true }
    )
    if (updated) return res.json(updated)
  } catch (err) {
    console.warn('MongoDB reject fallback:', err.message)
  }

  const reqObj = fallbackRequests.find((r) => r.id.toLowerCase() === id.toLowerCase())
  if (!reqObj) return res.status(404).json({ error: 'Request not found.' })

  reqObj.status = 'Rejected'
  reqObj.approvedBy = null
  reqObj.approvedAt = null
  return res.json(reqObj)
})

// POST /api/requests/:id/check-in - Record Gate Entry
router.post('/:id/check-in', async (req, res) => {
  const { id } = req.params
  const { officerName } = req.body
  const timestamp = new Date().toLocaleString()
  const officer = officerName || 'Officer Marcus Vance'

  try {
    const updated = await VisitorRequest.findOneAndUpdate(
      { id: new RegExp(`^${id}$`, 'i') },
      { status: 'Checked-In', checkInTime: timestamp, checkedInBy: officer },
      { new: true }
    )
    if (updated) {
      const gateLog = await GateLog.create({
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        requestId: updated.id,
        visitorName: updated.visitorName,
        host: updated.studentName || updated.host,
        department: updated.hostDepartment,
        action: 'CHECK_IN',
        timestamp,
        securityOfficer: officer,
        gate: 'Gate 1 / Main Entrance'
      })
      return res.json({ message: 'Visitor checked in successfully.', request: updated, log: gateLog })
    }
  } catch (err) {
    console.warn('MongoDB check-in fallback:', err.message)
  }

  const reqObj = fallbackRequests.find((r) => r.id.toLowerCase() === id.toLowerCase())
  if (!reqObj) return res.status(404).json({ error: 'Request not found.' })

  reqObj.status = 'Checked-In'
  reqObj.checkInTime = timestamp
  reqObj.checkedInBy = officer
  return res.json({ message: 'Visitor checked in successfully.', request: reqObj })
})

// POST /api/requests/:id/check-out - Record Gate Departure & Calculate Visit Duration
router.post('/:id/check-out', async (req, res) => {
  const { id } = req.params
  const { officerName } = req.body
  const timestamp = new Date().toLocaleString()
  const officer = officerName || 'Officer Marcus Vance'

  try {
    const existing = await VisitorRequest.findOne({ id: new RegExp(`^${id}$`, 'i') })
    if (existing) {
      const inTime = new Date(existing.checkInTime || timestamp)
      const outTime = new Date(timestamp)
      let durationMinutes = 1
      if (!isNaN(inTime.getTime()) && !isNaN(outTime.getTime())) {
        const diffMs = outTime.getTime() - inTime.getTime()
        durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)))
      }

      existing.status = 'Checked-Out'
      existing.checkOutTime = timestamp
      existing.checkedOutBy = officer
      existing.durationMinutes = durationMinutes
      await existing.save()

      const gateLog = await GateLog.create({
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        requestId: existing.id,
        visitorName: existing.visitorName,
        host: existing.studentName || existing.host,
        department: existing.hostDepartment,
        action: 'CHECK_OUT',
        timestamp,
        securityOfficer: officer,
        durationMinutes,
        gate: 'Gate 1 / Main Entrance'
      })

      return res.json({ message: 'Visitor checked out successfully.', request: existing, log: gateLog })
    }
  } catch (err) {
    console.warn('MongoDB check-out fallback:', err.message)
  }

  const reqObj = fallbackRequests.find((r) => r.id.toLowerCase() === id.toLowerCase())
  if (!reqObj) return res.status(404).json({ error: 'Request not found.' })

  const inTime = new Date(reqObj.checkInTime || timestamp)
  const outTime = new Date(timestamp)
  let durationMinutes = 1
  if (!isNaN(inTime.getTime()) && !isNaN(outTime.getTime())) {
    const diffMs = outTime.getTime() - inTime.getTime()
    durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)))
  }

  reqObj.status = 'Checked-Out'
  reqObj.checkOutTime = timestamp
  reqObj.checkedOutBy = officer
  reqObj.durationMinutes = durationMinutes
  return res.json({ message: 'Visitor checked out successfully.', request: reqObj })
})

// POST /api/requests/reset - Reset Demo Data
router.post('/reset', async (req, res) => {
  try {
    await VisitorRequest.deleteMany({})
    await VisitorRequest.insertMany(fallbackRequests)
    return res.json({ message: 'Demo data reloaded to MongoDB.', requests: fallbackRequests })
  } catch (err) {
    return res.json({ message: 'Demo data reset locally.', requests: fallbackRequests })
  }
})

export default router
