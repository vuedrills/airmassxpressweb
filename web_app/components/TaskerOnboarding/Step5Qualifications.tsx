'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SmartFileUpload } from './SmartFileUpload';
import { Loader2, Plus, Trash2, Award } from 'lucide-react';
import { Qualification } from '@/types/user'; // Ensure this is imported

interface StepQualificationsProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepQualifications({ data, updateData, onNext, onBack }: StepQualificationsProps) {
    const [qualifications, setQualifications] = useState<Qualification[]>(data.qualifications || []);
    const [isAdding, setIsAdding] = useState(false);

    // New qualification form state
    const [newQual, setNewQual] = useState<Partial<Qualification>>({
        name: '',
        issuer: '',
        date: '',
        url: ''
    });

    const handleAdd = () => {
        if (!newQual.name || !newQual.issuer || !newQual.date || !newQual.url) {
            alert("Please fill in all fields and upload a certificate.");
            return;
        }
        const updated = [...qualifications, newQual as Qualification];
        setQualifications(updated);
        updateData({ ...data, qualifications: updated });
        setNewQual({ name: '', issuer: '', date: '', url: '' });
        setIsAdding(false);
    };

    const handleRemove = (index: number) => {
        const updated = qualifications.filter((_, i) => i !== index);
        setQualifications(updated);
        updateData({ ...data, qualifications: updated });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Qualifications</h2>
                <p className="text-sm text-gray-500">
                    Upload your trade certificates, degrees, or other certifications.
                    <span className="block mt-1 font-medium text-blue-600 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        You will get a "Qualifications Badge" on your profile!
                    </span>
                </p>
            </div>

            {/* List of added qualifications */}
            <div className="space-y-4">
                {qualifications.map((q, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                        <div>
                            <h4 className="font-semibold text-gray-900">{q.name}</h4>
                            <p className="text-sm text-gray-600">{q.issuer} • {q.date}</p>
                            <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View Certificate</a>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Add New Form */}
            {isAdding ? (
                <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Qualification Name</label>
                            <Input
                                placeholder="e.g. BSc Computer Science"
                                value={newQual.name}
                                onChange={e => setNewQual({ ...newQual, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Issuer / Institution</label>
                            <Input
                                placeholder="e.g. University of Zimbabwe"
                                value={newQual.issuer}
                                onChange={e => setNewQual({ ...newQual, issuer: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date Issued</label>
                            <Input
                                type="date"
                                value={newQual.date}
                                onChange={e => setNewQual({ ...newQual, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Upload Certificate</label>
                        <SmartFileUpload
                            label="Certificate"
                            path={`tasker_qualifications`}
                            type="qualification"
                            value={newQual.url ? [newQual.url] : []}
                            onUploadComplete={(urls) => setNewQual({ ...newQual, url: urls[0] })}
                            maxFiles={1}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newQual.url}>Add Qualification</Button>
                    </div>
                </div>
            ) : (
                <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-2" /> Add Qualification
                </Button>
            )}

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
