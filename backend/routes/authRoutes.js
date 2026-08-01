import express from 'express'
import User from '../models/User.js'
import { users as fallbackUsers } from '../data/mockStore.js'

const router = express.Router()

// POST /api/auth/login - Email & Password Authentication
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const dbUser = await User.findOne({ email: email.toLowerCase() })

    if (dbUser) {
      if (dbUser.password !== password) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' })
      }
      return res.json({
        user: {
          id: dbUser._id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          department: dbUser.department,
          gate: dbUser.gate
        }
      })
    }
  } catch (err) {
    console.warn('MongoDB auth query fallback:', err.message)
  }

  // Fallback to memory
  const matchedUser = fallbackUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

  if (!matchedUser) {
    return res.status(401).json({ error: 'User email not found. Please register an account.' })
  }

  if (matchedUser.password !== password) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' })
  }

  return res.json({
    user: {
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
      department: matchedUser.department,
      gate: matchedUser.gate
    }
  })
})

// POST /api/auth/google - Instant Google OAuth Login (Password-Free DB Role Recognition)
router.post('/google', async (req, res) => {
  const { email, name } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Google account email is required.' })
  }

  const cleanEmail = email.toLowerCase().trim()

  try {
    // Query MongoDB for matching email
    const dbUser = await User.findOne({ email: cleanEmail })

    if (dbUser) {
      console.log(`🔑 Google Auth matched DB User: ${dbUser.name} (${dbUser.role.toUpperCase()})`)
      return res.json({
        user: {
          id: dbUser._id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          department: dbUser.department,
          gate: dbUser.gate
        }
      })
    }

    // If new user, register as Visitor automatically
    const created = await User.create({
      email: cleanEmail,
      password: `google_${Date.now()}`,
      name: name || cleanEmail.split('@')[0],
      role: 'visitor',
      department: 'General'
    })

    return res.status(201).json({
      user: {
        id: created._id,
        email: created.email,
        name: created.name,
        role: created.role,
        department: created.department
      }
    })
  } catch (err) {
    console.warn('MongoDB Google login fallback:', err.message)
    let autoRole = 'visitor'
    if (cleanEmail.includes('admin')) autoRole = 'admin'
    if (cleanEmail.includes('security') || cleanEmail.includes('officer')) autoRole = 'security'

    return res.json({
      user: {
        id: `USR-GOOGLE-${Date.now()}`,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: autoRole,
        department: 'General'
      }
    })
  }
})

// POST /api/auth/register - Public Visitor Registration (Strictly Visitor Role)
router.post('/register', async (req, res) => {
  const { email, password, name, department } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required registration fields.' })
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ error: 'User email is already registered.' })
    }

    const created = await User.create({
      email,
      password,
      name,
      role: 'visitor',
      department: department || 'General'
    })

    return res.status(201).json({
      user: {
        id: created._id,
        email: created.email,
        name: created.name,
        role: created.role,
        department: created.department
      }
    })
  } catch (err) {
    console.warn('MongoDB register fallback:', err.message)
    const newUser = {
      id: `USR-${Date.now()}`,
      email,
      name,
      role: 'visitor',
      department: department || 'General'
    }
    fallbackUsers.push({ ...newUser, password })
    return res.status(201).json({ user: newUser })
  }
})

export default router
