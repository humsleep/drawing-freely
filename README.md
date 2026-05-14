# 그림자유

어린이/부모용 그림 크리에이티브 플랫폼.
사진을 그림 도안으로 바꾸고, 만든 작품을 자랑하고, 무료 도안을 받는 곳.

자세한 작업 기준은 [`CLAUDE.md`](./CLAUDE.md) 참고.

## 기술 스택

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- 배포: Vercel
- (예정) Supabase: Auth + Postgres + Storage
- (예정) 외부 이미지 변환 API — `lib/convert.ts` 한 곳에서만 호출

## 로컬에서 실행

```bash
npm install
npm run dev          # http://localhost:3000
```

## 명령어

| 명령 | 용도 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (typecheck 포함) |
| `npm start` | 프로덕션 서버 |
| `npm run lint` | ESLint |
| `npm test` | Vitest (`*.test.ts`) |

## 환경변수

실제 값은 `.env.local`에만. 키 이름은 `.env.local.example` 참고.

v0 (현재)에는 외부 의존이 아직 없어 **환경변수 없이도 빌드/배포가 동작**한다.
Supabase·변환 API를 붙이는 시점부터 다음 키들을 채우면 된다.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # 서버 코드에서만 사용
CONVERT_API_KEY               # lib/convert.ts 에서만 사용
```

## Vercel 배포

1. GitHub 리포를 Vercel에 import
2. Framework Preset = **Next.js** (자동 감지)
3. Build/Output 설정은 기본값 사용 — 별도 `vercel.json` 없음
4. 도메인은 나중에 연결

v0 페이지는 전부 정적(prerendered)이라 Edge/Serverless 함수가 없다.
환경변수도 v0에는 필요 없음.

## 폴더 구조

```
app/             # 라우트 (App Router)
  page.tsx       # 둘러보기 (랜딩)
  me/            # 내 작품 — 자랑하기 컨트롤
  templates/     # 무료 도안
  ranking/       # 이번 주 랭킹
lib/
  policy.ts      # 공개 전환 등 정책 함수 (테스트 대상)
```

## 개인정보 원칙

- 생년월일·성별·실명은 **수집하지 않는다**.
- 어린이는 닉네임 + 연령대(`4-6` / `7-9` / `10-12`)만.
- 공개 갤러리는 부모가 명시적으로 공개 전환한 작품만 노출.

세부 규칙은 [`CLAUDE.md`](./CLAUDE.md) 참고.
