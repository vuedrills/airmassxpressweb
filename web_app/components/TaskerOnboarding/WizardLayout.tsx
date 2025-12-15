'use client';

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface WizardLayoutProps {
    currentStep: number;
    totalSteps: number;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function WizardLayout({ currentStep, totalSteps, title, description, children }: WizardLayoutProps) {
    const steps = [
        { id: 1, title: 'Basic Info' },
        { id: 2, title: 'Identity' },
        { id: 3, title: 'Professions' },
        { id: 4, title: 'Portfolio' },
        { id: 5, title: 'Payments' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Left Sidebar */}
                    <div className="w-full md:w-56 flex-shrink-0">
                        <div className="sticky top-12">
                            <h1 className="text-2xl font-bold mb-8 text-gray-900">{title}</h1>
                            {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}

                            <nav className="space-y-1">
                                {steps.map((step) => {
                                    const isCompleted = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;

                                    return (
                                        <div
                                            key={step.id}
                                            className={`w-full text-left py-3 px-0 transition-colors relative flex items-center ${isCurrent
                                                    ? 'text-gray-900 font-medium'
                                                    : isCompleted
                                                        ? 'text-gray-700'
                                                        : 'text-gray-400'
                                                }`}
                                        >
                                            {/* Active Indicator */}
                                            {isCurrent && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>
                                            )}

                                            <span className={`flex items-center ${isCurrent ? 'pl-4' : 'pl-0'}`}>
                                                {isCompleted ? (
                                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                                ) : (
                                                    <span className={`w-4 h-4 mr-2 flex items-center justify-center text-xs rounded-full border ${isCurrent ? 'border-blue-600 text-blue-600' : 'border-gray-400'}`}>
                                                        {step.id}
                                                    </span>
                                                )}
                                                {step.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
