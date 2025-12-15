'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { SmartFileUpload } from './SmartFileUpload';
import { User } from '@/types';

interface Step1BasicInfoProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    user: User;
}

export function Step1BasicInfo({ data, updateData, onNext, user }: Step1BasicInfoProps) {
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (!data.bio || !data.location || !data.profilePictureUrl) {
            alert('Please fill in all fields');
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500">Tell us a bit about yourself.</p>
            </div>

            <div className="space-y-4">
                <SmartFileUpload
                    label="Profile Picture"
                    path={`tasker_portfolio/${user.id}`}
                    type="profile_picture"
                    value={data.profilePictureUrl ? [data.profilePictureUrl] : []}
                    onUploadComplete={(urls) => updateData({ ...data, profilePictureUrl: urls[0] })}
                    maxFiles={1}
                    acceptedFileTypes={['image/jpeg', 'image/png']}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <Textarea
                        placeholder="Describe your skills and experience..."
                        value={data.bio || ''}
                        onChange={(e) => updateData({ ...data, bio: e.target.value })}
                        className="min-h-[100px]"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <LocationAutocomplete
                        value={data.location || ''}
                        onChange={(location) => updateData({ ...data, location })}
                        placeholder="Where are you based?"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Continue to Identity
                </Button>
            </div>
        </div>
    );
}
