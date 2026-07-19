import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const trimmedUser = username.trim()
    const { data } = await api.post('/auth/login', {
      username: trimmedUser,
      password,
    })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('role', data.role)
    try {
      const me = await api.get('/auth/me')
      setUser(me.data)
    } catch (err) {
      localStorage.clear()
      throw err
    }
    return data.role
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      /* ignore */
    }
    localStorage.clear()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isSuperAdmin: user?.role === 'superadmin',
      isManager: user?.role === 'department_manager',
      canManage: user?.role === 'superadmin' || user?.role === 'department_manager',
      canUpload:
        user?.role === 'superadmin' ||
        user?.role === 'department_manager' ||
        user?.role === 'uploader',
      darkMode,
      setDarkMode,
    }),
    [user, loading, darkMode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
