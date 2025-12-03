'use client';

import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/lib/api';

export default function PostTaskPage() {
    const router = useRouter();
    const { loggedInUser, currentTaskDraft, updateTaskDraft, clearTaskDraft } = useStore();
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    if (!loggedInUser) {
        router.push('/login');
        return null;
    }

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        // In a real app, this would call createTask API
        console.log('Creating task:', currentTaskDraft);
        clearTaskDraft();
        router.push('/dashboard');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        {/* Progress Indicator */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="flex items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${s < step
                                                ? 'bg-primary text-white'
                                                : s === step
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                                }`}
                                        >
                                            {s < step ? <Check className="h-5 w-5" /> : s}
                                        </div>
                                        {s < 5 && (
                                            <div
                                                className={`w-full h-1 mx-2 ${s < step ? 'bg-primary' : 'bg-gray-200'
                                                    }`}
                                                style={{ width: '60px' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-sm text-gray-600">
                                Step {step} of {totalSteps}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border p-8">
                            {/* Step 1: Category */}
                            {step === 1 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">What do you need done?</h2>
                                    <p className="text-gray-600 mb-6">Select a category for your task</p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {categories?.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    updateTaskDraft({ category: category.name });
                                                    nextStep();
                                                }}
                                                className={`p-6 border rounded-lg text-center hover:border-primary hover:shadow-md transition-all ${currentTaskDraft.category === category.name
                                                    ? 'border-primary bg-primary/5'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="text-3xl mb-2">
                                                    {getCategoryEmoji(category.slug)}
                                                </div>
                                                <p className="font-semibold text-sm">{category.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Task Details */}
                            {step === 2 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Describe your task</h2>
                                    <p className="text-gray-600 mb-6">
                                        Provide details about what you need done
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Task Title *</label>
                                            <Input
                                                value={currentTaskDraft.title || ''}
                                                onChange={(e) => updateTaskDraft({ title: e.target.value })}
                                                placeholder="e.g., Clean 3-bedroom house"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description *</label>
                                            <textarea
                                                value={currentTaskDraft.description || ''}
                                                onChange={(e) => updateTaskDraft({ description: e.target.value })}
                                                rows={6}
                                                className="w-full border rounded-lg px-4 py-2"
                                                placeholder="Describe your task in detail..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Location *</label>
                                            <Input
                                                value={currentTaskDraft.location || ''}
                                                onChange={(e) => updateTaskDraft({ location: e.target.value })}
                                                placeholder="e.g., Sandton, Johannesburg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Budget */}
                            {step === 3 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">What's your budget?</h2>
                                    <p className="text-gray-600 mb-6">
                                        Set a budget for your task
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Budget ($) *</label>
                                            <Input
                                                type="number"
                                                value={currentTaskDraft.budget || ''}
                                                onChange={(e) => updateTaskDraft({ budget: parseInt(e.target.value) })}
                                                placeholder="0"
                                                min="0"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Tip: Browse similar tasks to get an idea of fair pricing
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-900">
                                                💡 Setting a realistic budget helps attract quality taskers
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Date Preferences */}
                            {step === 4 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">When do you need it done?</h2>
                                    <p className="text-gray-600 mb-6">Choose your date preference</p>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                                            <input
                                                type="radio"
                                                name="dateType"
                                                value="flexible"
                                                checked={currentTaskDraft.dateType === 'flexible'}
                                                onChange={(e) => updateTaskDraft({ dateType: e.target.value as any })}
                                            />
                                            <div>
                                                <p className="font-semibold">Flexible</p>
                                                <p className="text-sm text-gray-600">I'm flexible with the date</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                                            <input
                                                type="radio"
                                                name="dateType"
                                                value="on_date"
                                                checked={currentTaskDraft.dateType === 'on_date'}
                                                onChange={(e) => updateTaskDraft({ dateType: e.target.value as any })}
                                            />
                                            <div>
                                                <p className="font-semibold">On a specific date</p>
                                                <p className="text-sm text-gray-600">I need it done on a certain day</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                                            <input
                                                type="radio"
                                                name="dateType"
                                                value="before_date"
                                                checked={currentTaskDraft.dateType === 'before_date'}
                                                onChange={(e) => updateTaskDraft({ dateType: e.target.value as any })}
                                            />
                                            <div>
                                                <p className="font-semibold">Before a date</p>
                                                <p className="text-sm text-gray-600">It must be done by a specific date</p>
                                            </div>
                                        </label>

                                        {(currentTaskDraft.dateType === 'on_date' || currentTaskDraft.dateType === 'before_date') && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium mb-2">Select Date</label>
                                                <Input
                                                    type="date"
                                                    value={currentTaskDraft.date || ''}
                                                    onChange={(e) => updateTaskDraft({ date: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {step === 5 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Review your task</h2>
                                    <p className="text-gray-600 mb-6">Make sure everything looks good</p>

                                    <div className="space-y-4">
                                        <div className="border-b pb-4">
                                            <p className="text-sm text-gray-600 mb-1">Category</p>
                                            <Badge variant="secondary">{currentTaskDraft.category}</Badge>
                                        </div>

                                        <div className="border-b pb-4">
                                            <p className="text-sm text-gray-600 mb-1">Title</p>
                                            <p className="font-semibold">{currentTaskDraft.title}</p>
                                        </div>

                                        <div className="border-b pb-4">
                                            <p className="text-sm text-gray-600 mb-1">Description</p>
                                            <p className="text-gray-700">{currentTaskDraft.description}</p>
                                        </div>

                                        <div className="border-b pb-4">
                                            <p className="text-sm text-gray-600 mb-1">Location</p>
                                            <p className="font-semibold">{currentTaskDraft.location}</p>
                                        </div>

                                        <div className="border-b pb-4">
                                            <p className="text-sm text-gray-600 mb-1">Budget</p>
                                            <p className="font-semibold text-primary text-2xl">
                                                ${currentTaskDraft.budget}
                                            </p>
                                        </div>

                                        <div className="border-b pb-4">
                                            <p className="text-sm text-gray-600 mb-1">Date</p>
                                            <p className="font-semibold">
                                                {currentTaskDraft.dateType === 'flexible'
                                                    ? 'Flexible'
                                                    : currentTaskDraft.dateType === 'on_date'
                                                        ? `On ${currentTaskDraft.date}`
                                                        : `Before ${currentTaskDraft.date}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t">
                                {step > 1 ? (
                                    <Button variant="outline" onClick={prevStep}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {step < totalSteps ? (
                                    <Button
                                        onClick={nextStep}
                                        disabled={
                                            (step === 2 &&
                                                (!currentTaskDraft.title ||
                                                    !currentTaskDraft.description ||
                                                    !currentTaskDraft.location)) ||
                                            (step === 3 && !currentTaskDraft.budget) ||
                                            (step === 4 && !currentTaskDraft.dateType)
                                        }
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Post Task
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function getCategoryEmoji(slug: string): string {
    const emojiMap: Record<string, string> = {
        'home-cleaning': '✨',
        'handyman': '🔨',
        'removals-delivery': '🚚',
        'gardening': '🌿',
        'assembly': '📦',
        'painting': '🎨',
        'plumbing': '💧',
        'electrical': '⚡',
        'photography': '📸',
        'pet-care': '🐾',
        'computer-help': '💻',
        'event-catering': '🍰',
    };
    return emojiMap[slug] || '📋';
}
