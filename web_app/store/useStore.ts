import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Task } from '@/types';

interface BrowseFilters {
    selectedCategories: string[];
    priceRange: [number, number] | null;
    location: string | null;
    sortBy: 'newest' | 'price_low' | 'price_high' | 'most_offers';
}

interface AppState {
    // Auth
    loggedInUser: User | null;
    login: (user: User) => void;
    logout: () => void;

    // Post Task Draft (multi-step form)
    currentTaskDraft: Partial<Task>;
    updateTaskDraft: (data: Partial<Task>) => void;
    clearTaskDraft: () => void;

    // Browse Filters
    browseFilters: BrowseFilters;
    updateBrowseFilters: (filters: Partial<BrowseFilters>) => void;
    resetBrowseFilters: () => void;
}

const defaultFilters: BrowseFilters = {
    selectedCategories: [],
    priceRange: null,
    location: null,
    sortBy: 'newest',
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // Auth state
            loggedInUser: null,
            login: (user) => set({ loggedInUser: user }),
            logout: () => set({ loggedInUser: null, currentTaskDraft: {} }),

            // Post Task Draft state
            currentTaskDraft: {},
            updateTaskDraft: (data) =>
                set((state) => ({
                    currentTaskDraft: { ...state.currentTaskDraft, ...data },
                })),
            clearTaskDraft: () => set({ currentTaskDraft: {} }),

            // Browse filters
            browseFilters: {
                selectedCategories: [],
                priceRange: null,
                location: null,
                sortBy: 'newest',
            },
            updateBrowseFilters: (filters) =>
                set((state) => ({
                    browseFilters: { ...state.browseFilters, ...filters },
                })),
            resetBrowseFilters: () =>
                set({
                    browseFilters: {
                        selectedCategories: [],
                        priceRange: null,
                        location: null,
                        sortBy: 'newest',
                    },
                }),
        }),
        {
            name: 'airmass-xpress-storage', // LocalStorage key
            partialize: (state) => ({
                loggedInUser: state.loggedInUser,
                // Don't persist filters or task draft
            }),
        }
    )
);
