'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { Send } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchConversations, fetchMessagesByConversation, fetchUserProfile, markConversationAsRead } from '@/lib/api';

export default function MessagesPageContent() {
    const router = useRouter();
    const { loggedInUser } = useStore();
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('userId');
    const conversationIdParam = searchParams.get('conversationId');
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // WebSocket is now connected in Header component globally

    // Fetch target user if userId is present
    const { data: targetUser } = useQuery({
        queryKey: ['user', targetUserId],
        queryFn: () => fetchUserProfile(targetUserId!),
        enabled: !!targetUserId,
    });

    const { data: conversations, isLoading: conversationsLoading } = useQuery({
        queryKey: ['conversations', loggedInUser?.id, 'v3'], // v3 to clear mock data cache
        queryFn: async () => {
            const data = await fetchConversations(loggedInUser?.id || 'user-demo');
            console.log('📥 Fetched conversations:', data.length);
            return data; // Return real data without mock transformation
        },
        enabled: !!loggedInUser,
    });

    // Redirect to login if not authenticated - MUST be in useEffect to avoid hook violations
    useEffect(() => {
        if (!loggedInUser) {
            router.push('/login');
        }
    }, [loggedInUser, router]);

    // Effect to handle initial selection or creation of conversation based on URL param
    useEffect(() => {
        if (!conversations) return;

        // Priority 1: Direct conversation ID match
        if (conversationIdParam) {
            const existingConv = conversations.find(c => c.id === conversationIdParam);
            if (existingConv) {
                setSelectedConversationId(existingConv.id);
                return;
            }
        }

        // Priority 2: Target User ID match
        if (targetUserId) {
            const existingConv = conversations.find(c =>
                c.participants.includes(targetUserId)
            );
            if (existingConv) {
                setSelectedConversationId(existingConv.id);
            } else if (targetUser) {
                // ... handling new conversation mock ...
                // Create a temporary mock conversation object
                const mockConv = {
                    id: `new-conv-${targetUserId}`,
                    participants: [loggedInUser!.id, targetUserId],
                    participantDetails: [targetUser],
                    lastMessage: {
                        id: 'temp',
                        conversationId: `new-conv-${targetUserId}`,
                        senderId: '',
                        receiverId: '',
                        content: 'Start a new conversation',
                        read: true,
                        createdAt: new Date().toISOString()
                    },
                    unreadCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setSelectedConversationId(`new-conv-${targetUserId}`);
            }
        }
    }, [conversations, targetUserId, conversationIdParam, targetUser, loggedInUser]);

    const { data: messages, refetch: refetchMessages } = useQuery({
        queryKey: ['messages', selectedConversationId],
        queryFn: () => {
            if (selectedConversationId?.startsWith('new-conv-')) {
                return []; // No messages yet for new conversation
            }
            return fetchMessagesByConversation(selectedConversationId!);
        },
        enabled: !!selectedConversationId,
    });

    // Mark conversation as read when selected
    useEffect(() => {
        if (selectedConversationId && !selectedConversationId.startsWith('new-conv-')) {
            markConversationAsRead(selectedConversationId).then(() => {
                // Invalidate conversations query to update UI (remove bold styling)
                queryClient.invalidateQueries({
                    queryKey: ['conversations', loggedInUser?.id, 'v3']
                });
            });
        }
    }, [selectedConversationId, queryClient, loggedInUser?.id]);

    // Listen for new WebSocket messages
    useEffect(() => {
        const handleNewMessage = (event: CustomEvent) => {
            const newMessage = event.detail;
            console.log('📨 Received WebSocket message:', newMessage);
            console.log('📍 Selected conversation:', selectedConversationId);
            console.log('🔍 Message conversation:', newMessage.conversationId);

            // Invalidate conversations to update sidebar (last message)
            queryClient.invalidateQueries({
                queryKey: ['conversations', loggedInUser?.id, 'v3']
            });

            // Invalidate the specific conversation's messages query
            // This ensures that whether we are viewing it NOW or LATER, the cache is marked stale
            // and will trigger a refetch.
            queryClient.invalidateQueries({
                queryKey: ['messages', newMessage.conversationId]
            });

            console.log('✅ Invalidated queries for conversation:', newMessage.conversationId);
        };

        window.addEventListener('ws_new_message', handleNewMessage as EventListener);
        return () => window.removeEventListener('ws_new_message', handleNewMessage as EventListener);
    }, [selectedConversationId, refetchMessages, queryClient, loggedInUser]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Determine the active conversation object (real or mock)
    // MUST be before early return to maintain hooks order
    const selectedConversation = useMemo(() => {
        if (!selectedConversationId) return null;

        // Check existing conversations
        const existing = conversations?.find((c) => c.id === selectedConversationId);
        if (existing) return existing;

        // Construct mock conversation if it's a new one and we have target user data
        if (selectedConversationId.startsWith('new-conv-') && targetUser && loggedInUser) {
            return {
                id: selectedConversationId,
                participants: [loggedInUser.id, targetUser.id],
                participantDetails: [targetUser],
                lastMessage: undefined,
                unreadCount: 0,
                task_id: undefined,
                task: undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        return null;
    }, [conversations, selectedConversationId, targetUser, loggedInUser]);

    // Calculate total unread count across all conversations
    const totalUnreadCount = (conversations || []).reduce((total, conv) => total + conv.unreadCount, 0);

    // Don't render until we have a logged-in user
    // This MUST be after all hooks
    if (!loggedInUser) {
        return null;
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />

            <main className="flex-1 overflow-hidden">
                <div className="container mx-auto px-4 h-full py-4">
                    <div className="flex gap-4 h-full">
                        {/* Conversations List */}
                        <div className="w-80 bg-white border rounded-lg flex flex-col">
                            <div className="p-4 border-b">
                                <h2 className="font-semibold text-lg">Messages</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {conversations && conversations.length > 0 ? (
                                    // Sort by most recent first (updatedAt DESC)
                                    [...conversations]
                                        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                        .map((conv) => {
                                            const otherUser = conv.participantDetails[0];
                                            console.log('🔔 Conversation:', conv.id.substring(0, 8),
                                                'unreadCount:', conv.unreadCount,
                                                'hasUnread:', conv.unreadCount > 0);
                                            return (
                                                <button
                                                    key={conv.id}
                                                    onClick={() => setSelectedConversationId(conv.id)}
                                                    className={`w-full p-4 border-b hover:bg-gray-50 text-left transition-colors ${selectedConversationId === conv.id
                                                        ? 'bg-gray-100'
                                                        : conv.unreadCount > 0
                                                            ? 'bg-blue-50 border-l-4 border-l-blue-600'
                                                            : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Link href={`/profile/${otherUser.id}`} onClick={(e) => e.stopPropagation()}>
                                                            <Avatar>
                                                                <AvatarImage src={otherUser.avatar} />
                                                                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                        </Link>
                                                        <div className="flex-1 min-w-0">
                                                            {conv.task_id && conv.task && (
                                                                <p className="text-xs text-gray-500 truncate mb-0.5" title={conv.task.title}>
                                                                    {conv.task.title}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>{otherUser.name}</span>
                                                                {conv.unreadCount > 0 && (
                                                                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                                                                        {conv.unreadCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 truncate">
                                                                {conv.lastMessage?.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>No conversations yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Panel */}
                        <div className="flex-1 bg-white border rounded-lg flex flex-col">
                            {selectedConversation ? (
                                <>
                                    {/* Conversation Header */}
                                    <div className="border-b p-4">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/profile/${selectedConversation.participantDetails[0]?.id}`}>
                                                <Avatar>
                                                    <AvatarImage src={selectedConversation.participantDetails[0]?.avatar} />
                                                    <AvatarFallback>
                                                        {selectedConversation.participantDetails[0]?.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold">
                                                    {selectedConversation.participantDetails[0]?.name}
                                                </h3>
                                                {selectedConversation.task_id && selectedConversation.task && (
                                                    <p className="text-sm text-gray-600 truncate" title={selectedConversation.task.title}>
                                                        {selectedConversation.task.title}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages?.map((message) => {
                                            const isOwn = message.senderId === loggedInUser.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                                            {new Date(message.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t">
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                if (!messageText.trim()) return;

                                                try {
                                                    const response = await fetch(
                                                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/conversations/${selectedConversationId}/messages`,
                                                        {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                                                            },
                                                            body: JSON.stringify({ content: messageText })
                                                        }
                                                    );

                                                    if (response.ok) {
                                                        setMessageText('');
                                                        // Refetch messages to include the new one
                                                        refetchMessages();
                                                    } else {
                                                        console.error('Failed to send message');
                                                    }
                                                } catch (error) {
                                                    console.error('Error sending message:', error);
                                                }
                                            }}
                                            className="flex gap-2"
                                        >
                                            <Input
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1"
                                            />
                                            <Button type="submit" size="icon">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
