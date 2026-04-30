# 이로움 · EALOWM 웹앱

**지혜의 씨앗으로 자비의 연꽃 피우기**  
중독 예방 및 마음 치유를 위한 12단계 자기돌봄 프로그램 — 웹앱

---

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Auth + DB**: Supabase (이메일/비밀번호 인증, PostgreSQL)
- **Styling**: Tailwind CSS + Gowun Batang / Noto Sans KR
- **Language**: TypeScript

---

## 로컬 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 무료 계정 생성
2. 새 프로젝트 생성
3. **SQL Editor** → `supabase-schema.sql` 파일 내용 전체 붙여넣고 실행
4. **Project Settings → API** → URL과 anon key 복사

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 Supabase URL과 anon key 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:3000 에서 확인

---

## 배포 (Vercel 권장)

1. [vercel.com](https://vercel.com) 에서 GitHub 저장소 연결
2. **Environment Variables** 에 `.env.local` 내용 동일하게 입력
3. Deploy

### Supabase 이메일 인증 콜백 URL 설정

Supabase Dashboard → **Authentication → URL Configuration** → **Site URL** 에:
```
https://your-domain.vercel.app
```

**Redirect URLs** 에:
```
https://your-domain.vercel.app/auth/callback
```

---

## 앱 구조

```
app/
  page.tsx              # 랜딩 + 로그인/회원가입
  dashboard/page.tsx    # 대시보드 (회기 목록, 진행률)
  session/[id]/page.tsx # 개별 회기 (생각해보기·실천해보기·정리해보기)
  auth/callback/        # 이메일 인증 콜백

components/
  AuthForm.tsx          # 로그인/회원가입 폼
  DashboardClient.tsx   # 대시보드 UI
  SessionClient.tsx     # 회기 실습 UI (3탭)

lib/
  sessions.ts           # 12회기 전체 데이터
  supabase-client.ts    # 클라이언트용 Supabase
  supabase-server.ts    # 서버용 Supabase

types/index.ts          # TypeScript 타입 정의
supabase-schema.sql     # DB 스키마 (Supabase에서 실행)
```

---

## 주요 기능

- **계정 기반 저장**: 이메일/비밀번호 인증, 기기·브라우저 무관하게 데이터 유지
- **자동 저장**: 입력 후 2초 뒤 자동 저장
- **3탭 실습 구조**: 생각해보기(체크리스트) / 실천해보기(자유 기록) / 정리해보기(성찰 질문 3개 + 선언문)
- **진행률 추적**: 12회기 완료 현황 + 퍼센트 프로그레스바
- **Row Level Security**: 각 사용자는 본인 데이터만 접근 가능

---

## 12회기 구성

| 회기 | 이름 | 주제 | 구분 |
|------|------|------|------|
| 1 | 무상관 | 변화와 벗어남 | 육관행 |
| 2 | 세속관 | 번뇌와 끊어냄 | 육관행 |
| 3 | 자비관 | 인정과 따뜻함 | 육관행 |
| 4 | 보시행 | 나눔과 이타심 | 육바라밀 |
| 5 | 지계행 | 도덕과 절제함 | 육바라밀 |
| 6 | 인욕행 | 인내와 평온함 | 육바라밀 |
| 7 | 사상관 | 비움과 덧없음 | 육관행 |
| 8 | 생멸관 | 살핌과 자각함 | 육관행 |
| 9 | 무량관 | 믿음과 무한함 | 육관행 |
| 10 | 정진행 | 노력과 성장함 | 육바라밀 |
| 11 | 선정행 | 집중과 고요함 | 육바라밀 |
| 12 | 지혜행 | 통찰과 깨달음 | 육바라밀 |

---

원측(圓測, 613–696) 『무량의경소』(無量義經疏) 기반  
© 도욱 2026 · 비영리 목적 자유 사용 가능
