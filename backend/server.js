import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import requestRoutes from './routes/requestRoutes.js'
import VisitorRequest from './models/VisitorRequest.js'
import GateLog from './models/GateLog.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Initialize MongoDB Connection & Wipe Old Test Data
connectDB().then(async (isConnected) => {
  if (isConnected) {
    try {
      await VisitorRequest.deleteMany({})
      await GateLog.deleteMany({})
      console.log('🧹 Wiped all old visitor test data from MongoDB on startup!')
    } catch (err) {
      console.warn('Startup cleanup skipped:', err.message)
    }
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB', timestamp: new Date().toISOString() })
})

// Route Modules
app.use('/api/auth', authRoutes)
app.use('/api/requests', requestRoutes)

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Visitor Management Backend running on http://localhost:${PORT}`)
})
