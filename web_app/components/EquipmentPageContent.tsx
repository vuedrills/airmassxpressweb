'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, fetchTaskById } from '@/lib/api';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Filter, Calendar, DollarSign, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
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

    // Simple filters (Search only Eqiupment tasks for now)
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
            <div className="flex flex-col min-h-screen bg-gray-50">
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
                                    Equipment Hire
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
                                <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-2">
                                    {isLoading ? (
                                        <div className="text-center py-8 text-gray-500">Loading machinery...</div>
                                    ) : filteredTasks && filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={() => setSelectedTaskId(task.id)}
                                                className={`w-full text-left bg-white rounded-lg border p-4 hover:border-[#1a2847] transition-all ${selectedTaskId === task.id ? 'border-[#1a2847] shadow-md' : ''
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
                                                        <span className="truncate">{task.location.split(',')[0]}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                                        <span>
                                                            {task.dateType === 'flexible'
                                                                ? 'Flexible date'
                                                                : task.date || 'No date'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`px-2 py-0.5 rounded ${task.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800'}`}>
                                                            {task.status.toUpperCase()}
                                                        </Badge>
                                                        <span className="text-gray-600">· {task.offerCount || 0} offers</span>
                                                    </div>
                                                    {task.poster && (
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src={getAvatarSrc(task.poster)}
                                                                alt={task.poster.name}
                                                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                                            />
                                                        </div>
                                                    )}
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
                                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                        <div className="bg-white rounded-lg border p-6">
                                            <button
                                                onClick={() => setSelectedTaskId(null)}
                                                className="flex items-center gap-2 text-[#1a2847] hover:underline mb-4 text-sm font-medium"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Return to list
                                            </button>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* Main Content */}
                                                <div className="lg:col-span-2">
                                                    {/* Header Badges */}
                                                    <div className="flex gap-2 mb-6 items-center">
                                                        <span className={`inline-block text-xs uppercase font-bold px-2 py-1 rounded-md ${selectedTask.status === 'open' ? 'bg-green-100 text-green-700' :
                                                            selectedTask.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {selectedTask.status}
                                                        </span>
                                                        <Badge variant="outline">{selectedTask.category}</Badge>
                                                    </div>

                                                    <h1 className="font-heading text-3xl font-bold text-[#1a2847] mb-4 leading-tight" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                                        {selectedTask.title}
                                                    </h1>

                                                    {/* Posted By Section (Matching Browse Page) */}
                                                    {selectedTask.poster && (
                                                        <div className="mb-6 pb-6 border-b">
                                                            <div className="text-xs text-gray-600 mb-3">POSTED BY</div>
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={getAvatarSrc(selectedTask.poster)}
                                                                    alt={selectedTask.poster.name}
                                                                    className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-[#1a2847] transition-all cursor-pointer"
                                                                />
                                                                <div>
                                                                    <div className="font-semibold text-sm flex items-center gap-1">
                                                                        {selectedTask.poster.name}
                                                                        {selectedTask.poster.isVerified && <CheckCircle2 className="h-3 w-3 text-blue-600" />}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                        <span>{selectedTask.poster.rating ? selectedTask.poster.rating.toFixed(1) : 'New'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Locations and Date */}
                                                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-5 w-5" />
                                                            <span>{selectedTask.location}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setMapFocusTaskId(selectedTask.id);
                                                                    setSelectedTaskId(null);
                                                                }}
                                                                className="text-[#1a2847] hover:underline ml-2 bg-transparent border-none p-0 cursor-pointer font-medium"
                                                            >
                                                                View map
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-5 w-5" />
                                                            <span className="font-semibold text-gray-900">TO BE DONE</span>
                                                            <span>{selectedTask.dateType === 'flexible' ? 'Flexible Date' : selectedTask.date || 'No date'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <div className="mb-6">
                                                        <h3 className="font-bold text-lg text-gray-900 mb-3">Description</h3>
                                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                                                {selectedTask.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sidebar - Budget & Actions */}
                                                <div>
                                                    <div className="bg-white border rounded-lg p-6">
                                                        <div className="text-center mb-4">
                                                            <div className="text-xs text-gray-600 mb-1">TASK BUDGET</div>
                                                            <div className="font-heading text-4xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                                                ${selectedTask.budget}
                                                            </div>
                                                        </div>
                                                        <MakeOfferButton taskId={selectedTask.id} variant="default" className="w-full" />
                                                        <select className="w-full px-4 py-2 border rounded-md text-sm mt-2">
                                                            <option>More Options</option>
                                                            <option>Report this task</option>
                                                            <option>Save task</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tabs */}
                                            <div className="mt-4">
                                                <TaskDetailTabs task={selectedTask} />
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
            </div >
        </GoogleMapsLoader >
    );
}
