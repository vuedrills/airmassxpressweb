// Dispute management types
export type DisputeStatus = 'open' | 'under_review' | 'resolved';

export type DisputeReason =
    | 'work_not_completed'
    | 'poor_quality'
    | 'not_as_described'
    | 'payment_issue'
    | 'communication_issue'
    | 'other';

export type DisputeResolution =
    | 'full_refund'
    | 'full_payment'
    | 'partial_refund_50_50'
    | 'partial_refund_30_70'
    | 'partial_refund_70_30'
    | 'custom';

export interface Dispute {
    id: string;
    taskId: string;
    offerId: string;
    raisedBy: 'poster' | 'tasker';
    raisedById: string;
    reason: DisputeReason;
    description: string;
    status: DisputeStatus;
    resolution?: DisputeResolution;
    resolutionNotes?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DisputeMessage {
    id: string;
    disputeId: string;
    senderId: string;
    senderName: string;
    message: string;
    attachments?: string[];
    createdAt: string;
}
