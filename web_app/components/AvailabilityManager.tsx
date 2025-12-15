'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Availability } from '@/types/user';
import { Loader2, Save, Clock } from 'lucide-react';
import { updateTaskerProfile } from '@/lib/api';

interface AvailabilityManagerProps {
    initialAvailability?: Availability;
    onUpdate?: (newAvailability: Availability) => void;
    hideSaveButton?: boolean;
}

const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

export function AvailabilityManager({ initialAvailability, onUpdate, hideSaveButton }: AvailabilityManagerProps) {
    const [availability, setAvailability] = useState<Availability>(initialAvailability || {});
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (initialAvailability) {
            // Simple deep check to avoid resetting state if it matches (prevents cursor jump in controlled mode)
            if (JSON.stringify(initialAvailability) !== JSON.stringify(availability)) {
                setAvailability(initialAvailability);
            }
        }
    }, [initialAvailability]);

    const handleToggleDay = (dayKey: keyof Availability) => {
        const current = availability[dayKey] || [];
        const isAvailable = current.length > 0;

        let newRanges: string[] | undefined;
        if (isAvailable) {
            // content -> empty (unavailable)
            newRanges = undefined;
        } else {
            // empty -> default range
            newRanges = ['09:00-17:00'];
        }

        const updated = { ...availability, [dayKey]: newRanges };
        setAvailability(updated);
        setHasChanges(true);
        if (hideSaveButton && onUpdate) {
            onUpdate(updated);
        }
    };

    const handleTimeChange = (dayKey: keyof Availability, value: string) => {
        const updated = { ...availability, [dayKey]: [value] };
        setAvailability(updated);
        setHasChanges(true);
        if (hideSaveButton && onUpdate) {
            onUpdate(updated);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Save to backend
            // availability structure is flattened in updateTaskerProfile mapping
            await updateTaskerProfile({ availability });
            if (onUpdate) onUpdate(availability);
            setHasChanges(false);
            alert('Availability saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to save availability');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={hideSaveButton ? "border-0 shadow-none" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
                <CardTitle className="text-base font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Weekly Availability
                    </div>
                </CardTitle>
                {!hideSaveButton && hasChanges && (
                    <Button size="sm" onClick={handleSave} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500 mb-6">
                    Set your general weekly availability. You can adjust this anytime (e.g., when you're on leave).
                </p>

                <div className="space-y-2">
                    {DAYS.map((day) => {
                        const dayKey = day.key as keyof Availability;
                        const ranges = availability[dayKey];
                        const isAvailable = ranges && ranges.length > 0;
                        const timeRange = isAvailable ? ranges[0] : '';

                        return (
                            <div key={day.key} className="flex flex-wrap items-center justify-between p-2.5 bg-gray-50 rounded-md gap-y-2">
                                <div className="flex items-center gap-3 min-w-[124px]">
                                    <Switch
                                        className="h-5 w-9"
                                        checked={isAvailable}
                                        onCheckedChange={() => handleToggleDay(dayKey)}
                                    />
                                    <span className={`text-sm font-medium ${isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {day.label}
                                    </span>
                                </div>

                                {isAvailable ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                className="w-[104px] h-8 text-xs font-mono px-2 bg-white"
                                                value={timeRange.split('-')[0] || '09:00'}
                                                onChange={(e) => {
                                                    const start = e.target.value;
                                                    const end = timeRange.split('-')[1] || '17:00';
                                                    handleTimeChange(dayKey, `${start}-${end}`);
                                                }}
                                            />
                                        </div>
                                        <span className="text-gray-400 text-xs">to</span>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                className="w-[104px] h-8 text-xs font-mono px-2 bg-white"
                                                value={timeRange.split('-')[1] || '17:00'}
                                                onChange={(e) => {
                                                    const start = timeRange.split('-')[0] || '09:00';
                                                    const end = e.target.value;
                                                    handleTimeChange(dayKey, `${start}-${end}`);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic text-right w-full sm:w-auto">Unavailable</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
