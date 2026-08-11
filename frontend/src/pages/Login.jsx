import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 font-body">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-semibold mb-10 justify-center">
          <span className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-you to-twin flex items-center justify-center font-mono text-[11px] font-bold text-bg">TW</span>
          Twinly
        </Link>
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h1 className="font-display text-2xl mb-1">Welcome back</h1>
          <p className="text-textMuted text-sm mb-6">Log in to your dashboard</p>

          {error && <div className="bg-you/10 border border-you/30 text-you text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-textMuted block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
            </div>
            <button type="submit" disabled={loading}
              className="mt-2 bg-gradient-to-br from-twin to-[#8FEEF5] text-bg font-semibold text-sm py-2.5 rounded-lg disabled:opacity-60">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-textMuted mt-6">
            No account yet? <Link to="/signup" className="text-twin">Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
