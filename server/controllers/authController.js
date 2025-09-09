const jwt = require('jsonwebtoken')

const USERS = [
  { email: 'admin@gmail.com', role: 'admin' },
  { email: 'staff@gmail.com', role: 'staff' },
]

const PASSWORD = '123456'

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPassword = String(password || '').trim()
    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const user = USERS.find(u => u.email === normalizedEmail)
    if (!user || normalizedPassword !== PASSWORD) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const payload = { email: user.email, role: user.role }
    const secret = process.env.JWT_SECRET || 'dev-secret'
    const token = jwt.sign(payload, secret, { expiresIn: '7d' })
    res.json({ token, user: payload })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing token' })
    const secret = process.env.JWT_SECRET || 'dev-secret'
    const decoded = jwt.verify(token, secret)
    res.json({ user: decoded })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}


