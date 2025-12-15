'use client';

import { useState } from 'react';

interface ProfileAvatarProps {
    src: string;
    alt: string;
    className?: string;
}

export function ProfileAvatar({ src, alt, className = "" }: ProfileAvatarProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => setImgSrc('/avatars/user.png')}
        />
    );
}
