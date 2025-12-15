'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, TaskerProfile, Qualification } from '@/types';
import { updateTaskerProfile, getCurrentUser, fetchProfessions } from '@/lib/api';
import { SmartFileUpload } from '@/components/TaskerOnboarding/SmartFileUpload';
import { Loader2, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { GoogleMapsLoader } from '@/components/GoogleMapsLoader';

export default function EditProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // Form State
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);

    // Qualification Input State
    const [qualName, setQualName] = useState('');
    const [qualIssuer, setQualIssuer] = useState('');
    const [qualDate, setQualDate] = useState('');
    const [qualUrl, setQualUrl] = useState('');

    // Profession State
    const [professionIds, setProfessionIds] = useState<string[]>([]);
    const [allProfessions, setAllProfessions] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [currentUser, professions] = await Promise.all([
                    getCurrentUser(),
                    fetchProfessions()
                ]);

                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                setUser(currentUser);
                setAllProfessions(professions);

                // Initialize Form
                const taskerProfile = currentUser.taskerProfile || {} as TaskerProfile;
                setBio(taskerProfile.bio || currentUser.bio || '');
                setLocation(currentUser.location || '');
                setProfilePictureUrl(taskerProfile.profilePictureUrl || currentUser.avatar || '');
                setPortfolioUrls(taskerProfile.portfolioUrls || []);
                setQualifications(taskerProfile.qualifications || []);
                setProfessionIds(taskerProfile.professionIds || []);
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Failed to load profile data");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [router]);

    const handleToggleProfession = (id: string) => {
        setProfessionIds(prev =>
            prev.includes(id)
                ? prev.filter(pId => pId !== id)
                : [...prev, id]
        );
    };

    const handleAddQualification = () => {
        if (!qualName || !qualIssuer || !qualDate) return;
        setQualifications([...qualifications, {
            name: qualName,
            issuer: qualIssuer,
            date: qualDate,
            url: qualUrl
        }]);
        setQualName('');
        setQualIssuer('');
        setQualDate('');
        setQualUrl('');
    };

    const handleRemoveQualification = (index: number) => {
        setQualifications(qualifications.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateTaskerProfile({
                bio,
                location,
                profilePictureUrl,
                portfolioUrls,
                qualifications,
                professionIds
            });

            toast.success("Profile updated successfully");
            router.push(`/profile/${user.id}`); // Redirect back to profile
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    const profilePicValue = profilePictureUrl ? [profilePictureUrl] : [];

    return (
        <GoogleMapsLoader>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-bold text-[#1a2847]">Edit Profile</h1>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-[#1a2847] hover:bg-[#2a3c63] text-white font-bold shadow-lg shadow-blue-900/10"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Identity & Bio */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                                <h3 className="font-bold text-xl text-[#1a2847]">Identity</h3>

                                <div className="space-y-3">
                                    <Label className="text-base">Profile Picture</Label>
                                    <SmartFileUpload
                                        path={`profile_pictures/${user.id}`}
                                        type="profile_picture"
                                        value={profilePicValue}
                                        onUploadComplete={(urls) => setProfilePictureUrl(urls[0] || '')}
                                        maxFiles={1}
                                        acceptedFileTypes={['image/*']}
                                        label=""
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base">Display Name</Label>
                                    <Input value={user.name} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200" />
                                    <p className="text-xs text-muted-foreground">Contact support to change name.</p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                                <h3 className="font-bold text-xl text-[#1a2847]">Details</h3>

                                <div className="space-y-3">
                                    <Label className="text-base">About</Label>
                                    <Textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={6}
                                        placeholder="Tell clients about your experience and skills..."
                                        className="resize-none text-base"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base">Location</Label>
                                    <LocationAutocomplete
                                        value={location}
                                        onChange={setLocation}
                                        placeholder="Enter your city or area"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            {/* Professions Selection */}
                            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                                <h3 className="font-bold text-xl text-[#1a2847]">Professions</h3>
                                <p className="text-sm text-gray-500">Select the services you offer.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {allProfessions.map((prof) => {
                                        const isSelected = professionIds.includes(prof.id);
                                        return (
                                            <div
                                                key={prof.id}
                                                onClick={() => handleToggleProfession(prof.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="font-medium text-sm text-gray-900">{prof.name}</span>
                                                {isSelected && <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Portfolio & Qualifications */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                                <h3 className="font-bold text-xl text-[#1a2847]">Portfolio</h3>
                                <SmartFileUpload
                                    path={`tasker_portfolio/${user.id}`}
                                    type="portfolio"
                                    value={portfolioUrls}
                                    onUploadComplete={setPortfolioUrls}
                                    maxFiles={10}
                                    acceptedFileTypes={['image/*']}
                                />
                                <p className="text-sm text-gray-500">Upload up to 10 images of your best work.</p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                                <h3 className="font-bold text-xl text-[#1a2847]">Qualifications</h3>

                                {/* Existing Qualifications List */}
                                <div className="space-y-3 mb-6">
                                    {qualifications.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">No qualifications added yet.</p>
                                    ) : (
                                        qualifications.map((qual, idx) => (
                                            <div key={idx} className="flex justify-between items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100 group transition-all hover:bg-blue-50">
                                                <div className="flex-1">
                                                    <div className="font-bold text-[#1a2847]">{qual.name}</div>
                                                    <div className="text-sm text-gray-600 mb-1">{qual.issuer} • {qual.date}</div>
                                                    {qual.url && (
                                                        <a href={qual.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                            View Certificate
                                                        </a>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveQualification(idx)}
                                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add New Qualification Form */}
                                <div className="border-t pt-6 space-y-4">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Add New Qualification</Label>
                                    <Input
                                        value={qualName}
                                        onChange={e => setQualName(e.target.value)}
                                        placeholder="Qualification Name (e.g. Certified Electrician)"
                                        className="h-11"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            value={qualIssuer}
                                            onChange={e => setQualIssuer(e.target.value)}
                                            placeholder="Issuer/Institution"
                                            className="h-11"
                                        />
                                        <Input
                                            type="date"
                                            value={qualDate}
                                            onChange={e => setQualDate(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Label className="text-sm mb-2 block">Upload Certificate (Optional)</Label>
                                        <CertificateUploader onUpload={(url) => setQualUrl(url)} />
                                    </div>

                                    <Button
                                        onClick={handleAddQualification}
                                        disabled={!qualName || !qualIssuer || !qualDate}
                                        className="w-full bg-[#1a2847] hover:bg-[#2a3c63] text-white h-11"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Qualification
                                    </Button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleMapsLoader>
    );
}

// Mini component for upload
function CertificateUploader({ onUpload }: { onUpload: (url: string) => void }) {
    const [urls, setUrls] = useState<string[]>([]);

    const handleComplete = (newUrls: string[]) => {
        setUrls(newUrls);
        if (newUrls.length > 0) {
            onUpload(newUrls[0]);
        } else {
            onUpload('');
        }
    };

    return (
        <SmartFileUpload
            path="tasker_qualifications"
            type="qualification"
            value={urls}
            onUploadComplete={handleComplete}
            maxFiles={1}
            acceptedFileTypes={['image/*', 'application/pdf']}
            label=""
        />
    );
}
