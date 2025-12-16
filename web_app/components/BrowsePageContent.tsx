'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { fetchTasks, fetchCategories, fetchOffersByTask } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ArrowLeft, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Task } from '@/types';
import TaskDetailTabs from '@/components/TaskDetailTabs';
import MakeOfferButton from '@/components/MakeOfferButton';
import { SortFilter, PriceFilter, LocationFilter, OtherFilters, CategoryFilter } from '@/components/BrowseFilters';
import { NotificationBanner } from '@/components/NotificationBanner';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Layout/Header';
import TaskProgressCard from '@/components/TaskProgressCard';
import { GoogleMapsLoader } from '@/components/GoogleMapsLoader';

// Dynamically import map to avoid SSR issues
const TaskMap = dynamic(() => import('@/components/Map/TaskMap'), { ssr: false });

export default function BrowsePage() {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [mapFocusTaskId, setMapFocusTaskId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('newest');
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const searchParams = useSearchParams();
    const categoryParam = searchParams?.get('category');

    // Get logged-in user for debug display
    const loggedInUser = useStore((state) => state.loggedInUser);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 5, max: 9999 });
    const [location, setLocation] = useState('Harare');
    const [distance, setDistance] = useState(50);
    const [availableOnly, setAvailableOnly] = useState(false); // Changed to false to show all tasks
    const [noOffersOnly, setNoOffersOnly] = useState(false);

    // Check URL params for taskId (from My Tasks page)
    const taskIdParam = searchParams?.get('taskId');

    // Auto-select task from URL if present
    useEffect(() => {
        if (taskIdParam) {
            setSelectedTaskId(taskIdParam);
        }
    }, [taskIdParam]);

    // Notification state
    const currentNotification = useStore((state) => state.currentNotification);
    const dismissCurrentNotification = useStore((state) => state.dismissCurrentNotification);

    // Fetch all tasks
    const { data: allTasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks({}),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    // Client-side filtering and sorting
    const filteredTasks = useMemo(() => {
        if (!allTasks) return [];

        // Exclude equipment tasks - they should only appear on the Equipment page
        let filtered = allTasks.filter((task) => task.taskType !== 'equipment');

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query) ||
                    task.location.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter((task) => task.category === selectedCategory);
        }

        // Price filter
        filtered = filtered.filter(
            (task) => task.budget >= priceRange.min && task.budget <= priceRange.max
        );

        // Available only filter - only filter if explicitly enabled
        // This allows users to see their in-progress tasks
        if (availableOnly) {
            filtered = filtered.filter((task) => task.status === 'open');
        }

        // No offers only filter (assumes tasks have 'offerCount' field)
        if (noOffersOnly) {
            filtered = filtered.filter((task) => task.offerCount === 0);
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.budget - b.budget);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.budget - a.budget);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return filtered;
    }, [allTasks, searchQuery, selectedCategory, priceRange, availableOnly, noOffersOnly, sortBy]);

    const selectedTask = filteredTasks?.find((t) => t.id === selectedTaskId);

    // Fetch offers for selected task to get accepted offer
    const { data: taskOffers = [] } = useQuery({
        queryKey: ['taskOffers', selectedTaskId],
        queryFn: () => selectedTaskId ? fetchOffersByTask(selectedTaskId) : Promise.resolve([]),
        enabled: !!selectedTaskId,
    });

    // Find accepted offer and get escrow info from workflow
    const acceptedOffer = selectedTask?.acceptedOfferId
        ? taskOffers.find(o => o.id === selectedTask.acceptedOfferId)
        : undefined;

    // In a real app, fetch escrow from API. For now, simulate it
    const escrow = selectedTask?.acceptedOfferId ? {
        amount: acceptedOffer?.amount || 0,
        status: 'held',
    } : undefined;

    return (
        <GoogleMapsLoader>
            <div className="flex flex-col min-h-screen bg-gray-50">
                {/* Notification Banner */}
                <NotificationBanner
                    notification={currentNotification}
                    onDismiss={dismissCurrentNotification}
                />

                <Header />

                <main className="flex-1 py-6">
                    <div className="container mx-auto px-2 max-w-5xl">
                        {/* Filters Row */}
                        <div className="mb-4 flex gap-3 items-center overflow-x-auto pb-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                            <input
                                type="text"
                                placeholder="Search for a task"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-2 border rounded-md text-sm bg-white flex-shrink-0"
                            />
                            <div className="flex-shrink-0">
                                <CategoryFilter
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onChange={(value) => setSelectedCategory(value)}
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <LocationFilter
                                    onApply={(loc, dist, type) => {
                                        setLocation(loc);
                                        setDistance(dist);
                                    }}
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <PriceFilter
                                    onApply={(min, max) => {
                                        setPriceRange({ min, max });
                                    }}
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <OtherFilters
                                    onApply={(available, noOffers) => {
                                        setAvailableOnly(available);
                                        setNoOffersOnly(noOffers);
                                    }}
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <Link href="/equipment">
                                    <Button variant="default" className="bg-[#1a2847] hover:bg-[#2a3c63] text-white gap-2">
                                        🚜 Hire Equipment
                                    </Button>
                                </Link>
                            </div>
                            <div className="ml-auto flex-shrink-0">
                                <SortFilter
                                    value={sortBy}
                                    onChange={(value) => setSortBy(value)}
                                />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Left Sidebar - Task List */}
                            <div className="md:w-[34%] md:flex-shrink-0">
                                {/* Scrollable container for task list */}
                                <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-2">
                                    {/* Import Ratings Box */}
                                    <div className="bg-white rounded-lg border p-6 w-full">
                                        <h3 className="font-heading text-xl font-bold mb-2">
                                            🌟 You're new!
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Complete your first task to get public ratings and build your Airmass Xpress
                                            reputation.
                                        </p>
                                        <Link href="/post-task">
                                            <Button variant="outline" className="w-full text-sm">
                                                Post a task
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Task Cards */}
                                    {isLoading ? (
                                        <div className="text-center py-8 text-gray-500">Loading...</div>
                                    ) : filteredTasks && filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => {
                                            // Get offer count from API (supports both camelCase and snake_case)
                                            const offerCount = task.offerCount ?? (task as any).offer_count ?? 0;

                                            return (
                                                <button
                                                    key={task.id}
                                                    onClick={() => setSelectedTaskId(task.id)}
                                                    className={`w-full text-left bg-white rounded-lg border p-4 hover:border-primary transition-all ${selectedTaskId === task.id ? 'border-primary shadow-md' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h3 className="font-semibold text-gray-900 pr-4 flex-1">
                                                            {task.title}
                                                        </h3>
                                                        <div className="text-right font-bold text-gray-900 text-lg font-heading" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                                            ${task.budget}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 flex-shrink-0" />
                                                            <span>{task.location.split(',')[0]}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                                            <span>
                                                                {task.dateType === 'flexible'
                                                                    ? 'Flexible date'
                                                                    : task.date
                                                                        ? `${task.dateType === 'before_date' ? 'Before ' : 'On '}${new Date(task.date).toLocaleDateString()}`
                                                                        : 'Date not specified'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 flex-shrink-0" />
                                                            <span className="capitalize">{task.timeOfDay || 'Anytime'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                                {task.status.toUpperCase()}
                                                            </Badge>
                                                            <span className="text-gray-600">· {offerCount} {offerCount === 1 ? 'offer' : 'offers'}</span>
                                                        </div>
                                                        {/* Poster Avatar */}
                                                        <Link
                                                            href={`/profile/${task.poster?.id || 'user-1'}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex-shrink-0"
                                                        >
                                                            <img
                                                                src={task.poster?.avatar_url || task.poster?.avatar || '/avatars/user.png'}
                                                                alt={task.poster?.name}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/avatars/user.png';
                                                                    e.currentTarget.onerror = null; // Prevent infinite loop
                                                                }}
                                                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm hover:border-primary transition-colors cursor-pointer"
                                                            />
                                                        </Link>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">No tasks found</div>
                                    )}
                                </div>
                            </div>

                            {/* Right Section - Map / Task Detail */}
                            <div className="md:flex-1">
                                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {selectedTask ? (
                                        // Task Detail View
                                        <div className="bg-white rounded-lg border p-6">
                                            <button
                                                onClick={() => setSelectedTaskId(null)}
                                                className="flex items-center gap-2 text-primary hover:underline mb-4 text-sm"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Return to map
                                            </button>

                                            {/* Task Progress Card (shows for in-progress tasks) */}
                                            <TaskProgressCard
                                                task={selectedTask}
                                                acceptedOffer={acceptedOffer}
                                                escrow={escrow}
                                                currentUserId={loggedInUser?.id}
                                            />

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* Main Content */}
                                                <div className="lg:col-span-2">
                                                    {/* Status Badges and Follow Button */}
                                                    <div className="flex gap-2 mb-6 items-center">
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">OPEN</Badge>
                                                        <Badge variant="outline">ASSIGNED</Badge>
                                                        <Badge variant="outline">COMPLETED</Badge>
                                                        <button className="ml-2 text-primary text-sm flex items-center gap-1">
                                                            ♡ Follow
                                                        </button>
                                                    </div>

                                                    <h1 className="font-heading text-3xl font-bold mb-4 text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                                        {selectedTask.title}
                                                    </h1>

                                                    {/* Posted By */}
                                                    <div className="mb-6 pb-6 border-b">
                                                        <div className="text-xs text-gray-600 mb-3">POSTED BY</div>
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                href={`/profile/${selectedTask.poster?.id || 'user-1'}`}
                                                                className="flex-shrink-0"
                                                            >
                                                                <img
                                                                    src={selectedTask.poster?.avatar_url || selectedTask.poster?.avatar || '/avatars/user.png'}
                                                                    alt={selectedTask.poster?.name}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = '/avatars/user.png';
                                                                        e.currentTarget.onerror = null;
                                                                    }}
                                                                    className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                                                                />
                                                            </Link>
                                                            <div>
                                                                <div className="font-semibold text-sm">{selectedTask.poster?.name}</div>
                                                                <div className="text-xs text-gray-500">about 11 hours ago</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-5 w-5" />
                                                            <span>{selectedTask.location}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setMapFocusTaskId(selectedTask.id);
                                                                    setSelectedTaskId(null);
                                                                }}
                                                                className="text-primary hover:underline ml-2 bg-transparent border-none p-0 cursor-pointer"
                                                            >
                                                                View map
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-5 w-5" />
                                                            <span className="font-semibold text-gray-900">TO BE DONE</span>
                                                            <span>
                                                                {selectedTask.dateType === 'flexible'
                                                                    ? 'Flexible date'
                                                                    : selectedTask.date
                                                                        ? `${selectedTask.dateType === 'before_date' ? 'Before ' : 'On '}${new Date(selectedTask.date).toLocaleDateString()}`
                                                                        : 'Date not specified'}
                                                                {selectedTask.timeOfDay && <span className="capitalize"> ({selectedTask.timeOfDay})</span>}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Description Section */}
                                                    <div className="mb-6">
                                                        <h3 className="font-bold text-lg text-gray-900 mb-3">
                                                            Description
                                                        </h3>
                                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                                                {selectedTask.description || "No description provided."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Photos Section */}
                                                    {selectedTask.images && selectedTask.images.length > 0 && (
                                                        <div className="mb-8">
                                                            <h3 className="font-bold text-lg text-gray-900 mb-3">
                                                                Photos ({selectedTask.images.length})
                                                            </h3>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                {selectedTask.images.map((image, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-gray-200"
                                                                        onClick={() => setSelectedImageIndex(index)}
                                                                    >
                                                                        <img
                                                                            src={image}
                                                                            alt={`Task photo ${index + 1}`}
                                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Sidebar - TASK BUDGET only */}
                                                <div>
                                                    <div className="bg-white border rounded-lg p-6">
                                                        <div className="text-center mb-4">
                                                            <div className="text-xs text-gray-600 mb-1">TASK BUDGET</div>
                                                            <div className="font-heading text-4xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                                                ${selectedTask.budget}
                                                            </div>
                                                        </div>
                                                        <MakeOfferButton taskId={selectedTask.id} task={selectedTask} />
                                                        <select className="w-full px-4 py-2 border rounded-md text-sm mt-2">
                                                            <option>More Options</option>
                                                            <option>Report this task</option>
                                                            <option>Save task</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Task Details Tabs */}
                                            <div className="mt-4">
                                                <TaskDetailTabs task={selectedTask} />
                                            </div>

                                            {/* Lightbox for Photos */}
                                            {/* Note: using native dialog or custom overlay for simplicity locally, but keeping consistent with UI */}
                                            {selectedImageIndex !== null && selectedTask.images && (
                                                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                                                    {/* Close button */}
                                                    <button
                                                        onClick={() => setSelectedImageIndex(null)}
                                                        className="absolute top-4 right-4 z-[101] p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                                    >
                                                        <span className="sr-only">Close</span>
                                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>

                                                    {/* Navigation Buttons */}
                                                    {selectedTask.images.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedImageIndex(prev => prev !== null ? (prev - 1 + selectedTask.images!.length) % selectedTask.images!.length : 0);
                                                                }}
                                                                className="absolute left-4 z-[101] p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all hover:scale-110"
                                                            >
                                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedImageIndex(prev => prev !== null ? (prev + 1) % selectedTask.images!.length : 0);
                                                                }}
                                                                className="absolute right-4 z-[101] p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all hover:scale-110"
                                                            >
                                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Main Image */}
                                                    <img
                                                        src={selectedTask.images[selectedImageIndex]}
                                                        alt="Full screen view"
                                                        className="max-h-[90vh] max-w-full object-contain"
                                                    />

                                                    {/* Counter */}
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/50 rounded-full text-white text-sm font-medium">
                                                        {(selectedImageIndex ?? 0) + 1} / {selectedTask.images?.length || 0}
                                                    </div>
                                                </div>
                                            )}


                                        </div>
                                    ) : (
                                        // Map View
                                        <div className="bg-white rounded-lg border overflow-hidden" style={{ height: '600px' }}>
                                            <TaskMap
                                                tasks={filteredTasks || []}
                                                onTaskSelect={setSelectedTaskId}
                                                focusedTaskId={mapFocusTaskId}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </GoogleMapsLoader>
    );
}
