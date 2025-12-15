import { User } from './user';

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    parentId?: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
    user?: User;
    children?: Comment[];
}
