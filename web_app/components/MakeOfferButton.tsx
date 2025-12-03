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

interface MakeOfferButtonProps {
    taskId: string;
}

export default function MakeOfferButton({ taskId }: MakeOfferButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Offer submitted:', { taskId, offerAmount, offerMessage });
        // TODO: Submit offer to API
        setIsOpen(false);
        setOfferAmount('');
        setOfferMessage('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full mb-3" size="lg">
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
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Submit Offer
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
