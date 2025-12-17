'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, DollarSign, CheckCircle2, Loader2, FileText, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn, resizeImage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, createTask, addTaskAttachments } from '@/lib/api';
import LocationBuilder from '@/components/LocationBuilder';
import { FileUpload } from '@/components/FileUpload';
import { supabase } from '@/lib/supabase';

export default function PostTaskPage() {
    const router = useRouter();
    const { loggedInUser, currentTaskDraft, updateTaskDraft, clearTaskDraft } = useStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadHighQuality, setUploadHighQuality] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [error, setError] = useState('');
    const totalSteps = 5;

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');

    useEffect(() => {
        if (!loggedInUser) {
            router.push('/login');
        } else if (typeParam === 'equipment' && currentTaskDraft.taskType !== 'equipment') {
            updateTaskDraft({
                taskType: 'equipment',
                category: 'Heavy Machinery & Equipment'
            });
        }
    }, [loggedInUser, router, typeParam, currentTaskDraft.taskType, updateTaskDraft]);

    if (!loggedInUser) {
        return null;
    }

    const handleCreateTask = async () => {
        try {
            setLoading(true);
            setUploadProgress('Creating task...');
            setError('');

            // 1. Create Task (Backend)
            const { taskId } = await createTask({
                ...currentTaskDraft,
                posterId: loggedInUser.id,
                poster: loggedInUser,
            });

            // 2. Upload Files (if any) to Supabase Storage
            if (selectedFiles.length > 0) {
                const attachments: { url: string; type: string; name: string }[] = [];

                for (let i = 0; i < selectedFiles.length; i++) {
                    let fileToUpload = selectedFiles[i];

                    // Resize image if not high quality mode and it's an image
                    if (!uploadHighQuality && fileToUpload.type.startsWith('image/')) {
                        setUploadProgress(`Optimizing file ${i + 1}...`);
                        try {
                            fileToUpload = await resizeImage(fileToUpload);
                        } catch (e) {
                            console.warn('Image optimization failed, uploading original:', e);
                        }
                    }

                    setUploadProgress(`Uploading file ${i + 1} of ${selectedFiles.length}...`);

                    // Sanitize filename and build storage path
                    const sanitizedName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const filename = `${Date.now()}-${sanitizedName}`;
                    const path = `task_attachments/${taskId}/${filename}`;

                    const { error } = await supabase.storage
                        .from('uploads')
                        .upload(path, fileToUpload);

                    if (error) {
                        throw error;
                    }

                    const { data } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(path);

                    const downloadURL = data.publicUrl;

                    attachments.push({
                        url: downloadURL,
                        type: fileToUpload.type.startsWith('image/') ? 'image' : 'document',
                        name: fileToUpload.name
                    });
                }

                // 3. Link Attachments (Backend)
                setUploadProgress('Finalizing task...');
                await addTaskAttachments(taskId, attachments);
            }

            clearTaskDraft();
            router.push(`/tasks/${taskId}`);
        } catch (err: any) {
            console.error('Failed to create task:', err);
            setError(err.message || 'Failed to create task. Please try again.');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    const nextStep = async () => {
        // If leaving Step 2 (Location) and we have a location but no coordinates, try to geocode
        if (step === 2 && currentTaskDraft.location && (!currentTaskDraft.lat || !currentTaskDraft.lng)) {
            try {
                // Dynamic import to avoid SSR issues with use-places-autocomplete utils
                const { getGeocode, getLatLng } = await import('use-places-autocomplete');
                const results = await getGeocode({ address: currentTaskDraft.location });
                const { lat, lng } = await getLatLng(results[0]);
                updateTaskDraft({ lat, lng });
            } catch (error) {
                console.error("Geocoding failed:", error);
                // We proceed even if geocoding fails, as the location string is still useful
            }
        }

        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="fixed inset-0 bg-gray-50 overflow-auto">
            {/* Close Button */}
            <button
                onClick={() => router.push('/browse')}
                className="fixed top-6 right-6 z-50 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex gap-12">
                        {/* Left Sidebar - Minimal Step Navigation */}
                        <div className="w-56 flex-shrink-0">
                            <div className="sticky top-12">
                                <h1 className="text-2xl font-bold mb-8 text-gray-900">
                                    {currentTaskDraft.taskType === 'equipment' ? 'Request Equipment' : 'Post a task'}
                                </h1>
                                <nav className="space-y-0">
                                    {[
                                        { num: 1, label: 'Title & Date' },
                                        { num: 2, label: 'Location' },
                                        { num: 3, label: 'Details' },
                                        { num: 4, label: 'Budget' },
                                        { num: 5, label: 'Review' },
                                    ].map((item) => (
                                        <button
                                            key={item.num}
                                            onClick={() => step >= item.num && setStep(item.num)}
                                            className={`w-full text-left py-3 px-0 transition-colors relative ${step === item.num
                                                ? 'text-gray-900 font-medium'
                                                : step > item.num
                                                    ? 'text-gray-700 hover:text-gray-900'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                            disabled={step < item.num}
                                        >
                                            {/* Blue active indicator bar */}
                                            {step === item.num && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"></div>
                                            )}
                                            <span className={`${step === item.num ? 'pl-4' : 'pl-0'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Right Content - Form */}
                        <div className="flex-1 max-w-2xl">
                            <div className="bg-white rounded-lg border p-8">
                                {/* Step 1: Category & Title */}
                                {step === 1 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Let's start with the basics</h2>
                                        <p className="text-gray-600 mb-6">
                                            What do you need done?
                                        </p>

                                        <div className="space-y-4">
                                            {/* Category Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Category *</label>
                                                <select
                                                    value={currentTaskDraft.category || ''}
                                                    onChange={(e) => updateTaskDraft({ category: e.target.value })}
                                                    className="w-full border rounded-lg px-4 py-2"
                                                >
                                                    <option value="">Select a category</option>
                                                    {categories?.map((category) => (
                                                        <option key={category.id} value={category.name}>
                                                            {getCategoryEmoji(category.slug)} {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Task Title *</label>
                                                <Input
                                                    value={currentTaskDraft.title || ''}
                                                    onChange={(e) => updateTaskDraft({ title: e.target.value })}
                                                    placeholder="e.g., Fix leaking bathroom pipe"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    💡 Be specific - it helps taskers understand your needs
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Description & Location */}
                                {step === 2 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Tell us more</h2>
                                        <p className="text-gray-600 mb-6">
                                            Provide details about your task
                                        </p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Description *</label>
                                                <Textarea
                                                    value={currentTaskDraft.description || ''}
                                                    onChange={(e) => updateTaskDraft({ description: e.target.value })}
                                                    rows={6}
                                                    className="w-full border rounded-lg px-4 py-2"
                                                    placeholder="Describe your task in detail..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-4">Location</label>
                                                <LocationBuilder
                                                    initialData={{
                                                        city: currentTaskDraft.city,
                                                        suburb: currentTaskDraft.suburb,
                                                        addressDetails: currentTaskDraft.addressDetails,
                                                        lat: currentTaskDraft.lat,
                                                        lng: currentTaskDraft.lng
                                                    }}
                                                    onComplete={(data) => {
                                                        // Clean up suburb: If it ends with ", City", remove it
                                                        const cleanSuburb = data.suburb.replace(new RegExp(`, ${data.city}$`, 'i'), '');

                                                        // Construct location string cleanly
                                                        const parts = [
                                                            data.addressDetails?.trim(),
                                                            cleanSuburb.trim(),
                                                            data.city.trim()
                                                        ].filter(Boolean);

                                                        const locationString = parts.join(', ');

                                                        updateTaskDraft({
                                                            city: data.city,
                                                            suburb: cleanSuburb,
                                                            addressDetails: data.addressDetails,
                                                            lat: data.lat,
                                                            lng: data.lng,
                                                            location: locationString,
                                                            locationConfSource: data.locationConfSource
                                                        });
                                                        // Automatically move to next step after confirmation
                                                        setStep(3);
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Attachments (Optional)</label>
                                                <FileUpload
                                                    files={selectedFiles}
                                                    onFilesSelected={setSelectedFiles}
                                                    maxFiles={5}
                                                />
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="highQuality"
                                                        checked={uploadHighQuality}
                                                        onChange={(e) => setUploadHighQuality(e.target.checked)}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <label htmlFor="highQuality" className="text-sm text-gray-600 cursor-pointer">
                                                        Upload full quality (e.g., for detailed house plans)
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Standard images are optimized for faster loading.
                                                </p>
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
                                                    <div className="flex gap-4">
                                                        <Input
                                                            type="date"
                                                            value={currentTaskDraft.date || ''}
                                                            onChange={(e) => updateTaskDraft({ date: e.target.value })}
                                                            className="w-[240px]"
                                                        />

                                                        <select
                                                            className="border rounded-lg px-4 py-2 bg-white"
                                                            value={currentTaskDraft.timeOfDay || ''}
                                                            onChange={(e) => updateTaskDraft({ timeOfDay: e.target.value as any })}
                                                        >
                                                            <option value="">Any time</option>
                                                            <option value="morning">Morning</option>
                                                            <option value="afternoon">Afternoon</option>
                                                            <option value="evening">Evening</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Review & Submit */}
                                {step === 5 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Review your task</h2>
                                        <p className="text-gray-600 mb-6">Make sure everything looks good</p>

                                        {error && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                                {error}
                                            </div>
                                        )}

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

                                            {selectedFiles.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Attachments</p>
                                                    <p className="font-semibold">{selectedFiles.length} file(s) selected</p>
                                                </div>
                                            )}
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
                                        step !== 2 && <Button
                                            onClick={nextStep}
                                            disabled={
                                                (step === 1 && (!currentTaskDraft.category || !currentTaskDraft.title)) ||
                                                (step === 2 && (!currentTaskDraft.description || !currentTaskDraft.location)) ||
                                                (step === 3 && !currentTaskDraft.budget) ||
                                                (step === 4 && !currentTaskDraft.dateType)
                                            }
                                        >
                                            Next
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handleCreateTask} disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {uploadProgress || 'Posting...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Post Task
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
        'heavy-machinery': '🚜',
    };
    return emojiMap[slug] || '📋';
}
