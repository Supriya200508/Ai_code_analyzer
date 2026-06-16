# AI Code Analyzer

An AI-powered web application that analyzes source code, detects bugs, identifies security and performance issues, and provides optimized code suggestions using Google Gemini AI.

## 🚀 Live Demo

Frontend: https://ai-code-analyzer-kohl.vercel.app

Backend API: https://ai-code-analyzer-api.onrender.com

---

## 📌 Features

* 🔐 User Authentication (JWT-based)
* 👤 User Registration & Login
* 🤖 AI-Powered Code Analysis using Google Gemini
* 🐞 Bug Detection & Issue Identification
* ⚡ Performance Optimization Suggestions
* 🔒 Security Vulnerability Analysis
* 📝 Clean and Interactive UI
* 📊 Code Quality Scoring
* 🌐 Full-Stack Cloud Deployment
* 📱 Responsive Design

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Axios
* React Router
* CSS

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication
* Passlib + Bcrypt
* Pydantic

### AI Integration

* Google Gemini API

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## 📂 Project Structure

```text
AI_Code_Analyzer/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── db/
│   │   ├── core/
│   │   └── main.py
│   │
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/AI_Code_Analyzer.git

cd AI_Code_Analyzer
```

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env`

```env
SECRET_KEY=your_secret_key

DATABASE_URL=your_database_url

GEMINI_API_KEY=your_gemini_api_key

ALLOWED_ORIGINS=["http://localhost:5173"]
```

Run Backend

```bash
uvicorn main:app --reload
```

---

### Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=https://your-backend-url/api/v1
```

Run Frontend

```bash
npm run dev
```

---

## 🔑 Authentication

The application uses JWT Authentication.

### Register

```http
POST /api/v1/register
```

### Login

```http
POST /api/v1/login
```

Returns:

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

## 🤖 AI Analysis Workflow

1. User submits source code.
2. Backend validates request.
3. Gemini AI analyzes the code.
4. Issues are categorized by:

   * Security
   * Performance
   * Bugs
   * Code Quality
5. Optimized code suggestions are generated.
6. Results are displayed in the frontend.

---

## 📸 Screenshots

<img width="1912" height="1082" alt="image" src="https://github.com/user-attachments/assets/0bd7a1e0-daa4-4d86-aa2d-1dd4be02c0cf" />
<img width="1877" height="1085" alt="image" src="https://github.com/user-attachments/assets/4565436c-2209-4fb5-b1ed-dd5228f0b1fa" />
<img width="1915" height="1082" alt="image" src="https://github.com/user-attachments/assets/0ea398c7-2b5b-47d0-88c5-bf4a9685cce5" />
<img width="1912" height="1086" alt="image" src="https://github.com/user-attachments/assets/2a64a239-2f74-4033-9c6b-6bef48e629e2" />

---

## 🎯 Future Enhancements

* GitHub Repository Integration
* Multi-language Support
* AI Bug Fix Generation
* Code Comparison View
* Export Analysis Reports (PDF)
* Team Collaboration Features
* Analysis History Tracking

---

## 📈 Resume Highlights

* Built and deployed a full-stack AI-powered Code Analyzer using React, FastAPI, PostgreSQL, and Google Gemini AI.
* Implemented JWT authentication, secure password hashing, RESTful APIs, and cloud deployment with Vercel and Render.
* Designed an intelligent code review workflow capable of detecting bugs, security risks, and performance issues while generating optimization recommendations.

---

## 👨‍💻 Author

Supriya B

GitHub: https://github.com/Supriya200508

