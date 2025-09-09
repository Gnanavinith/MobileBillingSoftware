import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'mobilebill:auth'

const defaultAuth = {
  isAuthenticated: false,
  user: null, // { email, role: 'admin' | 'staff' }
}

const AuthContext = createContext({
  auth: defaultAuth,
  login: async (_email, _password) => {},
  logout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(defaultAuth)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') setAuth(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } catch {}
  }, [auth])

  const login = useCallback(async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPassword = String(password || '').trim()
    let role = null
    if (normalizedEmail === 'admin@gmail.com') role = 'admin'
    if (normalizedEmail === 'staff@gmail.com') role = 'staff'

    if (!role) {
      throw new Error('Invalid email or password')
    }

    if (normalizedPassword !== '123456') {
      throw new Error('Invalid email or password')
    }

    setAuth({ isAuthenticated: true, user: { email: normalizedEmail, role } })
  }, [])

  const logout = useCallback(() => {
    setAuth(defaultAuth)
  }, [])

  const value = useMemo(() => ({ auth, login, logout }), [auth, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


