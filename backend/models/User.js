import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['visitor', 'admin', 'security'],
      default: 'visitor'
    },
    department: {
      type: String,
      default: 'General'
    },
    gate: {
      type: String,
      default: 'Gate 1 / Main Entrance'
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
