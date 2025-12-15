'use client';

import { useStore } from '@/store/useStore';
import { Header } from '@/components/Layout/Header';
import { NotificationBanner } from '@/components/NotificationBanner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Bell,
    CheckCircle,
    DollarSign,
    MessageCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    Package,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
    const loggedInUser = useStore((state) => state.loggedInUser);
    const notifications = useStore((state) => state.notifications);
    const markNotificationAsRead = useStore((state) => state.markNotificationAsRead);
    const markAllNotificationsAsRead = useStore((state) => state.markAllNotificationsAsRead);
    const currentNotification = useStore((state) => state.currentNotification);
    const dismissCurrentNotification = useStore((state) => state.dismissCurrentNotification);

    if (!loggedInUser) {
        return (
            <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f3f3f7' }}>
                <Header />
                <main className="flex-1 py-6">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold mb-4">Please log in to view notifications</h1>
                            <Link href="/login" className="text-primary hover:underline">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Filter notifications for current user
    const userNotifications = notifications.filter(n => n.userId === loggedInUser.id);
    const unreadNotifications = userNotifications.filter(n => !n.read);
    const readNotifications = userNotifications.filter(n => n.read);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'offer_accepted':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'task_started':
                return <TrendingUp className="h-6 w-6 text-blue-600" />;
            case 'progress_update':
                return <Package className="h-6 w-6 text-blue-600" />;
            case 'task_completed':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'payment_released':
                return <DollarSign className="h-6 w-6 text-green-600" />;
            case 'revision_requested':
                return <AlertCircle className="h-6 w-6 text-yellow-600" />;
            case 'dispute_raised':
                return <AlertCircle className="h-6 w-6 text-red-600" />;
            default:
                return <Bell className="h-6 w-6 text-gray-600" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'offer_accepted':
            case 'task_started':
            case 'task_completed':
            case 'payment_released':
                return 'border-green-200 bg-green-50';
            case 'progress_update':
                return 'border-blue-200 bg-blue-50';
            case 'revision_requested':
                return 'border-yellow-200 bg-yellow-50';
            case 'dispute_raised':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-white';
        }
    };

    const NotificationCard = ({ notification }: { notification: any }) => (
        <Card
            className={`p-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-primary' : ''
                } transition-all hover:shadow-md`}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                            <Badge className="bg-primary text-white flex-shrink-0">New</Badge>
                        )}
                    </div>

                    <p className="text-gray-700 text-sm mb-3">{notification.message}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-3">
                        {notification.actionUrl && (
                            <Link href={notification.actionUrl}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Task
                                </Button>
                            </Link>
                        )}

                        {notification.taskId && (
                            <Link href={`/browse?taskId=${notification.taskId}`}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    Go to Task
                                </Button>
                            </Link>
                        )}

                        {!notification.read && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="text-primary"
                            >
                                Mark as read
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f3f3f7' }}>
            <NotificationBanner
                notification={currentNotification}
                onDismiss={dismissCurrentNotification}
            />
            <Header />

            <main className="flex-1 py-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="font-heading text-4xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                Notifications
                            </h1>
                            {unreadNotifications.length > 0 && (
                                <p className="text-gray-600 mt-1">
                                    You have {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>

                        {unreadNotifications.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={markAllNotificationsAsRead}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {userNotifications.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
                            <p className="text-gray-600">
                                You'll be notified here when there are updates to your tasks
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Unread Notifications */}
                            {unreadNotifications.length > 0 && (
                                <div>
                                    <h2 className="font-semibold text-lg mb-3 text-gray-900">
                                        Unread ({unreadNotifications.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {unreadNotifications.map(notification => (
                                            <NotificationCard key={notification.id} notification={notification} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Read Notifications */}
                            {readNotifications.length > 0 && (
                                <div>
                                    <h2 className="font-semibold text-lg mb-3 text-gray-700">
                                        Earlier ({readNotifications.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {readNotifications.map(notification => (
                                            <NotificationCard key={notification.id} notification={notification} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
