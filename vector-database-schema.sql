-- 벡터 데이터베이스 관리 시스템 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. pgvector 확장 활성화 (이미 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Collections 테이블 생성
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    document_count INTEGER DEFAULT 0,
    total_chunks INTEGER DEFAULT 0,
    
    -- 제약 조건
    CONSTRAINT collections_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT collections_document_count_positive CHECK (document_count >= 0),
    CONSTRAINT collections_total_chunks_positive CHECK (total_chunks >= 0)
);

-- 3. Documents 테이블 생성
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    chunk_count INTEGER DEFAULT 0,
    
    -- 제약 조건
    CONSTRAINT documents_filename_not_empty CHECK (length(trim(filename)) > 0),
    CONSTRAINT documents_file_size_positive CHECK (file_size > 0),
    CONSTRAINT documents_chunk_count_positive CHECK (chunk_count >= 0)
);

-- 4. Document_Chunks 테이블 생성
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT document_chunks_document_chunk_idx UNIQUE(document_id, chunk_index),
    CONSTRAINT document_chunks_chunk_index_positive CHECK (chunk_index >= 0),
    CONSTRAINT document_chunks_content_not_empty CHECK (length(trim(content)) > 0)
);

-- 5. Search_Logs 테이블 생성
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    search_type TEXT NOT NULL CHECK (search_type IN ('semantic', 'keyword', 'hybrid')),
    results_count INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT search_logs_query_not_empty CHECK (length(trim(query)) > 0),
    CONSTRAINT search_logs_results_count_positive CHECK (results_count >= 0),
    CONSTRAINT search_logs_execution_time_positive CHECK (execution_time_ms >= 0)
);

-- 6. 인덱스 생성
-- Collections 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_collections_created_by ON public.collections(created_by);
CREATE INDEX IF NOT EXISTS idx_collections_is_active ON public.collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at DESC);

-- Documents 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_documents_collection_id ON public.documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON public.documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Document_Chunks 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON public.document_chunks(chunk_index);

-- 벡터 유사도 검색을 위한 인덱스 (HNSW 알고리즘 사용)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_cosine 
ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- 전문 검색을 위한 인덱스 (한국어 지원)
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_fts 
ON public.document_chunks USING gin(to_tsvector('korean', content));

-- Search_Logs 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON public.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_search_type ON public.search_logs(search_type);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);

-- 7. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Collections 테이블 트리거
DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Documents 테이블 트리거
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 컬렉션 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_collection_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 문서가 추가/삭제될 때 컬렉션 통계 업데이트
    IF TG_OP = 'INSERT' THEN
        UPDATE public.collections 
        SET document_count = document_count + 1,
            total_chunks = total_chunks + COALESCE(NEW.chunk_count, 0)
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 청크 수가 변경된 경우
        IF OLD.chunk_count != NEW.chunk_count THEN
            UPDATE public.collections 
            SET total_chunks = total_chunks - OLD.chunk_count + NEW.chunk_count
            WHERE id = NEW.collection_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.collections 
        SET document_count = document_count - 1,
            total_chunks = total_chunks - COALESCE(OLD.chunk_count, 0)
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Documents 테이블 통계 트리거
DROP TRIGGER IF EXISTS update_collection_stats_trigger ON public.documents;
CREATE TRIGGER update_collection_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_stats();

-- 9. RLS (Row Level Security) 정책 설정
-- Collections 테이블 RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 작업 가능
CREATE POLICY "관리자는 모든 컬렉션에 접근 가능" ON public.collections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Documents 테이블 RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 작업 가능
CREATE POLICY "관리자는 모든 문서에 접근 가능" ON public.documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Document_Chunks 테이블 RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 청크에 접근 가능
CREATE POLICY "관리자는 모든 청크에 접근 가능" ON public.document_chunks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- AI 에이전트가 검색을 위해 청크를 읽을 수 있도록 허용 (읽기 전용)
CREATE POLICY "인증된 사용자는 청크를 읽을 수 있음" ON public.document_chunks
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Search_Logs 테이블 RLS
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 검색 로그 접근 가능
CREATE POLICY "관리자는 모든 검색 로그에 접근 가능" ON public.search_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 사용자는 자신의 검색 로그만 생성 가능
CREATE POLICY "사용자는 자신의 검색 로그를 생성할 수 있음" ON public.search_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 10. 유틸리티 함수 생성
-- 벡터 유사도 검색 함수
CREATE OR REPLACE FUNCTION search_similar_chunks(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    collection_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    collection_id UUID,
    content TEXT,
    similarity FLOAT,
    document_name TEXT,
    collection_name TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunk_id,
        dc.document_id,
        d.collection_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) as similarity,
        d.filename as document_name,
        c.name as collection_name,
        dc.metadata
    FROM public.document_chunks dc
    JOIN public.documents d ON dc.document_id = d.id
    JOIN public.collections c ON d.collection_id = c.id
    WHERE 
        dc.embedding IS NOT NULL
        AND (collection_ids IS NULL OR d.collection_id = ANY(collection_ids))
        AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
        AND c.is_active = true
        AND d.processing_status = 'completed'
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 키워드 검색 함수
CREATE OR REPLACE FUNCTION search_chunks_by_keyword(
    search_query TEXT,
    match_count INT DEFAULT 10,
    collection_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    collection_id UUID,
    content TEXT,
    rank FLOAT,
    document_name TEXT,
    collection_name TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunk_id,
        dc.document_id,
        d.collection_id,
        dc.content,
        ts_rank(to_tsvector('korean', dc.content), plainto_tsquery('korean', search_query)) as rank,
        d.filename as document_name,
        c.name as collection_name,
        dc.metadata
    FROM public.document_chunks dc
    JOIN public.documents d ON dc.document_id = d.id
    JOIN public.collections c ON d.collection_id = c.id
    WHERE 
        to_tsvector('korean', dc.content) @@ plainto_tsquery('korean', search_query)
        AND (collection_ids IS NULL OR d.collection_id = ANY(collection_ids))
        AND c.is_active = true
        AND d.processing_status = 'completed'
    ORDER BY ts_rank(to_tsvector('korean', dc.content), plainto_tsquery('korean', search_query)) DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 샘플 데이터 (선택사항)
-- 기본 컬렉션 생성 (관리자 계정으로 실행 시)
-- INSERT INTO public.collections (name, description, metadata) VALUES 
-- ('일반 문서', '일반적인 회사 문서들', '{"category": "general"}'),
-- ('제품 매뉴얼', '제품 관련 매뉴얼 및 가이드', '{"category": "manual"}'),
-- ('기술 문서', '기술적인 문서 및 사양서', '{"category": "technical"}');

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '벡터 데이터베이스 스키마가 성공적으로 생성되었습니다!';
    RAISE NOTICE '다음 단계: OpenAI API 키를 환경 변수에 설정하고 애플리케이션을 시작하세요.';
END $$;