
const API_BASE = 'http://localhost:8080/api/v1';

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('admin_token');
    }
    return null;
};

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', token);
    }
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
    }
};

const MOCK_DATA: Record<string, any> = {
    '/auth/login': { access_token: 'mock_jwt_token' },
    '/admin/users': [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', is_tasker: false, is_verified: true, created_at: new Date().toISOString() },
        { id: '2', name: 'Tasker Tim', email: 'tim@example.com', role: 'user', is_tasker: true, is_verified: false, tasker_profile: { status: 'pending_review' }, created_at: new Date().toISOString() }
    ],
    '/admin/taskers/pending': [
        {
            user: { id: '2', name: 'Tasker Tim', email: 'tim@example.com', location: 'Harare', avatar_url: '' },
            profile: { status: 'pending_review', profession_ids: ['plumber'], created_at: new Date().toISOString() }
        }
    ]
};

export async function fetcher(endpoint: string, options: RequestInit = {}) {
    const token = getToken();

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });

        if (res.status === 401) {
            logout();
            throw new Error('Unauthorized');
        }

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'API Error');
        }

        return res.json();
    } catch (error) {
        console.error(`API Request to ${endpoint} failed`, error);
        throw error;
    }
}
