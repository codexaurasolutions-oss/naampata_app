import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextData>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  markAsRead: () => {},
  joinConversation: () => {},
  leaveConversation: () => {},
});

let API_URL = 'https://local-business-listing-directory-production.up.railway.app/api/v1';
try {
  API_URL = require('../services/api').API_URL || API_URL;
} catch (e) {}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const baseUrl = (API_URL || '').replace('/api/v1', '');

  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket: Socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setIsConnected(true);

      if (user?.role === 'vendor') {
        newSocket.emit('join_vendor_room', user.id);
      } else {
        newSocket.emit('join_user_room', user.id);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    newSocket.on('new_message', (message: any) => {
      console.log('[Socket] New message:', message);
    });

    newSocket.on('message_sent', (data: any) => {
      console.log('[Socket] Message sent confirmation:', data);
    });

    newSocket.on('conversation_updated', (data: any) => {
      console.log('[Socket] Conversation updated:', data);
    });

    newSocket.on('notification', (notification: any) => {
      console.log('[Socket] Notification:', notification);
    });

    newSocket.on('lead_received', (lead: any) => {
      console.log('[Socket] Lead received:', lead);
    });

    newSocket.on('new_review', (review: any) => {
      console.log('[Socket] New review:', review);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user, token]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (socket?.connected) {
      socket.emit('send_message', { conversationId, content });
    }
  }, [socket]);

  const markAsRead = useCallback((conversationId: string) => {
    if (socket?.connected) {
      socket.emit('mark_as_read', { conversationId });
    }
  }, [socket]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket?.connected) {
      socket.emit('join_conversation', { conversationId });
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket?.connected) {
      socket.emit('leave_conversation', { conversationId });
    }
  }, [socket]);

  const ping = useCallback(() => {
    if (socket?.connected) {
      socket.emit('ping');
    }
  }, [socket]);

  useEffect(() => {
    if (!socket?.connected) return;
    const interval = setInterval(() => {
      ping();
    }, 30000);
    return () => clearInterval(interval);
  }, [socket, ping]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage, markAsRead, joinConversation, leaveConversation }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};