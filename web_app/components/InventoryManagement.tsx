'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyInventory, createInventoryItem, deleteInventoryItem, fetchEquipmentCapacities, updateInventoryItem, uploadInventoryImage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Header } from '@/components/Layout/Header';
import { Trash2, Plus, PenTool, ChevronDown, ChevronUp, Pencil, Tractor, Wrench, Truck, Hammer, Box, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { FileUpload } from '@/components/FileUpload';
import type { EquipmentCapacity, InventoryItem } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Predefined categories matching prompt
import { EQUIPMENT_CATEGORIES } from '@/lib/constants';

// Helper to get icon by category
const getCategoryIcon = (category: string, size = "w-8 h-8") => {
    const slug = category.toLowerCase();
    if (slug.includes('heavy') || slug.includes('machinery') || slug.includes('dozer') || slug.includes('excavator')) return <Tractor className={`${size} text-gray-400`} />;
    if (slug.includes('truck') || slug.includes('delivery') || slug.includes('vehicle')) return <Truck className={`${size} text-gray-400`} />;
    if (slug.includes('tool') || slug.includes('equipment')) return <Hammer className={`${size} text-gray-400`} />;
    if (slug.includes('fix') || slug.includes('mechanic')) return <Wrench className={`${size} text-gray-400`} />;
    return <Box className={`${size} text-gray-400`} />;
};

export default function InventoryManagement() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // Form State
    const [itemForm, setItemForm] = useState({
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
    const categoryCapacities = capacitiesData?.grouped?.[itemForm.category] || [];

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myInventory'] });
            resetForm();
            setIsAddOpen(false);
            toast.success('Equipment added to inventory');
        },
        onError: (error) => {
            console.error(error);
            toast.error(`Failed to add equipment: ${error.message}`);
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (data: { id: string, item: Partial<InventoryItem> }) => updateInventoryItem(data.id, data.item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myInventory'] });
            resetForm();
            setIsAddOpen(false);
            toast.success('Equipment updated successfully');
        },
        onError: (error) => {
            console.error(error);
            toast.error(`Failed to update equipment: ${error.message}`);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myInventory'] });
            toast.success('Item removed from inventory');
        }
    });

    const resetForm = () => {
        setEditingItem(null);
        setItemForm({
            name: '', category: EQUIPMENT_CATEGORIES[0], capacityId: '', capacity: '',
            location: '', isAvailable: true, withOperator: false, operatorBundled: true,
            hourlyRate: '', dailyRate: '', weeklyRate: '', deliveryFee: '', operatorFee: '', photos: []
        });
        setSelectedFiles([]);
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            category: item.category,
            capacityId: item.capacityId || '',
            capacity: item.capacity || '',
            location: item.location || '',
            isAvailable: item.isAvailable,
            withOperator: item.withOperator || false,
            operatorBundled: item.operatorBundled !== undefined ? item.operatorBundled : true,
            hourlyRate: item.hourlyRate?.toString() || '',
            dailyRate: item.dailyRate?.toString() || '',
            weeklyRate: item.weeklyRate?.toString() || '',
            deliveryFee: item.deliveryFee?.toString() || '',
            operatorFee: item.operatorFee?.toString() || '',
            photos: item.photos || []
        });
        setIsAddOpen(true);
    };

    const uploadFiles = async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        try {
            const uploadedUrls: string[] = [];
            for (const file of files) {
                const url = await uploadInventoryImage(file);
                uploadedUrls.push(url);
            }
            return uploadedUrls;
        } catch (error: any) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload photos: ' + error.message);
        }
    };

    const handleSubmit = async () => {
        if (!itemForm.name || !itemForm.location) {
            toast.error('Name and location are required');
            return;
        }

        setIsUploading(true);
        try {
            // Upload new files if any
            let newPhotoUrls: string[] = [];
            if (selectedFiles.length > 0) {
                newPhotoUrls = await uploadFiles(selectedFiles);
            }

            // Combine existing photos and new uploads
            const finalPhotos = [...itemForm.photos, ...newPhotoUrls];

            // Map form data to API format
            const payload: any = {
                name: itemForm.name,
                category: itemForm.category,
                location: itemForm.location,
                isAvailable: itemForm.isAvailable,
                withOperator: itemForm.withOperator,
                operatorBundled: itemForm.operatorBundled,
                photos: finalPhotos
            };

            if (itemForm.capacityId) payload.capacityId = itemForm.capacityId;
            if (itemForm.capacity) payload.capacity = itemForm.capacity;
            if (itemForm.hourlyRate) payload.hourlyRate = parseFloat(itemForm.hourlyRate);
            if (itemForm.dailyRate) payload.dailyRate = parseFloat(itemForm.dailyRate);
            if (itemForm.weeklyRate) payload.weeklyRate = parseFloat(itemForm.weeklyRate);
            if (itemForm.deliveryFee) payload.deliveryFee = parseFloat(itemForm.deliveryFee);
            if (itemForm.operatorFee) payload.operatorFee = parseFloat(itemForm.operatorFee);

            if (editingItem) {
                updateMutation.mutate({ id: editingItem.id, item: payload }, {
                    onSuccess: () => {
                        // Clear files on success
                        setSelectedFiles([]);
                    }
                });
            } else {
                createMutation.mutate(payload, {
                    onSuccess: () => {
                        setSelectedFiles([]);
                    }
                });
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Failed to save equipment.');
        } finally {
            setIsUploading(false);
        }
    };

    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
                        <Dialog open={isAddOpen} onOpenChange={(open) => {
                            setIsAddOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#1a2847]">
                                    <Plus className="w-4 h-4 mr-2" /> Add Equipment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-md"
                                            value={itemForm.category}
                                            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value, capacityId: '' })}
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
                                                value={itemForm.capacityId}
                                                onChange={(e) => {
                                                    const cap = categoryCapacities.find(c => c.id === e.target.value);
                                                    setItemForm({
                                                        ...itemForm,
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
                                            value={itemForm.name}
                                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Base Location</Label>
                                        <LocationAutocomplete
                                            value={itemForm.location}
                                            onChange={(val) => setItemForm({ ...itemForm, location: val })}
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
                                                        checked={itemForm.isAvailable}
                                                        onChange={() => setItemForm({ ...itemForm, isAvailable: true })}
                                                        className="w-4 h-4 text-[#1a2847]"
                                                    />
                                                    <span className="text-sm">Available</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={!itemForm.isAvailable}
                                                        onChange={() => setItemForm({ ...itemForm, isAvailable: false })}
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
                                                        checked={itemForm.withOperator}
                                                        onChange={() => setItemForm({ ...itemForm, withOperator: true })}
                                                        className="w-4 h-4 text-[#1a2847]"
                                                    />
                                                    <span className="text-sm">Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={!itemForm.withOperator}
                                                        onChange={() => setItemForm({ ...itemForm, withOperator: false })}
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
                                                        value={itemForm.hourlyRate}
                                                        onChange={(e) => setItemForm({ ...itemForm, hourlyRate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Daily Rate ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={itemForm.dailyRate}
                                                        onChange={(e) => setItemForm({ ...itemForm, dailyRate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Weekly Rate ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={itemForm.weeklyRate}
                                                        onChange={(e) => setItemForm({ ...itemForm, weeklyRate: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Delivery Fee ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={itemForm.deliveryFee}
                                                        onChange={(e) => setItemForm({ ...itemForm, deliveryFee: e.target.value })}
                                                    />
                                                </div>
                                                {itemForm.withOperator && !itemForm.operatorBundled && (
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Operator Fee ($)</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={itemForm.operatorFee}
                                                            onChange={(e) => setItemForm({ ...itemForm, operatorFee: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {itemForm.withOperator && (
                                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={itemForm.operatorBundled}
                                                        onChange={(e) => setItemForm({ ...itemForm, operatorBundled: e.target.checked })}
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

                                    {itemForm.photos.length > 0 && (
                                        <div>
                                            <div className="text-xs text-green-600 mb-2">
                                                ✅ {itemForm.photos.length} file(s) attached
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {itemForm.photos.map((url, idx) => (
                                                    <div key={idx} className="relative w-16 h-16 border rounded bg-gray-100 overflow-hidden">
                                                        <img src={url} alt="Equipment" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newPhotos = [...itemForm.photos];
                                                                newPhotos.splice(idx, 1);
                                                                setItemForm({ ...itemForm, photos: newPhotos });
                                                            }}
                                                            className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                                        {isUploading ? 'Uploading & Saving...' : (createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingItem ? 'Update Equipment' : 'Add Equipment'))}
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
                            <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm relative group hover:border-[#292d73] transition-colors">
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded"
                                        title="Edit"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded"
                                        title="Delete"
                                        onClick={() => setItemToDelete(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    {item.photos && item.photos.length > 0 ? (
                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 border flex-shrink-0">
                                            <img
                                                src={item.photos[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                            <div className="hidden w-full h-full flex items-center justify-center">
                                                {getCategoryIcon(item.category)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                            {getCategoryIcon(item.category)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-[#1a2847] line-clamp-1" title={item.name}>{item.name}</h3>
                                        <p className="text-xs text-gray-500">{item.category}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex justify-between"><span className="font-medium">Capacity:</span> <span>{item.capacity || 'N/A'}</span></p>
                                    <p className="flex justify-between"><span className="font-medium">Location:</span> <span className="truncate max-w-[150px]" title={item.location}>{item.location}</span></p>
                                    <p className={`text-xs font-semibold flex items-center gap-1 ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <div className="flex justify-center mb-3">
                            <Tractor className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900">No Equipment Added</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                            You need to add equipment to your inventory before you can bid on equipment requests.
                        </p>
                        <Button onClick={() => setIsAddOpen(true)}>Add Your First Item</Button>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete this equipment item? This action cannot be undone.
                        </p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (itemToDelete) {
                                        deleteMutation.mutate(itemToDelete);
                                        setItemToDelete(null);
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
