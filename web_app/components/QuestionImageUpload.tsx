'use client';

import React, { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileUpload } from '@/components/FileUpload';
import { Loader2, X, FileText } from 'lucide-react';

interface QuestionImageUploadProps {
    pathPrefix: string; // e.g. "task_questions"
    onUploadComplete: (urls: string[]) => void;
    maxFiles?: number;
    value?: string[]; // Existing URLs
    label?: string;
    acceptedFileTypes?: string[];
}

export function QuestionImageUpload({
    pathPrefix,
    onUploadComplete,
    maxFiles = 3,
    value = [],
    label,
    acceptedFileTypes = ['image/*']
}: QuestionImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleFilesSelected = async (files: File[]) => {
        if (files.length === 0) return;
        setUploading(true);
        const uploadedUrls: string[] = [...value];

        try {
            for (const file of files) {
                // simple name sanitization
                const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                const storageRef = ref(storage, `${pathPrefix}/${filename}`);

                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

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
        return /\.(jpeg|jpg|png|gif|webp)$/i.test(url) || url.includes('alt=media');
    };

    return (
        <div className="space-y-4">
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            {/* Display existing/uploaded URLs with thumbnails */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {value.map((url, idx) => (
                        <div key={idx} className="relative group border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center w-20 h-20 shadow-sm">
                            {isImage(url) ? (
                                <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center p-2 text-center overflow-hidden w-full">
                                    <FileText className="w-6 h-6 text-gray-400 mb-1 flex-shrink-0" />
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
                        </div>
                    ))}
                </div>
            )}

            {uploading ? (
                <div className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg h-20 bg-gray-50">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                </div>
            ) : (
                <FileUpload
                    onFilesSelected={handleFilesSelected}
                    maxFiles={maxFiles - value.length}
                    acceptedFileTypes={acceptedFileTypes}
                    dropzoneLabel={value.length > 0 ? "+" : "Attach Photos"}
                />
            )}
        </div>
    );
}
