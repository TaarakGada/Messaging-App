# Messaging App

## Overview

Real-time messaging application built with React, Express, and Socket.IO, enabling seamless communication between users.

## 🌐 Live Demo

[messaging-app-taarak.netlify.app](https://messaging-app-taarak.netlify.app)

## 🛠 Technologies Used

### Frontend

- React (v18.3.1)
- React Router (v6.28.0)
- Axios for HTTP requests
- Tailwind CSS for styling
- Socket.IO Client for real-time communication

### Backend

- Express.js
- MongoDB with Mongoose
- Socket.IO for WebSocket communication
- JWT for authentication
- Bcrypt for password hashing
- Cloudinary for media uploads

## 📋 Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB database
- Cloudinary account (optional)

## 🚀 Local Setup

### Frontend

1. Clone the repository
2. Navigate to frontend directory
3. Install dependencies

```bash
cd frontend
npm install
```

4. Create `.env` file with necessary environment variables
5. Run development server

```bash
npm run dev
```

### Backend

1. Navigate to backend directory
2. Install dependencies

```bash
cd backend
npm install
```

3. Create `.env` file with:
   - MONGODB_URI
   - JWT_SECRET
   - CLOUDINARY_CREDENTIALS
4. Start server

```bash
npm start
```

## 📦 Key Dependencies

- Frontend: React, Axios, Socket.IO Client
- Backend: Express, Mongoose, Socket.IO, JWT, Bcrypt

## 🔒 Environment Variables

- `VITE_API_URL`: Backend API endpoint
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JSON Web Token secret
- `CLOUDINARY_*`: Cloudinary configuration

## 👥 Authors

- **Primary Developer**:
- **Contributors**:

## 📄 License

[Your License Here - e.g., MIT]

## 🐛 Issues

Report issues at [Your GitHub Repository]/issues

## 🤝 Contributions

Contributions are welcome! Please read contribution guidelines before getting started.
