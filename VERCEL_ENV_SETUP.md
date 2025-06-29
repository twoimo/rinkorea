# 🚀 Vercel 환경변수 설정 가이드

## 현재 문제 해결

**문제:** Vercel에서 화이트 스크린이 나타나는 이유는 Supabase 환경변수가 설정되지 않았기 때문입니다.

**해결:** 아래 단계를 따라 환경변수를 설정하세요.

## 📋 단계별 설정 방법

### 1. Vercel 대시보드 접속
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 (rinkorea)
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭

### 2. 필수 환경변수 추가

다음 환경변수들을 **반드시** 추가하세요:

| 변수명                   | 값                                 | 설명                   |
| ------------------------ | ---------------------------------- | ---------------------- |
| `VITE_SUPABASE_URL`      | `https://your-project.supabase.co` | Supabase 프로젝트 URL  |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...`  | Supabase Anonymous Key |

### 3. Supabase 정보 확인 방법

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴 이동
4. **Project URL**과 **anon public** key 복사

### 4. Vercel에 환경변수 추가

각 환경변수마다:
1. **Add New** 버튼 클릭
2. **Name** 필드에 변수명 입력 (예: `VITE_SUPABASE_URL`)
3. **Value** 필드에 값 입력
4. **Environment** 선택:
   - ✅ **Production** (필수)
   - ✅ **Preview** (권장)
   - ✅ **Development** (권장)
5. **Save** 버튼 클릭

### 5. 재배포

환경변수 설정 후 **반드시** 재배포하세요:
1. **Deployments** 탭 이동
2. 최신 배포의 **⋯** 메뉴 클릭
3. **Redeploy** 선택
4. **Redeploy** 버튼 클릭

## 🔍 확인 방법

재배포 완료 후:
1. 사이트 접속
2. 브라우저 개발자 도구 열기 (F12)
3. Console 탭에서 다음 메시지 확인:
   - ✅ `✅ Supabase: Connected successfully`
   - ❌ `🚧 Supabase: Using placeholder configuration` (아직 설정 안됨)

## 🔧 문제 해결

### 환경변수 설정했는데도 화이트 스크린이 나타날 때:

1. **캐시 클리어**
   ```bash
   Ctrl + Shift + R (하드 새로고침)
   ```

2. **Environment Variables 재확인**
   - 변수명에 오타가 없는지 확인
   - 값이 올바른지 확인
   - 모든 환경(Production, Preview, Development)에 설정했는지 확인

3. **강제 재배포**
   ```bash
   git commit --allow-empty -m "Force redeploy"
   git push origin main
   ```

4. **브라우저 콘솔 로그 확인**
   - 에러 메시지가 있는지 확인
   - 네트워크 탭에서 실패한 요청 확인

## 📞 추가 도움

여전히 문제가 해결되지 않으면:
1. Vercel 배포 로그 확인
2. Supabase 프로젝트 상태 확인
3. 환경변수 값에 특수문자나 공백이 있는지 확인

---

**✨ 설정 완료 후 사이트가 정상적으로 작동합니다!** 