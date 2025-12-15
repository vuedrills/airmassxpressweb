import { User } from './user';

export interface InventoryItem {
    id: string;
    userId: string;
    name: string;
    category: string;
    capacity?: string;
    location?: string;
    photos?: string[];
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    user?: User; // Optional user details if needed
}
