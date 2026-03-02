# HRMS Lite – Human Resource Management System

A lightweight, full-stack HR Management System built with **React** (frontend) and **Django REST Framework** (backend).

## 🚀 Live Demo
- **Frontend:** *(Deploy URL here)*
- **Backend API:** *(Deploy URL here)*

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Axios, Vite |
| Backend | Django 4.2, Django REST Framework, django-cors-headers |
| Database | SQLite (local) / PostgreSQL (production) |
| Deployment | Vercel (Frontend), Render (Backend) |

## ✅ Features

### Employee Management
- Add employees with Employee ID, Full Name, Email, Department
- View all employees in a clean table with total present days
- Delete employees (with confirmation)
- Server-side validation: unique Employee ID, unique email, valid email format

### Attendance Management
- Mark daily attendance (Present / Absent) per employee
- View all attendance records
- Filter by employee and/or date
- Prevent duplicate attendance entries for the same employee/date
- Display total present days per employee

### Dashboard
- Summary cards: Total Employees, Present Today, Absent Today, Departments
- Recent attendance table

### UI/UX
- Professional sidebar layout with navigation
- Loading states, empty states, error states
- Reusable components (Modal, LoadingSpinner, EmptyState)
- Status badges (green/red), responsive design

## 📁 Project Structure

```
hrms-lite/
├── backend/                  # Django REST API
│   ├── api/
│   │   ├── models.py         # Employee & Attendance models
│   │   ├── serializers.py    # DRF serializers with validation
│   │   ├── views.py          # ViewSets + dashboard endpoint
│   │   └── urls.py           # API routes
│   ├── hrms/
│   │   ├── settings.py       # Django settings
│   │   └── urls.py           # Root URL config
│   ├── requirements.txt
│   ├── Procfile              # For Render deployment
│   └── build.sh              # Build script for Render
│
└── frontend/                 # React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   └── Attendance.jsx
    │   ├── components/
    │   │   ├── Modal.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── EmptyState.jsx
    │   ├── api.js            # Axios instance
    │   ├── App.jsx           # App layout + routing
    │   └── index.css         # Global styles
    ├── vercel.json           # Vercel SPA routing config
    └── .env.example
```

## 🖥️ Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# API runs at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000
npm run dev
# App runs at http://localhost:5173
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Create employee |
| DELETE | `/api/employees/{id}/` | Delete employee |
| GET | `/api/attendance/` | List attendance records |
| GET | `/api/attendance/?employee_id=&date=` | Filter attendance |
| POST | `/api/attendance/` | Mark attendance |
| GET | `/api/dashboard/` | Dashboard summary stats |

## 📦 Deployment

### Backend (Render)
1. Connect GitHub repo to Render
2. Set **Build Command:** `./build.sh`
3. Set **Start Command:** `gunicorn hrms.wsgi`
4. Set environment variable: `DEBUG=False`

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set **Root Directory:** `frontend`
3. Set environment variable: `VITE_API_URL=<your-render-backend-url>`

## ⚠️ Assumptions & Limitations
- Single admin user — no authentication required
- SQLite used locally; configure PostgreSQL for production via `DATABASE_URL`
- Leave, payroll, and advanced HR features are out of scope
- All times stored in UTC
