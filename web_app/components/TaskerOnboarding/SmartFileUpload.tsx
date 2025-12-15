'use client';

import React, { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileUpload } from '@/components/FileUpload';
import { Loader2, X, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadTaskerFileMetadata } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface SmartFileUploadProps {
    path: string; // Storage path prefix, e.g., "tasker_verification/userId"
    type: 'id_document' | 'selfie' | 'portfolio' | 'profile_picture' | 'qualification';
    onUploadComplete: (urls: string[]) => void;
    maxFiles?: number;
    value?: string[]; // Existing URLs
    label?: string;
    acceptedFileTypes?: string[];
}

export function SmartFileUpload({
    path,
    type,
    onUploadComplete,
    maxFiles = 1,
    value = [],
    label,
    acceptedFileTypes
}: SmartFileUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleFilesSelected = async (files: File[]) => {
        if (files.length === 0) return;
        setUploading(true);
        const uploadedUrls: string[] = [...value];

        try {
            for (const file of files) {
                // simple name sanitization
                const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                const storageRef = ref(storage, `${path}/${filename}`);

                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                // Sync with backend metadata
                await uploadTaskerFileMetadata(url, type);

                uploadedUrls.push(url);
            }
            onUploadComplete(uploadedUrls);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (index: number) => {
        const newUrls = value.filter((_, i) => i !== index);
        onUploadComplete(newUrls);
    };

    const isImage = (url: string) => {
        return /\.(jpeg|jpg|png|gif|webp)$/i.test(url) || url.includes('alt=media'); // Basic check, Firebase URLs often have alt=media
    };

    const getFileName = (url: string) => {
        try {
            // decipher filename from firebase url if possible, else generic
            const decoded = decodeURIComponent(url);
            const parts = decoded.split('/');
            const lastPart = parts[parts.length - 1];
            return lastPart.split('?')[0]; // remove query params
        } catch (e) {
            return 'Uploaded File';
        }
    };

    return (
        <div className="space-y-4">
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            {/* Display existing/uploaded URLs with thumbnails */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {value.map((url, idx) => (
                        <div key={idx} className="relative group border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center aspect-square shadow-sm">
                            {isImage(url) ? (
                                <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center p-2 text-center overflow-hidden w-full">
                                    <FileText className="w-6 h-6 text-gray-400 mb-1 flex-shrink-0" />
                                    <span className="text-[10px] text-gray-500 truncate w-full px-1">{getFileName(url)}</span>
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveFile(idx);
                                }}
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-20"
                                title="Remove file"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {!isImage(url) && (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" title="View file" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {uploading ? (
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg h-24 bg-gray-50">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                </div>
            ) : (
                <div className="transform scale-100 origin-top-left">
                    <FileUpload
                        onFilesSelected={handleFilesSelected}
                        maxFiles={maxFiles - value.length}
                        acceptedFileTypes={acceptedFileTypes}
                        dropzoneLabel={value.length > 0 ? "+" : "Upload"}
                    // Attempting to make it smaller via CSS in parent or props if supported
                    />
                </div>
            )}
        </div>
    );
}
