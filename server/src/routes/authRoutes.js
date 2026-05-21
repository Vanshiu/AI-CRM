import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes for session establishment
router.post('/signup', signup);
router.post('/login', login);

// Private route requiring verified authentication sessions
router.get('/me', protect, getMe);

export default router;
