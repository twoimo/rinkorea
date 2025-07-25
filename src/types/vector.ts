// 벡터 데이터베이스 관리 시스템 타입 정의

// 기본 공통 타입
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// 컬렉션 관련 타입
export interface Collection extends BaseEntity {
  name: string;
  description?: string;
  metadata: Record<string, any>;
  created_by: string | null;
  is_active: boolean;
  document_count: number;
  total_chunks: number;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  is_active?: boolean;
}

export interface CollectionStats {
  id: string;
  name: string;
  document_count: number;
  total_chunks: number;
  total_size: number;
  last_updated: string;
  processing_documents: number;
  failed_documents: number;
}

export interface CollectionFilters {
  is_active?: boolean;
  created_by?: string;
  search?: string;
  sort_by?: 'name' | 'created_at' | 'document_count';
  sort_order?: 'asc' | 'desc';
}

// 문서 관련 타입
export type DocumentProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Document extends BaseEntity {
  collection_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  content?: string;
  metadata: Record<string, any>;
  processing_status: DocumentProcessingStatus;
  error_message?: string;
  created_by: string | null;
  chunk_count: number;
}

export interface DocumentFilters {
  collection_id?: string;
  file_type?: string;
  processing_status?: DocumentProcessingStatus;
  created_by?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'filename' | 'created_at' | 'file_size' | 'chunk_count';
  sort_order?: 'asc' | 'desc';
}

// 문서 청크 관련 타입
export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface ChunkWithDocument extends DocumentChunk {
  document_name: string;
  collection_name: string;
  collection_id: string;
}

// 파일 업로드 관련 타입
export interface FileUploadData {
  file: File;
  collection_id: string;
}

export interface UploadResult {
  file: File;
  success: boolean;
  document_id?: string;
  error?: string;
}

export interface ProcessingResult {
  document_id: string;
  success: boolean;
  chunks_created: number;
  error?: string;
  processing_time_ms: number;
}

export interface UploadProgress {
  file_name: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  error?: string;
}

// 검색 관련 타입
export type SearchType = 'semantic' | 'keyword' | 'hybrid';

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  collection_id: string;
  content: string;
  similarity_score?: number;
  rank?: number;
  document_name: string;
  collection_name: string;
  metadata: Record<string, any>;
  highlighted_content?: string;
}

export interface SemanticSearchOptions {
  query: string;
  match_threshold?: number;
  match_count?: number;
  collection_ids?: string[];
}

export interface KeywordSearchOptions {
  query: string;
  match_count?: number;
  collection_ids?: string[];
  highlight?: boolean;
}

export interface HybridSearchOptions {
  query: string;
  semantic_weight?: number; // 0-1, 기본값 0.7
  keyword_weight?: number; // 0-1, 기본값 0.3
  match_count?: number;
  collection_ids?: string[];
  match_threshold?: number;
}

export interface SearchFilters {
  collection_ids?: string[];
  document_types?: string[];
  date_from?: string;
  date_to?: string;
  min_similarity?: number;
}

export interface SearchStats {
  total_searches: number;
  avg_execution_time: number;
  popular_queries: Array<{
    query: string;
    count: number;
  }>;
  search_type_distribution: Record<SearchType, number>;
}

// 검색 로그 타입
export interface SearchLog {
  id: string;
  user_id: string | null;
  query: string;
  search_type: SearchType;
  results_count: number;
  execution_time_ms: number | null;
  created_at: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// 오류 관련 타입
export interface VectorError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ProcessingError extends VectorError {
  document_id: string;
  step: 'upload' | 'text_extraction' | 'chunking' | 'embedding' | 'storage';
}

// 설정 관련 타입
export interface VectorConfig {
  max_file_size: number; // bytes
  supported_file_types: string[];
  chunk_size: number; // characters
  chunk_overlap: number; // characters
  embedding_model: string;
  max_chunks_per_document: number;
}

// 통계 관련 타입
export interface SystemStats {
  total_collections: number;
  total_documents: number;
  total_chunks: number;
  total_storage_used: number; // bytes
  processing_queue_size: number;
  avg_processing_time: number; // ms
  success_rate: number; // 0-1
}

// 컴포넌트 Props 타입
export interface CollectionListProps {
  collections: Collection[];
  loading: boolean;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onBulkAction: (action: 'delete' | 'activate' | 'deactivate', ids: string[]) => void;
}

export interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onView: (document: Document) => void;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  onBulkAction: (action: 'delete' | 'reprocess', ids: string[]) => void;
}

export interface SearchInterfaceProps {
  onSearch: (query: string, type: SearchType, options?: any) => void;
  loading: boolean;
  collections: Collection[];
}

export interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  searchType: SearchType;
  onResultClick: (result: SearchResult) => void;
}

// 훅 반환 타입
export interface UseCollectionsReturn {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  createCollection: (data: CreateCollectionData) => Promise<Collection>;
  updateCollection: (id: string, data: UpdateCollectionData) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  bulkDeleteCollections: (ids: string[]) => Promise<void>;
  getCollectionStats: (id: string) => Promise<CollectionStats>;
  refetch: () => Promise<void>;
}

export interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadDocuments: (files: File[], collectionId: string) => Promise<UploadResult[]>;
  deleteDocument: (id: string) => Promise<void>;
  reprocessDocument: (id: string) => Promise<void>;
  getDocumentChunks: (documentId: string) => Promise<DocumentChunk[]>;
  refetch: () => Promise<void>;
}

export interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, type: SearchType, options?: any) => Promise<SearchResult[]>;
  clearResults: () => void;
  getSearchStats: () => Promise<SearchStats>;
}

// 유틸리티 타입
export type FileType = 'pdf' | 'txt' | 'md' | 'docx' | 'html';

export interface SupportedFileType {
  extension: string;
  mimeType: string;
  maxSize: number;
  processor: string;
}

// 상수
export const SUPPORTED_FILE_TYPES: Record<FileType, SupportedFileType> = {
  pdf: {
    extension: '.pdf',
    mimeType: 'application/pdf',
    maxSize: 55 * 1024 * 1024, // 55MB
    processor: 'pdf-parse'
  },
  txt: {
    extension: '.txt',
    mimeType: 'text/plain',
    maxSize: 55 * 1024 * 1024, // 55MB
    processor: 'text'
  },
  md: {
    extension: '.md',
    mimeType: 'text/markdown',
    maxSize: 55 * 1024 * 1024, // 55MB
    processor: 'markdown'
  },
  docx: {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    maxSize: 55 * 1024 * 1024, // 55MB
    processor: 'mammoth'
  },
  html: {
    extension: '.html',
    mimeType: 'text/html',
    maxSize: 55 * 1024 * 1024, // 55MB
    processor: 'html-parser'
  }
};

export const DEFAULT_CONFIG: VectorConfig = {
  max_file_size: 55 * 1024 * 1024, // 55MB
  supported_file_types: Object.keys(SUPPORTED_FILE_TYPES),
  chunk_size: 1000,
  chunk_overlap: 200,
  embedding_model: 'text-embedding-ada-002',
  max_chunks_per_document: 1000
};