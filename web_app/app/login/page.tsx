'use client';

import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { authenticateUser } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = await authenticateUser(email, password);
            if (user) {
                login(user);
                router.push('/dashboard');
            } else {
                alert('Invalid credentials. Try: demo@airmassxpress.com');
            }
        } catch (error) {
            alert('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = async (email: string, password: string) => {
        setEmail(email);
        setPassword(password);
        setIsLoading(true);

        try {
            const user = await authenticateUser(email, password);
            if (user) {
                login(user);
                router.push('/dashboard');
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            alert('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
                <div className="w-full max-w-md px-4">
                    <div className="bg-white rounded-lg border p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-gray-600">Log in to your Airmass Xpress account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Log In'}
                            </Button>
                        </form>

                        {/* Quick Login Buttons */}
                        <div className="mt-4 space-y-2">
                            <p className="text-xs text-gray-500 text-center mb-2">Quick Login (Dev):</p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-sm"
                                onClick={() => quickLogin('reefai@gmail.com', '12345678')}
                                disabled={isLoading}
                            >
                                Login as reefai@gmail.com
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-sm"
                                onClick={() => quickLogin('ju@afds.om', '12345678')}
                                disabled={isLoading}
                            >
                                Login as ju@afds.om
                            </Button>
                        </div>

                        <div className="mt-6">
                            <Button variant="outline" className="w-full">
                                Continue with Google
                            </Button>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                Sign Up
                            </Link>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                            <p className="font-semibold mb-1">Demo Account:</p>
                            <p className="text-gray-600">Email: demo@airmassxpress.com</p>
                            <p className="text-gray-600">Password: (any password)</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
