-- 문의사항 비밀글 기능 추가
ALTER TABLE public.inquiries ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;

-- 문의사항 답변(여러 개) 테이블 신설
CREATE TABLE public.replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 답변에 대한 RLS 정책(관리자만 등록/수정/삭제, 모두 조회)
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view replies" ON public.replies FOR SELECT USING (true);
CREATE POLICY "Only admins can insert replies" ON public.replies FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update replies" ON public.replies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete replies" ON public.replies FOR DELETE USING (public.has_role(auth.uid(), 'admin')); 