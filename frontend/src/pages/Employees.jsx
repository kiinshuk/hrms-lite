import { useState, useEffect } from 'react'
import API from '../api'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Product', 'Other']

const initialForm = { employee_id: '', full_name: '', email: '', department: '' }

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchEmployees = () => {
    setLoading(true)
    API.get('/api/employees/')
      .then(res => setEmployees(res.data))
      .catch(() => setError('Failed to load employees.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEmployees() }, [])

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
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required.'
    if (!form.full_name.trim()) errs.full_name = 'Full name is required.'
    if (!form.email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address.'
    }
    if (!form.department) errs.department = 'Department is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      await API.post('/api/employees/', form)
      setShowModal(false)
      setForm(initialForm)
      setFormErrors({})
      fetchEmployees()
      showSuccess('Employee added successfully!')
    } catch (err) {
      const data = err.response?.data || {}
      const mapped = {}
      Object.entries(data).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v.join(' ') : v
      })
      setFormErrors(mapped)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      await API.delete(`/api/employees/${deleteId}/`)
      setDeleteId(null)
      fetchEmployees()
      showSuccess('Employee deleted successfully!')
    } catch {
      setError('Failed to delete employee.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const openModal = () => { setForm(initialForm); setFormErrors({}); setShowModal(true) }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your organization's employee records</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          ＋ Add Employee
        </button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">👥 All Employees ({employees.length})</span>
        </div>
        {loading ? (
          <LoadingSpinner text="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No employees found"
            description="Get started by adding your first employee to the system."
            action={<button className="btn btn-primary" onClick={openModal}>＋ Add Employee</button>}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Present Days</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>
                        {emp.employee_id}
                      </span>
                    </td>
                    <td><strong>{emp.full_name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                    <td>
                      <span style={{ background: 'var(--bg)', padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                        {emp.department}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                        {emp.total_present_days} days
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(emp.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(emp.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Employee"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Employee'}
            </button>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Employee ID *</label>
            <input
              className={`form-input ${formErrors.employee_id ? 'error' : ''}`}
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              placeholder="e.g. EMP-001"
            />
            {formErrors.employee_id && <span className="form-error">{formErrors.employee_id}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className={`form-input ${formErrors.full_name ? 'error' : ''}`}
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
            />
            {formErrors.full_name && <span className="form-error">{formErrors.full_name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              className={`form-input ${formErrors.email ? 'error' : ''}`}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. john@company.com"
            />
            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select
              className={`form-input ${formErrors.department ? 'error' : ''}`}
              name="department"
              value={form.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {formErrors.department && <span className="form-error">{formErrors.department}</span>}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : '🗑 Delete Employee'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to delete this employee? This action will also remove all their attendance records and <strong>cannot be undone</strong>.
        </p>
      </Modal>
    </div>
  )
}
