# 📁 File Collaboration Dashboard

A full-stack File Collaboration Dashboard that enables secure file sharing, role-based access control, data visualization, and AI-powered analytics. The project consists of a React frontend, FastAPI backend, Android application, and Face Recognition Service.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Multiple user roles:
  - Admin
  - Manager
  - Employee
  - Viewer

### 📂 File Management
- Upload files securely
- Download files
- View uploaded files
- Edit file details
- Delete files
- Support for:
  - CSV
  - Excel (.xlsx)
  - LibreOffice files
  - ZIP files

### 📊 Data Visualization
- Automatic dataset analysis
- Interactive charts
- Scatter Plot visualization
- Data statistics
- Machine Learning visualization

### 🤖 Machine Learning Integration
- K-Means Clustering
- K-Nearest Neighbors (KNN)
- Dataset preprocessing
- Visual cluster analysis

### 👤 Face Recognition Attendance
- Android application
- Face verification
- Attendance marking
- GPS-based location verification

### 📱 Android Application
- User login
- Attendance marking
- Camera integration
- Location services
- Secure API communication

### 🖥️ Admin Dashboard
- User Management
- File Management
- Analytics Dashboard
- Attendance Monitoring
- Machine Learning Reports

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Bootstrap 5
- Tailwind CSS
- Axios

## Backend
- FastAPI
- Python
- SQLAlchemy
- Alembic
- JWT Authentication

## Android
- Kotlin
- MVVM Architecture
- CameraX
- Retrofit
- DataStore

## Database
- PostgreSQL
- SQLite (Development)

## Machine Learning
- Scikit-learn
- Pandas
- NumPy
- Matplotlib

## Face Recognition
- InsightFace
- OpenCV
- FastAPI

---

# 📁 Project Structure

```
filecollab/
│
├── frontend/                  # React Frontend
├── backend/                   # FastAPI Backend
├── android-app/               # Android Application
├── face-recognition-service/  # Face Recognition API
├── database/                  # Database Scripts
├── alembic/                   # Database Migrations
├── README.md
└── requirements.txt
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/palak700/file-collaboration-dashboard.git
cd file-collaboration-dashboard
```

---

## Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---



# 📊 Supported File Formats

- CSV
- XLSX
- LibreOffice Files
- ZIP

---

# 🔐 Security Features

- JWT Authentication
- Role-Based Access Control
- Secure File Upload
- Protected APIs
- Password Encryption

---

# 📈 Machine Learning Features

- K-Means Clustering
- KNN Classification
- Data Visualization
- Statistical Analysis

---

# 📱 Modules

- Authentication
- User Management
- File Management
- Attendance Management
- Face Recognition
- Analytics Dashboard
- Machine Learning

---

# Future Enhancements

- AI-powered document analysis
- OCR support
- Cloud storage integration
- Email notifications
- Real-time collaboration
- Audit logs
- Advanced analytics dashboard

---

# 👩‍💻 Developer

**Palak Gupta**

B.Tech Computer Science Engineering

Interested in Full Stack Development, AI/ML, and Mobile Application Development.

GitHub: https://github.com/palak700

---

# 📄 License

This project is developed for educational and learning purposes.
