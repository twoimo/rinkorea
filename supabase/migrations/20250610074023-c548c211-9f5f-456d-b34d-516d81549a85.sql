
-- profiles 테이블의 외래 키 제약 조건을 CASCADE 삭제로 수정
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 사용자 역할 관리를 위한 enum과 테이블 생성
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, role)
);

-- user_roles 테이블에 RLS 활성화
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 역할 확인을 위한 보안 함수 생성
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 현재 사용자의 역할을 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1),
    'user'::app_role
  )
$$;

-- user_roles 테이블 정책 설정
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 관리자만 역할을 관리할 수 있도록 설정
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 기존 inquiries 테이블 정책 업데이트 (관리자만 답변/삭제 가능)
DROP POLICY IF EXISTS "Anyone can view inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;

CREATE POLICY "Anyone can view inquiries"
  ON public.inquiries
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create inquiries"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can update inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete inquiries"
  ON public.inquiries
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 기존 news 테이블 정책 업데이트 (관리자만 작성/수정/삭제)
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
DROP POLICY IF EXISTS "Authenticated users can create news" ON public.news;
DROP POLICY IF EXISTS "Authors can update their own news" ON public.news;

CREATE POLICY "Anyone can view published news"
  ON public.news
  FOR SELECT
  USING (published = true);

CREATE POLICY "Only admins can create news"
  ON public.news
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update news"
  ON public.news
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete news"
  ON public.news
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 온라인 스토어 제품 관리를 위한 products 테이블 생성
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- products 테이블에 RLS 활성화
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- products 테이블 정책 설정
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can create products"
  ON public.products
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
  ON public.products
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
  ON public.products
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 지정된 계정을 관리자로 설정 (2019@rinkorea.com)
-- 이 부분은 해당 사용자가 가입한 후에 실행되어야 합니다
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = '2019@rinkorea.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
