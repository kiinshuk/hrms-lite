import { useState, useEffect } from 'react'
import API from '../api'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const today = new Date().toISOString().split('T')[0]
const initialForm = { employee: '', date: today, status: 'Present' }

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const fetchData = () => {
    setLoading(true)
    const params = {}
    if (filterEmployee) params.employee_id = filterEmployee
    if (filterDate) params.date = filterDate
    Promise.all([
      API.get('/api/attendance/', { params }),
      API.get('/api/employees/'),
    ])
      .then(([attRes, empRes]) => {
        setRecords(attRes.data)
        setEmployees(empRes.data)
      })
      .catch(() => setError('Failed to load attendance data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [filterEmployee, filterDate])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFormErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.employee) errs.employee = 'Please select an employee.'
    if (!form.date) errs.date = 'Date is required.'
    if (!form.status) errs.status = 'Status is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      await API.post('/api/attendance/', form)
      setShowModal(false)
      setForm(initialForm)
      setFormErrors({})
      fetchData()
      showSuccess('Attendance marked successfully!')
    } catch (err) {
      const data = err.response?.data || {}
      if (data.non_field_errors) {
        setFormErrors({ non_field: Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors })
      } else {
        const mapped = {}
        Object.entries(data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v.join(' ') : v
        })
        setFormErrors(mapped)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Summary: present days per employee
  const presentSummary = employees.map(emp => ({
    ...emp,
    presentDays: records.filter(r => r.employee === emp.id && r.status === 'Present').length,
  })).filter(emp => emp.presentDays > 0).sort((a, b) => b.presentDays - a.presentDays)

  const openModal = () => { setForm({ ...initialForm, date: today }); setFormErrors({}); setShowModal(true) }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track and manage daily employee attendance</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          ＋ Mark Attendance
        </button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="filters-bar">
        <label>Filter by:</label>
        <select
          className="filter-input"
          value={filterEmployee}
          onChange={e => setFilterEmployee(e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
          ))}
        </select>
        <input
          className="filter-input"
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        {(filterEmployee || filterDate) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterEmployee(''); setFilterDate('') }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Attendance Records Table */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <div className="section-card-header">
          <span className="section-card-title">📅 Attendance Records ({records.length})</span>
        </div>
        {loading ? (
          <LoadingSpinner text="Loading attendance..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No attendance records"
            description={filterEmployee || filterDate ? "No records match your filters." : "Start by marking attendance for your employees."}
            action={!filterEmployee && !filterDate && (
              <button className="btn btn-primary" onClick={openModal}>＋ Mark Attendance</button>
            )}
          />
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
                  <th>Marked At</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td><strong>{record.employee_name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{record.employee_id_code}</td>
                    <td>{record.department}</td>
                    <td>{record.date}</td>
                    <td>
                      <span className={`badge badge-${record.status.toLowerCase()}`}>
                        {record.status === 'Present' ? '✅' : '❌'} {record.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                      {new Date(record.marked_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Present Days Summary */}
      {!filterEmployee && !filterDate && presentSummary.length > 0 && (
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">🏆 Present Days Summary</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Total Present Days</th>
                </tr>
              </thead>
              <tbody>
                {presentSummary.map(emp => (
                  <tr key={emp.id}>
                    <td><strong>{emp.full_name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{emp.employee_id}</td>
                    <td>{emp.department}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 15 }}>
                        {emp.presentDays} {emp.presentDays === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mark Attendance"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : '✓ Mark Attendance'}
            </button>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          {formErrors.non_field && (
            <div className="alert alert-error">{formErrors.non_field}</div>
          )}
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              className={`form-input ${formErrors.employee ? 'error' : ''}`}
              name="employee"
              value={form.employee}
              onChange={handleChange}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id}) — {emp.department}
                </option>
              ))}
            </select>
            {formErrors.employee && <span className="form-error">{formErrors.employee}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              className={`form-input ${formErrors.date ? 'error' : ''}`}
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
            {formErrors.date && <span className="form-error">{formErrors.date}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Status *</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Present', 'Absent'].map(s => (
                <label
                  key={s}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '10px 20px', borderRadius: 8,
                    border: `2px solid ${form.status === s ? (s === 'Present' ? 'var(--success)' : 'var(--danger)') : 'var(--border)'}`,
                    background: form.status === s ? (s === 'Present' ? 'var(--success-bg)' : 'var(--danger-bg)') : 'white',
                    fontWeight: 500, transition: 'all 0.15s', flex: 1, justifyContent: 'center',
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {s === 'Present' ? '✅' : '❌'} {s}
                </label>
              ))}
            </div>
            {formErrors.status && <span className="form-error">{formErrors.status}</span>}
          </div>
        </form>
      </Modal>
    </div>
  )
}
