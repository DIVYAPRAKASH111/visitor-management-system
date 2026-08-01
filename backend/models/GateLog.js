import mongoose from 'mongoose'

const gateLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    requestId: {
      type: String,
      required: true,
      trim: true
    },
    visitorName: {
      type: String,
      required: true
    },
    host: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'General'
    },
    action: {
      type: String,
      enum: ['CHECK_IN', 'CHECK_OUT'],
      required: true
    },
    timestamp: {
      type: String,
      default: () => new Date().toLocaleString()
    },
    securityOfficer: {
      type: String,
      default: 'Officer Marcus Vance'
    },
    durationMinutes: {
      type: Number,
      default: null
    },
    gate: {
      type: String,
      default: 'Gate 1 / Main Gate'
    }
  },
  {
    timestamps: true
  }
)

const GateLog = mongoose.models.GateLog || mongoose.model('GateLog', gateLogSchema)
export default GateLog
