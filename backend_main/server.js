import 'dotenv/config';  
import app from './app.js';
import './src/config/index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`GEMINI_API_KEY loaded: ${!!process.env.GEMINI_API_KEY}`);
});