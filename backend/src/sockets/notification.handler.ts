import { Socket } from 'socket.io';
import prisma from '../../config/database';

export const handleNotificationEvents = (socket: Socket) => {
  socket.on('join-notifications', () => {
    socket.join(`notifications-${socket.userId}`);
  });

  socket.on('mark-notification-read', async (notificationId: string) => {
    try {
      await prisma.notification.update({
        where: { 
          id: notificationId,
          userId: socket.userId,
        },
        data: { isRead: true },
      });

      socket.emit('notification-marked-read', { notificationId });
    } catch (error) {
      socket.emit('notification-error', { error: 'Failed to mark notification as read' });
    }
  });
};

export const sendNotificationToUser = async (userId: string, notification: any, io: any) => {
  try {
    const savedNotification = await prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'INFO',
      },
    });

    io.to(`notifications-${userId}`).emit('new-notification', savedNotification);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
