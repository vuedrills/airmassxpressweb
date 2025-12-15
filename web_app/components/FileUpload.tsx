'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
    files?: File[];
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    acceptedFileTypes?: string[];
    dropzoneLabel?: string;
}

export function FileUpload({
    files = [],
    onFilesSelected,
    maxFiles = 5,
    acceptedFileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    dropzoneLabel = "Click to upload images or documents"
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            const totalFiles = files.length + newFiles.length;

            if (totalFiles > maxFiles) {
                alert(`You can only upload a maximum of ${maxFiles} files.`);
                return;
            }

            const updatedFiles = [...files, ...newFiles];
            onFilesSelected(updatedFiles);

            // Reset input so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_: File, i: number) => i !== index);
        onFilesSelected(updatedFiles);
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon className="w-5 h-5 text-blue-500" />;
        }
        return <FileText className="w-5 h-5 text-orange-500" />;
    };

    return (
        <div className="w-full">
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept={acceptedFileTypes.join(',')}
                    onChange={handleFileSelect}
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                    {dropzoneLabel}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, PDF, DOC (Max {maxFiles} files)
                </p>
            </div>

            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file: File, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(file)}
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
