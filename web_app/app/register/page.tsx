'use client';

import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
                <div className="w-full max-w-md px-4">
                    <div className="bg-white rounded-lg border p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                            <p className="text-gray-600">Join Airmass Xpress today</p>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <Input type="text" placeholder="John Doe" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <Input type="email" placeholder="your@email.com" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <Input type="password" placeholder="••••••••" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                                <Input type="password" placeholder="••••••••" required />
                            </div>

                            <Button type="submit" className="w-full">
                                Sign Up
                            </Button>
                        </form>

                        <div className="mt-6">
                            <Button variant="outline" className="w-full">
                                Continue with Google
                            </Button>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-600">Already have an account? </span>
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Log In
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
