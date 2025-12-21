'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fetcher, setToken } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Using existing backend login endpoint
            const data = await fetcher('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // In a real app, verify role here. 
            // For now, allow any user but check if they have admin flag in future.
            setToken(data.access_token);
            router.push('/');
        } catch (err: any) {
            setError('Invalid credentials or server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Airmass Admin</CardTitle>
                    <CardDescription>Login to manage the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@airmass.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign In'}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Development
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                                // DEV BYPASS: Backend admin routes are public in dev mode,
                                // so we just need a token to satisfy AuthGuard.
                                setToken('dev-bypass-token');
                                router.push('/');
                            }}
                        >
                            <span className="mr-2">⚡</span> Quick Access (Dev Bypass)
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
