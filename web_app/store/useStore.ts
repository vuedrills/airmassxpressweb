import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Task, Notification, TaskReview, Escrow } from '@/types';

interface BrowseFilters {
    selectedCategories: string[];
    priceRange: [number, number] | null;
    location: string | null;
    sortBy: 'newest' | 'price_low' | 'price_high' | 'most_offers';
}

interface AppState {
    // Auth
    loggedInUser: User | null;
    login: (user: User) => void;
    logout: () => void;

    // Post Task Draft (multi-step form)
    currentTaskDraft: Partial<Task>;
    updateTaskDraft: (data: Partial<Task>) => void;
    clearTaskDraft: () => void;

    // Browse Filters
    browseFilters: BrowseFilters;
    updateBrowseFilters: (filters: Partial<BrowseFilters>) => void;
    resetBrowseFilters: () => void;

    // Notifications
    notifications: Notification[];
    currentNotification: Notification | null;
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    dismissCurrentNotification: () => void;
    markNotificationRead: (notificationId: string) => void;
    markNotificationAsRead: (notificationId: string) => void; // Alias for consistency
    markAllNotificationsAsRead: () => void;
    clearNotifications: () => void;
}

const defaultFilters: BrowseFilters = {
    selectedCategories: [],
    priceRange: null,
    location: null,
    sortBy: 'newest',
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // Auth state
            loggedInUser: null,
            login: (user) => set({ loggedInUser: user }),
            logout: () => {
                // Clear tokens from localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
                set({ loggedInUser: null, currentTaskDraft: {} });
            },

            // Post Task Draft state
            currentTaskDraft: {},
            updateTaskDraft: (data) =>
                set((state) => ({
                    currentTaskDraft: { ...state.currentTaskDraft, ...data },
                })),
            clearTaskDraft: () => set({ currentTaskDraft: {} }),

            // Browse filters
            browseFilters: {
                selectedCategories: [],
                priceRange: null,
                location: null,
                sortBy: 'newest',
            },
            updateBrowseFilters: (filters) =>
                set((state) => ({
                    browseFilters: { ...state.browseFilters, ...filters },
                })),
            resetBrowseFilters: () =>
                set({
                    browseFilters: {
                        selectedCategories: [],
                        priceRange: null,
                        location: null,
                        sortBy: 'newest',
                    },
                }),

            // Notifications
            notifications: [],
            currentNotification: null,
            setNotifications: (notifications) => set({ notifications }),
            addNotification: (notification) =>
                set((state) => {
                    const exists = state.notifications.some((n) => n.id === notification.id);
                    if (exists) {
                        return state;
                    }
                    return {
                        notifications: [notification, ...state.notifications],
                        currentNotification: notification,
                    };
                }),
            dismissCurrentNotification: () =>
                set({ currentNotification: null }),
            markNotificationRead: (notificationId) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === notificationId ? { ...n, read: true } : n
                    ),
                })),
            markNotificationAsRead: (notificationId) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === notificationId ? { ...n, read: true } : n
                    ),
                })),
            markAllNotificationsAsRead: () =>
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                })),
            clearNotifications: () =>
                set({ notifications: [], currentNotification: null }),
        }),
        {
            name: 'airmass-xpress-storage', // LocalStorage key
            partialize: (state) => ({
                loggedInUser: state.loggedInUser,
                notifications: state.notifications,
                // Don't persist filters, task draft, or current notification
            }),
        }
    )
);
