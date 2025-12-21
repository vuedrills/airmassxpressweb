'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/api";
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PendingTasker {
    user: {
        id: string;
        name: string;
        email: string;
        location: string;
        avatar_url: string;
    };
    profile: {
        status: string;
        profession_ids: string[];
        created_at: string;
    };
}

export default function VerificationPage() {
    const [pending, setPending] = useState<PendingTasker[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await fetcher('/admin/taskers/pending');
            setPending(data || []);
        } catch (error) {
            console.error('Failed to load pending taskers', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (email: string) => {
        try {
            await fetcher('/admin/approve-tasker', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            // Remove from list or refresh
            setPending(prev => prev.filter(p => p.user.email !== email));
            // toast.success("Tasker approved!"); // Install sonner if needed
            alert("Tasker approved successfully");
        } catch (error) {
            alert("Failed to approve tasker");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-6">
                <Link href="/" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Tasker Verification Queue</h1>
                <p className="text-gray-500">Review and approve tasker applications.</p>
            </div>

            {loading ? (
                <div>Loading queue...</div>
            ) : pending.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                        <h3 className="text-lg font-medium">All Caught Up!</h3>
                        <p>No pending tasker applications found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {pending.map((item) => (
                        <Card key={item.user.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                        {item.user.avatar_url && (
                                            <img src={item.user.avatar_url} alt={item.user.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle>{item.user.name}</CardTitle>
                                        <CardDescription>{item.user.email} • {item.user.location}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    {item.profile.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-2">Professions Requested:</h4>
                                    <div className="flex gap-2">
                                        {item.profile.profession_ids?.map((prof) => (
                                            <Badge key={prof} variant="outline">{prof}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Applied on: {new Date(item.profile.created_at).toLocaleDateString()}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 bg-gray-50/50 p-4 border-t">
                                <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(item.user.email)}>
                                    <CheckCircle className="w-4 h-4 mr-2" /> Approve Application
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
