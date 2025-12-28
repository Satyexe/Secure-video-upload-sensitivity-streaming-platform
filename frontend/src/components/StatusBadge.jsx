const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
        status
      )}`}
    >
      {status.toUpperCase()}
    </span>
  );
};

export default StatusBadge;

