import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getVideos } from '../api/video';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await getVideos({ limit: 10 });
      setVideos(res.data.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
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

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
            <p className="text-gray-600">Role: {user?.role}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Videos</h2>
              {(user?.role === 'editor' || user?.role === 'admin') && (
                <Link
                  to="/upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Upload Video
                </Link>
              )}
            </div>

            {videos.length === 0 ? (
              <p className="text-gray-500">No videos yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <Link
                    key={video._id}
                    to={`/video/${video._id}`}
                    className="border rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold truncate">{video.title}</h3>
                      <StatusBadge status={video.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      Progress: {video.progress}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

