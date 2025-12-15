'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { SmartFileUpload } from './SmartFileUpload';
import { User } from '@/types';

interface Step4PortfolioProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
    user: User;
}

export function Step4Portfolio({ data, updateData, onNext, onBack, user }: Step4PortfolioProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Portfolio</h2>
                <p className="text-sm text-gray-500">Show off your best work. Upload photos or documents.</p>
            </div>

            <div className="space-y-6">
                <SmartFileUpload
                    label="Work Samples"
                    path={`tasker_portfolio/${user.id}`}
                    type="portfolio"
                    value={data.portfolioUrls || []}
                    onUploadComplete={(urls) => updateData({ ...data, portfolioUrls: urls })}
                    maxFiles={5}
                    acceptedFileTypes={['image/jpeg', 'image/png', 'application/pdf']}
                />
            </div>

            <div className="flex justify-between pt-6">
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
