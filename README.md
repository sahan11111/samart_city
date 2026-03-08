# 🏙️ Smart City Platform

A full-stack **Smart City Management Platform** built with a modern tech stack — a Python-powered backend API, a JavaScript/React frontend, and fully containerized with Docker for seamless deployment.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running with Docker (Recommended)](#running-with-docker-recommended)
  - [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## 🌐 Overview

The **Smart City Platform** is designed to help manage and monitor city infrastructure, services, and data in real time. It features a RESTful backend API, a live dashboard with WebSocket support, and a responsive frontend interface — all orchestrated via Docker Compose.

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | JavaScript, React (Vite), CSS, HTML |
| Backend    | Python, FastAPI                   |
| Database   | SQLite (dev) / PostgreSQL (prod)  |
| Auth       | JWT (HS256)                       |
| Realtime   | WebSockets                        |
| Container  | Docker, Docker Compose            |

### Language Breakdown

![JavaScript](https://img.shields.io/badge/JavaScript-63.5%25-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-32.9%25-3776AB?style=flat&logo=python&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1.7%25-1572B6?style=flat&logo=css3&logoColor=white)
![Dockerfile](https://img.shields.io/badge/Dockerfile-1.3%25-2496ED?style=flat&logo=docker&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-0.6%25-E34F26?style=flat&logo=html5&logoColor=white)

---

## 📁 Project Structure

```
samart_city/
├── backend/               # Python FastAPI backend
│   └── Dockerfile
├── frontend/              # React (Vite) frontend
│   └── Dockerfile
├── docker-compose.yml     # Docker Compose orchestration
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18+ for local frontend development)
- [Python](https://www.python.org/) (3.10+ for local backend development)

---

### Running with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sahan11111/samart_city.git
   cd samart_city
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   | Service  | URL                        |
   |----------|----------------------------|
   | Frontend | http://localhost           |
   | Backend API | http://localhost:8000   |
   | Health Check | http://localhost:8000/health |

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

---

### Running Locally

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Environment Variables

The following environment variables are used by the backend service:

| Variable                    | Default                        | Description                          |
|-----------------------------|--------------------------------|--------------------------------------|
| `SECRET_KEY`                | *(set in docker-compose)*      | JWT secret key                       |
| `ALGORITHM`                 | `HS256`                        | JWT signing algorithm                |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                         | Token expiration time (minutes)      |
| `DATABASE_URL`              | `sqlite:///./smart_city.db`    | Database connection string           |
| `ENVIRONMENT`               | `development`                  | Runtime environment                  |

The following environment variables are used by the frontend service:

| Variable         | Default                              | Description               |
|------------------|--------------------------------------|---------------------------|
| `VITE_API_URL`   | `http://backend:8000/api`            | Backend REST API URL      |
| `VITE_WS_URL`    | `ws://backend:8000/ws/dashboard`     | WebSocket endpoint URL    |

> ⚠️ **Note:** For production, make sure to replace the `SECRET_KEY` and configure a proper database (e.g., PostgreSQL). See the commented-out PostgreSQL section in `docker-compose.yml`.

---

## 📡 API Endpoints

| Method | Endpoint          | Description               |
|--------|-------------------|---------------------------|
| `GET`  | `/health`         | Health check              |
| `POST` | `/api/auth/login` | User login (returns JWT)  |
| `GET`  | `/api/...`        | City data endpoints       |
| `WS`   | `/ws/dashboard`   | Live dashboard WebSocket  |

> 📝 Full API documentation is available at `http://localhost:8000/docs` (Swagger UI) when the backend is running.

---

## 🐘 PostgreSQL (Production)

To switch from SQLite to PostgreSQL, uncomment the `postgres` service block in `docker-compose.yml` and update your `DATABASE_URL`:

```env
DATABASE_URL=postgresql://cityuser:citypass123@postgres:5432/smart_city_db
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open source. Feel free to use, modify, and distribute it.

---

<p align="center">Made with ❤️ by <a href="https://github.com/sahan11111">sahan11111</a></p>
