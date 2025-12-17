import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function resizeImage(file: File, maxWidth = 1200, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    // If not an image, return original file
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
import { API_BASE_URL } from '@/lib/api';

// Helper function to safely extract avatar src from string, object, or User
export const getAvatarSrc = (input: any): string => {
  const DEFAULT_AVATAR = '/avatars/default.png';

  if (!input) return DEFAULT_AVATAR;

  let avatarUrl: string | undefined;

  // If it's already a string URL, use it
  if (typeof input === 'string' && input) {
    avatarUrl = input;
  } else if (input && typeof input === 'object') {
    // Check common avatar field names (for User objects and avatar data)
    avatarUrl =
      input.avatar ||           // User.avatar
      input.url ||
      input.src ||
      input.path ||
      input.file_path ||
      input.avatar_url ||
      input.avatarUrl ||
      input.image ||
      input.profileImage;
  }

  // Fallback to default image if no avatar found
  if (!avatarUrl || avatarUrl === '' || avatarUrl === 'null' || avatarUrl === 'undefined') {
    return DEFAULT_AVATAR;
  }

  // Handle various URL formats
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:') || avatarUrl.startsWith('/')) {
    // For absolute URLs or paths starting with /, return as-is
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }
    // For paths starting with /, check if it's a backend path or public path
    if (avatarUrl.startsWith('/avatars') || avatarUrl.startsWith('/uploads')) {
      const host = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
      return `${host}${avatarUrl}`;
    }
    return avatarUrl; // Public folder paths like /default.png
  }

  // Prepend backend host for relative paths
  const host = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${host}/${avatarUrl}`;
};

// Helper function to safely format dates
export const formatDate = (dateString: any): string => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (error) {
    return 'Recently';
  }
};

// Lightweight relative time formatter (minutes, hours, days, months)
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Just now';

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
};
