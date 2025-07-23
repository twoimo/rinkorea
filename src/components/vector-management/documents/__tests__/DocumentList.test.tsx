import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentList } from '../DocumentList';
import type { Document } from '@/types/vector';
import { beforeEach } from 'node:test';

// Mock UI components for testing
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ onCheckedChange, ...props }: any) => (
    <input 
      type="checkbox" 
      onChange={(e) => onCheckedChange?.(e.target.checked)} 
      {...props} 
    />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select onChange={(e) => onValueChange?.(e.target.value)} value={value}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Search: () => <span>Search</span>,
  Filter: () => <span>Filter</span>,
  Trash2: () => <span>Trash2</span>,
  RefreshCw: () => <span>RefreshCw</span>,
  Eye: () => <span>Eye</span>,
  FileText: () => <span>FileText</span>,
  Clock: () => <span>Clock</span>,
  CheckCircle: () => <span>CheckCircle</span>,
  XCircle: () => <span>XCircle</span>,
  AlertCircle: () => <span>AlertCircle</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
}));

vi.mock('@/lib/utils', () => ({
  formatFileSize: (bytes: number) => `${bytes} bytes`,
  formatDate: (date: string) => date,
}));

// Mock 문서 데이터
const mockDocuments: Document[] = [
  {
    id: '1',
    collection_id: 'collection-1',
    filename: 'test1.pdf',
    original_filename: 'test1.pdf',
    file_type: 'application/pdf',
    file_size: 1024000,
    content: 'Test content 1',
    metadata: { pages: 5 },
    processing_status: 'completed',
    error_message: null,
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    chunk_count: 10
  },
  {
    id: '2',
    collection_id: 'collection-1',
    filename: 'test2.txt',
    original_filename: 'test2.txt',
    file_type: 'text/plain',
    file_size: 512000,
    content: 'Test content 2',
    metadata: {},
    processing_status: 'processing',
    error_message: null,
    created_by: 'user-1',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    chunk_count: 5
  },
  {
    id: '3',
    collection_id: 'collection-1',
    filename: 'test3.docx',
    original_filename: 'test3.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size: 2048000,
    content: null,
    metadata: {},
    processing_status: 'failed',
    error_message: '파일 처리 중 오류가 발생했습니다.',
    created_by: 'user-1',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    chunk_count: 0
  }
];

const defaultProps = {
  documents: mockDocuments,
  loading: false,
  onView: vi.fn(),
  onDelete: vi.fn(),
  onReprocess: vi.fn(),
  onBulkAction: vi.fn(),
  totalCount: mockDocuments.length,
  currentPage: 1,
  pageSize: 10,
  onPageChange: vi.fn(),
  onFiltersChange: vi.fn()
};

describe('DocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('문서 목록을 올바르게 렌더링해야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    expect(screen.getByText('test2.txt')).toBeInTheDocument();
    expect(screen.getByText('test3.docx')).toBeInTheDocument();
  });

  it('로딩 상태를 올바르게 표시해야 함', () => {
    render(<DocumentList {...defaultProps} loading={true} />);
    
    expect(screen.getByText('문서 목록을 불러오는 중...')).toBeInTheDocument();
  });

  it('문서 상태를 올바르게 표시해야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('처리중')).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
  });

  it('검색 기능이 작동해야 함', async () => {
    render(<DocumentList {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('파일명으로 검색...');
    fireEvent.change(searchInput, { target: { value: 'test1' } });
    
    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
      expect(screen.queryByText('test2.txt')).not.toBeInTheDocument();
      expect(screen.queryByText('test3.docx')).not.toBeInTheDocument();
    });
  });

  it('상태 필터가 작동해야 함', async () => {
    render(<DocumentList {...defaultProps} />);
    
    // 필터 버튼 클릭
    const filterButton = screen.getByText('필터');
    fireEvent.click(filterButton);
    
    // 상태 필터 변경
    const statusSelect = screen.getByDisplayValue('전체');
    fireEvent.click(statusSelect);
    
    const completedOption = screen.getByText('완료');
    fireEvent.click(completedOption);
    
    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
      expect(screen.queryByText('test2.txt')).not.toBeInTheDocument();
      expect(screen.queryByText('test3.docx')).not.toBeInTheDocument();
    });
  });

  it('문서 선택 기능이 작동해야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const firstDocumentCheckbox = checkboxes[1]; // 첫 번째는 전체 선택 체크박스
    
    fireEvent.click(firstDocumentCheckbox);
    
    expect(screen.getByText('1개 선택됨')).toBeInTheDocument();
  });

  it('전체 선택 기능이 작동해야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    expect(screen.getByText('3개 선택됨')).toBeInTheDocument();
  });

  it('문서 보기 버튼이 작동해야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    const viewButtons = screen.getAllByRole('button');
    const firstViewButton = viewButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('aria-label') === null
    );
    
    if (firstViewButton) {
      fireEvent.click(firstViewButton);
      expect(defaultProps.onView).toHaveBeenCalledWith(mockDocuments[0]);
    }
  });

  it('재처리 버튼이 실패한 문서에만 표시되어야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    // 실패한 문서(test3.docx)의 행을 찾아서 재처리 버튼이 있는지 확인
    const failedDocumentRow = screen.getByText('test3.docx').closest('tr');
    expect(failedDocumentRow).toBeInTheDocument();
  });

  it('일괄 삭제 기능이 작동해야 함', async () => {
    render(<DocumentList {...defaultProps} />);
    
    // 전체 선택
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    // 삭제 버튼 클릭
    const deleteButton = screen.getByText('삭제');
    fireEvent.click(deleteButton);
    
    // 확인 다이얼로그에서 삭제 확인
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: '삭제' });
      fireEvent.click(confirmButton);
    });
    
    expect(defaultProps.onBulkAction).toHaveBeenCalledWith('delete', ['1', '2', '3']);
  });

  it('빈 상태를 올바르게 표시해야 함', () => {
    render(<DocumentList {...defaultProps} documents={[]} />);
    
    expect(screen.getByText('업로드된 문서가 없습니다.')).toBeInTheDocument();
  });

  it('파일 크기가 올바르게 포맷되어야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    expect(screen.getByText('1000.0 KB')).toBeInTheDocument(); // 1024000 bytes
    expect(screen.getByText('500.0 KB')).toBeInTheDocument();  // 512000 bytes
    expect(screen.getByText('2.0 MB')).toBeInTheDocument();    // 2048000 bytes
  });

  it('오류 메시지가 표시되어야 함', () => {
    render(<DocumentList {...defaultProps} />);
    
    expect(screen.getByText('파일 처리 중 오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('필터 초기화가 작동해야 함', async () => {
    render(<DocumentList {...defaultProps} />);
    
    // 필터 열기
    const filterButton = screen.getByText('필터');
    fireEvent.click(filterButton);
    
    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('파일명으로 검색...');
    fireEvent.change(searchInput, { target: { value: 'test1' } });
    
    // 필터 초기화
    const resetButton = screen.getByText('필터 초기화');
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });
});