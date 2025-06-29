-- 자료실 테이블 생성
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    category VARCHAR(100) DEFAULT 'general',
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON public.resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_title ON public.resources USING gin(to_tsvector('simple', title));

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 자료를 볼 수 있음
CREATE POLICY "Anyone can view active resources" ON public.resources
    FOR SELECT USING (is_active = true);

-- 관리자만 자료를 생성/수정/삭제할 수 있음
CREATE POLICY "Admins can manage resources" ON public.resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 자료실 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS public.resource_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 기본 카테고리 데이터 삽입
INSERT INTO public.resource_categories (name, color) VALUES 
('카탈로그', '#3B82F6'),
('시험성적서', '#10B981'),
('매뉴얼', '#F59E0B'),
('기술자료', '#8B5CF6'),
('인증서', '#EF4444'),
('기타', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- 자료실 카테고리 RLS 정책
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.resource_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.resource_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 자료실 다운로드 로그 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS public.resource_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 다운로드 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.resources 
    SET download_count = download_count + 1 
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 다운로드 로그 삽입 시 자동으로 다운로드 수 증가
CREATE TRIGGER trigger_update_download_count
    AFTER INSERT ON public.resource_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_download_count();

-- 자료실 다운로드 로그 RLS 정책
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their downloads" ON public.resource_downloads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view download logs" ON public.resource_downloads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    ); 