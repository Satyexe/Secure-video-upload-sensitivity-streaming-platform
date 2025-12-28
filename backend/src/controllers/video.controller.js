import Video from '../models/Video.js';
import { analyzeVideoSensitivity } from '../services/sensitivity.service.js';
import { getVideoDuration } from '../services/ffmpeg.service.js';
import { getVideoPath } from '../services/storage.service.js';
import { getIO } from '../config/socket.js';
import fs from 'fs/promises';

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title } = req.body;
    const file = req.file;

    // Get video duration
    const videoPath = file.path;
    const duration = await getVideoDuration(videoPath);

    // Create video record
    const video = await Video.create({
      title: title || file.originalname,
      filename: file.filename,
      originalFilename: file.originalname,
      ownerId: req.user._id,
      organizationId: req.user.organizationId,
      status: 'uploaded',
      progress: 0,
      duration,
      size: file.size
    });

    // Trigger processing asynchronously
    processVideoAsync(video._id, videoPath);

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        progress: video.progress
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading video' });
  }
};

const processVideoAsync = async (videoId, videoPath) => {
  try {
    const io = getIO();
    const video = await Video.findById(videoId);

    if (!video) return;

    // Update status to processing
    video.status = 'processing';
    video.progress = 0;
    await video.save();

    // Analyze video sensitivity
    const analysisResult = await analyzeVideoSensitivity(videoPath, videoId.toString(), io);

    // Update video with results
    video.status = analysisResult.status;
    video.progress = 100;
    video.sensitivityScore = analysisResult.sensitivityScore;
    video.analysisDetails = analysisResult.analysisDetails;
    await video.save();

    // Emit final progress
    io.emit('progress', { videoId: videoId.toString(), progress: 100, status: video.status });
  } catch (error) {
    console.error('Processing error:', error);
    const video = await Video.findById(videoId);
    if (video) {
      video.status = 'flagged'; // Default to flagged on error
      await video.save();
    }
  }
};

export const getVideos = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = { organizationId: req.user.organizationId };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Role-based filtering
    if (req.user.role === 'viewer') {
      // Viewers can only see their own videos
      query.ownerId = req.user._id;
    } else if (req.user.role === 'editor') {
      // Editors can see their own videos
      query.ownerId = req.user._id;
    }
    // Admins can see all organization videos (no ownerId filter)

    const videos = await Video.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Error fetching videos' });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({
      _id: id,
      organizationId: req.user.organizationId
    }).populate('ownerId', 'name email');

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check permissions for viewers
    if (req.user.role === 'viewer' && video.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Error fetching video' });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({
      _id: id,
      organizationId: req.user.organizationId
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check permissions
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot delete videos' });
    }

    if (req.user.role === 'editor' && video.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own videos' });
    }

    // Delete file
    const videoPath = getVideoPath(video.filename);
    try {
      await fs.unlink(videoPath);
    } catch (error) {
      console.error('Error deleting video file:', error);
    }

    // Delete record
    await Video.findByIdAndDelete(id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Error deleting video' });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const video = await Video.findOne({
      _id: id,
      organizationId: req.user.organizationId
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check permissions
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot update videos' });
    }

    if (req.user.role === 'editor' && video.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own videos' });
    }

    if (title) {
      video.title = title;
    }

    await video.save();

    res.json({ message: 'Video updated successfully', video });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Error updating video' });
  }
};

