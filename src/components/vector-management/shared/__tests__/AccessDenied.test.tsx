import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AccessDenied from '../AccessDenied';
import { useAuth } from '@/contexts/AuthContext';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AccessDenied', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders access denied message correctly', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    renderWithRouter(<AccessDenied />);
    
    expect(screen.getByText('접근 권한 없음')).toBeInTheDocument();
    expect(screen.getByText('이 페이지에 접근할 권한이 없습니다.')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated and showLoginButton is true', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    renderWithRouter(<AccessDenied showLoginButton={true} />);
    
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('shows admin permission message when user is authenticated but not admin', () => {
    (useAuth as any).mockReturnValue({ user: { id: '123', email: 'user@test.com' } });
    
    renderWithRouter(<AccessDenied />);
    
    expect(screen.getByText('관리자 권한이 필요합니다')).toBeInTheDocument();
    expect(screen.getByText('벡터 데이터베이스 관리 기능은 관리자만 사용할 수 있습니다.')).toBeInTheDocument();
  });

  it('navigates to home when "메인 페이지로 돌아가기" button is clicked', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    renderWithRouter(<AccessDenied />);
    
    const homeButton = screen.getByText('메인 페이지로 돌아가기');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('navigates to auth page when login button is clicked', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    renderWithRouter(<AccessDenied showLoginButton={true} />);
    
    const loginButton = screen.getByText('로그인');
    fireEvent.click(loginButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/auth', {
      state: {
        returnUrl: '/',
        message: '벡터 데이터베이스 관리 기능을 사용하려면 관리자 권한이 필요합니다.'
      }
    });
  });

  it('renders custom message when provided', () => {
    (useAuth as any).mockReturnValue({ user: null });
    const customMessage = '사용자 정의 오류 메시지';
    
    renderWithRouter(<AccessDenied message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});