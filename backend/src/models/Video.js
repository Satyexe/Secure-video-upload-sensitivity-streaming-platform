import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'safe', 'flagged'],
    default: 'uploaded'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  size: {
    type: Number, // in bytes
    required: true
  },
  sensitivityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  analysisDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
videoSchema.index({ organizationId: 1, status: 1 });
videoSchema.index({ ownerId: 1 });

export default mongoose.model('Video', videoSchema);

