import http from 'http';
import app from './app';
import { config } from './config/env';
import { initializeSocket } from './config/socket';
import redisClient from './config/redis';
import prisma from './config/database';
import { Server } from 'socket.io';



const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Connect to Redis
redisClient.connect().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  server.close(async () => {
    await prisma.$disconnect();
    await redisClient.quit();
    process.exit(0);
  });
});

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

export default server;
