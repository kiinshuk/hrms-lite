import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/employees', icon: '👥', label: 'Employees' },
  { to: '/attendance', icon: '📅', label: 'Attendance' },
]

const pageTitles = {
  '/': 'Dashboard',
  '/employees': 'Employee Management',
  '/attendance': 'Attendance Management',
}

function App() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'HRMS Lite'

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🏢 HRMS Lite</h1>
          <span>HR Management System</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          v1.0.0 · HRMS Lite
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <div className="admin-badge">
              👤 Admin
            </div>
          </div>
        </header>
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
