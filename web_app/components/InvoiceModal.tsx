'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InvoiceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoiceData: any;
}

export default function InvoiceModal({ open, onOpenChange, invoiceData }: InvoiceModalProps) {
    const router = useRouter();

    if (!invoiceData) return null;

    const handleClose = () => {
        onOpenChange(false);
        router.refresh(); // Refresh to show completed status
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Task Completed!</DialogTitle>
                    <DialogDescription className="text-center">
                        Invoice generated successfully.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4 my-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-sm text-gray-500">Task</span>
                        <span className="font-medium text-gray-900">{invoiceData.taskTitle}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-sm text-gray-500">Amount Due</span>
                        <span className="font-bold text-xl text-gray-900">${invoiceData.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Payment Method</span>
                        <span className="font-medium text-gray-900 capitalize">{invoiceData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 uppercase">
                            {invoiceData.status}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" /> Save PDF
                    </Button>
                    <Button className="flex-1" onClick={handleClose}>
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
