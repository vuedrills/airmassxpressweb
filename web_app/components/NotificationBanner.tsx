'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Notification } from '@/types';

interface NotificationBannerProps {
    notification: Notification | null;
    onDismiss: () => void;
}

export function NotificationBanner({ notification, onDismiss }: NotificationBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            onDismiss();
        }, 300); // Wait for slide-out animation
    };

    if (!notification) return null;

    return (
        <div
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
            style={{ maxWidth: '500px', width: '90%' }}
        >
            <div
                className="rounded-lg shadow-lg p-4 flex items-start gap-3"
                style={{ backgroundColor: '#1a2847' }}
            >
                <div className="flex-1">
                    <h3 className="font-bold text-white text-sm mb-1">{notification.title}</h3>
                    <p className="text-white/90 text-sm">{notification.message}</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Dismiss notification"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
