# Doctor Stroke — Post-Stroke Rehabilitation Platform

A comprehensive platform for managing post-stroke rehabilitation, connecting patients, caregivers, and healthcare providers through coordinated care, medication management, and progress tracking.

## 🏗️ Architecture Overview

This monorepo contains multiple applications:

- **Backend API** (`backend_main/`) - Node.js + Express + PostgreSQL (Neon)
- **Web Portal** (`web-portal/`) - React + Vite (Clinician dashboard)
- **Mobile App** (Root) - Expo + React Native (Patient/Caregiver app)
- **Signup Site** (`normal-site/`) - Static site for public registration
- **Mock Server** (`server/`) - Development API server (optional)

---

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Git (to clone the repository)

### 1. Clone and Setup

```powershell
# Clone the repository
git clone <your-repo-url>
cd Doctor-Stroke

# Create environment file
Copy-Item .env.docker.example .env

# Edit .env if needed (DATABASE_URL and JWT_SECRET are pre-configured)
notepad .env
```

### 2. Start All Services

```powershell
# Build and start all containers
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access Applications

Once all containers are healthy (wait ~30 seconds):

- **Backend API**: http://localhost:3001
- **Web Portal** (Clinicians): http://localhost:5173
- **Signup Site**: http://localhost:8082

### 4. Test the Integration

```powershell
# Test backend health
curl http://localhost:3001

# Open web portal in browser
Start-Process http://localhost:5173

# Open signup site
Start-Process http://localhost:8082
```

### 5. Stop Services

```powershell
# Stop all containers
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v
```

---

## 🛠️ Development Setup (Without Docker)

For active development with hot-reload and debugging:

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Neon cloud instance from `.env`)

### Backend Setup

```powershell
cd backend_main
npm install

# Configure environment
Copy-Item .env.example .env
notepad .env  # Update DATABASE_URL and JWT_SECRET

# Start backend
npm run dev  # Runs on http://localhost:3001
```

### Web Portal Setup

```powershell
cd web-portal
npm install
npm run dev  # Runs on http://localhost:5173
```

### Mobile App Setup (Expo)

```powershell
# From project root
npm install

# Start Expo dev server
npx expo start

# Options:
# - Press 'w' for web preview
# - Scan QR code with Expo Go app for mobile testing
```

### Signup Site Setup

```powershell
cd normal-site
npm install
npm start  # Runs on http://localhost:8082
```

---

## 📋 Docker Commands Reference

### Basic Operations

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
```

### Development Workflows

```powershell
# Rebuild after code changes
docker-compose build backend
docker-compose up -d backend

# Rebuild everything from scratch
docker-compose build --no-cache
docker-compose up -d

# Run development mode with hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Database Operations

```powershell
# Run migrations
docker-compose exec backend node migrate.js

# Check database connection
docker-compose exec backend node -e "require('./src/config/db').query('SELECT NOW()').then(r => console.log(r.rows[0]))"

# Access PostgreSQL CLI (if using local postgres)
docker-compose exec postgres psql -U postgres -d doctor_stroke
```

### Troubleshooting

```powershell
# Check container health
docker-compose ps

# View detailed logs with timestamps
docker-compose logs --tail=100 --timestamps backend

# Execute commands in container
docker-compose exec backend sh

# Clean up everything (nuclear option)
docker-compose down -v --rmi all
docker system prune -a --volumes -f
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Database (Neon PostgreSQL Cloud)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_key_change_this

# Node Environment
NODE_ENV=production

# Port Configuration (optional)
PORT=3001
```

### Port Mapping

| Service | Container Port | Host Port |
|---------|----------------|-----------|
| Backend API | 3001 | 3001 |
| Web Portal | 80 | 5173 |
| Signup Site | 8082 | 8082 |
| Mock Server | 4000 | 4000 |

To change host ports, edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "3002:3001"  # Change 3002 to your desired port
```

---

## 🧪 Testing

### Test User Registration

```powershell
# Register via API
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"caregiver"}'

# Login
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Web Portal

1. Open http://localhost:5173
2. Click "Request Access" to register
3. Use "Sign In" to login
4. Navigate to "Scheduler" to test authenticated routes

### Test Mobile App

```powershell
# Update config for mobile testing
notepad config.js

# Change BACKEND_URL to your machine's IP
# export const BACKEND_URL = 'http://192.168.1.XXX:3001/api';

# Start Expo
npx expo start

# Scan QR code with Expo Go app
```

---

## 📦 Production Deployment

### Using Docker Compose

```powershell
# Build production images
docker-compose -f docker-compose.yml build

# Start services
docker-compose up -d

# Enable SSL (recommended)
# Add reverse proxy like Nginx or Traefik
```

### Environment Setup

1. **Update `.env` for production:**
   - Use strong `JWT_SECRET`
   - Configure production database
   - Set `NODE_ENV=production`

2. **Configure CORS:**
   - Update allowed origins in [`backend_main/app.js`](backend_main/app.js)

3. **Setup SSL/TLS:**
   - Use Let's Encrypt with Certbot
   - Or configure cloud load balancer

### Health Checks

All services include health checks:

```powershell
# Check service health
docker-compose ps

# Expected output:
# NAME                    STATUS
# doctor-stroke-backend   Up (healthy)
# doctor-stroke-web       Up
# doctor-stroke-normal    Up (healthy)
```

---

## 🗂️ Project Structure

```
Doctor-Stroke/
├── backend_main/          # Main backend API
│   ├── src/
│   │   ├── api/          # Route handlers
│   │   ├── controllers/  # Business logic
│   │   ├── services/     # Core services
│   │   ├── repositories/ # Database access
│   │   └── config/       # Database & migrations
│   ├── Dockerfile
│   └── .env
│
├── web-portal/           # Clinician web dashboard
│   ├── src/
│   │   ├── App.jsx      # Main app component
│   │   ├── Signup.jsx   # Registration modal
│   │   ├── SignIn.jsx   # Login modal
│   │   └── Scheduler.jsx # Appointment scheduler
│   ├── Dockerfile
│   └── nginx.conf
│
├── normal-site/          # Public signup site
│   ├── index.html
│   ├── server.js        # Express proxy
│   └── Dockerfile
│
├── components/           # Expo app components
│   ├── LandingScreen.js
│   └── SignUpForm.js
│
├── services/            # API client
│   └── api.js
│
├── docker-compose.yml   # Production compose
├── docker-compose.dev.yml # Development compose
├── .env                 # Environment variables
└── config.js           # Frontend config
```

---

## 🔗 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Patients

- `POST /api/patients` - Create patient (authenticated)
- `GET /api/patients` - Get my patients (authenticated)

### Appointments

- `POST /api/appointments` - Schedule appointment
- `GET /api/appointments` - Get my appointments

### Prescriptions

- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/patient/:id` - Get patient prescriptions
- `POST /api/prescriptions/:id/adherence` - Log medication adherence

### Progress Tracking

- `POST /api/progress` - Record progress snapshot
- `GET /api/progress/patient/:id` - Get progress history
- `GET /api/progress/patient/:id/report` - Generate progress report

### Nutrition

- `PUT /api/nutrition/patient/:id/profile` - Update nutrition profile
- `GET /api/nutrition/patient/:id/plan` - Get meal plan
- `POST /api/nutrition/patient/:id/meals` - Log meal

For detailed API documentation, see [`backend_main/README.md`](backend_main/README.md).

---

## 🐛 Troubleshooting

### Port Already in Use

```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Database Connection Failed

```powershell
# Test connection from backend container
docker-compose exec backend node -e "require('./src/config/db').query('SELECT 1').then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e.message))"

# Check DATABASE_URL in .env
cat .env | findstr DATABASE_URL
```

### Container Keeps Restarting

```powershell
# View error logs
docker-compose logs --tail=50 backend

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port conflict
# - Missing dependencies
```

### CORS Errors

Update allowed origins in [`backend_main/app.js`](backend_main/app.js):

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8082'],
  credentials: true
}));
```

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 👥 Team

**Group 7 and 15** - Doctor Stroke Development Team

---

## 🚧 Development Status

**Current Features:**
- ✅ User authentication (JWT)
- ✅ Patient management
- ✅ Appointment scheduling
- ✅ Medication tracking with adherence logging
- ✅ Progress monitoring and reporting
- ✅ Nutrition management and meal planning
- ✅ Docker containerization
- ✅ Frontend-Backend integration

**Upcoming Features:**
- 🔄 Real-time notifications
- 🔄 Mobile app enhancements
- 🔄 Advanced analytics dashboard
- 🔄 Multi-language support

---

For questions or support, please open an issue in the repository or contact the development team.