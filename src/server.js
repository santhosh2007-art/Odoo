import dotenv from 'dotenv';
import app from './app.js';
import { initDb } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Database tables
    await initDb();

    app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 Dayflow HRMS Backend running on port ${PORT}`);
      console.log(`👉 Health check: http://localhost:${PORT}/health`);
      console.log(`👉 Auth Signup:  http://localhost:${PORT}/api/auth/signup`);
      console.log(`👉 Auth Signin:  http://localhost:${PORT}/api/auth/signin`);
      console.log(`=============================================`);
    });
  } catch (error) {
    console.error('Failed to start Dayflow HRMS server:', error);
    process.exit(1);
  }
};

startServer();
