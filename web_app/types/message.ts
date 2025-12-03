// Message types
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
    createdAt: string;
}

export interface Conversation {
    id: string;
    participants: string[];
    participantDetails: {
        id: string;
        name: string;
        avatar?: string;
    }[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}
