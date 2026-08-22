import express from 'express';
import { register, verifyEmail, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', register);
router.get('/verify-email', verifyEmail);
router.post('/signin', login);

// Protected routes
router.get('/me', authenticateToken, getMe);

export default router;
