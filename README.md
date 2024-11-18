# Messaging App

## Overview

Real-time messaging application built with React, Express, and Socket.IO, enabling seamless communication between users.

## 🌐 Live Demo

[messaging-app-taarak.netlify.app](https://messaging-app-taarak.netlify.app)

## 🛠 Technologies Used

### Frontend

- React (v18.3.1)
- React Router (v6.28.0)
- Tailwind CSS for styling
- Socket.IO Client for real-time communication

### Backend

- Express.js
- MongoDB with Mongoose
- Socket.IO for WebSocket communication
- JWT for authentication

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

4. Run development server

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

3. Create `.env` file with the following configuration:

```env
MONGODB_URL=your_mongodc_connection_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start server

```bash
npm start
```

## 📦 Dependencies

### Frontend Dependencies

- `axios@1.7.7`: HTTP client for API requests
- `js-cookie@3.0.5`: Browser cookie handling
- `react@18.3.1`: Core React library
- `react-dom@18.3.1`: React DOM rendering
- `react-router-dom@6.28.0`: Routing management
- `socket.io-client@4.8.1`: Real-time communication

### Backend Dependencies

- `bcrypt@5.1.1`: Password hashing
- `cloudinary@2.5.1`: Cloud media management
- `cookie-parser@1.4.7`: Cookie parsing middleware
- `cors@2.8.5`: Cross-origin resource sharing
- `dotenv@16.4.5`: Environment variable management
- `express@4.21.1`: Web application framework
- `jsonwebtoken@9.0.2`: Token-based authentication
- `mongoose@8.8.1`: MongoDB object modeling
- `multer@1.4.5-lts.1`: Multipart form data handling
- `nodemon@3.1.7`: Development server auto-restart
- `socket.io@4.8.1`: WebSocket communication

## 📦 NPM Install Commands

### Frontend

```bash
npm install axios js-cookie react react-dom react-router-dom socket.io-client
```

### Backend

```bash
npm install bcrypt cloudinary cookie-parser cors dotenv express jsonwebtoken mongoose multer nodemon socket.io
```

## 👥 Authors

- **Taarak Gada**
  - GitHub: [https://github.com/TaarakGada](https://github.com/TaarakGada)
  - LinkedIn: [https://www.linkedin.com/in/taarak-gada-ab0107252/](https://www.linkedin.com/in/taarak-gada-ab0107252/)
