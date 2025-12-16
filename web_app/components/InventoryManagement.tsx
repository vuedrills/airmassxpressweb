'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyInventory, createInventoryItem, deleteInventoryItem, fetchEquipmentCapacities } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Header } from '@/components/Layout/Header';
import { Trash2, Plus, PenTool, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { FileUpload } from '@/components/FileUpload';
import type { EquipmentCapacity } from '@/types';
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

// Predefined categories matching prompt
import { EQUIPMENT_CATEGORIES } from '@/lib/constants';

export default function InventoryManagement() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        category: EQUIPMENT_CATEGORIES[0],
        capacityId: '',
        capacity: '',
        location: '',
        isAvailable: true,
        withOperator: false,
        operatorBundled: true,
        hourlyRate: '',
        dailyRate: '',
        weeklyRate: '',
        deliveryFee: '',
        operatorFee: '',
        photos: [] as string[]
    });

    // Fetch Inventory
    const { data: inventory, isLoading } = useQuery({
        queryKey: ['myInventory'],
        queryFn: fetchMyInventory,
    });

    // Fetch Equipment Capacities
    const { data: capacitiesData } = useQuery({
        queryKey: ['equipmentCapacities'],
        queryFn: fetchEquipmentCapacities,
    });

    // Get capacities for selected category
    const categoryCapacities = capacitiesData?.grouped?.[newItem.category] || [];

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myInventory'] });
            setIsAddOpen(false);
            setNewItem({
                name: '', category: EQUIPMENT_CATEGORIES[0], capacityId: '', capacity: '',
                location: '', isAvailable: true, withOperator: false, operatorBundled: true,
                hourlyRate: '', dailyRate: '', weeklyRate: '', deliveryFee: '', operatorFee: '', photos: []
            });
            alert('Equipment added to inventory');
        },
        onError: () => {
            alert('Failed to add equipment');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myInventory'] });
            alert('Item removed from inventory');
        }
    });

    const handleSubmit = () => {
        if (!newItem.name || !newItem.location) {
            alert('Name and location are required');
            return;
        }
        // Map form data to API format
        const payload: any = {
            name: newItem.name,
            category: newItem.category,
            location: newItem.location,
            isAvailable: newItem.isAvailable,
            withOperator: newItem.withOperator,
            operatorBundled: newItem.operatorBundled,
        };
        if (newItem.capacityId) payload.capacityId = newItem.capacityId;
        if (newItem.capacity) payload.capacity = newItem.capacity;
        if (newItem.hourlyRate) payload.hourlyRate = parseFloat(newItem.hourlyRate);
        if (newItem.dailyRate) payload.dailyRate = parseFloat(newItem.dailyRate);
        if (newItem.weeklyRate) payload.weeklyRate = parseFloat(newItem.weeklyRate);
        if (newItem.deliveryFee) payload.deliveryFee = parseFloat(newItem.deliveryFee);
        if (newItem.operatorFee) payload.operatorFee = parseFloat(newItem.operatorFee);
        if (newItem.photos && newItem.photos.length > 0) payload.photos = newItem.photos;

        createMutation.mutate(payload);
    };

    // Photo upload handler
    const handlePhotoUpload = async () => {
        if (selectedFiles.length === 0) return;
        setIsUploading(true);
        try {
            // Sign in anonymously for Firebase upload
            await signInAnonymously(auth);

            const uploadedUrls: string[] = [];
            for (const file of selectedFiles) {
                const timestamp = Date.now();
                const storageRef = ref(storage, `inventory/${timestamp}-${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                uploadedUrls.push(url);
            }
            setNewItem({ ...newItem, photos: uploadedUrls });
            alert(`${uploadedUrls.length} photos uploaded successfully!`);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload photos');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-[#1a2847]">My Equipment Inventory</h1>
                        <p className="text-gray-600">Manage your fleet to be eligible for equipment tasks</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/equipment">
                            <Button variant="outline">Browse Requests</Button>
                        </Link>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#1a2847]">
                                    <Plus className="w-4 h-4 mr-2" /> Add Equipment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Equipment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-md"
                                            value={newItem.category}
                                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value, capacityId: '' })}
                                        >
                                            {EQUIPMENT_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Capacity Selection from API */}
                                    {categoryCapacities.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Capacity / Size Class</Label>
                                            <select
                                                className="w-full px-3 py-2 border rounded-md"
                                                value={newItem.capacityId}
                                                onChange={(e) => {
                                                    const cap = categoryCapacities.find(c => c.id === e.target.value);
                                                    setNewItem({
                                                        ...newItem,
                                                        capacityId: e.target.value,
                                                        capacity: cap?.displayName || ''
                                                    });
                                                }}
                                            >
                                                <option value="">Select capacity...</option>
                                                {categoryCapacities.map((cap: EquipmentCapacity) => (
                                                    <option key={cap.id} value={cap.id}>
                                                        {cap.capacityCode} - {cap.displayName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Equipment Name / Model</Label>
                                        <Input
                                            placeholder="e.g., CAT D6 Dozer"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Base Location</Label>
                                        <LocationAutocomplete
                                            value={newItem.location}
                                            onChange={(val) => setNewItem({ ...newItem, location: val })}
                                            placeholder="e.g., Harare, Msasa"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Availability</Label>
                                            <div className="flex gap-4 pt-1">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={newItem.isAvailable}
                                                        onChange={() => setNewItem({ ...newItem, isAvailable: true })}
                                                        className="w-4 h-4 text-[#1a2847]"
                                                    />
                                                    <span className="text-sm">Available</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={!newItem.isAvailable}
                                                        onChange={() => setNewItem({ ...newItem, isAvailable: false })}
                                                        className="w-4 h-4 text-[#1a2847]"
                                                    />
                                                    <span className="text-sm">Unavailable</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Operator Included?</Label>
                                            <div className="flex gap-4 pt-1">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={newItem.withOperator}
                                                        onChange={() => setNewItem({ ...newItem, withOperator: true })}
                                                        className="w-4 h-4 text-[#1a2847]"
                                                    />
                                                    <span className="text-sm">Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={!newItem.withOperator}
                                                        onChange={() => setNewItem({ ...newItem, withOperator: false })}
                                                        className="w-4 h-4 text-[#1a2847]"
                                                    />
                                                    <span className="text-sm">Dry Hire</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Options Toggle */}
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 text-sm text-[#1a2847] hover:underline"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                    >
                                        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        {showAdvanced ? 'Hide' : 'Show'} Pricing Options
                                    </button>

                                    {showAdvanced && (
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                            <p className="text-xs text-gray-500">Optional: Pre-set your rates so clients know your pricing.</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Hourly Rate ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={newItem.hourlyRate}
                                                        onChange={(e) => setNewItem({ ...newItem, hourlyRate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Daily Rate ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={newItem.dailyRate}
                                                        onChange={(e) => setNewItem({ ...newItem, dailyRate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Weekly Rate ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={newItem.weeklyRate}
                                                        onChange={(e) => setNewItem({ ...newItem, weeklyRate: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Delivery Fee ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={newItem.deliveryFee}
                                                        onChange={(e) => setNewItem({ ...newItem, deliveryFee: e.target.value })}
                                                    />
                                                </div>
                                                {newItem.withOperator && !newItem.operatorBundled && (
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Operator Fee ($)</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newItem.operatorFee}
                                                            onChange={(e) => setNewItem({ ...newItem, operatorFee: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {newItem.withOperator && (
                                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={newItem.operatorBundled}
                                                        onChange={(e) => setNewItem({ ...newItem, operatorBundled: e.target.checked })}
                                                        className="w-4 h-4"
                                                    />
                                                    Operator cost is bundled in rates
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Photos & Documents Section */}
                                <div className="space-y-3 border-t pt-4">
                                    <Label className="text-base font-semibold">Photos & Documents</Label>
                                    <p className="text-xs text-gray-500">
                                        Upload equipment photos, fitness certificates, ZINARA disc, or registration documents.
                                    </p>
                                    <FileUpload
                                        files={selectedFiles}
                                        onFilesSelected={setSelectedFiles}
                                        maxFiles={5}
                                    />
                                    {selectedFiles.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePhotoUpload}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
                                        </Button>
                                    )}
                                    {newItem.photos.length > 0 && (
                                        <div className="text-xs text-green-600">
                                            ✅ {newItem.photos.length} file(s) uploaded
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Saving...' : 'Add Equipment'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {isLoading ? (
                    <div>Loading inventory...</div>
                ) : inventory && inventory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inventory.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm relative group">
                                <button
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        if (confirm('Delete this item?')) deleteMutation.mutate(item.id);
                                    }}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                                        🚜
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-xs text-gray-500">{item.category}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-medium">Capacity:</span> {item.capacity || 'N/A'}</p>
                                    <p><span className="font-medium">Location:</span> {item.location}</p>
                                    <p className={`text-xs ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <div className="text-4xl mb-3">🚜</div>
                        <h3 className="font-semibold text-lg text-gray-900">No Equipment Added</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                            You need to add equipment to your inventory before you can bid on equipment requests.
                        </p>
                        <Button onClick={() => setIsAddOpen(true)}>Add Your First Item</Button>
                    </div>
                )}
            </main>
        </div>
    );
}
