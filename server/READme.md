# Backend Server – Football Player Management API

This is a Node.js + TypeScript + Express server that provides a RESTful API for managing football players, authentication, data scraping, and more.

---

## 🚀 Features

- RESTful API for players and user authentication
- Integration with MongoDB using Mongoose
- Schema validation with Zod for request payloads
- Centralized structured logging with Winston
- Authentication via JWT tokens for secured endpoints
- Middleware for authentication, cross-origin requests, error handling, and validation
- Web scraping module powered by Cheerio.js for automated player data extraction
- Clean and modular project structure following MVC principles
- Docker configurations for easy deployment and scaling

---

## 📁 Project Structure
```
server/
├── .env                  # Environment variables
├── logs/                 # Winston logs
├── src/                  # Application source code
│   ├── config/           # App configuration files
│   ├── context/          # Application context & dependency injection
│   ├── controllers/      # Route handlers
│   │   ├── authController.ts
│   │   └── playerController.ts
│   ├── logger/           # Winston logging setup
│   ├── middleware/       # Middleware for auth, error handling, etc.
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   │   ├── authRouter.ts
│   │   └── playerRouter.ts
│   ├── scraper/          # Player data scraping utilities
│   └── index.ts          # Entry point – Express app init
├── package.json
├── Dockerfile
├── tsconfig.json
└── .gitignore
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Validation**: Zod
- **Authentication**: JWT
- **Logging**: Winston
- **Containerization**: Docker

---

## 🔧 Installation & Setup

### 1. Clone & Install Dependencies

```bash
  git clone https://github.com/mahmoudjd/abschlussarbeit.git
  cd server
  pnpm install
```
### 2. Configure Environment Variables

Create a `.env` file in the root of the `server/` folder with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your_jwt_secret_key
```
> Ensure your MongoDB server is running before proceeding.

### 3. Start the Development Server

```bash
   pnpm dev
```
---

## 🐳 Running the Server with Docker

### 1. Build the Docker Image
```bash
  docker build -t backend-server
```

### 2. Run the Docker Container

```bash
  docker run -p 5000:5000 --env-file .env backend-server
```

---

## 🔐 API Endpoints

### Authentication:
- **POST /auth/register** → Create a new user
- **POST /auth/login** → Authenticate a user and generate a JWT token

### Players:
- **GET /players** → Fetch all players
- **POST /players** → Add a new player (authentication required)
- **PUT /players/:id** → Update an existing player (authentication required)
- **DELETE /players/:id** → Delete a player (authentication required)

> Note: Most routes require an `Authorization: Bearer <token>` header.

---

## 🆕 What's New (v2.0.0 – June 28, 2025)

- Dependency Injection added with Context Layer
- Zod-based input validation for robust API endpoints
- Logging using Winston with daily log rotation
- Enhanced JWT authentication system
- Modular and maintainable project refactor
- Unicode-aware football player search and normalization
- Docker support for streamlined deployment on any platform
- Comprehensive update to controller and route structure

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).




