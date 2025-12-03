'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchConversations, fetchMessagesByConversation } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
    const router = useRouter();
    const { loggedInUser } = useStore();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');

    const { data: conversations } = useQuery({
        queryKey: ['conversations', loggedInUser?.id],
        queryFn: () => fetchConversations(loggedInUser?.id || 'user-demo'),
        enabled: !!loggedInUser,
    });

    const { data: messages } = useQuery({
        queryKey: ['messages', selectedConversationId],
        queryFn: () => fetchMessagesByConversation(selectedConversationId!),
        enabled: !!selectedConversationId,
    });

    if (!loggedInUser) {
        router.push('/login');
        return null;
    }

    const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);

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
                                    conversations.map((conv) => {
                                        const otherUser = conv.participantDetails[0];
                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelectedConversationId(conv.id)}
                                                className={`w-full p-4 border-b hover:bg-gray-50 text-left transition-colors ${selectedConversationId === conv.id ? 'bg-gray-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={otherUser.avatar} />
                                                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-sm truncate">{otherUser.name}</span>
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
                                    {/* Chat Header */}
                                    <div className="p-4 border-b flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={selectedConversation.participantDetails[0].avatar} />
                                            <AvatarFallback>
                                                {selectedConversation.participantDetails[0].name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{selectedConversation.participantDetails[0].name}</p>
                                            <p className="text-sm text-gray-500">Active now</p>
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
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (messageText.trim()) {
                                                    // In a real app, this would call sendMessage API
                                                    console.log('Sending message:', messageText);
                                                    setMessageText('');
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
