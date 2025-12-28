import express from 'express';
import { streamVideo } from '../controllers/stream.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/:id', streamVideo);

export default router;

