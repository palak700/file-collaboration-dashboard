# 📁 File Collaboration Dashboard

A full-stack File Collaboration Dashboard that enables secure file management, role-based access control, and data visualization. The application allows users to upload, organize, and analyze files through an intuitive web interface while administrators manage users and permissions.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure JWT Authentication
- Role-Based Access Control (RBAC)
- Admin and User modules
- Protected API routes

### 📂 File Management
- Upload files
- Download files
- View file details
- Edit file information
- Delete files

### 📄 Supported File Types
- CSV
- Excel (.xlsx)
- LibreOffice files
- ZIP files

### 📊 Data Visualization
- Automatic data analysis
- Interactive scatter plots
- Dataset visualization
- Statistical insights

### 🤖 Machine Learning Integration
- K-Means Clustering
- K-Nearest Neighbors (KNN)
- Visual representation of clustered data

### 👨‍💼 Admin Dashboard
- User Management
- File Management
- Dataset Analytics
- Access Control

---

# 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Bootstrap 5
- Tailwind CSS
- Axios

### Backend
- FastAPI
- Python
- SQLAlchemy
- Alembic
- JWT Authentication

### Database
- SQLite
- PostgreSQL (Supported)

### Data Analysis & Machine Learning
- Pandas
- NumPy
- Matplotlib
- Scikit-learn

---

# 📁 Project Structure

```
file-collaboration-dashboard/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── tests/
│   ├── uploads/
│   └── requirements.txt
│
├── alembic/
├── database/
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

## Backend Setup

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

## Frontend Setup

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

# 📊 Machine Learning Features

- K-Means Clustering for data grouping
- K-Nearest Neighbors (KNN) visualization
- Scatter plot generation
- Dataset preprocessing using Pandas

---

# 🔐 Security

- JWT Authentication
- Role-Based Authorization
- Secure API endpoints
- Protected file access

---

# 📌 Future Improvements

- Drag-and-drop file upload
- Real-time notifications
- Advanced analytics dashboard
- File version history
- Search and filtering
- Cloud storage integration

---

# 👩‍💻 Developer

**Palak Gupta**

B.Tech Computer Science Engineering

**GitHub:** https://github.com/palak700

---

## ⭐ If you found this project helpful, consider giving it a star!
