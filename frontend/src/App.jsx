import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Inbox from './pages/Inbox'
import ContentCalendar from './pages/ContentCalendar'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/dashboard/content" element={<ProtectedRoute><ContentCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}
