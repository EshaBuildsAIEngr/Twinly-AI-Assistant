import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'

const navItems = [
  { to: '/dashboard', label: 'Inbox', icon: '💬', end: true },
  { to: '/dashboard/content', label: 'Content', icon: '✍️' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { permission, requestPermission } = useNotifications()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tierLabel = { trial: 'Free Trial', starter: 'Starter', pro: 'Pro', expired: 'Expired' }[user?.subscription_tier] || ''

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-body">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5 font-display text-lg font-semibold">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-you to-twin flex items-center justify-center font-mono text-[10px] font-bold text-bg">TW</span>
          Twinly
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-textMuted text-xl leading-none px-2">
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar — desktop always visible, mobile toggled */}
      <aside className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-60 border-r border-border flex-col shrink-0 md:min-h-screen`}>
        <div className="hidden md:flex items-center gap-2.5 font-display text-lg font-semibold px-6 py-5 border-b border-border">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-you to-twin flex items-center justify-center font-mono text-[10px] font-bold text-bg">TW</span>
          Twinly
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-surface2 text-text' : 'text-textMuted hover:text-text hover:bg-surface2/50'}`
              }>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        {permission !== 'granted' && permission !== 'unsupported' && (
          <div className="mx-3 mb-3 bg-twin/10 border border-twin/25 rounded-lg p-3">
            <div className="text-xs text-text mb-2">Get notified here when a customer needs you — no need to check a phone app.</div>
            <button onClick={requestPermission} className="text-xs bg-twin text-bg font-semibold px-3 py-1.5 rounded-lg">
              Enable notifications
            </button>
          </div>
        )}

        <div className="px-4 py-4 border-t border-border">
          <div className="text-xs text-textMuted mb-1">{user?.business_name}</div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-gold bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full">{tierLabel}</span>
            <button onClick={() => { logout(); navigate('/') }} className="text-xs text-textMuted hover:text-you">Log out</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  )
}