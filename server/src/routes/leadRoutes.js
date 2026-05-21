import express from 'express';
import { createLead, getLeads, getLead, updateLead, deleteLead } from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware guard globally across all lead routes
router.use(protect);

router.route('/')
  .post(createLead)
  .get(getLeads);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

export default router;
