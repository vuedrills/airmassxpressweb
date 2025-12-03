// Payment types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
    id: string;
    taskId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    status: PaymentStatus;
    method: string;
    createdAt: string;
    completedAt?: string;
}

export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank' | 'paypal';
    last4?: string;
    bankName?: string;
    isDefault: boolean;
}

export interface Invoice {
    id: string;
    taskId: string;
    amount: number;
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    dueDate: string;
    paidAt?: string;
    createdAt: string;
}
