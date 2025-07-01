# 📊 InsightHub – Full-Stack SaaS Dashboard (In Progress)

InsightHub is a full-stack SaaS dashboard designed to help small teams and freelancers manage projects, track productivity, and visualize team performance. Built with modern web technologies, it emphasizes clean architecture, role-based access, and rich data visualization.

> 🚧 This project is currently under development. Contributions and feedback are welcome!

---

## 🔧 Tech Stack

### Frontend

- React + TypeScript
- Tailwind CSS + shadcn/ui
- React Router DOM
- Zustand or Redux Toolkit
- Axios

### Backend

- Node.js + Express
- PostgreSQL + Prisma
- JWT Auth + Bcrypt
- Docker (optional)

### Testing

- Jest (unit)
- Cypress (end-to-end)

### Deployment

- Frontend: Vercel
- Backend: Render or Railway

---

## 📦 Features

- 🔐 Authentication with JWT + Role-based access
- 🧑‍💼 User & team management
- 📁 Project management (create, assign, manage projects)
- ✅ Task management with filters and status updates
- 📊 Dashboard with charts (Recharts) for performance insights
- 🧾 Reports by user/project with CSV export
- 🚦 Testing and CI/CD enabled

---

## 🧱 Project Structure

### Backend

```
src/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
└── app.ts
```

### Frontend

```
src/
├── components/
├── pages/
├── hooks/
├── store/
├── services/
└── main.tsx
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/insighthub.git
cd insighthub
```

### 2. Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Configure environment variables

- Copy .env.example to .env
- Add DB credentials, JWT secret, etc.

### 4. Run the project

```bash
# Backend
npm run dev

# Frontend (in another terminal)
npm run dev
```

---

## 🧪 Running Tests

```bash
# Backend unit tests
npm run test

# Frontend e2e tests
npx cypress open
```

---

## 📌 Roadmap

- Auth system with roles
- Tasks CRUD API
- Project module
- Dashboard with charts
- Reports and CSV exports
- Polish UI + mobile responsiveness
- Deployment & CI pipeline

---

## 📬 Feedback & Contributions

Feel free to open issues or submit pull requests.

---

## 🧑 Author

**Derrick Onyekachi**  
Frontend Engineer | JavaScript Enthusiast

[//]: # '[LinkedIn](#) | [Email](#)'

---

_Made with 💻 in progress. Follow along as the project evolves!_
