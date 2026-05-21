# AI CRM SaaS MVP 🚀

A modern, responsive Customer Relationship Management (CRM) platform equipped with an interactive Kanban Sales Pipeline and Gemini AI-powered response suggestions. Built on the production-grade MERN Stack (React, Vite, Node, Express, MongoDB).

---

## 🌟 Key Features

* **🔑 JWT Authentication**: Secure signup, login, protected workspace routes, and persistent session tokens.
* **📊 CRM Analytics Dashboard**: Live metrics tracking Total Leads, Pending Follow-Ups, and Closed Deals. Includes a modern timeline log for recent activities.
* **💼 Leads Workspace (CRUD)**: Fully interactive leads dashboard with status tracking, search queries, status filtering, and notes history.
* **📋 Kanban Pipeline Board**: Draggable pipeline view (`@dnd-kit`) supporting optimistic updates, instant database synchronization, and swipe gestures on mobile devices.
* **🤖 Gemini AI Response Assistant**: Generates short, conversational, human-like sales draft suggestions based on client inquiries. Includes copy-to-clipboard actions and a robust contextual intent fallback engine.
* **✨ Premium Design System**: Responsive dark-mode styling utilizing coordinated slate and indigo palettes with smooth hover micro-animations and pulsing skeleton loading states.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS, `@dnd-kit/core` (drag-and-drop), Lucide React.
* **Backend**: Node.js, Express, MongoDB (Mongoose), `@google/generative-ai` SDK.
* **Auth**: JSON Web Tokens (JWT) & bcrypt.js.
* **HTTP Client**: Axios.

---

## 🚀 Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### 1. Clone & Install Dependencies
Run the utility script in the root directory to install packages for the root, frontend, and backend:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ai-crm
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Optional: Add your Gemini API key from Google AI Studio. 
# If not provided, the server runs in fallback template mode.
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Servers
Start both the React client (Vite) and the Node API server concurrently from the root directory:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📸 Screenshots Section Placeholder
> *Add screenshots here (e.g. Dashboard metrics, Kanban drag-and-drop operations, and AI assistant modals).*

---

## 🚢 Production Deployment Placeholder

### 1. Database (MongoDB Atlas)
1. Provision a free database cluster on MongoDB Atlas.
2. Allow access from any IP address (`0.0.0.0/0`).
3. Replace the `MONGO_URI` environment variable in production with the Atlas connection string.

### 2. Backend (Render / Railway)
1. Link your repository.
2. Define build and start command scripts.
3. Configure the environment variables (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).

### 3. Frontend (Vercel / Netlify)
1. Configure Vite build parameters (`npm run build`, `dist`).
2. Add your server API URL configuration to `VITE_API_URL`.

---

## 📄 License
This project is licensed under the MIT License.
