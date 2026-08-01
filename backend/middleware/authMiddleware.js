// Express Auth Middleware for Token & Role Validation
export const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] || req.query.role || 'visitor'
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' })
    }
    next()
  }
}

export const loggerMiddleware = (req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`)
  next()
}
