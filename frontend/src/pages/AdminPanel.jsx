import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getVideos } from '../api/video';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    flagged: 0,
    processing: 0,
    uploaded: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getVideos({ limit: 1000 });
      const videos = res.data.videos;
      
      setStats({
        total: videos.length,
        safe: videos.filter(v => v.status === 'safe').length,
        flagged: videos.filter(v => v.status === 'flagged').length,
        processing: videos.filter(v => v.status === 'processing').length,
        uploaded: videos.filter(v => v.status === 'uploaded').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Videos</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-green-50 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Safe</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.safe}</p>
            </div>
            <div className="bg-red-50 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Flagged</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.flagged}</p>
            </div>
            <div className="bg-yellow-50 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Processing</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.processing}</p>
            </div>
            <div className="bg-blue-50 shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Uploaded</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.uploaded}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">System Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Role:</strong> Admin</p>
              <p><strong>Permissions:</strong> Full access to all videos and user management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

