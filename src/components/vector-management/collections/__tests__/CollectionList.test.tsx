import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CollectionList } from '../CollectionList';
import type { Collection } from '@/types/vector';

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2일 전'),
}));

vi.mock('date-fns/locale', () => ({
  ko: {},
}));

const mockCollections: Collection[] = [
  {
    id: '1',
    name: '테스트 컬렉션 1',
    description: '첫 번째 테스트 컬렉션',
    metadata: { category: 'test' },
    created_by: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    is_active: true,
    document_count: 5,
    total_chunks: 50,
  },
  {
    id: '2',
    name: '테스트 컬렉션 2',
    description: '두 번째 테스트 컬렉션',
    metadata: { category: 'test' },
    created_by: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    is_active: false,
    document_count: 3,
    total_chunks: 30,
  },
];

const defaultProps = {
  collections: mockCollections,
  loading: false,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onToggleStatus: vi.fn(),
  onBulkAction: vi.fn(),
  onCreate: vi.fn(),
};

describe('CollectionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('컬렉션 목록을 올바르게 렌더링한다', () => {
    render(<CollectionList {...defaultProps} />);
    
    expect(screen.getByText('테스트 컬렉션 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 컬렉션 2')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 테스트 컬렉션')).toBeInTheDocument();
    expect(screen.getByText('두 번째 테스트 컬렉션')).toBeInTheDocument();
  });

  it('로딩 상태를 올바르게 표시한다', () => {
    render(<CollectionList {...defaultProps} loading={true} />);
    
    expect(screen.getByText('컬렉션을 불러오는 중...')).toBeInTheDocument();
  });

  it('빈 상태를 올바르게 표시한다', () => {
    render(<CollectionList {...defaultProps} collections={[]} />);
    
    expect(screen.getByText('컬렉션이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 컬렉션을 생성해보세요')).toBeInTheDocument();
  });

  it('검색 기능이 작동한다', async () => {
    render(<CollectionList {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('컬렉션 검색...');
    fireEvent.change(searchInput, { target: { value: '컬렉션 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('테스트 컬렉션 1')).toBeInTheDocument();
      expect(screen.queryByText('테스트 컬렉션 2')).not.toBeInTheDocument();
    });
  });

  it('새 컬렉션 버튼 클릭이 작동한다', () => {
    render(<CollectionList {...defaultProps} />);
    
    const createButton = screen.getByText('새 컬렉션');
    fireEvent.click(createButton);
    
    expect(defaultProps.onCreate).toHaveBeenCalledTimes(1);
  });

  it('컬렉션 상태 배지를 올바르게 표시한다', () => {
    render(<CollectionList {...defaultProps} />);
    
    const activeBadges = screen.getAllByText('활성');
    const inactiveBadges = screen.getAllByText('비활성');
    
    expect(activeBadges).toHaveLength(1);
    expect(inactiveBadges).toHaveLength(1);
  });

  it('컬렉션 통계를 올바르게 표시한다', () => {
    render(<CollectionList {...defaultProps} />);
    
    // 첫 번째 컬렉션의 통계 확인
    expect(screen.getByText('5')).toBeInTheDocument(); // document_count
    expect(screen.getByText('50')).toBeInTheDocument(); // total_chunks
    
    // 두 번째 컬렉션의 통계 확인
    expect(screen.getByText('3')).toBeInTheDocument(); // document_count
    expect(screen.getByText('30')).toBeInTheDocument(); // total_chunks
  });

  it('전체 선택 체크박스가 작동한다', () => {
    render(<CollectionList {...defaultProps} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /전체 선택/i });
    fireEvent.click(selectAllCheckbox);
    
    // 일괄 작업 바가 표시되어야 함
    expect(screen.getByText('2개 컬렉션 선택됨')).toBeInTheDocument();
  });

  it('일괄 삭제 기능이 작동한다', async () => {
    render(<CollectionList {...defaultProps} />);
    
    // 전체 선택
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /전체 선택/i });
    fireEvent.click(selectAllCheckbox);
    
    // 삭제 버튼 클릭
    const deleteButton = screen.getByRole('button', { name: /삭제/i });
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onBulkAction).toHaveBeenCalledWith('delete', ['1', '2']);
  });
});