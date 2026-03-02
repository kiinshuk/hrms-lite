import { useState, useEffect } from 'react'
import API from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

const statCards = [
  { key: 'total_employees', label: 'Total Employees', icon: '👥', color: '#EFF6FF', iconColor: '#2563EB' },
  { key: 'total_present_today', label: 'Present Today', icon: '✅', color: '#DCFCE7', iconColor: '#16A34A' },
  { key: 'total_absent_today', label: 'Absent Today', icon: '❌', color: '#FEE2E2', iconColor: '#DC2626' },
  { key: 'departments_count', label: 'Departments', icon: '🏢', color: '#FEF3C7', iconColor: '#D97706' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    API.get('/api/dashboard/')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today — {stats?.today}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map(card => (
          <div className="stat-card" key={card.key}>
            <div className="stat-icon" style={{ background: card.color }}>
              <span style={{ fontSize: 22 }}>{card.icon}</span>
            </div>
            <div className="stat-info">
              <h3>{stats?.[card.key] ?? 0}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Attendance */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">📋 Recent Attendance</span>
        </div>
        {stats?.recent_attendance?.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No attendance records yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_attendance?.map(record => (
                  <tr key={record.id}>
                    <td><strong>{record.employee_name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{record.employee_id_code}</td>
                    <td>{record.department}</td>
                    <td>{record.date}</td>
                    <td>
                      <span className={`badge badge-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
