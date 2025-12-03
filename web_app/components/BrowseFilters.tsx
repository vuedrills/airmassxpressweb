'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check } from 'lucide-react';

interface SortFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const sortOptions = [
    { id: 'recommended', label: 'Recommended', icon: '⭐' },
    { id: 'newest', label: 'Most recently posted', icon: '🕐' },
    { id: 'due-soon', label: 'Due soon', icon: '📅' },
    { id: 'closest', label: 'Closest to me', icon: '📍' },
    { id: 'price-low', label: 'Lowest price', icon: '$' },
    { id: 'price-high', label: 'Highest price', icon: '$' },
];

export function SortFilter({ value, onChange }: SortFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(value);

    const handleApply = () => {
        onChange(selected);
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 border rounded-md text-sm bg-white"
            >
                Sort ▼
            </button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <div className="space-y-2">
                        {sortOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelected(option.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${selected === option.id
                                    ? 'bg-blue-50 text-[#1a2847]'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-xl">{option.icon}</span>
                                <span className="flex-1 text-left font-medium">{option.label}</span>
                                {selected === option.id && <Check className="h-5 w-5 text-[#1a2847]" />}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="flex-1">
                            Apply
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface PriceFilterProps {
    onApply: (min: number, max: number) => void;
}

export function PriceFilter({ onApply }: PriceFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(5);
    const [maxPrice, setMaxPrice] = useState(9999);

    const handleApply = () => {
        onApply(minPrice, maxPrice);
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 border rounded-md text-sm bg-white"
            >
                ${minPrice} - ${maxPrice.toLocaleString()} ▼
            </button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-gray-500 text-sm font-normal">TASK PRICE</DialogTitle>
                    </DialogHeader>
                    <div className="text-center text-2xl font-bold mb-6" style={{ color: '#1a2847' }}>
                        ${minPrice} - ${maxPrice.toLocaleString()}
                    </div>
                    <div className="px-2">
                        <input
                            type="range"
                            min="5"
                            max="9999"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                            className="w-full h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #0066FF 0%, #0066FF ${((maxPrice - 5) / (9999 - 5)) * 100
                                    }%, #e5e7eb ${((maxPrice - 5) / (9999 - 5)) * 100}%, #e5e7eb 100%)`,
                            }}
                        />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 text-blue-600"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="flex-1 rounded-full">
                            Apply
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface LocationFilterProps {
    onApply: (location: string, distance: number, type: string) => void;
}

export function LocationFilter({ onApply }: LocationFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [location, setLocation] = useState('Harare');
    const [distance, setDistance] = useState(50);
    const [toBeDone, setToBeDone] = useState<'in-person' | 'remotely' | 'all'>('in-person');

    const handleApply = () => {
        onApply(location, distance, toBeDone);
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 border rounded-md text-sm bg-white"
            >
                {distance}km {location} ▼
            </button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <div className="space-y-6">
                        <div>
                            <div className="text-gray-500 text-xs font-semibold mb-3">TO BE DONE</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setToBeDone('in-person')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${toBeDone === 'in-person'
                                        ? 'bg-[#1a2847] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    In-person
                                </button>
                                <button
                                    onClick={() => setToBeDone('remotely')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${toBeDone === 'remotely'
                                        ? 'bg-[#1a2847] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    Remotely
                                </button>
                                <button
                                    onClick={() => setToBeDone('all')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${toBeDone === 'all'
                                        ? 'bg-[#1a2847] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    All
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="text-gray-500 text-xs font-semibold mb-3">POSTCODE</div>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-[#1a2847] font-medium text-center"
                                placeholder="Enter location"
                            />
                        </div>

                        <div>
                            <div className="text-gray-500 text-xs font-semibold mb-3">DISTANCE</div>
                            <div className="text-center text-2xl font-bold mb-4" style={{ color: '#1a2847' }}>
                                {distance}km
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="200"
                                value={distance}
                                onChange={(e) => setDistance(parseInt(e.target.value))}
                                className="w-full h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #0066FF 0%, #0066FF ${((distance - 1) / 199) * 100
                                        }%, #e5e7eb ${((distance - 1) / 199) * 100}%, #e5e7eb 100%)`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 text-blue-600"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="flex-1 rounded-full">
                            Apply
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface OtherFiltersProps {
    onApply: (availableOnly: boolean, noOffersOnly: boolean) => void;
}

export function OtherFilters({ onApply }: OtherFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [availableOnly, setAvailableOnly] = useState(true);
    const [noOffersOnly, setNoOffersOnly] = useState(false);

    const handleApply = () => {
        onApply(availableOnly, noOffersOnly);
        setIsOpen(false);
    };

    const activeCount = (availableOnly ? 1 : 0) + (noOffersOnly ? 1 : 0);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 border rounded-md text-sm bg-white"
            >
                Other filters ({activeCount}) ▼
            </button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-gray-500 text-sm font-semibold tracking-wide">
                            OTHER FILTERS
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Available tasks only */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[#1a2847] mb-1">
                                    Available tasks only
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Hide tasks that are already assigned
                                </p>
                            </div>
                            <button
                                onClick={() => setAvailableOnly(!availableOnly)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${availableOnly ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${availableOnly ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Tasks with no offers only */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[#1a2847] mb-1">
                                    Tasks with no offers only
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Hide tasks that have offers
                                </p>
                            </div>
                            <button
                                onClick={() => setNoOffersOnly(!noOffersOnly)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${noOffersOnly ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${noOffersOnly ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 text-blue-600"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="flex-1 rounded-full">
                            Apply
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
