import http from 'http';
import { config } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/config/socket.js';
import app from './src/app.js';

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to database
connectDB();

// Start server
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

