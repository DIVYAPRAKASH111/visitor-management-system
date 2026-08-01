import mongoose from 'mongoose'
import User from '../models/User.js'
import VisitorRequest from '../models/VisitorRequest.js'
import GateLog from '../models/GateLog.js'
import { users as seedUsers } from '../data/mockStore.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visitor_management_db'

export const connectDB = async () => {
  try {
    const isAtlas = MONGODB_URI.includes('mongodb+srv://')
    console.log(`📡 Connecting to MongoDB ${isAtlas ? 'Atlas Cloud' : 'Database'}...`)

    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    })
    console.log(`🌐 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`)

    // WIPE OUT OLD TEST VISITOR DATA PERMANENTLY FROM MONGODB
    await VisitorRequest.deleteMany({})
    await GateLog.deleteMany({})
    console.log('🧹 Cleaned all old visitor test data from MongoDB.')

    await seedDatabase()
    return true
  } catch (error) {
    console.warn(`⚠️ MongoDB offline (${error.message}). Running with active instant memory store.`)
    mongoose.set('bufferCommands', false)
    return false
  }
}

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      await User.insertMany(seedUsers)
      console.log('✅ Seeded system User accounts to MongoDB.')
    }
  } catch (err) {
    console.error('Data seeding error:', err)
  }
}
