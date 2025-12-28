import api from './axios';

export const uploadVideo = (formData, onUploadProgress) => {
  return api.post('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onUploadProgress(percentCompleted);
    }
  });
};

export const getVideos = (params) => api.get('/videos', { params });
export const getVideoById = (id) => api.get(`/videos/${id}`);
export const updateVideo = (id, data) => api.put(`/videos/${id}`, data);
export const deleteVideo = (id) => api.delete(`/videos/${id}`);
export const streamVideoUrl = (id) => `/api/stream/${id}`;

