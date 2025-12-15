import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';

const RAW_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/v1/ws';
// Ensure no trailing slash
const WS_URL = RAW_WS_URL.endsWith('/') ? RAW_WS_URL.slice(0, -1) : RAW_WS_URL;
const PING_INTERVAL = 30000; // Send ping every 30 seconds

export function useWebSocket() {
    const { loggedInUser } = useStore();
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const connect = useCallback(() => {
        if (!loggedInUser) {
            console.log('WebSocket: No logged in user, skipping connection');
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('WebSocket: No access token, skipping connection');
            return;
        }

        console.log('🔌 WebSocket: Connecting with token...', token.substring(0, 10) + '...');

        // Close existing connection if any
        if (wsRef.current) {
            console.log('WebSocket: Closing existing connection before new one');
            if (wsRef.current.readyState !== WebSocket.CLOSED) {
                wsRef.current.close();
            }
        }

        try {
            const connectUrl = `${WS_URL}?token=${token}`;
            console.log('🔌 Connecting to WebSocket URL:', connectUrl);
            const ws = new WebSocket(connectUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected (onopen)');
                setIsConnected(true);

                // Start ping interval to keep connection alive
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                        // console.log('📡 Sent ping'); // Reduced noise
                    }
                }, PING_INTERVAL);
            };

            ws.onclose = (event) => {
                console.log(`❌ WebSocket disconnected: Code=${event.code}, Reason=${event.reason}, WasClean=${event.wasClean}`);
                setIsConnected(false);

                // Clear ping interval
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                }

                // Only attempt to reconnect if user is still logged in
                if (loggedInUser) {
                    // console.log('WebSocket: Scheduling reconnect...');
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('🔄 WebSocket: Reconnecting...');
                        connect();
                    }, 3000);
                }
            };

            ws.onerror = (error) => {
                console.error('⚠️ WebSocket error event:', error);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle pong response
                    if (data.type === 'pong') {
                        console.log('🏓 Received pong');
                        return;
                    }

                    console.log('📨 WebSocket message received:', data);

                    // Dispatch to appropriate handler based on message type
                    if (data.type === 'new_message') {
                        // Trigger a custom event that the messages component can listen to
                        window.dispatchEvent(new CustomEvent('ws_new_message', { detail: data.message }));
                    } else if (data.type === 'new_notification') {
                        // Trigger a custom event that the notification bell can listen to
                        window.dispatchEvent(new CustomEvent('ws_new_notification', { detail: data.message }));
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }, [loggedInUser?.id]);

    useEffect(() => {
        if (loggedInUser?.id) {
            // console.log('WebSocket: Initial connect trigger');
            connect();
        }
        return () => {
            console.log('WebSocket: Cleanup (unmount or dep change)');
            if (wsRef.current) {
                // Prevent onclose from triggering reconnect loop during cleanup
                wsRef.current.onclose = null;
                wsRef.current.onerror = null;
                wsRef.current.onmessage = null;
                wsRef.current.onopen = null;
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
        };
    }, [loggedInUser?.id, connect]);

    return { isConnected };
}
