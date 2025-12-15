'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Menu, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchConversations } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { ActiveTaskRibbon } from '../ActiveTaskRibbon';
import { Toaster } from 'sonner';
import { ForceReviewModal } from '@/components/ForceReviewModal';

interface HeaderProps {
    maxWidthClass?: string;
}

export function Header({ maxWidthClass }: HeaderProps) {
    const pathname = usePathname();
    const { loggedInUser, logout } = useStore();
    const isHomepage = pathname === '/';
    const queryClient = useQueryClient();

    // Fetch notifications when user logs in
    useNotifications();

    // Connect to WebSocket (maintains connection across all pages)
    useWebSocket();

    // Fetch conversations to calculate unread count  
    const { data: conversations } = useQuery({
        queryKey: ['conversations', loggedInUser?.id, 'v3'], // Match MessagesPageContent cache key
        queryFn: async () => {
            console.log('🔍 Header: Fetching conversations for user:', loggedInUser?.id);
            const data = await fetchConversations(loggedInUser?.id || '');
            console.log('📥 Header: Fetched conversations:', data.length);
            return data;
        },
        enabled: !!loggedInUser,
    });

    // Calculate total unread count
    const totalUnreadMessages = (conversations || []).reduce((total, conv) => total + conv.unreadCount, 0);

    console.log('📊 Badge calculation:', {
        conversationsCount: conversations?.length,
        unreadCounts: conversations?.map(c => ({ id: c.id.substring(0, 8), unread: c.unreadCount })),
        totalUnreadMessages
    });

    // Listen for WebSocket messages globally to update conversations
    useEffect(() => {
        const handleNewMessage = (event: CustomEvent) => {
            console.log('🌐 Header: Received WebSocket message, invalidating conversations query');
            // Invalidate conversations query to update badge and conversation list
            queryClient.invalidateQueries({
                queryKey: ['conversations', loggedInUser?.id, 'v3']
            });
        };

        window.addEventListener('ws_new_message', handleNewMessage as EventListener);
        return () => window.removeEventListener('ws_new_message', handleNewMessage as EventListener);
    }, [queryClient, loggedInUser]);

    // Handle hydration mismatch by ensuring we only show user state after mount
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // During SSR and initial client render, force logged-out state representation to match server
    // or simply wait for mount to render user-specific parts.
    // However, for the header, we want to show something. 
    // Best approach: Use isMounted to conditionally render the user-dependent sections.
    const showUserContent = isMounted && loggedInUser;

    const navLinks = [
        { href: '/browse', label: 'Browse Tasks' },
        { href: '/my-tasks', label: 'My Tasks' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className={`container mx-auto ${maxWidthClass || 'px-4 max-w-6xl'}`}>
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img
                            src="/logo.png"
                            alt="Airmass Xpress"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation - All on right for homepage */}
                    {isHomepage ? (
                        <div className="hidden md:flex items-center space-x-6">
                            <nav className="flex items-center space-x-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-gray-700'}`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            {showUserContent ? (
                                <div className="flex items-center space-x-4">
                                    <Button className="bg-white hover:bg-slate-50 text-[#a42444] border border-[#a42444]" asChild>
                                        <Link href="/post-task">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Post a Task
                                        </Link>
                                    </Button>

                                    {/* Tasker Link - Alway show for now as requested */}
                                    <Link href="/tasker/onboarding" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        Join as Pro
                                    </Link>

                                    <NotificationBell />
                                    <Link href="/messages" className="text-gray-700 hover:text-primary relative">
                                        Messages
                                        {totalUnreadMessages > 0 && (
                                            <span className="absolute -top-1 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href="/dashboard" className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={loggedInUser.avatar} />
                                            <AvatarFallback>
                                                {loggedInUser.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link href="/join-as-pro" className="text-sm font-medium text-gray-700 hover:text-primary">
                                        Join as a Pro
                                    </Link>
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">Log In</Link>
                                    </Button>
                                    <Button variant="default" asChild>
                                        <Link href="/register">Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Standard centered nav for other pages */}
                            <nav className="hidden md:flex items-center space-x-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-gray-700'}`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Desktop Actions */}
                            <div className="hidden md:flex items-center space-x-4">
                                {showUserContent ? (
                                    <>
                                        <Button className="bg-white hover:bg-slate-50 text-[#a42444] border border-[#a42444]" asChild>
                                            <Link href="/post-task">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Post a Task
                                            </Link>
                                        </Button>

                                        {/* Tasker Link */}
                                        {(!loggedInUser.isTasker || ['not_started', 'in_progress'].includes(loggedInUser.taskerProfile?.status || '')) && (
                                            <Link href="/tasker/onboarding" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                                Join as Pro
                                            </Link>
                                        )}

                                        <NotificationBell />
                                        <Link href="/messages" className="text-gray-700 hover:text-primary relative">
                                            Messages
                                            {totalUnreadMessages > 0 && (
                                                <span className="absolute -top-1 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                                                </span>
                                            )}
                                        </Link>
                                        <Link href="/dashboard" className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={loggedInUser.avatar} />
                                                <AvatarFallback>
                                                    {loggedInUser.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            onClick={logout}
                                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            Log Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/join-as-pro" className="text-sm font-medium text-gray-700 hover:text-primary">
                                            Join as a Pro
                                        </Link>
                                        <Button variant="ghost" asChild>
                                            <Link href="/login">Log In</Link>
                                        </Button>
                                        <Button variant="default" asChild>
                                            <Link href="/register">Sign Up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px]">
                            <div className="sr-only">
                                <SheetTitle>Mobile Menu</SheetTitle>
                            </div>
                            <div className="flex flex-col space-y-6 mt-6">
                                {showUserContent ? (
                                    <>
                                        <div className="flex items-center space-x-3 pb-4 border-b">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={loggedInUser.avatar} />
                                                <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{loggedInUser.name}</p>
                                                <p className="text-sm text-gray-500">{loggedInUser.email}</p>
                                            </div>
                                        </div>
                                        <Link href="/post-task" className="w-full">
                                            <Button className="w-full">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Post a Task
                                            </Button>
                                        </Link>

                                        {/* Tasker Link Mobile */}
                                        {(!loggedInUser.isTasker || ['not_started', 'in_progress'].includes(loggedInUser.taskerProfile?.status || '')) && (
                                            <Link href="/tasker/onboarding" className="w-full">
                                                <Button variant="outline" className="w-full text-blue-600 border-blue-200 bg-blue-50">
                                                    Join as Pro
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-3">
                                        <Link href="/join-as-pro" className="w-full">
                                            <Button variant="outline" className="w-full">Join as a Pro</Button>
                                        </Link>
                                        <Button variant="ghost" asChild>
                                            <Link href="/login">Log In</Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href="/register">Sign Up</Link>
                                        </Button>
                                    </div>
                                )}

                                <nav className="flex flex-col space-y-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="text-gray-700 hover:text-primary font-medium"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    {showUserContent && (
                                        <>
                                            <Link href="/dashboard" className="text-gray-700 hover:text-primary font-medium">
                                                Dashboard
                                            </Link>
                                            <Link href="/messages" className="text-gray-700 hover:text-primary font-medium">
                                                Messages
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="text-left text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Log Out
                                            </button>
                                        </>
                                    )}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            {/* Active Task Ribbon for Taskers */}
            <ActiveTaskRibbon />
            <ForceReviewModal />
            <Toaster />
        </header>
    );
}
