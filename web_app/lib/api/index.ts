import type { Task, Category, User, Offer, Conversation, Message } from '@/types';

// Import mock data
import tasksData from '@/data/tasks.json';
import categoriesData from '@/data/categories.json';
import usersData from '@/data/users.json';
import offersData from '@/data/offers.json';
import conversationsData from '@/data/conversations.json';
import messagesData from '@/data/messages.json';

// Helper to simulate network latency
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ TASKS API ============

export async function fetchTasks(filters?: {
    categories?: string[];
    priceRange?: [number, number];
    location?: string;
    sortBy?: string;
}): Promise<Task[]> {
    await delay(400);

    let filtered = [...tasksData] as Task[];

    // Filter by categories
    if (filters?.categories && filters.categories.length > 0) {
        filtered = filtered.filter(task =>
            filters.categories!.includes(task.category)
        );
    }

    // Filter by price range
    if (filters?.priceRange) {
        const [min, max] = filters.priceRange;
        filtered = filtered.filter(task =>
            task.budget >= min && task.budget <= max
        );
    }

    // Filter by location
    if (filters?.location) {
        filtered = filtered.filter(task =>
            task.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
    }

    // Sort
    if (filters?.sortBy) {
        switch (filters.sortBy) {
            case 'price_low':
                filtered.sort((a, b) => a.budget - b.budget);
                break;
            case 'price_high':
                filtered.sort((a, b) => b.budget - a.budget);
                break;
            case 'most_offers':
                filtered.sort((a, b) => b.offerCount - a.offerCount);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
        }
    }

    return filtered;
}

export async function fetchTaskById(id: string): Promise<Task | null> {
    await delay(200);
    const task = tasksData.find(t => t.id === id);
    return task ? (task as Task) : null;
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
    await delay(500);

    const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || '',
        description: taskData.description || '',
        category: taskData.category || '',
        budget: taskData.budget || 0,
        location: taskData.location || '',
        dateType: taskData.dateType || 'flexible',
        date: taskData.date,
        timeOfDay: taskData.timeOfDay,
        status: 'open',
        posterId: taskData.posterId || 'user-demo',
        poster: taskData.poster,
        offerCount: 0,
        images: taskData.images || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return newTask;
}

// ============ CATEGORIES API ============

export async function fetchCategories(): Promise<Category[]> {
    await delay(200);
    return categoriesData as Category[];
}

// ============ USERS API ============

export async function fetchUserProfile(id: string): Promise<User | null> {
    await delay(300);
    const user = usersData.find(u => u.id === id);
    return user ? (user as User) : null;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
    await delay(400);
    // Mock authentication - just find user by email
    const user = usersData.find(u => u.email === email);
    return user ? (user as User) : null;
}

// ============ OFFERS API ============

export async function fetchOffersByTask(taskId: string): Promise<Offer[]> {
    await delay(300);
    const taskOffers = offersData.filter(o => o.taskId === taskId);
    return taskOffers as Offer[];
}

export async function createOffer(offerData: Partial<Offer>): Promise<Offer> {
    await delay(400);

    const newOffer: Offer = {
        id: `offer-${Date.now()}`,
        taskId: offerData.taskId || '',
        taskerId: offerData.taskerId || '',
        tasker: offerData.tasker!,
        amount: offerData.amount || 0,
        description: offerData.description || '',
        status: 'pending',
        estimatedDuration: offerData.estimatedDuration,
        availability: offerData.availability,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return newOffer;
}

// ============ MESSAGES API ============

export async function fetchConversations(userId: string): Promise<Conversation[]> {
    await delay(300);
    const userConversations = conversationsData.filter(c =>
        c.participants.includes(userId)
    );
    return userConversations as Conversation[];
}

export async function fetchMessagesByConversation(conversationId: string): Promise<Message[]> {
    await delay(200);
    const conversationMessages = messagesData.filter(m =>
        m.conversationId === conversationId
    );
    return conversationMessages as Message[];
}

export async function sendMessage(messageData: Partial<Message>): Promise<Message> {
    await delay(300);

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: messageData.conversationId || '',
        senderId: messageData.senderId || '',
        receiverId: messageData.receiverId || '',
        content: messageData.content || '',
        read: false,
        createdAt: new Date().toISOString(),
    };

    return newMessage;
}
