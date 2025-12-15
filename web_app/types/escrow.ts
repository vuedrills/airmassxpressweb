// Virtual escrow types for payment tracking
export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';

export type PaymentGateway = 'PLACEHOLDER_PAYNOW' | 'PLACEHOLDER_PESAPAL' | 'NONE';

export interface Escrow {
    id: string;
    taskId: string;
    offerId: string;
    amount: number;
    status: EscrowStatus;
    paymentGateway: PaymentGateway;
    gatewayTransactionId?: string;
    heldAt: string;
    releasedAt?: string;
    refundedAt?: string;
    releaseScheduledFor?: string;
    notes?: string;
}
