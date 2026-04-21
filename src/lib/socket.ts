import { io, Socket } from 'socket.io-client';

/**
 * Singleton socket connection.
 * Loginda `connectSocket(token)` chaqiriladi, logoutda `disconnectSocket()`.
 */
let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket && socket.connected) return socket;
  socket?.disconnect();

  socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
