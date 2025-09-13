import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from './database';

// Define custom socket interface
interface CustomSocket extends Socket {
  userId?: string;
  username?: string;
}

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (user) {
        socket.userId = user.id;
        socket.username = user.username;
        next();
      } else {
        next(new Error('Authentication error'));
      }
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    console.log(`User ${socket.username} connected`);

    // Join user to a room
    socket.on('join-room', (room: string) => {
      socket.join(room);
      socket.to(room).emit('user-joined', socket.username);
    });

    // Handle chat messages
    socket.on('send-message', async (data: { message: string; room: string }) => {
      try {
        const message = await prisma.chatMessage.create({
          data: {
            userId: socket.userId!,
            message: data.message,
            room: data.room,
          },
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        });

        io.to(data.room).emit('new-message', message);
      } catch (error) {
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected`);
    });
  });

  return io;
};