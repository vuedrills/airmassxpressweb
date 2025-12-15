// Notification types
export type NotificationType =
    | 'offer_accepted'
    | 'task_started'
    | 'task_completed'
    | 'payment_released'
    | 'review_received'
    | 'dispute_raised'
    | 'revision_requested'
    | 'progress_update'
    | 'offer_declined'
    | 'task_cancelled'
    | 'offer_withdrawn';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>; // Flexible data payload
    taskId?: string; // Legacy fields (can be deprecated if moved to data)
    offerId?: string;
    read: boolean;
    created_at: string; // Matches backend JSON tag
    actionUrl?: string;
}
