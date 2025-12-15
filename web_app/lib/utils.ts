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

// Helper function to safely extract avatar src from string or object
export const getAvatarSrc = (avatar: any): string | undefined => {
  // If it's a string, use it directly
  let avatarUrl: string | undefined;

  if (typeof avatar === 'string' && avatar) {
    avatarUrl = avatar;
  } else if (avatar && typeof avatar === 'object') {
    avatarUrl = (avatar as any).url || (avatar as any).src || (avatar as any).path || (avatar as any).file_path || (avatar as any).avatar_url;
  }

  // Fallback to default image if no avatar found
  if (!avatarUrl) {
    return '/default.png';
  }

  if (avatarUrl) {
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }
    // Prepend backend host if it's a relative path from backend
    // Assuming backend is at localhost:8080/api/v1 -> localhost:8080
    // We strip /api/v1
    const host = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${host}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
  }

  return undefined;
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
