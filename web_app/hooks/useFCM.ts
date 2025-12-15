import { useEffect, useCallback } from 'react';
import { requestPermissionAndGetToken, messaging } from '@/lib/firebase-messaging';
import { onMessage } from 'firebase/messaging';
import { useStore } from '@/store/useStore'; // Assuming we have access to user state
import { Notification } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export function useFCM() {
    const loggedInUser = useStore((state) => state.loggedInUser);
    const addNotification = useStore((state) => state.addNotification);

    const updateFCMTokenInBackend = useCallback(async (token: string) => {
        if (!loggedInUser) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/fcm-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ token, device: 'web' })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to update FCM token in backend:', errorData.error || response.statusText);
            }
        } catch (error) {
            console.error('Error updating FCM token:', error);
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (!loggedInUser) return;

        // Request permission and get token
        requestPermissionAndGetToken((token) => {
            console.log('FCM Token:', token);
            updateFCMTokenInBackend(token);
        });

        // Foreground message listener
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('FCM Message received in foreground:', payload);

                const newNotification: Notification = {
                    id: payload.messageId || Date.now().toString(),
                    userId: loggedInUser.id,
                    type: payload.data?.type as any || 'info', // Adjust type mapping
                    title: payload.notification?.title || 'New Notification',
                    message: payload.notification?.body || '',
                    data: payload.data,
                    read: false,
                    created_at: new Date().toISOString()
                };

                addNotification(newNotification);

                // Optional: Show browser notification if needed, but 'onMessage' usually implies 
                // we handle UI in app. System notification only shows if backgrounded.
            });
            return () => unsubscribe();
        }
    }, [loggedInUser, updateFCMTokenInBackend, addNotification]);

    // Listen for messages from the service worker (background/inactive tabs)
    // Force Service Worker update to ensure broadcast logic is active
    useEffect(() => {
        const handleServiceWorkerMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'FCM_MESSAGE') {
                const payload = event.data.payload;

                const newNotification: Notification = {
                    id: payload.messageId || Date.now().toString(),
                    userId: loggedInUser?.id || '',
                    type: payload.data?.type as any || 'info',
                    title: payload.notification?.title || 'New Notification',
                    message: payload.notification?.body || '',
                    data: payload.data,
                    read: false,
                    created_at: new Date().toISOString()
                };

                addNotification(newNotification);
            }
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('Service Worker registered/updated:', registration);
                    if (registration.waiting) {
                        // If there's a waiting worker, skip waiting to activate immediately
                        // This usually requires the SW itself to handle skipWaiting, but we can try updating
                        registration.update();
                    }
                })
                .catch((err) => console.error('Service Worker registration failed:', err));

            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
            }
        };
    }, [loggedInUser, addNotification]);
}
