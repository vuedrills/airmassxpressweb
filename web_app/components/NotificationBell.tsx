'use client';

import { Bell, CheckCircle, MessageCircle, ExternalLink, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { markNotificationAsRead as apiMarkAsRead, markAllNotificationsAsRead as apiMarkAllAsRead } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function NotificationBell() {
    const notifications = useStore((state) => state.notifications);
    const setNotifications = useStore((state) => state.setNotifications);
    const addNotification = useStore((state) => state.addNotification);
    const storeMarkAsRead = useStore((state) => state.markNotificationAsRead);
    const storeMarkAllAsRead = useStore((state) => state.markAllNotificationsAsRead);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        const handleNewNotification = (event: CustomEvent) => {
            const newNotification = event.detail;
            console.log('🔔 Real-time notification received:', newNotification);

            // Add to store using dedicated action
            addNotification(newNotification);

            // Show toast
            toast.info(newNotification.title || 'New Notification', {
                description: newNotification.message,
                duration: 5000,
            });

            // Play sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => { });
        };

        window.addEventListener('ws_new_notification', handleNewNotification as EventListener);
        return () => window.removeEventListener('ws_new_notification', handleNewNotification as EventListener);
    }, [addNotification]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            storeMarkAsRead(id);
            await apiMarkAsRead(id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            storeMarkAllAsRead();
            await apiMarkAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleAction = async (notification: any, action: 'view' | 'message' | 'confirm') => {
        // Mark as read first
        if (!notification.read) {
            await handleMarkAsRead(notification.id);
        }

        setIsOpen(false);

        const data = notification.data || {};

        if (action === 'view' || action === 'confirm') {
            if (data.task_id) {
                router.push(`/browse?taskId=${data.task_id}`);
            }
        } else if (action === 'message') {
            if (data.conversation_id) {
                router.push(`/messages?conversationId=${data.conversation_id}`);
            } else if (data.task_id) {
                // Fallback if conversation ID missing but task ID present? 
                // Currently message button implies conversation exists.
                // We'll stick to redirecting to messages home if no ID.
                router.push('/messages');
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
                <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'text-primary animate-pulse' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-600 rounded-full px-1 border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
                    <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {notification.type === 'offer_accepted' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Bell className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 leading-snug">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>

                                                {/* Actions */}
                                                {(notification.data?.task_id || notification.data?.conversation_id) && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {notification.data?.task_id && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleAction(notification, 'confirm')}
                                                                className="h-8 text-xs bg-[#1a2847] hover:bg-[#1a2847]/90"
                                                            >
                                                                <Check className="h-3 w-3 mr-1" />
                                                                Confirm & View
                                                            </Button>
                                                        )}

                                                        {notification.data?.conversation_id && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleAction(notification, 'message')}
                                                                className="h-8 text-xs"
                                                            >
                                                                <MessageCircle className="h-3 w-3 mr-1" />
                                                                Message
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {!notification.read && (
                                                <div className="flex-shrink-0">
                                                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="p-2 border-t bg-gray-50 rounded-b-lg text-center">
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-gray-600 hover:text-primary block py-1"
                        >
                            View all history
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
