import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useVectorAuth, useVectorAccess } from '../useVectorAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '../useUserRole';

// Mock the dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../useUserRole', () => ({
  useUserRole: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('useVectorAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when auth is loading', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: true
    });
    (useUserRole as any).mockReturnValue({
      isAdmin: false,
      loading: false
    });

    const { result } = renderHook(() => useVectorAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.hasAccess).toBe(false);
  });

  it('returns loading state when role is loading', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '123' },
      loading: false
    });
    (useUserRole as any).mockReturnValue({
      isAdmin: false,
      loading: true
    });

    const { result } = renderHook(() => useVectorAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.hasAccess).toBe(false);
  });

  it('returns hasAccess true when user is authenticated and admin', () => {
    const mockUser = { id: '123', email: 'admin@test.com' };
    (useAuth as any).mockReturnValue({
      user: mockUser,
      loading: false
    });
    (useUserRole as any).mockReturnValue({
      isAdmin: true,
      loading: false
    });

    const { result } = renderHook(() => useVectorAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.hasAccess).toBe(true);
    expect(result.current.user).toBe(mockUser);
    expect(result.current.isAdmin).toBe(true);
  });

  it('returns hasAccess false when user is not admin', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '123' },
      loading: false
    });
    (useUserRole as any).mockReturnValue({
      isAdmin: false,
      loading: false
    });

    const { result } = renderHook(() => useVectorAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });
});

describe('useVectorAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct access information for admin user', () => {
    const mockUser = { id: '123', email: 'admin@test.com' };
    (useAuth as any).mockReturnValue({
      user: mockUser
    });
    (useUserRole as any).mockReturnValue({
      isAdmin: true,
      loading: false
    });

    const { result } = renderHook(() => useVectorAccess());

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('returns correct access information for non-admin user', () => {
    const mockUser = { id: '123', email: 'user@test.com' };
    (useAuth as any).mockReturnValue({
      user: mockUser
    });
    (useUserRole as any).mockReturnValue({
      isAdmin: false,
      loading: false
    });

    const { result } = renderHook(() => useVectorAccess());

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('returns correct access information for unauthenticated user', () => {
    (useAuth as any).mockReturnValue({
      user: null
    });
    (useUserRole as any).mockReturnValue({
      isAdmin: false,
      loading: false
    });

    const { result } = renderHook(() => useVectorAccess());

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });
});