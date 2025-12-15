'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { SmartFileUpload } from './SmartFileUpload';
import { User } from '@/types';

interface Step2IdentityProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
    user: User;
}

export function Step2Identity({ data, updateData, onNext, onBack, user }: Step2IdentityProps) {
    const handleNext = () => {
        if (!data.idDocumentUrls?.length || !data.selfieUrl) {
            alert('Please upload your ID and a selfie');
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Identity Verification</h2>
                <p className="text-sm text-gray-500">We need to verify your identity to keep the platform safe.</p>
            </div>

            <div className="space-y-6">
                <SmartFileUpload
                    label="Government ID (Front & Back)"
                    path={`tasker_verification/${user.id}`}
                    type="id_document"
                    value={data.idDocumentUrls || []}
                    onUploadComplete={(urls) => updateData({ ...data, idDocumentUrls: urls })}
                    maxFiles={2}
                    acceptedFileTypes={['image/jpeg', 'image/png', 'application/pdf']}
                />

                <SmartFileUpload
                    label="Selfie Photo"
                    path={`tasker_verification/${user.id}`}
                    type="selfie"
                    value={data.selfieUrl ? [data.selfieUrl] : []}
                    onUploadComplete={(urls) => updateData({ ...data, selfieUrl: urls[0] })}
                    maxFiles={1}
                    acceptedFileTypes={['image/jpeg', 'image/png']}
                />
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Continue to Professions
                </Button>
            </div>
        </div>
    );
}
