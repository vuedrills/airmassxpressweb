'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetcher } from "@/lib/api";
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Shield, ShieldAlert, User as UserIcon } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    is_tasker: boolean;
    is_verified: boolean;
    created_at: string;
    tasker_profile?: {
        status: string;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await fetcher('/admin/users');
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleVerify = async (userId: string, email: string) => {
        if (!confirm(`Are you sure you want to verify ${email}?`)) return;
        try {
            await fetcher('/admin/verify-user', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId })
            });
            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_verified: true } : u
            ));
        } catch (error) {
            alert("Failed to verify user");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-6">
                <Link href="/" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500">View and manage all registered users.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Users ({users.length})</CardTitle>
                        <Button variant="outline" onClick={loadData}>Refresh</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading users...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {user.is_tasker ? (
                                                    <Badge className="bg-blue-600 hover:bg-blue-700">
                                                        <Shield className="w-3 h-3 mr-1" /> Tasker
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        <UserIcon className="w-3 h-3 mr-1" /> Client
                                                    </Badge>
                                                )}
                                                {user.tasker_profile?.status === 'pending_review' && (
                                                    <Badge variant="outline" className="text-orange-500 border-orange-500">Pending</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_verified ? (
                                                <div className="flex items-center text-green-600 text-sm">
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <ShieldAlert className="w-4 h-4 mr-1" /> Unverified
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!user.is_verified && (
                                                <Button size="sm" variant="outline" onClick={() => handleVerify(user.id, user.email)}>
                                                    Verify
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
