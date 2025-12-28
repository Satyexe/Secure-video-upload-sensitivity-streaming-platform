import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getVideoPath = (filename) => {
  return path.join(__dirname, '../../', config.uploadDir, filename);
};

export const videoExists = async (filename) => {
  try {
    const videoPath = getVideoPath(filename);
    await fs.access(videoPath);
    return true;
  } catch {
    return false;
  }
};

export const deleteVideo = async (filename) => {
  try {
    const videoPath = getVideoPath(filename);
    await fs.unlink(videoPath);
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
};

