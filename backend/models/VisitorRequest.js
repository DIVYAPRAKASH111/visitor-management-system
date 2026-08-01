import mongoose from 'mongoose'

const visitorRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    visitorName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    host: {
      type: String,
      default: ''
    },
    studentName: {
      type: String,
      default: ''
    },
    studentRegisterNo: {
      type: String,
      default: 'N/A'
    },
    hostDepartment: {
      type: String,
      default: 'Computer Science & Engineering (CSE)'
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      default: '10:00'
    },
    endTime: {
      type: String,
      default: '12:30'
    },
    purpose: {
      type: String,
      default: 'General Visit'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Checked-In', 'Checked-Out'],
      default: 'Pending'
    },
    approvedBy: {
      type: String,
      default: null
    },
    approvedAt: {
      type: String,
      default: null
    },
    passPin: {
      type: String,
      default: null
    },
    checkInTime: {
      type: String,
      default: null
    },
    checkedInBy: {
      type: String,
      default: null
    },
    checkOutTime: {
      type: String,
      default: null
    },
    checkedOutBy: {
      type: String,
      default: null
    },
    durationMinutes: {
      type: Number,
      default: null
    },
    assignedAdminEmail: {
      type: String,
      default: 'admin1@gmail.com'
    },
    assignedAdminName: {
      type: String,
      default: 'Prakash'
    },
    submittedAt: {
      type: String,
      default: () => new Date().toLocaleString()
    }
  },
  {
    timestamps: true
  }
)

const VisitorRequest =
  mongoose.models.VisitorRequest || mongoose.model('VisitorRequest', visitorRequestSchema)

export default VisitorRequest
