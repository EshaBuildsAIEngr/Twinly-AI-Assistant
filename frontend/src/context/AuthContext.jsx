import React, { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    const token = localStorage.getItem('twinly_token')
    if (!token) { setLoading(false); return }
    try {
      const res = await client.get('/api/auth/me')
      setUser(res.data)
    } catch {
      localStorage.removeItem('twinly_token')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUser() }, [])

  const login = async (email, password) => {
    const res = await client.post('/api/auth/login', { email, password })
    localStorage.setItem('twinly_token', res.data.access_token)
    await loadUser()
  }

  const signup = async (email, password, business_name) => {
    const res = await client.post('/api/auth/signup', { email, password, business_name })
    localStorage.setItem('twinly_token', res.data.access_token)
    await loadUser()
  }

  const logout = () => {
    localStorage.removeItem('twinly_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
