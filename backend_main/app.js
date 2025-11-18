import express from 'express';
import mainRouter from './src/api/index.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// API Routes
app.use('/api', mainRouter);

export default app;
