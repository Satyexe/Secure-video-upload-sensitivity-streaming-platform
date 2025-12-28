import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getVideoById } from '../api/video';
import { streamVideoUrl } from '../api/video';
import StatusBadge from '../components/StatusBadge';
import { useSocket } from '../context/SocketContext';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchVideo();

    // Listen for progress updates
    if (socket) {
      socket.on('progress', (data) => {
        if (data.videoId === id) {
          setVideo((prev) => prev ? { ...prev, progress: data.progress, status: data.status || prev.status } : null);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('progress');
      }
    };
  }, [id, socket]);

  const fetchVideo = async () => {
    try {
      const res = await getVideoById(id);
      setVideo(res.data.video);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-red-500">Video not found</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link to="/library" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Library
          </Link>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{video.title}</h1>
              <StatusBadge status={video.status} />
            </div>

            {video.status === 'processing' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing...</span>
                  <span>{video.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${video.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {video.sensitivityScore !== null && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Analysis Results</h3>
                <p className="text-sm">
                  Sensitivity Score: <span className="font-bold">{video.sensitivityScore}/100</span>
                </p>
                {video.analysisDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Categories: {video.analysisDetails.categories?.join(', ') || 'N/A'}</p>
                    <p>Frames Analyzed: {video.analysisDetails.totalFramesAnalyzed || 'N/A'}</p>
                  </div>
                )}
              </div>
            )}

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-full"
                src={streamVideoUrl(id)}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Duration: {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toFixed(0).padStart(2, '0')}` : 'N/A'}</p>
              <p>Size: {(video.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>Uploaded: {new Date(video.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

