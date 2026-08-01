// API Base URL Configuration for Local & Cloud Production Deployment
// Priority 1: VITE_API_BASE_URL from Vercel Environment Variables
// Priority 2: Localhost backend (http://localhost:5000)
// Priority 3: Fallback Production Render Backend URL
export const RENDER_BACKEND_URL = 'https://visitor-management-system-backend.onrender.com' // Replace with your actual Render backend URL if different

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : RENDER_BACKEND_URL)
