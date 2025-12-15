import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { fetchNotifications } from '@/lib/api';
import { useFCM } from '@/hooks/useFCM';

/**
 * Hook to fetch and sync notifications when user logs in
 */
export function useNotifications() {
    const loggedInUser = useStore((state) => state.loggedInUser);
    const setNotifications = useStore((state) => state.setNotifications);

    // Initialize FCM (Token & Listeners)
    useFCM();

    useEffect(() => {
        if (!loggedInUser) {
            // Clear notifications when user logs out
            setNotifications([]);
            return;
        }

        // Fetch notifications when user is logged in (Initial Load)
        const loadNotifications = async () => {
            try {
                console.log('[useNotifications] Fetching notifications for user:', loggedInUser.id);
                const notifications = await fetchNotifications();
                console.log('[useNotifications] Received notifications:', notifications);
                console.log('[useNotifications] Notification count:', notifications?.length || 0);
                setNotifications(notifications);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        loadNotifications();

        // Polling removed in favor of FCM
    }, [loggedInUser, setNotifications]);
}
