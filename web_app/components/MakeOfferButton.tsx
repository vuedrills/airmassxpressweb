'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { createOffer } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface MakeOfferButtonProps {
    taskId: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export default function MakeOfferButton({ taskId, className = "w-full mb-3", variant = "default", size = "lg" }: MakeOfferButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [offerAvailability, setOfferAvailability] = useState('Available immediately');
    const [isLoading, setIsLoading] = useState(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);

    // Global store for notifications
    const addNotification = useStore((state) => state.addNotification);
    const loggedInUser = useStore((state) => state.loggedInUser);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loggedInUser) {
            alert('Please log in to make an offer.');
            return;
        }

        setIsLoading(true);

        try {
            await createOffer({
                taskId: taskId,
                amount: parseFloat(offerAmount),
                description: offerMessage,
                availability: offerAvailability,
                estimatedDuration: 'Not specified', // Default for now
            });

            // addNotification({
            //     id: Date.now().toString(),
            //     type: 'offer_sent', // Custom type not in enum yet
            //     message: 'Your offer has been submitted successfully!',
            //     read: true,
            //     userId: loggedInUser.id,
            //     title: 'Offer Sent',
            //     createdAt: new Date().toISOString()
            // });

            setIsOpen(false);
            setOfferAmount('');
            setOfferMessage('');

            // Reload page to show new offer
            window.location.reload(); // Simple refresh for now
        } catch (error: any) {
            let errorMsg = 'Failed to submit offer';
            if (error.message.includes('Only approved taskers')) {
                errorMsg = 'Only approved taskers can make offers. Please complete your profile.';
            } else if (error.message.includes('Task is not open')) {
                errorMsg = 'This task is no longer accepting offers.';
            } else if (error.message.includes('registered equipment') || error.message.includes('INVENTORY_REQUIRED')) {
                const parts = error.message.split('category:');
                const cat = parts.length > 1 ? parts[1].trim() : 'this category';
                setInventoryError(`This task requires you to have registered equipment in: ${cat}. Please add it to your inventory.`);
                return; // Don't show alert, show UI state
            }

            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={className} variant={variant} size={size}>
                    Make an offer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Make an Offer</DialogTitle>
                    <DialogDescription>
                        Submit your offer for this task. Be competitive but fair!
                    </DialogDescription>
                </DialogHeader>

                {inventoryError ? (
                    <div className="py-4 space-y-4">
                        <div className="bg-red-50 text-red-800 p-3 rounded-md border border-red-200 text-sm">
                            <p className="font-bold mb-1">Equipment Required 🚜</p>
                            <p>{inventoryError}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <a href="/equipment/inventory" className="flex-1">
                                <Button className="w-full bg-[#1a2847]">
                                    Add to Inventory
                                </Button>
                            </a>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Offer Amount ($)</label>
                            <input
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-4 py-2 border rounded-md"
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                            <textarea
                                value={offerMessage}
                                onChange={(e) => setOfferMessage(e.target.value)}
                                placeholder="Explain why you're the best person for this job..."
                                className="w-full px-4 py-2 border rounded-md h-32 resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Tell the poster about your experience and availability
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Availability</label>
                            <select
                                value={offerAvailability}
                                onChange={(e) => setOfferAvailability(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                            >
                                <option value="Available immediately">Available immediately</option>
                                <option value="Can start this week">Can start this week</option>
                                <option value="Weekends only">Weekends only</option>
                                <option value="Flexible">Flexible</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                                {isLoading ? 'Submitting...' : 'Submit Offer'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
