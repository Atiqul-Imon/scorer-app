import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

let socket: Socket | null = null;

export interface ScoreUpdateEvent {
  matchId: string;
  score: {
    home: { runs: number; wickets: number; overs: number };
    away: { runs: number; wickets: number; overs: number };
  };
  location?: string;
  timestamp: string;
}

export interface MatchCreatedEvent {
  match: {
    matchId: string;
    teams: { home: { name: string }; away: { name: string } };
    venue: { name: string; city: string };
  };
}

export interface MatchEndedEvent {
  matchId: string;
  status: 'completed';
}

/**
 * Connect to WebSocket server
 */
export function connectSocket(token?: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
}

/**
 * Disconnect from WebSocket server
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Subscribe to score updates for a specific match
 */
export function subscribeToMatch(matchId: string, callback: (data: ScoreUpdateEvent) => void): void {
  if (!socket || !socket.connected) {
    console.warn('Socket not connected');
    return;
  }

  socket.emit('subscribe-match', matchId);
  
  // Create a wrapped callback that checks matchId
  const wrappedCallback = (data: ScoreUpdateEvent) => {
    if (data.matchId === matchId) {
      callback(data);
    }
  };
  
  socket.on('score-update', wrappedCallback);
  
  // Store callback reference for cleanup
  (socket as any)._matchCallbacks = (socket as any)._matchCallbacks || new Map();
  (socket as any)._matchCallbacks.set(matchId, wrappedCallback);
}

/**
 * Subscribe to location-based updates
 */
export function subscribeToLocation(location: string, callback: (data: ScoreUpdateEvent) => void): void {
  if (!socket) {
    console.warn('Socket not connected');
    return;
  }

  socket.emit('subscribe-location', location);
  socket.on('score-update', (data: ScoreUpdateEvent) => {
    if (data.location === location) {
      callback(data);
    }
  });
}

/**
 * Unsubscribe from match updates
 */
export function unsubscribeFromMatch(matchId: string): void {
  if (!socket) return;
  
  socket.emit('unsubscribe-match', matchId);
  
  // Remove callback listener
  if ((socket as any)._matchCallbacks?.has(matchId)) {
    const callback = (socket as any)._matchCallbacks.get(matchId);
    socket.off('score-update', callback);
    (socket as any)._matchCallbacks.delete(matchId);
  }
}

/**
 * Unsubscribe from location updates
 */
export function unsubscribeFromLocation(location: string): void {
  if (!socket) return;
  socket.emit('unsubscribe-location', location);
}




