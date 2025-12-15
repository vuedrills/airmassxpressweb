'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AvailabilityManager } from '@/components/AvailabilityManager';
import { Availability } from '@/types/user';

interface Step6AvailabilityProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function Step6Availability({ data, updateData, onNext, onBack }: Step6AvailabilityProps) {
    const handleAvailabilityUpdate = (newAvailability: Availability) => {
        updateData({ ...data, availability: newAvailability });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Set Your Availability</h2>
                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800">
                    <p className="font-medium text-blue-800 dark:text-blue-300">
                        What is this for?
                    </p>
                    <p className="mt-1">
                        Use this calendar to set your general working hours (e.g., weekends only, or after 6 PM).
                        This helps us recommend tasks that fit your schedule and enables future rebooking features.
                    </p>
                    <p className="mt-2 text-xs text-gray-500 italic">
                        Note: This does not affect your ability to make offers on any task. You can still offer on any task regardless of these settings.
                    </p>
                </div>
            </div>

            <AvailabilityManager
                initialAvailability={data.availability}
                onUpdate={handleAvailabilityUpdate}
                hideSaveButton={true}
            />

            <div className="flex justify-between pt-6 border-t mt-8">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Continue to Payments
                </Button>
            </div>
        </div>
    );
}
