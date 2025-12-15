'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, fetchTaskById } from '@/lib/api';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Filter, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAvatarSrc } from '@/lib/utils';
import MakeOfferButton from '@/components/MakeOfferButton';
import dynamic from 'next/dynamic';
import TaskDetailTabs from '@/components/TaskDetailTabs';
import { NotificationBanner } from '@/components/NotificationBanner';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Layout/Header';
import { GoogleMapsLoader } from '@/components/GoogleMapsLoader';

// Reuse TaskMap for now, can create EquipmentMap if markers need distinction
const TaskMap = dynamic(() => import('@/components/Map/TaskMap'), { ssr: false });

export default function EquipmentPageContent() {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [mapFocusTaskId, setMapFocusTaskId] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    // Get logged-in user for debug display
    const loggedInUser = useStore((state) => state.loggedInUser);

    // Notification state
    const currentNotification = useStore((state) => state.currentNotification);
    const dismissCurrentNotification = useStore((state) => state.dismissCurrentNotification);

    // Fetch EQUIPMENT tasks
    const { data: allTasks, isLoading } = useQuery({
        queryKey: ['equipmentTasks'],
        queryFn: () => fetchTasks({ taskType: 'equipment' }),
    });

    // Simple filters (Search only for simplicity MVP)
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTasks = useMemo(() => {
        if (!allTasks) return [];
        let filtered = [...allTasks];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query) ||
                    task.location.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [allTasks, searchQuery]);

    const selectedTask = filteredTasks?.find((t) => t.id === selectedTaskId);

    return (
        <GoogleMapsLoader>
            <div className="flex flex-col min-h-screen bg-amber-50">
                <NotificationBanner
                    notification={currentNotification}
                    onDismiss={dismissCurrentNotification}
                />
                <Header />

                <main className="flex-1 py-6">
                    <div className="container mx-auto px-2 max-w-5xl">
                        {/* Header & Actions */}
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-2">
                                    🚜 Equipment Hire
                                </h1>
                                <p className="text-gray-600">Find heavy machinery and equipment for your projects</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/post-equipment">
                                    <Button className="bg-[#1a2847] hover:bg-[#2a3c63]">
                                        Request Equipment
                                    </Button>
                                </Link>
                                <Link href="/equipment/inventory">
                                    <Button variant="outline">
                                        Manage My Fleet
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search by machine name, location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-1/2 px-4 py-2 border rounded-md text-sm bg-white"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Left Sidebar - List */}
                            <div className="md:w-[34%] md:flex-shrink-0">
                                <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-2">
                                    {isLoading ? (
                                        <div className="text-center py-8 text-gray-500">Loading machinery...</div>
                                    ) : filteredTasks && filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={() => setSelectedTaskId(task.id)}
                                                className={`w-full text-left bg-white rounded-lg border p-4 hover:border-amber-500 transition-all ${selectedTaskId === task.id ? 'border-amber-500 shadow-md ring-1 ring-amber-500' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-900 pr-2 flex-1 line-clamp-2">
                                                        {task.title}
                                                    </h3>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900 text-lg font-heading">
                                                            ${task.budget}
                                                        </div>
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${task.status === 'open' ? 'bg-green-100 text-green-700' :
                                                            task.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm text-gray-600 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        <span className="truncate">{task.location.split(',')[0]}</span>
                                                    </div>

                                                    {/* Poster Info */}
                                                    {task.poster && (
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={getAvatarSrc(task.poster)}
                                                                alt={task.poster.name}
                                                                className="w-5 h-5 rounded-full object-cover bg-gray-200"
                                                            />
                                                            <span className="text-xs text-gray-500">
                                                                {task.poster.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                                        <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                                                            {task.offerCount || 0} bids
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(task.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 bg-white rounded border">
                                            No equipment requests found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Section - Map/Detail */}
                            <div className="md:flex-1">
                                {selectedTask ? (
                                    <div className="h-full overflow-y-auto p-6">
                                        <Button
                                            variant="ghost"
                                            className="mb-4 pl-0 hover:pl-2 transition-all"
                                            onClick={() => setSelectedTaskId(null)}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Return to list
                                        </Button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Left Column: Details */}
                                            <div className="md:col-span-2 space-y-6">
                                                <div>
                                                    <div className="flex gap-2 mb-3">
                                                        <span className={`inline-block text-xs uppercase font-bold px-2 py-1 rounded-md ${selectedTask.status === 'open' ? 'bg-green-100 text-green-700' :
                                                            selectedTask.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {selectedTask.status}
                                                        </span>
                                                        <Badge variant="outline">{selectedTask.category}</Badge>
                                                    </div>

                                                    <h1 className="font-heading text-3xl font-bold text-[#1a2847] mb-2">
                                                        {selectedTask.title}
                                                    </h1>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{selectedTask.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{selectedTask.dateType === 'flexible' ? 'Flexible Date' : selectedTask.date || 'No date'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg border p-6">
                                                    <h3 className="font-semibold text-lg mb-3">Description</h3>
                                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                                        {selectedTask.description}
                                                    </p>
                                                </div>

                                                {/* Posted By Section (Mobile only, or kept here if sidebar is full) 
                                                    But screenshot has it in 'Posted By' area. Detailed view usually puts it in sidebar or top.
                                                    We'll put it in sidebar to match 'Task Detail'.
                                                */}
                                            </div>

                                            {/* Right Column: Sidebar */}
                                            <div className="space-y-6">
                                                {/* Budget Card */}
                                                <div className="bg-white rounded-lg border p-6 shadow-sm">
                                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Task Budget</p>
                                                    <div className="text-4xl font-bold text-[#1a2847] mb-4">
                                                        ${selectedTask.budget}
                                                    </div>

                                                    {/* Make Offer Button */}
                                                    <MakeOfferButton taskId={selectedTask.id} variant="default" className="w-full mb-3" />

                                                    {/* Other actions if needed */}
                                                </div>

                                                {/* Poster Info Card */}
                                                {selectedTask.poster && (
                                                    <div className="bg-white rounded-lg border p-6">
                                                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Posted By</h3>
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={getAvatarSrc(selectedTask.poster)}
                                                                alt={selectedTask.poster.name}
                                                                className="w-12 h-12 rounded-full object-cover bg-gray-200"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {selectedTask.poster.name}
                                                                </p>
                                                                {selectedTask.poster.isVerified && (
                                                                    <div className="flex items-center text-green-600 text-xs mt-0.5">
                                                                        <span className="font-medium">Verified User</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[calc(100vh-250px)] min-h-[500px] bg-white rounded-lg border overflow-hidden">
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
                </main>
            </div>
        </GoogleMapsLoader>
    );
}
