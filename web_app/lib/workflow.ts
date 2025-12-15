// Workflow helper functions for managing the marketplace workflow
import type { Notification, Escrow } from '@/types';

// Mock data imports
import tasksData from '@/data/tasks.json';
import offersData from '@/data/offers.json';
import escrowData from '@/data/escrow.json';
import reviewsData from '@/data/reviews.json';
import notificationsData from '@/data/notifications.json';
import disputesData from '@/data/disputes.json';

// In-memory storage for mock data (simulates database)
// In a real app, these would be API calls
// Using 'as any' to allow dynamic property assignment on imported JSON data
let tasks = [...tasksData] as any[];
let offers = [...offersData] as any[];
let escrows = [...escrowData] as any[];
let reviews = [...reviewsData] as any[];
let notifications = [...notificationsData] as any[];
let disputes = [...disputesData] as any[];

export const workflowHelpers = {
    // Accept an offer
    acceptOffer: (offerId: string, taskId: string, currentUserId: string) => {
        const task = tasks.find(t => t.id === taskId);
        const offer = offers.find(o => o.id === offerId);

        if (!task || !offer) {
            throw new Error('Task or offer not found');
        }

        // Validate
        if (task.posterId !== currentUserId) {
            throw new Error('Only task poster can accept offers');
        }
        if (offer.status !== 'pending') {
            throw new Error('Offer must be pending');
        }
        if (task.status !== 'open') {
            throw new Error('Task must be open');
        }

        // Update offer status
        offer.status = 'accepted';
        offer.acceptedAt = new Date().toISOString();

        // Decline all other offers
        offers.forEach(o => {
            if (o.taskId === taskId && o.id !== offerId && o.status === 'pending') {
                o.status = 'declined';
                o.declinedAt = new Date().toISOString();
            }
        });

        // Update task status
        task.status = 'in_progress';
        task.acceptedOfferId = offerId;
        task.progress = 0;
        task.updatedAt = new Date().toISOString();

        // Create escrow entry
        const escrow: Escrow = {
            id: `escrow-${Date.now()}`,
            taskId,
            offerId,
            amount: offer.amount,
            status: 'held',
            paymentGateway: 'PLACEHOLDER_PAYNOW',
            heldAt: new Date().toISOString(),
            releaseScheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            notes: 'Payment held in escrow pending task completion',
        };
        escrows.push(escrow);

        // Create notifications
        const taskerNotification: Notification = {
            id: `notif-${Date.now()}-1`,
            userId: offer.taskerId,
            type: 'offer_accepted',
            title: 'Offer Accepted!',
            message: `Your offer for "${task.title}" has been accepted.`,
            taskId,
            offerId,
            read: false,
            created_at: new Date().toISOString(),
            actionUrl: `/browse?taskId=${taskId}`,
        };

        const posterNotification: Notification = {
            id: `notif-${Date.now()}-2`,
            userId: task.posterId,
            type: 'task_started',
            title: 'Task Started',
            message: `Work has begun on your task "${task.title}".`,
            taskId,
            read: false,
            created_at: new Date().toISOString(),
            actionUrl: `/browse?taskId=${taskId}`,
        };

        notifications.push(taskerNotification, posterNotification);

        return {
            task,
            offer,
            escrow,
            notifications: [taskerNotification, posterNotification],
        };
    },

    // Update task progress
    updateTaskProgress: (taskId: string, progress: number, currentUserId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');

        const offer = offers.find(o => o.id === task.acceptedOfferId);
        if (!offer) throw new Error('No accepted offer found');

        if (offer.taskerId !== currentUserId) {
            throw new Error('Only the tasker can update progress');
        }

        task.progress = progress;
        task.updatedAt = new Date().toISOString();

        // Notify poster
        const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: task.posterId,
            type: 'progress_update',
            title: 'Progress Update',
            message: `Task progress updated to ${progress}% for "${task.title}".`,
            taskId,
            read: false,
            created_at: new Date().toISOString(),
            actionUrl: `/browse?taskId=${taskId}`,
        };
        notifications.push(notification);

        return { task, notification };
    },

    // Mark task as complete (by tasker)
    markTaskComplete: (taskId: string, currentUserId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');

        const offer = offers.find(o => o.id === task.acceptedOfferId);
        if (!offer) throw new Error('No accepted offer found');

        if (offer.taskerId !== currentUserId) {
            throw new Error('Only the tasker can mark as complete');
        }

        task.progress = 100;
        task.updatedAt = new Date().toISOString();

        // Notify poster to review and release payment
        const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: task.posterId,
            type: 'task_completed',
            title: 'Task Marked Complete',
            message: `The tasker has marked "${task.title}" as complete. Please review and release payment.`,
            taskId,
            read: false,
            created_at: new Date().toISOString(),
            actionUrl: `/browse?taskId=${taskId}`,
        };
        notifications.push(notification);

        return { task, notification };
    },

    // Release payment
    releasePayment: (taskId: string, currentUserId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');

        if (task.posterId !== currentUserId) {
            throw new Error('Only the task poster can release payment');
        }

        const escrow = escrows.find(e => e.taskId === taskId && e.status === 'held');
        if (!escrow) throw new Error('No held escrow found');

        const offer = offers.find(o => o.id === task.acceptedOfferId);
        if (!offer) throw new Error('No accepted offer found');

        // Update escrow
        escrow.status = 'released';
        escrow.releasedAt = new Date().toISOString();
        escrow.gatewayTransactionId = `PAYNOW_TXN_${Date.now()}`;
        escrow.notes = 'Payment successfully released to tasker';

        // Update task
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();

        // Notify tasker
        const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: offer.taskerId,
            type: 'payment_released',
            title: 'Payment Released',
            message: `Payment of $${escrow.amount} has been released for "${task.title}".`,
            taskId,
            read: false,
            created_at: new Date().toISOString(),
        };
        notifications.push(notification);

        return { task, escrow, notification };
    },

    // Request revisions
    requestRevisions: (taskId: string, message: string, currentUserId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');

        if (task.posterId !== currentUserId) {
            throw new Error('Only the task poster can request revisions');
        }

        const offer = offers.find(o => o.id === task.acceptedOfferId);
        if (!offer) throw new Error('No accepted offer found');

        task.status = 'revision_requested';
        task.revisionMessage = message;
        task.progress = 75; // Set back to 75%
        task.updatedAt = new Date().toISOString();

        // Notify tasker
        const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: offer.taskerId,
            type: 'revision_requested',
            title: 'Revisions Requested',
            message: `The task poster has requested revisions on "${task.title}".`,
            taskId,
            read: false,
            created_at: new Date().toISOString(),
            actionUrl: `/browse?taskId=${taskId}`,
        };
        notifications.push(notification);

        return { task, notification };
    },

    // Raise dispute
    raiseDispute: (taskId: string, reason: string, description: string, currentUserId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');

        const offer = offers.find(o => o.id === task.acceptedOfferId);
        if (!offer) throw new Error('No accepted offer found');

        const escrow = escrows.find(e => e.taskId === taskId && e.status === 'held');
        if (!escrow) throw new Error('No held escrow found');

        // Determine who raised the dispute
        let raisedBy: 'poster' | 'tasker';
        if (task.posterId === currentUserId) {
            raisedBy = 'poster';
        } else if (offer.taskerId === currentUserId) {
            raisedBy = 'tasker';
        } else {
            throw new Error('User not authorized');
        }

        // Update task
        task.status = 'dispute';
        task.updatedAt = new Date().toISOString();

        // Update escrow
        escrow.status = 'disputed';
        escrow.notes = 'Payment on hold due to active dispute';

        // Create dispute record
        const dispute = {
            id: `dispute-${Date.now()}`,
            taskId,
            offerId: offer.id,
            raisedBy,
            raisedById: currentUserId,
            reason,
            description,
            status: 'open' as const,
            created_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        disputes.push(dispute);

        // Notify the other party
        const otherUserId = raisedBy === 'poster' ? offer.taskerId : task.posterId;
        const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: otherUserId,
            type: 'dispute_raised',
            title: 'Dispute Raised',
            message: `A dispute has been raised for task "${task.title}". Our team will review.`,
            taskId,
            read: false,
            created_at: new Date().toISOString(),
            actionUrl: `/browse?taskId=${taskId}`,
        };
        notifications.push(notification);

        return { task, escrow, dispute, notification };
    },

    // Get notifications for user
    getUserNotifications: (userId: string) => {
        return notifications.filter(n => n.userId === userId).sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    },

    // Get escrow for task
    getEscrowForTask: (taskId: string) => {
        return escrows.find(e => e.taskId === taskId);
    },
};
