'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchTasks, fetchCategories } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { MapPin, Calendar, ArrowLeft, MessageCircle, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Task } from '@/types';
import TaskDetailTabs from '@/components/TaskDetailTabs';
import MakeOfferButton from '@/components/MakeOfferButton';
import { SortFilter, PriceFilter, LocationFilter, OtherFilters } from '@/components/BrowseFilters';

// Dynamically import map to avoid SSR issues
const TaskMap = dynamic(() => import('@/components/Map/TaskMap'), { ssr: false });

export default function BrowsePage() {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 5, max: 9999 });
    const [location, setLocation] = useState('Harare');
    const [distance, setDistance] = useState(50);
    const [availableOnly, setAvailableOnly] = useState(true);
    const [noOffersOnly, setNoOffersOnly] = useState(false);

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

        let filtered = [...allTasks];

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

        // Available only filter (assumes tasks have a 'status' field)
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

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f3f3f7' }}>
            <Header maxWidthClass="px-2 max-w-5xl" />

            <main className="flex-1 py-6">
                <div className="container mx-auto px-2 max-w-5xl">
                    {/* Filters Row */}
                    <div className="mb-4 flex gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Search for a task"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 border rounded-md text-sm bg-white"
                        />
                        <select
                            className="px-4 py-2 border rounded-md text-sm min-w-[140px] bg-white"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Category</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <LocationFilter
                            onApply={(loc, dist, type) => {
                                setLocation(loc);
                                setDistance(dist);
                            }}
                        />
                        <PriceFilter
                            onApply={(min, max) => {
                                setPriceRange({ min, max });
                            }}
                        />
                        <OtherFilters
                            onApply={(available, noOffers) => {
                                setAvailableOnly(available);
                                setNoOffersOnly(noOffers);
                            }}
                        />
                        <div className="ml-auto">
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
                                        // Actual offer counts from dummy data
                                        const offerCounts: Record<string, number> = {
                                            'task-1': 3,
                                            'task-2': 2,
                                            'task-3': 1,
                                            'task-4': 2,
                                            'task-5': 1,
                                            'task-6': 1,
                                            'task-7': 2,
                                            'task-8': 1,
                                            'task-9': 1,
                                            'task-10': 1,
                                            'task-11': 1,
                                            'task-12': 1,
                                            'task-13': 1,
                                            'task-14': 1,
                                            'task-15': 1,
                                        };
                                        const offerCount = offerCounts[task.id] || 0;

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
                                                            {task.dateType === 'flexible' ? 'Flexible' : task.dateType === 'on_date' ? 'Tomorrow' : 'Anytime'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                                        <span>Afternoon</span>
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
                                                            src={task.poster?.avatar || '/avatars/91.jpg'}
                                                            alt={task.poster?.name}
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
                                                                src={selectedTask.poster?.avatar || '/avatars/63.jpg'}
                                                                alt={selectedTask.poster?.name}
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
                                                        <Link href="#" className="text-primary hover:underline ml-2">
                                                            View map
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-5 w-5" />
                                                        <span className="font-semibold text-gray-900">TO BE DONE ON</span>
                                                        <span>Tomorrow</span>
                                                    </div>
                                                </div>
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
                                                    <MakeOfferButton taskId={selectedTask.id} />
                                                    <select className="w-full px-4 py-2 border rounded-md text-sm mt-2">
                                                        <option>More Options</option>
                                                        <option>Report this task</option>
                                                        <option>Save task</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full-width Details section below grid */}
                                        <div className="border-t pt-6 mt-6">
                                            <h2 className="font-heading text-xl font-bold mb-4">Details</h2>
                                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                                {selectedTask.description}
                                            </p>

                                            {/* Task Images - Not Full Width, Clickable Gallery */}
                                            {selectedTask.images && selectedTask.images.length > 0 && (
                                                <div className="mt-6 max-w-md">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {selectedTask.images.map((image, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => {
                                                                    const modal = document.getElementById('image-gallery-modal') as HTMLDialogElement;
                                                                    const img = document.getElementById('gallery-image') as HTMLImageElement;
                                                                    const counter = document.getElementById('image-counter');
                                                                    if (modal && img) {
                                                                        modal.dataset.currentIndex = String(index);
                                                                        modal.dataset.images = JSON.stringify(selectedTask.images);
                                                                        img.src = image;
                                                                        if (counter) counter.textContent = `${index + 1} / ${selectedTask.images.length}`;
                                                                        modal.showModal();
                                                                    }
                                                                }}
                                                                className="w-full h-32 overflow-hidden rounded-lg border hover:border-primary transition-all cursor-pointer"
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`Task image ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Full-width Offers/Questions tabs */}
                                        <TaskDetailTabs taskId={selectedTask.id} />

                                        {/* Image Gallery Modal */}
                                        <dialog id="image-gallery-modal" className="p-0 bg-black/95 backdrop:bg-black/80 max-w-5xl w-full">
                                            <div className="relative">
                                                {/* Close Button */}
                                                <button
                                                    onClick={() => {
                                                        const modal = document.getElementById('image-gallery-modal') as HTMLDialogElement;
                                                        modal?.close();
                                                    }}
                                                    className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
                                                >
                                                    <span className="text-2xl">×</span>
                                                </button>

                                                {/* Image Counter */}
                                                <div id="image-counter" className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-10">
                                                    1 / 1
                                                </div>

                                                {/* Previous Button */}
                                                <button
                                                    onClick={() => {
                                                        const modal = document.getElementById('image-gallery-modal') as HTMLDialogElement;
                                                        const img = document.getElementById('gallery-image') as HTMLImageElement;
                                                        const counter = document.getElementById('image-counter');
                                                        if (modal && img) {
                                                            const images = JSON.parse(modal.dataset.images || '[]');
                                                            let currentIndex = parseInt(modal.dataset.currentIndex || '0');
                                                            currentIndex = (currentIndex - 1 + images.length) % images.length;
                                                            modal.dataset.currentIndex = String(currentIndex);
                                                            img.src = images[currentIndex];
                                                            if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
                                                        }
                                                    }}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3"
                                                >
                                                    <span className="text-2xl">←</span>
                                                </button>

                                                {/* Next Button */}
                                                <button
                                                    onClick={() => {
                                                        const modal = document.getElementById('image-gallery-modal') as HTMLDialogElement;
                                                        const img = document.getElementById('gallery-image') as HTMLImageElement;
                                                        const counter = document.getElementById('image-counter');
                                                        if (modal && img) {
                                                            const images = JSON.parse(modal.dataset.images || '[]');
                                                            let currentIndex = parseInt(modal.dataset.currentIndex || '0');
                                                            currentIndex = (currentIndex + 1) % images.length;
                                                            modal.dataset.currentIndex = String(currentIndex);
                                                            img.src = images[currentIndex];
                                                            if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
                                                        }
                                                    }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3"
                                                >
                                                    <span className="text-2xl">→</span>
                                                </button>

                                                {/* Main Image */}
                                                <img
                                                    id="gallery-image"
                                                    src=""
                                                    alt="Gallery"
                                                    className="w-full h-auto max-h-[80vh] object-contain"
                                                />
                                            </div>
                                        </dialog>
                                    </div>
                                ) : (
                                    // Map View
                                    <div className="bg-white rounded-lg border overflow-hidden" style={{ height: '600px' }}>
                                        <TaskMap tasks={filteredTasks || []} onTaskSelect={setSelectedTaskId} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
