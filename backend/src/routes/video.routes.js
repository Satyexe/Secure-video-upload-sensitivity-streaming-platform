import express from 'express';
import { uploadVideo, getVideos, getVideoById, deleteVideo, updateVideo } from '../controllers/video.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/rbac.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload video (editor and admin only)
router.post('/upload', allowRoles('editor', 'admin'), upload.single('video'), uploadVideo);

// Get all videos (all roles)
router.get('/', getVideos);

// Get video by ID (all roles)
router.get('/:id', getVideoById);

// Update video (editor and admin only)
router.put('/:id', allowRoles('editor', 'admin'), updateVideo);

// Delete video (editor and admin only)
router.delete('/:id', allowRoles('editor', 'admin'), deleteVideo);

export default router;

