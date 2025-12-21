import type { Task, Category, User, Offer, Conversation, Message } from '@/types';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Token management
const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
};

const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
    }
};

const setRefreshToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', token);
    }
};

import { useStore } from '@/store/useStore';

const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Clear Zustand store to prevent infinite loop on rehydration
        useStore.getState().logout();
    }
};

// API fetch wrapper with auth
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    console.log(`[API] ${options.method || 'GET'} ${endpoint} -> ${response.status}`);

    if (response.status === 401 && !endpoint.includes('/auth/')) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (refreshResponse.ok) {
                    const { access_token } = await refreshResponse.json();
                    setToken(access_token);

                    // Retry original request
                    headers['Authorization'] = `Bearer ${access_token}`;
                    const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                        ...options,
                        headers,
                    });
                    return retryResponse.json();
                } else {
                    // Refresh failed (e.g. refresh token expired)
                    clearTokens();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    throw new Error('Session expired');
                }
            } catch (error) {
                clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw error;
            }
        } else {
            // No refresh token available
            clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `HTTP ${response.status}: ${errorText}`);
        } catch (e: any) {
            // If JSON parse fails, throw the text or custom error
            if (e.message && !e.message.startsWith('HTTP')) {
                // It was a JSON parse error, so use the raw text
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            throw e;
        }
    }

    return response.json();
}

// Helper to handle Go zero-value dates
function safeDate(dateStr?: string): string | undefined {
    if (!dateStr || dateStr.startsWith('0001-01-01')) return undefined;
    return dateStr;
}

// Helper to map backend user to frontend User type
function mapBackendUser(data: any): User {
    if (!data) return data;
    return {
        ...data,
        isVerified: data.is_verified ?? data.isVerified,
        reviewCount: data.review_count ?? data.reviewCount,
        tasksCompleted: data.tasks_completed ?? data.tasksCompleted,
        memberSince: data.member_since ?? data.memberSince,
        lastActivityAt: safeDate(data.last_activity_at ?? data.lastActivityAt),
        avatar: data.avatar_url ?? data.avatar ?? data.profile_picture_url, // Map backend snake_case to frontend
        // Tasker specific mapping
        isTasker: data.is_tasker,
        role: data.is_tasker ? 'tasker' : 'user',
        taskerProfile: data.tasker_profile ? {
            ...data.tasker_profile,
            onboardingStep: data.tasker_profile.onboarding_step,
            professionIds: data.tasker_profile.profession_ids,
            profilePictureUrl: data.tasker_profile.profile_picture_url,
            idDocumentUrls: data.tasker_profile.id_document_urls,
            selfieUrl: data.tasker_profile.selfie_url,
            addressDocumentUrl: data.tasker_profile.address_document_url,
            portfolioUrls: data.tasker_profile.portfolio_urls,
            ecocashNumber: data.tasker_profile.ecocash_number,
            availability: data.tasker_profile.availability ? {
                monday: data.tasker_profile.availability.monday,
                tuesday: data.tasker_profile.availability.tuesday,
                wednesday: data.tasker_profile.availability.wednesday,
                thursday: data.tasker_profile.availability.thursday,
                friday: data.tasker_profile.availability.friday,
                saturday: data.tasker_profile.availability.saturday,
                sunday: data.tasker_profile.availability.sunday,
            } : undefined
        } : undefined
    };
}

// ============ AUTHENTICATION API ============

export async function registerUser(email: string, password: string, name: string, phone?: string, location?: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
    const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone, location }),
    });

    setToken(response.access_token);
    setRefreshToken(response.refresh_token);

    return {
        ...response,
        user: mapBackendUser(response.user)
    };
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
    try {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        setToken(response.access_token);
        setRefreshToken(response.refresh_token);

        return mapBackendUser(response.user);
    } catch (error) {
        console.error('Login failed:', error);
        return null;
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const user = await apiFetch('/auth/me');
        return mapBackendUser(user);
    } catch (error) {
        return null;
    }
}

export async function logoutUser(): Promise<void> {
    try {
        await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        clearTokens();
    }
}

// ============ TASKER API ============

export async function fetchProfessions(): Promise<any[]> {
    return await apiFetch('/professions');
}

export async function updateTaskerProfile(profileData: Partial<any>): Promise<any> {
    // Map frontend camelCase to backend snake_case
    const backendData: any = { ...profileData };

    if (profileData.onboardingStep) backendData.onboarding_step = profileData.onboardingStep;
    if (profileData.professionIds) backendData.profession_ids = profileData.professionIds;
    if (profileData.profilePictureUrl) backendData.profile_picture_url = profileData.profilePictureUrl;
    if (profileData.idDocumentUrls) backendData.id_document_urls = profileData.idDocumentUrls;
    if (profileData.selfieUrl) backendData.selfie_url = profileData.selfieUrl;
    if (profileData.addressDocumentUrl) backendData.address_document_url = profileData.addressDocumentUrl;
    if (profileData.portfolioUrls) backendData.portfolio_urls = profileData.portfolioUrls;
    if (profileData.ecocashNumber) backendData.ecocash_number = profileData.ecocashNumber;
    if (profileData.qualifications) backendData.qualifications = profileData.qualifications;

    if (profileData.availability) {
        backendData.availability = {
            monday: profileData.availability.monday,
            tuesday: profileData.availability.tuesday,
            wednesday: profileData.availability.wednesday,
            thursday: profileData.availability.thursday,
            friday: profileData.availability.friday,
            saturday: profileData.availability.saturday,
            sunday: profileData.availability.sunday,
        };
    }

    const response = await apiFetch('/tasker/profile', {
        method: 'POST',
        body: JSON.stringify(backendData)
    });

    return mapBackendUser(response.user);
}

export async function uploadTaskerFileMetadata(fileUrl: string, type: string): Promise<any> {
    const response = await apiFetch('/tasker/upload-metadata', {
        method: 'POST',
        body: JSON.stringify({ file_url: fileUrl, type })
    });

    return mapBackendUser(response.user);
}

// Temporary Admin helper
export async function approveTaskerProfile(email: string): Promise<void> {
    await apiFetch('/admin/approve-tasker', {
        method: 'POST',
        body: JSON.stringify({ email })
    });
}

// ============ INVENTORY API ============

export async function fetchMyInventory(): Promise<import('@/types').InventoryItem[]> {
    const items = await apiFetch('/inventory');
    // Map backend snake_case to frontend camelCase
    return items.map((item: any) => ({
        ...item,
        isAvailable: item.is_available,
        capacityId: item.capacity_id,
        withOperator: item.with_operator,
        operatorBundled: item.operator_bundled,
        hourlyRate: item.hourly_rate ? parseFloat(item.hourly_rate) : undefined,
        dailyRate: item.daily_rate ? parseFloat(item.daily_rate) : undefined,
        weeklyRate: item.weekly_rate ? parseFloat(item.weekly_rate) : undefined,
        deliveryFee: item.delivery_fee ? parseFloat(item.delivery_fee) : undefined,
        operatorFee: item.operator_fee ? parseFloat(item.operator_fee) : undefined,
        lat: item.lat,
        lng: item.lng,
        photos: item.photos?.map((p: string) => p.startsWith('http') ? p : `${API_BASE_URL.replace('/api/v1', '')}${p}`) || []
    }));
}

export async function createInventoryItem(item: Partial<import('@/types').InventoryItem>): Promise<import('@/types').InventoryItem> {
    const payload: Record<string, any> = {
        name: item.name,
        category: item.category,
        location: item.location,
        is_available: item.isAvailable,
        photos: item.photos, // Include photos in create payload
    };
    // V2 fields - map camelCase to snake_case
    if (item.capacityId) payload.capacity_id = item.capacityId;
    if (item.capacity) payload.capacity = item.capacity;
    if (item.withOperator !== undefined) payload.with_operator = item.withOperator;
    if (item.operatorBundled !== undefined) payload.operator_bundled = item.operatorBundled;
    if (item.hourlyRate) payload.hourly_rate = item.hourlyRate;
    if (item.dailyRate) payload.daily_rate = item.dailyRate;
    if (item.weeklyRate) payload.weekly_rate = item.weeklyRate;
    if (item.deliveryFee) payload.delivery_fee = item.deliveryFee;
    if (item.operatorFee) payload.operator_fee = item.operatorFee;
    if (item.lat) payload.lat = item.lat;
    if (item.lng) payload.lng = item.lng;

    return await apiFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateInventoryItem(id: string, item: Partial<import('@/types').InventoryItem>): Promise<import('@/types').InventoryItem> {
    const payload: Record<string, any> = {
        name: item.name,
        category: item.category,
        location: item.location,
        is_available: item.isAvailable,
        photos: item.photos, // Send photos if updating
    };
    // V2 fields - map camelCase to snake_case
    if (item.capacityId !== undefined) payload.capacity_id = item.capacityId;
    if (item.capacity) payload.capacity = item.capacity;
    if (item.withOperator !== undefined) payload.with_operator = item.withOperator;
    if (item.operatorBundled !== undefined) payload.operator_bundled = item.operatorBundled;
    if (item.hourlyRate !== undefined) payload.hourly_rate = item.hourlyRate;
    if (item.dailyRate !== undefined) payload.daily_rate = item.dailyRate;
    if (item.weeklyRate !== undefined) payload.weekly_rate = item.weeklyRate;
    if (item.deliveryFee !== undefined) payload.delivery_fee = item.deliveryFee;
    if (item.operatorFee !== undefined) payload.operator_fee = item.operatorFee;
    if (item.lat !== undefined) payload.lat = item.lat;
    if (item.lng !== undefined) payload.lng = item.lng;

    return await apiFetch(`/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function deleteInventoryItem(id: string): Promise<void> {
    await apiFetch(`/inventory/${id}`, {
        method: 'DELETE',
    });
}



export async function uploadInventoryImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/inventory/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed details:', response.status, errorText);
        throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    // Return full URL if backend returns relative (though Supabase returns full)
    return data.url.startsWith('http') ? data.url : `${API_BASE_URL.replace('/api/v1', '')}${data.url}`;
}

// ============ EQUIPMENT CAPACITIES API ============

export async function fetchEquipmentCapacities(): Promise<{ capacities: import('@/types').EquipmentCapacity[]; grouped: Record<string, import('@/types').EquipmentCapacity[]> }> {
    const data = await apiFetch('/equipment-capacities');
    // Map snake_case to camelCase
    const mapCapacity = (c: any): import('@/types').EquipmentCapacity => ({
        id: c.id,
        equipmentType: c.equipment_type,
        capacityCode: c.capacity_code,
        displayName: c.display_name,
        minWeightTons: c.min_weight_tons,
        maxWeightTons: c.max_weight_tons,
        sortOrder: c.sort_order,
    });

    return {
        capacities: data.capacities?.map(mapCapacity) || [],
        grouped: Object.fromEntries(
            Object.entries(data.grouped || {}).map(([key, caps]) => [
                key,
                (caps as any[]).map(mapCapacity)
            ])
        ),
    };
}

export async function fetchEquipmentCapacitiesByType(equipmentType: string): Promise<import('@/types').EquipmentCapacity[]> {
    const capacities = await apiFetch(`/equipment-capacities/${encodeURIComponent(equipmentType)}`);
    return capacities.map((c: any) => ({
        id: c.id,
        equipmentType: c.equipment_type,
        capacityCode: c.capacity_code,
        displayName: c.display_name,
        minWeightTons: c.min_weight_tons,
        maxWeightTons: c.max_weight_tons,
        sortOrder: c.sort_order,
    }));
}

export async function fetchEquipmentTypes(): Promise<string[]> {
    return await apiFetch('/equipment-types');
}

// ============ TASKS API ============

export async function fetchTasks(filters?: {
    categories?: string[];
    priceRange?: [number, number];
    location?: string;
    sortBy?: string;
    posterId?: string;
    offeredBy?: string;
    taskType?: string;
}): Promise<Task[]> {
    const params = new URLSearchParams();

    if (filters?.categories && filters.categories.length > 0) {
        params.append('category', filters.categories[0]); // Backend supports single category
    }
    if (filters?.location) {
        params.append('location', filters.location);
    }
    if (filters?.posterId) {
        params.append('poster_id', filters.posterId);
    }
    if (filters?.offeredBy) {
        params.append('offered_by', filters.offeredBy);
    }
    if (filters?.taskType) {
        params.append('task_type', filters.taskType);
    }
    if (filters?.sortBy) {
        const sortMap: Record<string, string> = {
            'price_low': 'budget asc',
            'price_high': 'budget desc',
            'newest': 'created_at desc',
        };
        params.append('sort', sortMap[filters.sortBy] || 'created_at desc');
    }

    const queryString = params.toString();
    const tasks = await apiFetch(`/tasks${queryString ? `?${queryString}` : ''}`);

    // Map backend snake_case to frontend camelCase
    return tasks.map((task: any) => ({
        ...task,
        posterId: task.poster_id, // Map backend snake_case to frontend
        timeOfDay: task.time_of_day,
        dateType: task.date_type,
        taskType: task.task_type,
        // Equipment-specific fields
        hireDurationType: task.hire_duration_type,
        estimatedHours: task.estimated_hours,
        estimatedDuration: task.estimated_duration,
        fuelIncluded: task.fuel_included,
        operatorPreference: task.operator_preference,
        requiredCapacityId: task.required_capacity_id,
        offerCount: task.offer_count,
        // Map attachment URLs to use backend base URL
        attachments: task.attachments?.map((att: any) => ({
            ...att,
            url: att.url?.startsWith('http') ? att.url : `${API_BASE_URL.replace('/api/v1', '')}${att.url}`
        })),
        images: task.attachments
            ?.filter((att: any) => att.type === 'image' || att.type?.startsWith('image/'))
            .map((att: any) => att.url?.startsWith('http') ? att.url : `${API_BASE_URL.replace('/api/v1', '')}${att.url}`) || []
    }));
}

export async function fetchActiveTaskerTasks(): Promise<Task | null> {
    const tasks = await apiFetch('/tasks/active');
    if (!tasks || tasks.length === 0) return null;
    return tasks[0]; // Return the first active task (assuming one at a time for now)
}

export async function fetchTaskById(id: string): Promise<Task | null> {
    try {
        const task = await apiFetch(`/tasks/${id}`);
        // Map backend snake_case to frontend camelCase
        return {
            ...task,
            timeOfDay: task.time_of_day,
            dateType: task.date_type,
            posterId: task.poster_id, // Map backend snake_case to frontend
            // Equipment-specific fields
            hireDurationType: task.hire_duration_type,
            estimatedHours: task.estimated_hours,
            operatorPreference: task.operator_preference,
            requiredCapacityId: task.required_capacity_id,
            // Map poster
            poster: task.poster ? mapBackendUser(task.poster) : undefined,
            // Map offers and their taskers
            offers: task.offers?.map((offer: any) => ({
                ...offer,
                tasker: offer.tasker ? mapBackendUser(offer.tasker) : undefined,
            })) || [],
            // Map accepted offer
            acceptedOffer: task.accepted_offer ? {
                id: task.accepted_offer.id,
                taskerId: task.accepted_offer.tasker_id,
                amount: task.accepted_offer.amount,
                conversationId: task.conversation_id,
                tasker: task.accepted_offer.tasker ? mapBackendUser(task.accepted_offer.tasker) : undefined,
            } : undefined,
            // Map attachment URLs to use backend base URL
            attachments: task.attachments?.map((att: any) => ({
                ...att,
                url: att.url?.startsWith('http') ? att.url : `${API_BASE_URL.replace('/api/v1', '')}${att.url}`
            })),
            images: task.attachments
                ?.filter((att: any) => att.type === 'image' || att.type?.startsWith('image/'))
                .map((att: any) => att.url?.startsWith('http') ? att.url : `${API_BASE_URL.replace('/api/v1', '')}${att.url}`) || []
        };
    } catch (error) {
        return null;
    }
}

export async function createTask(taskData: Partial<Task>): Promise<{ taskId: string }> {
    const payload: Record<string, any> = {
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        budget: taskData.budget,
        location: taskData.location,
        lat: taskData.lat,      // Store coordinates once, never geocode again!
        lng: taskData.lng,
        task_type: taskData.taskType,
        date_type: taskData.dateType,
        date: taskData.date,
        time_of_day: taskData.timeOfDay,
    };

    // V2 Equipment Fields
    if (taskData.hireDurationType) payload.hire_duration_type = taskData.hireDurationType;
    if (taskData.estimatedHours) payload.estimated_hours = taskData.estimatedHours;
    if (taskData.operatorPreference) payload.operator_preference = taskData.operatorPreference;
    if (taskData.requiredCapacityId) payload.required_capacity_id = taskData.requiredCapacityId;

    // Location V2
    if (taskData.city) payload.city = taskData.city;
    if (taskData.suburb) payload.suburb = taskData.suburb;
    if (taskData.addressDetails) payload.address_details = taskData.addressDetails;

    return await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function addTaskAttachments(taskId: string, attachments: { url: string; type: string; name: string }[]): Promise<void> {
    await apiFetch(`/tasks/${taskId}/attachments`, {
        method: 'PUT',
        body: JSON.stringify({ attachments }),
    });
}

// ============ CATEGORIES API ============

// Categories are still mock for now (can be hardcoded or moved to backend)
export async function fetchCategories(): Promise<Category[]> {
    return [
        { id: 'plumbing', name: 'Plumbing', slug: 'plumbing', icon: '🔧' },
        { id: 'electrical', name: 'Electrical Service', slug: 'electrical', icon: '⚡' },
        { id: 'painting', name: 'Painting', slug: 'painting', icon: '🎨' },
        { id: 'tiling', name: 'Tiling', slug: 'tiling', icon: '🔲' },
        { id: 'carpentry', name: 'Carpentry', slug: 'carpentry', icon: '🪚' },
        { id: 'building', name: 'Building Services', slug: 'building', icon: '🏗️' },
        { id: 'landscaping', name: 'Landscaping', slug: 'landscaping', icon: '🌳' },
        { id: 'solar', name: 'Solar Installations', slug: 'solar', icon: '☀️' },
        { id: 'mechanics', name: 'Mechanics', slug: 'mechanics', icon: '🔩' },
        { id: 'heavy_machinery', name: 'Heavy Machinery & Equipment', slug: 'heavy-machinery', icon: '🚜' },
        { id: 'other', name: 'Other', slug: 'other', icon: '📦' },
    ];
}

// ============ USERS API ============

export async function fetchUserProfile(id: string): Promise<User | null> {
    try {
        const data = await apiFetch(`/users/${id}`);
        return mapBackendUser(data);
    } catch (error) {
        return null;
    }
}

// ============ OFFERS API ============

export async function fetchOffersByTask(taskId: string): Promise<Offer[]> {
    try {
        const task = await fetchTaskById(taskId);
        // Backend returns offers with task details
        return (task as any)?.offers || [];
    } catch (error) {
        return [];
    }
}

export async function createOffer(offerData: Partial<Offer>): Promise<Offer> {
    const payload: Record<string, any> = {
        task_id: offerData.taskId,
        amount: offerData.amount,
        description: offerData.description,
        estimated_duration: offerData.estimatedDuration,
        availability: offerData.availability,
    };

    // V2 Equipment Quote Fields
    if (offerData.quoteType) payload.quote_type = offerData.quoteType;
    if (offerData.rateType) payload.rate_type = offerData.rateType;
    if (offerData.baseRate) payload.base_rate = offerData.baseRate;
    if (offerData.deliveryFee) payload.delivery_fee = offerData.deliveryFee;
    if (offerData.operatorFee) payload.operator_fee = offerData.operatorFee;
    if (offerData.includesOperator !== undefined) payload.includes_operator = offerData.includesOperator;
    if (offerData.inventoryId) payload.inventory_id = offerData.inventoryId;

    return await apiFetch('/offers', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function acceptOffer(offerId: string): Promise<any> {
    return await apiFetch(`/offers/${offerId}/accept`, {
        method: 'POST',
    });
}

// ============ MESSAGES API ============

export async function fetchConversations(userId: string): Promise<Conversation[]> {
    return await apiFetch('/conversations');
}

export async function fetchMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await apiFetch(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
    return await apiFetch(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
}

export async function markConversationAsRead(conversationId: string): Promise<any> {
    return await apiFetch(`/conversations/${conversationId}/read`, {
        method: 'POST',
    });
}

// ============ REVIEWS API ============

export async function createReview(data: {
    taskId: string;
    ratingCommunication: number;
    ratingTime: number;
    ratingProfessionalism: number;
    comment: string;
}): Promise<any> {
    return await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
            task_id: data.taskId,
            rating_communication: data.ratingCommunication,
            rating_time: data.ratingTime,
            rating_professionalism: data.ratingProfessionalism,
            comment: data.comment,
        }),
    });
}

export async function replyReview(reviewId: string, reply: string): Promise<any> {
    return await apiFetch(`/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply }),
    });
}

// ============ TASK COMPLETION API ============

export async function completeTask(taskId: string): Promise<{ invoice: any }> {
    return await apiFetch(`/tasks/${taskId}/complete`, {
        method: 'POST',
    });
}

// ============ QUESTIONS API ============

export async function fetchTaskQuestions(taskId: string): Promise<any[]> {
    const questions = await apiFetch(`/tasks/${taskId}/questions`);
    return questions.map((q: any) => ({
        ...q,
        id: q.id,
        taskId: q.task_id,
        userId: q.user_id,
        content: q.content,
        parentId: q.parent_id,
        images: q.images?.map((img: string) => img.startsWith('http') ? img : `${API_BASE_URL.replace('/api/v1', '')}${img.startsWith('/') ? '' : '/'}${img}`) || [],
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        user: q.user ? mapBackendUser(q.user) : undefined,
        children: q.children ? q.children.map((child: any) => mapBackendComment(child)) : []
    }));
}

// Helper to map comment recursively
function mapBackendComment(q: any): any {
    return {
        ...q,
        id: q.id,
        taskId: q.task_id,
        userId: q.user_id,
        content: q.content,
        parentId: q.parent_id,
        images: q.images?.map((img: string) => img.startsWith('http') ? img : `${API_BASE_URL.replace('/api/v1', '')}${img.startsWith('/') ? '' : '/'}${img}`) || [],
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        user: q.user ? mapBackendUser(q.user) : undefined,
        children: q.children ? q.children.map((child: any) => mapBackendComment(child)) : []
    };
}

export async function postQuestion(taskId: string, content: string, images: string[] = []): Promise<any> {
    return await apiFetch(`/tasks/${taskId}/questions`, {
        method: 'POST',
        body: JSON.stringify({ content, images }),
    });
}

export async function replyQuestion(questionId: string, content: string, images: string[] = []): Promise<any> {
    return await apiFetch(`/questions/${questionId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content, images }),
    });
}

// ============ NOTIFICATIONS API ============

export async function fetchNotifications(): Promise<any[]> {
    return await apiFetch('/notifications');
}

export async function markNotificationAsRead(notificationId: string): Promise<any> {
    return await apiFetch(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
    });
}

export async function markAllNotificationsAsRead(): Promise<any> {
    return await apiFetch('/notifications/read-all', {
        method: 'PATCH',
    });
}

// Export token management functions for use in components
export { getToken, setToken, clearTokens };
