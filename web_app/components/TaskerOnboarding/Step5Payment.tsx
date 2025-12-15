'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateTaskerProfile } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface Step5PaymentProps {
    data: any;
    updateData: (data: any) => void;
    onBack: () => void;
}

export function Step5Payment({ data, updateData, onBack }: Step5PaymentProps) {
    const router = useRouter();
    const { loggedInUser, login } = useStore();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');

        // Validate Ecocash
        const ecoNumber = data.ecocashNumber?.replace(/\s/g, '') || '';
        if (!/^07\d{8}$/.test(ecoNumber)) {
            setError('Please enter a valid Econet number (e.g., 0771234567)');
            return;
        }

        setSubmitting(true);
        try {
            await updateTaskerProfile({
                ...data,
                ecocashNumber: ecoNumber,
                status: 'pending_review',
                onboardingStep: 5
            });

            // Update local store to reflect new status immediately
            // This ensures Header "Join as Pro" link updates correctly without refresh
            if (loggedInUser) {
                login({
                    ...loggedInUser,
                    isTasker: true,
                    taskerProfile: {
                        ...(loggedInUser.taskerProfile || {}),
                        status: 'pending_review'
                    }
                } as any);
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error('Submission failed', err);
            setError(err.message || 'Failed to submit profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Your profile has been submitted for review. We will notify you once your application has been processed.
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Payment Setup</h2>
                <p className="text-sm text-gray-500">We process payments via Ecocash.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ecocash Number</label>
                    <Input
                        placeholder="077xxxxxxx"
                        value={data.ecocashNumber || ''}
                        onChange={(e) => updateData({ ...data, ecocashNumber: e.target.value })}
                        type="tel"
                    />
                    <p className="text-xs text-gray-500">Must be a valid Econet number registered with Ecocash.</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onBack} disabled={submitting}>
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Application'
                    )}
                </Button>
            </div>
        </div>
    );
}
