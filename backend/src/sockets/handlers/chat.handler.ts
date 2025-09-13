import { Socket } from 'socket.io';
import prisma from '../../config/database';

export const handleChatEvents = (socket: Socket) => {
  socket.on('join-chat-room', async (roomId: string) => {
    socket.join(`chat-${roomId}`);
    socket.to(`chat-${roomId}`).emit('user-joined-chat', {
      userId: socket.userId,
      username: socket.username,
    });
  });

  socket.on('send-chat-message', async (data: { room: string; message: string }) => {
    try {
      const chatMessage = await prisma.chatMessage.create({
        data: {
          userId: socket.userId,
          message: data.message,
          room: data.room,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      socket.to(`chat-${data.room}`).emit('new-chat-message', chatMessage);
      socket.emit('message-sent', { success: true, message: chatMessage });
    } catch (error) {
      socket.emit('chat-error', { error: 'Failed to send message' });
    }
  });

  socket.on('leave-chat-room', (roomId: string) => {
    socket.leave(`chat-${roomId}`);
    socket.to(`chat-${roomId}`).emit('user-left-chat', {
      userId: socket.userId,
      username: socket.username,
    });
  });
};
