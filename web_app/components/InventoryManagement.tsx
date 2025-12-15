'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyInventory, createInventoryItem, deleteInventoryItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Header } from '@/components/Layout/Header';
import { Trash2, Plus, PenTool } from 'lucide-react';
import Link from 'next/link';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';

// Predefined categories matching prompt
import { EQUIPMENT_CATEGORIES } from '@/lib/constants';

export default function InventoryManagement() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        category: EQUIPMENT_CATEGORIES[0],
        capacity: '',
        location: '',
        isAvailable: true,
        photos: [] as string[] // TODO: implement upload
    });

    // Fetch Inventory
    const { data: inventory, isLoading } = useQuery({
        queryKey: ['myInventory'],
        queryFn: fetchMyInventory,
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createInventoryItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myInventory'] });
            setIsAddOpen(false);
            setNewItem({ name: '', category: EQUIPMENT_CATEGORIES[0], capacity: '', location: '', isAvailable: true, photos: [] });
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
        createMutation.mutate(newItem);
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
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Equipment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-md"
                                            value={newItem.category}
                                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        >
                                            {EQUIPMENT_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Equipment Name / Model</Label>
                                        <Input
                                            placeholder="e.g., CAT D6 Dozer"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Capacity / Specs (Optional)</Label>
                                        <Input
                                            placeholder="e.g., 20 Ton"
                                            value={newItem.capacity}
                                            onChange={(e) => setNewItem({ ...newItem, capacity: e.target.value })}
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
                                                <span>Available</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={!newItem.isAvailable}
                                                    onChange={() => setNewItem({ ...newItem, isAvailable: false })}
                                                    className="w-4 h-4 text-[#1a2847]"
                                                />
                                                <span>Unavailable</span>
                                            </label>
                                        </div>
                                    </div>
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
