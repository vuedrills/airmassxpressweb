'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { createOffer, fetchMyInventory } from '@/lib/api';
import { useStore } from '@/store/useStore';
import type { InventoryItem, Task } from '@/types';

interface MakeOfferButtonProps {
    taskId: string;
    task?: Task;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export default function MakeOfferButton({ taskId, task, className = "w-full mb-3", variant = "default", size = "lg" }: MakeOfferButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [quoteType, setQuoteType] = useState<'flexible' | 'structured'>('flexible');
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [offerAvailability, setOfferAvailability] = useState('Available immediately');
    const [isLoading, setIsLoading] = useState(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);

    // V2 Structured quote fields
    const [rateType, setRateType] = useState<'hourly' | 'daily' | 'weekly'>('daily');
    const [baseRate, setBaseRate] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
    const [operatorFee, setOperatorFee] = useState('');
    const [includesOperator, setIncludesOperator] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState('');

    // Inventory for equipment tasks
    const [myInventory, setMyInventory] = useState<InventoryItem[]>([]);

    // Global store
    const loggedInUser = useStore((state) => state.loggedInUser);

    // Check if this is equipment task
    const isEquipmentTask = task?.taskType === 'equipment';

    // Fetch inventory if equipment task
    useEffect(() => {
        if (isEquipmentTask && isOpen && loggedInUser) {
            fetchMyInventory().then(setMyInventory).catch(console.error);
        }
    }, [isEquipmentTask, isOpen, loggedInUser]);

    // Calculate total for structured quote
    const calculateTotal = () => {
        const base = parseFloat(baseRate) || 0;
        const delivery = parseFloat(deliveryFee) || 0;
        const operator = includesOperator ? (parseFloat(operatorFee) || 0) : 0;
        return base + delivery + operator;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loggedInUser) {
            alert('Please log in to make an offer.');
            return;
        }

        setIsLoading(true);

        try {
            const offerData: any = {
                taskId: taskId,
                amount: quoteType === 'structured' ? calculateTotal() : parseFloat(offerAmount),
                description: offerMessage,
                availability: offerAvailability,
                estimatedDuration: 'Not specified',
            };

            // V2 fields for equipment tasks
            if (isEquipmentTask) {
                offerData.quoteType = quoteType;
                if (quoteType === 'structured') {
                    offerData.rateType = rateType;
                    offerData.baseRate = parseFloat(baseRate);
                    if (deliveryFee) offerData.deliveryFee = parseFloat(deliveryFee);
                    if (includesOperator && operatorFee) offerData.operatorFee = parseFloat(operatorFee);
                    offerData.includesOperator = includesOperator;
                }
                if (selectedInventoryId) offerData.inventoryId = selectedInventoryId;
            }

            await createOffer(offerData);

            setIsOpen(false);
            setOfferAmount('');
            setOfferMessage('');
            setBaseRate('');
            setDeliveryFee('');
            setOperatorFee('');

            window.location.reload();
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
                return;
            }

            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter inventory to match task category
    const relevantInventory = myInventory.filter(item =>
        task?.category ? item.category.toLowerCase().includes(task.category.toLowerCase()) : true
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={className} variant={variant} size={size}>
                    Make an offer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Make an Offer</DialogTitle>
                    <DialogDescription>
                        {isEquipmentTask
                            ? 'Submit your equipment hire quote for this request.'
                            : 'Submit your offer for this task. Be competitive but fair!'}
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
                        {/* Equipment Task: Select Inventory */}
                        {isEquipmentTask && relevantInventory.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Select Your Equipment</label>
                                <select
                                    value={selectedInventoryId}
                                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md"
                                >
                                    <option value="">Choose equipment...</option>
                                    {relevantInventory.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} {item.capacity ? `(${item.capacity})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Equipment Task: Quote Type Toggle */}
                        {isEquipmentTask && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Type</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setQuoteType('flexible')}
                                        className={`flex-1 py-2 px-3 rounded-md border text-sm ${quoteType === 'flexible'
                                            ? 'bg-[#1a2847] text-white border-[#1a2847]'
                                            : 'bg-white text-gray-700 border-gray-300'
                                            }`}
                                    >
                                        Flexible Quote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQuoteType('structured')}
                                        className={`flex-1 py-2 px-3 rounded-md border text-sm ${quoteType === 'structured'
                                            ? 'bg-[#1a2847] text-white border-[#1a2847]'
                                            : 'bg-white text-gray-700 border-gray-300'
                                            }`}
                                    >
                                        Structured Pricing
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {quoteType === 'flexible'
                                        ? 'Enter a single total amount'
                                        : 'Break down your rates and fees'}
                                </p>
                            </div>
                        )}

                        {/* Flexible Quote: Single Amount */}
                        {(quoteType === 'flexible' || !isEquipmentTask) && (
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
                        )}

                        {/* Structured Quote: Rate Breakdown */}
                        {isEquipmentTask && quoteType === 'structured' && (
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rate Type</label>
                                    <select
                                        value={rateType}
                                        onChange={(e) => setRateType(e.target.value as any)}
                                        className="w-full px-4 py-2 border rounded-md"
                                    >
                                        <option value="hourly">Hourly</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Base Rate ($)</label>
                                        <input
                                            type="number"
                                            value={baseRate}
                                            onChange={(e) => setBaseRate(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Delivery Fee ($)</label>
                                        <input
                                            type="number"
                                            value={deliveryFee}
                                            onChange={(e) => setDeliveryFee(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="checkbox"
                                            checked={includesOperator}
                                            onChange={(e) => setIncludesOperator(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        Includes operator
                                    </label>
                                    {includesOperator && (
                                        <input
                                            type="number"
                                            value={operatorFee}
                                            onChange={(e) => setOperatorFee(e.target.value)}
                                            placeholder="Operator fee"
                                            className="flex-1 px-3 py-1 border rounded-md text-sm"
                                        />
                                    )}
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Total Quote:</span>
                                        <span className="text-lg font-bold text-[#1a2847]">
                                            ${calculateTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                            <textarea
                                value={offerMessage}
                                onChange={(e) => setOfferMessage(e.target.value)}
                                placeholder={isEquipmentTask
                                    ? "Describe your equipment, any terms or conditions..."
                                    : "Explain why you're the best person for this job..."}
                                className="w-full px-4 py-2 border rounded-md h-24 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Availability</label>
                            <select
                                value={offerAvailability}
                                onChange={(e) => setOfferAvailability(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                            >
                                {isEquipmentTask ? (
                                    <>
                                        <option value="Available immediately">Available immediately</option>
                                        <option value="Available within 24 hours">Available within 24 hours</option>
                                        <option value="2-3 days notice required">2-3 days notice required</option>
                                        <option value="1 week notice required">1 week notice required</option>
                                        <option value="Subject to current hire schedule">Subject to current hire schedule</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Available immediately">Available immediately</option>
                                        <option value="Can start this week">Can start this week</option>
                                        <option value="Weekends only">Weekends only</option>
                                        <option value="Flexible">Flexible</option>
                                    </>
                                )}
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

