-- 매출 관리를 위한 테이블 생성
CREATE TABLE public.revenue_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT,
    revenue DECIMAL(12,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    region TEXT,
    customer_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 매출 카테고리 테이블
CREATE TABLE public.revenue_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 기본 카테고리 데이터 삽입
INSERT INTO public.revenue_categories (name, color) VALUES
('제품 매출', '#3B82F6'),
('서비스 매출', '#10B981'),
('장비 매출', '#F59E0B'),
('기타 매출', '#8B5CF6');

-- RLS 활성화
ALTER TABLE public.revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_categories ENABLE ROW LEVEL SECURITY;

-- 정책 설정 - 관리자만 접근 가능
CREATE POLICY "Only admins can view revenue data"
  ON public.revenue_data FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can create revenue data"
  ON public.revenue_data FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update revenue data"
  ON public.revenue_data FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete revenue data"
  ON public.revenue_data FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can view revenue categories"
  ON public.revenue_categories FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage revenue categories"
  ON public.revenue_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 인덱스 생성
CREATE INDEX idx_revenue_data_date ON public.revenue_data(date);
CREATE INDEX idx_revenue_data_category ON public.revenue_data(category);
CREATE INDEX idx_revenue_data_created_at ON public.revenue_data(created_at);