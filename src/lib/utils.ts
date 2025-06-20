import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 안전한 이미지 URL 처리 함수
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '/images/placeholder.svg'; // 기본 플레이스홀더 이미지
  }

  // 이미 완전한 URL인 경우 (http:// 또는 https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // data: URL인 경우 (base64 이미지 등)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // blob: URL인 경우
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // 절대 경로인 경우 (/)
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // 상대 경로인 경우 public/images 디렉토리로 변환
  if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
    // 상대 경로를 절대 경로로 변환
    const cleanPath = imagePath.replace(/^\.\.?\//, '');
    return `/images/${cleanPath}`;
  }

  // 기타 경우는 모두 images 디렉토리로 처리
  return `/images/${imagePath}`;
}

// 이미지 에러 핸들링 함수
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.src !== '/images/placeholder.svg') {
    img.src = '/images/placeholder.svg';
  }
}

// 파일 크기를 사람이 읽기 쉬운 형태로 변환
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// 날짜 포맷팅 함수
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

// 전화번호 포맷 함수
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
}
