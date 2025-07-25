// 사용자 피드백 및 오류 메시지 관리
// import { toast } from 'sonner'; // 임시로 주석 처리

// 임시 toast 대체 함수
const toast = {
  error: (title: string, options?: any) => {
    console.error(`[ERROR] ${title}`, options?.description || '');
  },
  success: (message: string, options?: any) => {
    console.log(`[SUCCESS] ${message}`, options?.description || '');
  },
  info: (title: string, options?: any) => {
    console.info(`[INFO] ${title}`, options?.description || '');
  },
  loading: (message: string, options?: any) => {
    console.log(`[LOADING] ${message}`);
    return { id: Date.now() };
  },
  dismiss: (id?: any) => {
    console.log('[TOAST] Dismissed');
  }
};

// 오류 타입 정의
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  PERMISSION = 'permission',
  FILE_PROCESSING = 'file_processing',
  SEARCH = 'search',
  SYSTEM = 'system'
}

export interface UserFriendlyError {
  title: string;
  message: string;
  category: ErrorCategory;
  actionable: boolean;
  actions?: ErrorAction[];
  helpUrl?: string;
}

export interface ErrorAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

// 사용자 친화적 오류 메시지 매핑
const ERROR_MESSAGES: Record<string, UserFriendlyError> = {
  // 파일 업로드 관련
  'FILE_TOO_LARGE': {
    title: '파일 크기 초과',
    message: '업로드하려는 파일이 너무 큽니다. 파일을 분할하거나 압축해서 다시 시도해주세요.',
    category: ErrorCategory.FILE_PROCESSING,
    actionable: true,
    actions: [
      {
        label: '지원되는 파일 형식 확인',
        action: () => window.open('/help/file-formats', '_blank')
      }
    ]
  },
  
  'UNSUPPORTED_FILE_TYPE': {
    title: '지원되지 않는 파일 형식',
    message: '현재 PDF, TXT, MD, DOCX, HTML 파일만 지원됩니다. 파일을 변환한 후 다시 시도해주세요.',
    category: ErrorCategory.VALIDATION,
    actionable: true,
    actions: [
      {
        label: '지원 형식 보기',
        action: () => showSupportedFormats()
      }
    ]
  },
  
  'BUCKET_NOT_FOUND': {
    title: '스토리지 설정 오류',
    message: '파일 저장소가 올바르게 설정되지 않았습니다. 관리자에게 문의해주세요.',
    category: ErrorCategory.SYSTEM,
    actionable: false,
    helpUrl: '/help/storage-setup'
  },
  
  'TEXT_EXTRACTION_FAILED': {
    title: '텍스트 추출 실패',
    message: '파일에서 텍스트를 추출할 수 없습니다. 파일이 손상되었거나 보호되어 있을 수 있습니다.',
    category: ErrorCategory.FILE_PROCESSING,
    actionable: true,
    actions: [
      {
        label: '다른 파일로 시도',
        action: () => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
      }
    ]
  },
  
  // 검색 관련
  'SEARCH_FAILED': {
    title: '검색 실패',
    message: '검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    category: ErrorCategory.SEARCH,
    actionable: true,
    actions: [
      {
        label: '다시 검색',
        action: () => window.location.reload(),
        primary: true
      }
    ]
  },
  
  'NO_SEARCH_RESULTS': {
    title: '검색 결과 없음',
    message: '검색 조건에 맞는 결과를 찾을 수 없습니다. 다른 키워드로 시도해보세요.',
    category: ErrorCategory.SEARCH,
    actionable: true,
    actions: [
      {
        label: '검색 팁 보기',
        action: () => showSearchTips()
      }
    ]
  },
  
  // 권한 관련
  'INSUFFICIENT_PERMISSIONS': {
    title: '권한 부족',
    message: '이 작업을 수행할 권한이 없습니다. 관리자에게 문의해주세요.',
    category: ErrorCategory.PERMISSION,
    actionable: false
  },
  
  'UNAUTHENTICATED': {
    title: '로그인 필요',
    message: '이 기능을 사용하려면 로그인이 필요합니다.',
    category: ErrorCategory.PERMISSION,
    actionable: true,
    actions: [
      {
        label: '로그인',
        action: () => window.location.href = '/auth',
        primary: true
      }
    ]
  },
  
  // 네트워크 관련
  'NETWORK_ERROR': {
    title: '연결 오류',
    message: '네트워크 연결을 확인하고 다시 시도해주세요.',
    category: ErrorCategory.NETWORK,
    actionable: true,
    actions: [
      {
        label: '다시 시도',
        action: () => window.location.reload(),
        primary: true
      }
    ]
  },
  
  // 시스템 관련
  'SYSTEM_ERROR': {
    title: '시스템 오류',
    message: '일시적인 시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    category: ErrorCategory.SYSTEM,
    actionable: true,
    actions: [
      {
        label: '새로고침',
        action: () => window.location.reload()
      }
    ]
  }
};

// 진행률 메시지
export const PROGRESS_MESSAGES = {
  UPLOADING: '파일을 업로드하는 중...',
  PROCESSING: '파일을 처리하는 중...',
  EXTRACTING_TEXT: '텍스트를 추출하는 중...',
  GENERATING_VECTORS: '벡터를 생성하는 중...',
  SAVING: '저장하는 중...',
  SEARCHING: '검색하는 중...',
  COMPLETED: '완료되었습니다!'
};

// 성공 메시지
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: '파일이 성공적으로 업로드되었습니다.',
  COLLECTION_CREATED: '컬렉션이 생성되었습니다.',
  COLLECTION_UPDATED: '컬렉션이 업데이트되었습니다.',
  COLLECTION_DELETED: '컬렉션이 삭제되었습니다.',
  DOCUMENT_PROCESSED: '문서 처리가 완료되었습니다.',
  SEARCH_COMPLETED: '검색이 완료되었습니다.'
};

// 사용자 친화적 오류 처리
export const handleUserError = (error: unknown, fallbackMessage?: string): void => {
  let userError: UserFriendlyError;
  
  if (error instanceof Error) {
    // 오류 코드나 메시지에서 매핑된 오류 찾기
    const errorCode = extractErrorCode(error.message);
    userError = ERROR_MESSAGES[errorCode] || createGenericError(error.message, fallbackMessage);
  } else if (typeof error === 'string') {
    const errorCode = extractErrorCode(error);
    userError = ERROR_MESSAGES[errorCode] || createGenericError(error, fallbackMessage);
  } else {
    userError = createGenericError('알 수 없는 오류가 발생했습니다.', fallbackMessage);
  }
  
  showUserError(userError);
};

// 오류 코드 추출
const extractErrorCode = (message: string): string => {
  // 일반적인 오류 패턴 매칭
  if (message.includes('파일 크기') || message.includes('too large')) {
    return 'FILE_TOO_LARGE';
  }
  if (message.includes('지원되지 않는') || message.includes('unsupported')) {
    return 'UNSUPPORTED_FILE_TYPE';
  }
  if (message.includes('버킷') || message.includes('bucket')) {
    return 'BUCKET_NOT_FOUND';
  }
  if (message.includes('텍스트 추출') || message.includes('text extraction')) {
    return 'TEXT_EXTRACTION_FAILED';
  }
  if (message.includes('검색') || message.includes('search')) {
    return 'SEARCH_FAILED';
  }
  if (message.includes('권한') || message.includes('permission')) {
    return 'INSUFFICIENT_PERMISSIONS';
  }
  if (message.includes('인증') || message.includes('auth')) {
    return 'UNAUTHENTICATED';
  }
  if (message.includes('네트워크') || message.includes('network')) {
    return 'NETWORK_ERROR';
  }
  
  return 'SYSTEM_ERROR';
};

// 일반적인 오류 생성
const createGenericError = (message: string, fallbackMessage?: string): UserFriendlyError => ({
  title: '오류 발생',
  message: fallbackMessage || message || '알 수 없는 오류가 발생했습니다.',
  category: ErrorCategory.SYSTEM,
  actionable: true,
  actions: [
    {
      label: '다시 시도',
      action: () => window.location.reload()
    }
  ]
});

// 사용자 오류 표시
const showUserError = (error: UserFriendlyError): void => {
  toast.error(error.title, {
    description: error.message,
    duration: error.actionable ? 10000 : 5000,
    action: error.actions?.[0] ? {
      label: error.actions[0].label,
      onClick: error.actions[0].action
    } : undefined
  });
  
  // 접근성을 위한 스크린 리더 알림
  announceToScreenReader(`오류: ${error.title}. ${error.message}`);
};

// 성공 메시지 표시
export const showSuccessMessage = (message: string, description?: string): void => {
  toast.success(message, {
    description,
    duration: 3000
  });
  
  announceToScreenReader(`성공: ${message}`);
};

// 진행률 메시지 표시
export const showProgressMessage = (message: string, progress?: number): void => {
  const progressText = progress ? ` (${Math.round(progress)}%)` : '';
  
  toast.loading(`${message}${progressText}`, {
    duration: Infinity
  });
};

// 진행률 메시지 업데이트
export const updateProgressMessage = (message: string, progress?: number): void => {
  toast.dismiss();
  showProgressMessage(message, progress);
};

// 진행률 메시지 완료
export const completeProgressMessage = (message: string = '완료되었습니다!'): void => {
  toast.dismiss();
  showSuccessMessage(message);
};

// 스크린 리더 알림
const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// 도움말 함수들
const showSupportedFormats = (): void => {
  const formats = [
    'PDF (.pdf) - 최대 55MB',
    'Text (.txt) - 최대 55MB', 
    'Markdown (.md) - 최대 55MB',
    'Word (.docx) - 최대 55MB',
    'HTML (.html) - 최대 55MB'
  ];
  
  toast.info('지원되는 파일 형식', {
    description: formats.join('\n'),
    duration: 8000
  });
};

const showSearchTips = (): void => {
  const tips = [
    '구체적인 키워드 사용',
    '여러 단어 조합 시도',
    '동의어나 유사어 활용',
    '검색 필터 활용'
  ];
  
  toast.info('검색 팁', {
    description: tips.join('\n'),
    duration: 8000
  });
};

// 사용자 피드백 수집
export const collectUserFeedback = (
  action: string,
  success: boolean,
  details?: Record<string, any>
): void => {
  // 사용자 행동 로깅 (개인정보 제외)
  console.log('User Feedback:', {
    action,
    success,
    timestamp: new Date().toISOString(),
    details: details ? Object.keys(details) : undefined // 키만 로깅
  });
  
  // 실제 구현에서는 분석 서비스로 전송
  // analytics.track(action, { success, ...details });
};

// 접근성 개선을 위한 키보드 네비게이션 헬퍼
export const enhanceKeyboardNavigation = (): void => {
  // ESC 키로 모달/토스트 닫기
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toast.dismiss();
    }
  });
  
  // 포커스 트랩 관리
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const focusable = modal.querySelectorAll(focusableElements);
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  });
};

// 초기화 함수
export const initializeUserFeedback = (): void => {
  enhanceKeyboardNavigation();
  
  // 전역 오류 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleUserError(event.reason, '예상치 못한 오류가 발생했습니다.');
  });
  
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    handleUserError(event.error, '페이지 로드 중 오류가 발생했습니다.');
  });
};