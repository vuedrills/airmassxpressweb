'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchProfessions } from '@/lib/api';
import { Profession } from '@/types';
import { Loader2, Check } from 'lucide-react';

interface Step3ProfessionsProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function Step3Professions({ data, updateData, onNext, onBack }: Step3ProfessionsProps) {
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfessions() {
            try {
                const result = await fetchProfessions();
                setProfessions(result);
            } catch (error) {
                console.error('Failed to load professions', error);
            } finally {
                setLoading(false);
            }
        }
        loadProfessions();
    }, []);

    const toggleProfession = (id: string) => {
        const current = data.professionIds || [];
        const updated = current.includes(id)
            ? current.filter((pId: string) => pId !== id)
            : [...current, id];
        updateData({ ...data, professionIds: updated });
    };

    const handleNext = () => {
        if (!data.professionIds?.length) {
            alert('Please select at least one profession');
            return;
        }
        onNext();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Group by category for better display? Or just list.
    // Given the prompt list, just grid is fine.

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Select Your Professions</h2>
                <p className="text-sm text-gray-500">What services do you offer?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
                {professions.map((prof) => {
                    const isSelected = (data.professionIds || []).includes(prof.id);
                    return (
                        <div
                            key={prof.id}
                            onClick={() => toggleProfession(prof.id)}
                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <span className="font-medium text-gray-900">{prof.name}</span>
                            {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Continue to Portfolio
                </Button>
            </div>
        </div>
    );
}
