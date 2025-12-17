'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';

type MessageHandler = (message: any) => void;

interface WebSocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    lastMessage: any;
    subscribe: (topic: string, handler: MessageHandler) => void;
    unsubscribe: (topic: string, handler: MessageHandler) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const loggedInUser = useStore((state) => state.loggedInUser);

    // Retry logic
    const retryCountRef = useRef(0);
    const maxRetries = 5;
    const retryTimeoutRef = useRef<NodeJS.Timeout>();
    const isConnectingRef = useRef(false);

    // Subscription management
    // Topic -> Set of Handlers
    const subscribersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());

    // Track active subscriptions to resubscribe on reconnect
    const activeTopicsRef = useRef<Set<string>>(new Set());

    const connect = useCallback(() => {
        if (!loggedInUser || isConnectingRef.current) return;

        isConnectingRef.current = true;

        // Determine WS Protocol (ws or wss)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Allow overriding via ENV if needed, otherwise infer from current host
        // Assuming backend runs on distinct port 8080 in dev, or same host in prod via proxy
        // Just use NEXT_PUBLIC_API_URL base but replace http with ws
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const token = localStorage.getItem('access_token');
        const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws?user_id=' + loggedInUser.id + '&token=' + (token || '');

        console.log(`🔌 Connecting to WebSocket at ${wsUrl}`);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('✅ WebSocket Connected');
            setIsConnected(true);
            setSocket(ws);
            retryCountRef.current = 0;
            isConnectingRef.current = false;

            // Resubscribe to active topics
            activeTopicsRef.current.forEach(topic => {
                ws.send(JSON.stringify({ type: 'subscribe', topic }));
            });
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Handle PING/PONG (if backend sends ping)
                if (data.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                    return;
                }

                setLastMessage(data);

                // Distribute to subscribers
                // If message is generic, maybe check "topic" field if backend sends it
                // OR infer from message type?
                // Backend sends room messages as specific types.
                // However, how do we know which TOPIC it belongs to?
                // Backend broadcastRoom sends: { RoomID, Message (as bytes) }.
                // Actually the current backend implementation sends the INNER message directly to the client.
                // It does NOT wrap it in "topic: roomID".
                // This is a small issue in my plan: Client needs to know which handler to fire.
                // Backend `BroadcastToRoom` sends the `message` interface directly.
                // 
                // Fix strategy:
                // Frontend handlers will likely Filter based on data.type or data content (like task_id).
                // BUT, for generic "browse_tasks", we just want that handler to fire.
                //
                // SIMPLIFIED APPROACH:
                // We broadcast to ALL local subscribers and let them filter?
                // No, we want topic-based dispatch.
                // 
                // Since the backend doesn't currently attach "topic" to the payload sent to the client
                // (it just sends the payload to the clients IN the room),
                // the client doesn't know *which* room caused this message.
                // 
                // Ideally, backend should wrap: { topic: "...", payload: ... }
                // 
                // WORKAROUND for now without changing backend again:
                // We will fire ALL handlers.
                // Most handlers verify "data.task.id === currentId".
                // Browse handler verifies "data.type === 'task_created'".
                // This is slightly less efficient locally but functionally fine.
                // 
                // Wait, I can verify if I can just assume all handlers get all messages.
                // Yes, `subscribersRef` is a Map, but if I don't know the topic of the incoming msg...
                //
                // Let's implement a global broadcast to all subscribers for now.
                // Handlers will guard themselves: `if (msg.type !== '...') return`.

                subscribersRef.current.forEach((handlers) => {
                    handlers.forEach(handler => handler(data));
                });

            } catch (e) {
                console.error('❌ WebSocket message parse error', e);
            }
        };

        ws.onclose = () => {
            console.log('🔴 WebSocket Disconnected');
            setIsConnected(false);
            setSocket(null);
            isConnectingRef.current = false;

            // Reconnect logic
            if (loggedInUser && retryCountRef.current < maxRetries) {
                const timeout = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
                retryCountRef.current += 1;
                console.log(`Creating reconnect timer for ${timeout}ms (Attempt ${retryCountRef.current})`);
                retryTimeoutRef.current = setTimeout(connect, timeout);
            }
        };

        ws.onerror = (error) => {
            console.error('⚠️ WebSocket Error', error);
            ws.close();
        };

        return ws;
    }, [loggedInUser]);

    useEffect(() => {
        if (loggedInUser) {
            connect();
        } else {
            // Logout cleanup
            if (socket) {
                socket.close();
            }
        }

        return () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (socket) socket.close();
        };
    }, [loggedInUser, connect]);

    const subscribe = useCallback((topic: string, handler: MessageHandler) => {
        if (!subscribersRef.current.has(topic)) {
            subscribersRef.current.set(topic, new Set());
        }
        subscribersRef.current.get(topic)?.add(handler);
        activeTopicsRef.current.add(topic);

        // Send subscribe message to backend if connected
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'subscribe', topic }));
        }
    }, [socket]);

    const unsubscribe = useCallback((topic: string, handler: MessageHandler) => {
        const handlers = subscribersRef.current.get(topic);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                subscribersRef.current.delete(topic);
                activeTopicsRef.current.delete(topic);
                // Send unsubscribe to backend
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'unsubscribe', topic }));
                }
            }
        }
    }, [socket]);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected, lastMessage, subscribe, unsubscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
