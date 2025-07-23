-- 벡터 데이터베이스 스토리지 버킷 설정
-- Supabase SQL Editor에서 실행하세요

-- 1. 벡터 문서용 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vector-documents',
  'vector-documents',
  false, -- 비공개 버킷
  52428800, -- 50MB 제한
  ARRAY[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/html',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. 스토리지 RLS 정책 설정
-- 관리자만 파일 업로드/다운로드 가능
CREATE POLICY "관리자는 벡터 문서를 업로드할 수 있음" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vector-documents' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "관리자는 벡터 문서를 다운로드할 수 있음" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vector-documents' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "관리자는 벡터 문서를 삭제할 수 있음" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vector-documents' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 완료 메시지
DO $
BEGIN
    RAISE NOTICE '벡터 문서 스토리지 버킷이 성공적으로 설정되었습니다!';
END $;