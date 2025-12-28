import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

export const getVideoDuration = async (videoPath) => {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    return parseFloat(stdout.trim()) || 0;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
};

export const extractFrames = async (videoPath, outputDir, frameRate = 1) => {
  try {
    await execAsync(
      `ffmpeg -i "${videoPath}" -vf fps=${frameRate} "${path.join(outputDir, 'frame-%04d.jpg')}"`
    );
    return true;
  } catch (error) {
    console.error('Error extracting frames:', error);
    return false;
  }
};

export const generateThumbnail = async (videoPath, outputPath, time = '00:00:01') => {
  try {
    await execAsync(
      `ffmpeg -i "${videoPath}" -ss ${time} -vframes 1 "${outputPath}"`
    );
    return true;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return false;
  }
};

