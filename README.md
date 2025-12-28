# Video Sensitivity Analysis Application

A full-stack application for uploading, analyzing, and managing videos with real-time sensitivity detection using AI/ML techniques.

## 🏗️ Architecture Overview

### Tech Stack

**Backend:**
- Node.js (LTS)
- Express.js
- MongoDB + Mongoose
- Multer (video upload)
- FFmpeg (video processing)
- Socket.io (real-time progress)
- JWT (authentication)
- RBAC middleware

**Frontend:**
- React + Vite
- Axios
- Socket.io-client
- Context API
- Tailwind CSS
- HTML5 Video Player

### Folder Structure

```
video-sensitivity-app/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, environment, socket configuration
│   │   ├── models/        # MongoDB models (User, Video, Organization)
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, RBAC, upload middleware
│   │   ├── services/      # Business logic (sensitivity, FFmpeg, storage)
│   │   └── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── context/       # React Context (Auth, Socket)
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

## 🗄️ Database Design

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['viewer', 'editor', 'admin'],
  organizationId: ObjectId
}
```

### Video Model
```javascript
{
  title: String,
  filename: String,
  originalFilename: String,
  ownerId: ObjectId,
  organizationId: ObjectId,
  status: ['uploaded', 'processing', 'safe', 'flagged'],
  progress: Number (0-100),
  duration: Number (seconds),
  size: Number (bytes),
  sensitivityScore: Number (0-100),
  analysisDetails: Object,
  createdAt: Date
}
```

### Organization Model
```javascript
{
  name: String,
  users: [ObjectId]
}
```

**Multi-tenant isolation:** All queries are scoped by `organizationId` to ensure data isolation between organizations.

## 🔐 Authentication & RBAC

### Roles & Permissions

| Role   | Permissions                                    |
|--------|------------------------------------------------|
| Viewer | View & stream own videos                       |
| Editor | Upload + manage own videos                     |
| Admin  | Full access + manage all organization videos   |

### RBAC Middleware

```javascript
allowRoles('admin', 'editor') // Only admin and editor can access
```

## 📤 Video Upload & Validation Flow

1. Frontend selects video file
2. Multer validates:
   - Format (mp4, mkv, avi, mov, webm)
   - Size limit (configurable, default 1GB)
3. File saved to `/uploads` directory
4. Metadata stored in MongoDB
5. Processing job triggered asynchronously

## 🔍 Video Sensitivity Analysis Pipeline

### Processing Stages

1. **Extract metadata** using FFmpeg (duration, etc.)
2. **Frame extraction** (mock implementation)
3. **Analysis** (mock AI/keyword/frame scoring)
4. **Status assignment:**
   - `safe` (score 0-50)
   - `flagged` (score 51-100)
5. Update MongoDB status
6. Emit Socket.io progress updates

### Real-Time Updates

**Backend:**
```javascript
io.emit('progress', { videoId, progress: 60, status: 'processing' });
```

**Frontend:**
```javascript
socket.on('progress', (data) => {
  setProgress(data.progress);
});
```

## 🎥 Secure Video Streaming

### HTTP Range Requests

The application uses HTTP Range Requests for efficient video streaming:

- Supports seeking/scrubbing
- Fast loading (only requested portions)
- Scalable for large files

**Backend Logic:**
```javascript
const range = req.headers.range;
if (range) {
  // Parse range and stream specific byte range
  const file = fs.createReadStream(videoPath, { start, end });
  res.writeHead(206, { 'Content-Range': ... });
}
```

## 📱 Frontend Pages & Features

### Pages

1. **Login / Register** - User authentication
2. **Upload Video** - Video upload with progress bar
3. **Dashboard** - Overview of recent videos
4. **Video Library** - List all videos with filtering
5. **Video Player** - Stream and view video details
6. **Admin Panel** - Statistics and system info

### UI Features

- ✅ Upload progress bar
- ✅ Live processing percentage (Socket.io)
- ✅ Status badges (Safe / Flagged / Processing)
- ✅ Responsive video player with range requests
- ✅ Search and filter functionality
- ✅ Role-based navigation

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- FFmpeg installed on system
  - **Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - **macOS:** `brew install ffmpeg`
  - **Linux:** `sudo apt-get install ffmpeg`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-sensitivity
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=1073741824
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Body: { name, email, password, role?, organizationName? }
Response: { token, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

### Video Endpoints

#### Upload Video
```
POST /api/videos/upload
Headers: Authorization: Bearer <token>
Body: FormData { video: File, title: String }
Roles: editor, admin
Response: { message, video }
```

#### Get All Videos
```
GET /api/videos?status=safe&search=title&page=1&limit=10
Headers: Authorization: Bearer <token>
Response: { videos, totalPages, currentPage, total }
```

#### Get Video by ID
```
GET /api/videos/:id
Headers: Authorization: Bearer <token>
Response: { video }
```

#### Update Video
```
PUT /api/videos/:id
Headers: Authorization: Bearer <token>
Body: { title }
Roles: editor, admin
Response: { message, video }
```

#### Delete Video
```
DELETE /api/videos/:id
Headers: Authorization: Bearer <token>
Roles: editor, admin
Response: { message }
```

### Streaming Endpoint

#### Stream Video
```
GET /api/stream/:id
Headers: Authorization: Bearer <token>
Headers: Range: bytes=0-1024 (optional)
Response: Video stream (206 Partial Content with Range, 200 OK without)
```

## 🔑 Key Features Explained

### 1. Multi-Tenant Architecture
All data is isolated by `organizationId`. Users can only access videos from their organization.

### 2. Real-Time Processing Updates
Socket.io emits progress events as videos are processed, allowing live UI updates without polling.

### 3. HTTP Range Request Streaming
Videos are streamed efficiently using Range Requests, enabling:
- Seeking without downloading entire file
- Faster initial playback
- Bandwidth optimization

### 4. RBAC (Role-Based Access Control)
Three-tier permission system:
- **Viewer:** Read-only access to own videos
- **Editor:** Can upload and manage own videos
- **Admin:** Full access to all organization videos

### 5. FFmpeg Integration
FFmpeg is used for:
- Video duration extraction
- Frame extraction (for analysis)
- Thumbnail generation (future enhancement)

## 🎯 Interview Defense Points

You can confidently explain:

1. **"We use Socket.io for real-time processing feedback"**
   - Eliminates polling overhead
   - Provides instant UI updates
   - Scalable with Redis adapter (production)

2. **"HTTP range requests enable efficient streaming"**
   - Supports video seeking
   - Reduces bandwidth usage
   - Industry-standard approach

3. **"RBAC ensures secure multi-tenant isolation"**
   - Organization-scoped queries
   - Middleware-based permission checks
   - Role hierarchy enforcement

4. **"FFmpeg handles preprocessing & optimization"**
   - Video metadata extraction
   - Frame extraction for analysis
   - Future: transcoding, thumbnails

5. **"MongoDB stores metadata, not heavy files"**
   - Files stored on filesystem (or S3 in production)
   - Database optimized for queries
   - Efficient indexing by organizationId

## 🚢 Deployment Strategy

### Backend
- **Platform:** Render / Railway / Heroku
- **Database:** MongoDB Atlas
- **Storage:** Persistent volume for uploads (or AWS S3)
- **Environment Variables:** Set all config values

### Frontend
- **Platform:** Vercel / Netlify
- **Build Command:** `npm run build`
- **Environment Variables:** Set API base URL

### Production Recommendations
- Use AWS S3 for video storage
- CloudFront CDN for video delivery
- Redis adapter for Socket.io (multi-instance)
- Environment-based configuration
- Rate limiting
- CORS configuration
- HTTPS everywhere

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Video upload with progress
- [ ] Real-time processing updates
- [ ] Video streaming with seeking
- [ ] Role-based access control
- [ ] Search and filter functionality
- [ ] Video deletion (permissions)

## 📝 Assumptions

1. **FFmpeg is installed** on the system running the backend
2. **MongoDB is accessible** (local or Atlas)
3. **File system storage** is sufficient (or S3 in production)
4. **Sensitivity analysis** uses mock implementation (replace with actual AI/ML model)
5. **Single instance** for Socket.io (use Redis adapter for scaling)

## 🔄 Future Enhancements

- [ ] Integrate actual AI/ML model for sensitivity detection
- [ ] Video transcoding to multiple formats/resolutions
- [ ] Thumbnail generation
- [ ] Video preview/trimming
- [ ] Batch upload support
- [ ] Email notifications
- [ ] Video sharing (public/private links)
- [ ] Advanced analytics dashboard
- [ ] User management UI for admins
- [ ] Webhook support for external integrations

## 📄 License

ISC

## 👤 Author

Video Sensitivity Analysis Application

---

**Note:** This is a production-ready architecture suitable for interviews and assignments. Replace the mock sensitivity analysis service with actual AI/ML integration for real-world deployment.

