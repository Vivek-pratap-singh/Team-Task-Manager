# Team Task Manager

A full-stack project and task management SaaS built with **React**, **Node.js/Express**, **MySQL**, and **Prisma ORM**. Features role-based access control, a drag-and-drop Kanban board, real-time updates via Socket.io, dark mode, and activity logging.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Railway-purple?style=for-the-badge&logo=railway)](https://team-task-manager-production-77b8.up.railway.app)

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, React Router v6, Axios  |
| Styling    | Tailwind CSS v3, Inter font             |
| Backend    | Node.js, Express.js                     |
| Database   | MySQL + Prisma ORM                 |
| Auth       | JWT + bcryptjs                          |
| Realtime   | Socket.io                               |
| Drag/Drop  | @dnd-kit                                |

---

## Folder Structure

```
Team Task Manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validations/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── layouts/
    │   ├── pages/
    │   └── routes/
    ├── tailwind.config.js
    └── package.json
```

---

## Prerequisites

- **Node.js** v18+
- **MySQL** v8+ (running locally or remote)
- **npm** v9+

---

## Setup Guide

### 1. Clone / Navigate to Project

```bash
cd "Team Task Manager"
```

### 2. MySQL – Create Database

Open mysql or MySQL Workbench and run:
```sql
CREATE DATABASE team_task_manager;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
copy .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:5432/team_task_manager?schema=public"
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

The API will be available at `http://localhost:5000`

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint             | Auth | Description          |
|--------|----------------------|------|----------------------|
| POST   | /api/auth/signup     | No   | Create account       |
| POST   | /api/auth/login      | No   | Login, get JWT       |
| GET    | /api/auth/me         | Yes  | Get current user     |
| PUT    | /api/auth/profile    | Yes  | Update name          |

### Projects
| Method | Endpoint                        | Role  | Description       |
|--------|---------------------------------|-------|-------------------|
| GET    | /api/projects                   | Any   | List projects     |
| POST   | /api/projects                   | Admin | Create project    |
| GET    | /api/projects/:id               | Any   | Get project       |
| PUT    | /api/projects/:id               | Admin | Update project    |
| DELETE | /api/projects/:id               | Admin | Delete project    |
| POST   | /api/projects/:id/members       | Admin | Add member        |
| DELETE | /api/projects/:id/members/:uid  | Admin | Remove member     |

### Tasks
| Method | Endpoint              | Role         | Description       |
|--------|-----------------------|--------------|-------------------|
| GET    | /api/tasks            | Any          | List tasks        |
| POST   | /api/tasks            | Admin        | Create task       |
| GET    | /api/tasks/:id        | Any          | Get task          |
| PUT    | /api/tasks/:id        | Admin        | Update task       |
| DELETE | /api/tasks/:id        | Admin        | Delete task       |
| PATCH  | /api/tasks/:id/status | Any*         | Update status     |
| POST   | /api/tasks/:id/comments | Any        | Add comment       |

*Members can only update status of tasks assigned to them

### Dashboard
| Method | Endpoint        | Auth | Description            |
|--------|-----------------|------|------------------------|
| GET    | /api/dashboard  | Yes  | Get stats and activity |

---

## Environment Variables

### Backend `.env`

| Variable       | Description                          |
|----------------|--------------------------------------|
| PORT           | Server port (default: 5000)          |
| DATABASE_URL   | MySQL connection string         |
| JWT_SECRET     | Secret key for JWT signing           |
| JWT_EXPIRES_IN | Token expiry (e.g., 7d)             |
| CLIENT_URL     | Frontend URL for CORS                |

---

## Features

### Core
- ✅ JWT authentication with bcrypt password hashing
- ✅ Role-based access control (Admin / Member)
- ✅ Full project CRUD with member management
- ✅ Full task CRUD with status, priority, due dates
- ✅ Dashboard with stats (total, completed, pending, overdue)
- ✅ Activity log feed

### UI/UX
- ✅ Dark / Light mode with system preference detection
- ✅ Responsive sidebar layout (mobile overlay)
- ✅ Drag-and-drop Kanban board (@dnd-kit)
- ✅ Toast notifications
- ✅ Modal forms with Escape key support
- ✅ Search and filtering on tasks/projects
- ✅ Status and priority badges
- ✅ Loading spinners

### Real-time (Socket.io)
- ✅ Task created/updated/deleted events
- ✅ Project created/updated/deleted events
- ✅ Comment added events

---

## Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
```

Opens at `http://localhost:5555`

---

## Production Build

```bash
# Frontend
cd frontend && npm run build

# Backend – set NODE_ENV=production in .env
cd backend && npm start
```
