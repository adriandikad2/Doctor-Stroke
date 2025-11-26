import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mainRouter from './src/api/index.js';

const app = express();

// CORS Middleware - Allow frontend to communicate with backend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.1:5174', 'http://localhost:8082', 'http://127.0.0.1:8082'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// API Routes
app.use('/api', mainRouter);

export default app;
