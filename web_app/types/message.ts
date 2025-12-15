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
    task_id?: string; // Optional link to task
    task?: {
        id: string;
        title: string;
    };
    createdAt: string;
    updatedAt: string;
}
