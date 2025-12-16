'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, MapPin, DollarSign, CheckCircle2, Loader2, FileText, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn, resizeImage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, createTask, addTaskAttachments, fetchEquipmentCapacities } from '@/lib/api';
import { GoogleMapsLoader } from '@/components/GoogleMapsLoader';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { FileUpload } from '@/components/FileUpload';
import { EQUIPMENT_CATEGORIES } from '@/lib/constants';
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import type { EquipmentCapacity } from '@/types';

export default function PostEquipmentPage() {
    const router = useRouter();
    const { loggedInUser, currentTaskDraft, updateTaskDraft, clearTaskDraft } = useStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadHighQuality, setUploadHighQuality] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [error, setError] = useState('');
    const totalSteps = 4;

    // Fetch equipment capacities from API
    const { data: capacitiesData } = useQuery({
        queryKey: ['equipmentCapacities'],
        queryFn: fetchEquipmentCapacities,
    });

    // Get capacities for current category
    const categoryCapacities = capacitiesData?.grouped?.[currentTaskDraft.category || ''] || [];

    useEffect(() => {
        if (!loggedInUser) {
            router.push('/login');
        } else {
            updateTaskDraft({
                taskType: 'equipment',
            });
        }
    }, [loggedInUser, router, updateTaskDraft]);

    if (!loggedInUser) {
        return null;
    }

    const handleCreateTask = async () => {
        try {
            setLoading(true);
            setUploadProgress('Creating request...');
            setError('');

            const { taskId } = await createTask({
                ...currentTaskDraft,
                posterId: loggedInUser.id,
                poster: loggedInUser,
                taskType: 'equipment', // Ensure it's equipment
            });

            if (selectedFiles.length > 0) {
                setUploadProgress('Uploading specs/images...');
                await signInAnonymously(auth);

                const attachments: { url: string; type: string; name: string }[] = [];

                for (let i = 0; i < selectedFiles.length; i++) {
                    let fileToUpload = selectedFiles[i];

                    if (!uploadHighQuality && fileToUpload.type.startsWith('image/')) {
                        try {
                            fileToUpload = await resizeImage(fileToUpload);
                        } catch (e) {
                            console.warn('Image optimization failed:', e);
                        }
                    }

                    const storageRef = ref(storage, `task_attachments/${taskId}/${fileToUpload.name}`);
                    await uploadBytes(storageRef, fileToUpload);
                    const downloadURL = await getDownloadURL(storageRef);

                    attachments.push({
                        url: downloadURL,
                        type: fileToUpload.type.startsWith('image/') ? 'image' : 'document',
                        name: fileToUpload.name
                    });
                }

                await addTaskAttachments(taskId, attachments);
            }

            clearTaskDraft();
            router.push(`/tasks/${taskId}`); // Or maybe /equipment? But detail view handles it.
        } catch (err: any) {
            console.error('Failed to create task:', err);
            setError(err.message || 'Failed to submit request.');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <GoogleMapsLoader>
            <div className="fixed inset-0 bg-gray-50 overflow-auto">
                <button
                    onClick={() => router.push('/equipment')}
                    className="fixed top-6 right-6 z-50 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex gap-8">
                            {/* Left Sidebar */}
                            <div className="w-48 flex-shrink-0 hidden md:block">
                                <div className="sticky top-12">
                                    <h1 className="text-xl font-bold mb-6 text-[#1a2847]">Request Equipment</h1>
                                    <nav className="space-y-4">
                                        {[
                                            { num: 1, label: 'Machine Specs' },
                                            { num: 2, label: 'Location' },
                                            { num: 3, label: 'Timing & Budget' },
                                            { num: 4, label: 'Review' },
                                        ].map((item) => (
                                            <div
                                                key={item.num}
                                                className={`flex items-center gap-3 ${step === item.num ? 'text-[#1a2847] font-semibold' : 'text-gray-400'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === item.num ? 'border-[#1a2847] bg-[#1a2847] text-white' : 'border-gray-300'}`}>
                                                    {item.num}
                                                </div>
                                                <span>{item.label}</span>
                                            </div>
                                        ))}
                                    </nav>
                                </div>
                            </div>

                            {/* Main Form */}
                            <div className="flex-1">
                                <div className="bg-white rounded-lg border p-8 shadow-sm">
                                    {/* Step 1: Machine Specs */}
                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">What equipment do you need?</h2>
                                                <p className="text-gray-600">Specify the machinery and requirements</p>
                                            </div>

                                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-3">
                                                <div className="text-2xl">🚜</div>
                                                <div>
                                                    <p className="font-semibold text-amber-900">
                                                        {currentTaskDraft.category || 'Select Equipment Type Below'}
                                                    </p>
                                                    <p className="text-xs text-amber-700">Category</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Equipment Type *</label>
                                                <select
                                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                                    value={currentTaskDraft.title || ''}
                                                    onChange={(e) => updateTaskDraft({
                                                        title: e.target.value,
                                                        category: e.target.value,
                                                        requiredCapacityId: undefined // Reset capacity when type changes
                                                    })}
                                                >
                                                    <option value="">Select Equipment Type</option>
                                                    {EQUIPMENT_CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* V2: Capacity Selection from API */}
                                            {categoryCapacities.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Required Size/Capacity</label>
                                                    <select
                                                        className="w-full px-3 py-2 border rounded-md bg-white"
                                                        value={(currentTaskDraft as any).requiredCapacityId || ''}
                                                        onChange={(e) => updateTaskDraft({
                                                            requiredCapacityId: e.target.value || undefined
                                                        } as any)}
                                                    >
                                                        <option value="">Any size (flexible)</option>
                                                        {categoryCapacities.map((cap: EquipmentCapacity) => (
                                                            <option key={cap.id} value={cap.id}>
                                                                {cap.capacityCode} - {cap.displayName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xs text-gray-500 mt-1">Optional: Specify minimum capacity needed</p>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Job Description *</label>
                                                <Textarea
                                                    value={currentTaskDraft.description || ''}
                                                    onChange={(e) => updateTaskDraft({ description: e.target.value })}
                                                    rows={5}
                                                    placeholder="Describe the job, terrain, hours needed, etc..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Attachments (Optional)</label>
                                                <FileUpload
                                                    files={selectedFiles}
                                                    onFilesSelected={setSelectedFiles}
                                                    maxFiles={3}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Upload site plans or photos of the terrain.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Location */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">Site Location</h2>
                                                <p className="text-gray-600">Where is the equipment needed?</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Site Address *</label>
                                                <LocationAutocomplete
                                                    value={currentTaskDraft.location || ''}
                                                    onChange={(location, coordinates) => {
                                                        updateTaskDraft({
                                                            location,
                                                            lat: coordinates?.lat,
                                                            lng: coordinates?.lng
                                                        });
                                                    }}
                                                    placeholder="Enter site location"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">Timing & Budget</h2>
                                            </div>

                                            {/* V2: Hire Duration Type */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Hire Duration Type</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((type) => (
                                                        <label
                                                            key={type}
                                                            className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${(currentTaskDraft as any).hireDurationType === type
                                                                ? 'border-[#1a2847] bg-blue-50 text-[#1a2847]'
                                                                : 'hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                className="hidden"
                                                                checked={(currentTaskDraft as any).hireDurationType === type}
                                                                onChange={() => updateTaskDraft({ hireDurationType: type } as any)}
                                                            />
                                                            <span className="font-medium capitalize">{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* V2: Estimated Hours (if hourly) */}
                                            {(currentTaskDraft as any).hireDurationType === 'hourly' && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                                                    <Input
                                                        type="number"
                                                        value={(currentTaskDraft as any).estimatedHours || ''}
                                                        onChange={(e) => updateTaskDraft({ estimatedHours: parseInt(e.target.value) } as any)}
                                                        placeholder="e.g., 8"
                                                        min="1"
                                                    />
                                                </div>
                                            )}

                                            {/* V2: Operator Preference */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Operator Preference</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <label
                                                        className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${(currentTaskDraft as any).operatorPreference === 'required'
                                                            ? 'border-[#1a2847] bg-blue-50'
                                                            : 'hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            className="hidden"
                                                            checked={(currentTaskDraft as any).operatorPreference === 'required'}
                                                            onChange={() => updateTaskDraft({ operatorPreference: 'required' } as any)}
                                                        />
                                                        <span className="font-medium text-sm">Required</span>
                                                        <p className="text-xs text-gray-500 mt-1">Must include operator</p>
                                                    </label>
                                                    <label
                                                        className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${(currentTaskDraft as any).operatorPreference === 'preferred'
                                                            ? 'border-[#1a2847] bg-blue-50'
                                                            : 'hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            className="hidden"
                                                            checked={(currentTaskDraft as any).operatorPreference === 'preferred'}
                                                            onChange={() => updateTaskDraft({ operatorPreference: 'preferred' } as any)}
                                                        />
                                                        <span className="font-medium text-sm">Preferred</span>
                                                        <p className="text-xs text-gray-500 mt-1">Owner's choice</p>
                                                    </label>
                                                    <label
                                                        className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${(currentTaskDraft as any).operatorPreference === 'not_needed'
                                                            ? 'border-[#1a2847] bg-blue-50'
                                                            : 'hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            className="hidden"
                                                            checked={(currentTaskDraft as any).operatorPreference === 'not_needed'}
                                                            onChange={() => updateTaskDraft({ operatorPreference: 'not_needed' } as any)}
                                                        />
                                                        <span className="font-medium text-sm">Dry Hire</span>
                                                        <p className="text-xs text-gray-500 mt-1">I have my own operator</p>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">When do you need it?</label>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <label className={`p-4 border rounded-lg cursor-pointer ${currentTaskDraft.dateType === 'flexible' ? 'border-[#1a2847] bg-blue-50' : ''}`}>
                                                        <input type="radio" className="hidden"
                                                            checked={currentTaskDraft.dateType === 'flexible'}
                                                            onChange={() => updateTaskDraft({ dateType: 'flexible' })}
                                                        />
                                                        <span className="font-semibold block mb-1">Flexible</span>
                                                        <span className="text-xs text-gray-500">As soon as possible</span>
                                                    </label>
                                                    <label className={`p-4 border rounded-lg cursor-pointer ${currentTaskDraft.dateType === 'on_date' ? 'border-[#1a2847] bg-blue-50' : ''}`}>
                                                        <input type="radio" className="hidden"
                                                            checked={currentTaskDraft.dateType === 'on_date'}
                                                            onChange={() => updateTaskDraft({ dateType: 'on_date' })}
                                                        />
                                                        <span className="font-semibold block mb-1">Specific Date</span>
                                                        <span className="text-xs text-gray-500">Pick a start date</span>
                                                    </label>
                                                </div>

                                                {currentTaskDraft.dateType === 'on_date' && (
                                                    <Input
                                                        type="date"
                                                        value={currentTaskDraft.date || ''}
                                                        onChange={(e) => updateTaskDraft({ date: e.target.value })}
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Estimated Budget ($) *</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8"
                                                        value={currentTaskDraft.budget || ''}
                                                        onChange={(e) => updateTaskDraft({ budget: parseInt(e.target.value) })}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Total budget for the hire duration.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Review */}
                                    {step === 4 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">Review Request</h2>
                                                <p className="text-gray-600">Confirm details before posting</p>
                                            </div>

                                            {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}

                                            <div className="space-y-4 text-sm">
                                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                                    <span className="text-gray-500">Machine</span>
                                                    <span className="col-span-2 font-medium">{currentTaskDraft.title}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                                    <span className="text-gray-500">Location</span>
                                                    <span className="col-span-2 font-medium">{currentTaskDraft.location}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                                    <span className="text-gray-500">Budget</span>
                                                    <span className="col-span-2 font-medium text-lg">${currentTaskDraft.budget}</span>
                                                </div>
                                                {/* V2: Hire Duration */}
                                                {(currentTaskDraft as any).hireDurationType && (
                                                    <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                                        <span className="text-gray-500">Hire Duration</span>
                                                        <span className="col-span-2 font-medium capitalize">
                                                            {(currentTaskDraft as any).hireDurationType}
                                                            {(currentTaskDraft as any).hireDurationType === 'hourly' && (currentTaskDraft as any).estimatedHours && (
                                                                <span className="text-gray-500 ml-1">({(currentTaskDraft as any).estimatedHours} hours)</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {/* V2: Operator Preference */}
                                                {(currentTaskDraft as any).operatorPreference && (
                                                    <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                                        <span className="text-gray-500">Operator</span>
                                                        <span className="col-span-2 font-medium capitalize">
                                                            {(currentTaskDraft as any).operatorPreference === 'required' && '✅ Required'}
                                                            {(currentTaskDraft as any).operatorPreference === 'preferred' && '👍 Preferred'}
                                                            {(currentTaskDraft as any).operatorPreference === 'not_needed' && '🔧 Dry Hire (Not Needed)'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                                    <span className="text-gray-500">Timing</span>
                                                    <span className="col-span-2 font-medium">
                                                        {currentTaskDraft.dateType === 'flexible' ? 'Flexible' : `Start: ${currentTaskDraft.date}`}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <span className="text-gray-500">Description</span>
                                                    <span className="col-span-2 text-gray-700">{currentTaskDraft.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-between mt-8 pt-6 border-t">
                                        {step > 1 && (
                                            <Button variant="outline" onClick={prevStep}>Back</Button>
                                        )}
                                        <div className="ml-auto">
                                            {step < totalSteps ? (
                                                <Button onClick={nextStep}
                                                    disabled={
                                                        (step === 1 && (!currentTaskDraft.title || !currentTaskDraft.description)) ||
                                                        (step === 2 && !currentTaskDraft.location) ||
                                                        (step === 3 && !currentTaskDraft.budget)
                                                    }
                                                >
                                                    Next
                                                </Button>
                                            ) : (
                                                <Button onClick={handleCreateTask} disabled={loading} className="bg-[#1a2847]">
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Posting...
                                                        </>
                                                    ) : 'Submit Request'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleMapsLoader>
    );
}
