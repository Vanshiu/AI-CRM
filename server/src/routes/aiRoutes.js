import express from 'express';
import { generateReply } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to protect the AI suggestion resource
router.use(protect);

router.post('/reply', generateReply);

export default router;
