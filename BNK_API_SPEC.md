# BNK Backend API (BNK_API_SPEC.md)

본 문서는 현재 백엔드가 반환하는 응답 형태를 정리하고, 기존 `API_SPEC.md` 대비 변경/차이점을 명시합니다. 모든 엔드포인트는 글로벌 프리픽스 `/v1`가 적용됩니다. 인증은 전역 `AuthGuard`로 `Authorization: Bearer <userId>` 형식을 요구합니다.

## Health
- **GET** `/v1/health`
- **Response**: `"ok"`
- **Notes**: 헬스 체크용.

## Users
- **GET** `/v1/users/me`
  - **Response**: `UserResponseDto`
    - `id: string` (예: `user-1`)
    - `name: string`
    - `profileImageUrl: string | null`
    - `gender?: string` (M/F)
    - `age?: number`
    - `acceptanceRate: number`
    - `activeTimeSlot: string`
    - `coinBalance: number`
    - `preferences: { categories: string[]; isOnboardingComplete: boolean }`
  - **Notes**: `preferences.categories`는 API 카테고리 소문자 포맷.

- **GET** `/v1/users/me/preferences`
  - **Response**: `{ categories: string[]; isOnboardingComplete: boolean }`

- **POST** `/v1/users/me/preferences`
  - **Body**: `{ categories: string[] }`
  - **Response**: `{ categories: string[]; isOnboardingComplete: boolean }`

## Missions
- **GET** `/v1/missions`
  - **Query**: `category?` (API 소문자 → ML 변환), `sort?` (`distance`|`popular`|`recent`), `page?`, `limit?`
  - **Response**: `{ missions: MissionResponseDto[]; pagination: { currentPage, totalPages, totalCount, hasNext } }`

- **GET** `/v1/missions/:missionId`
  - **Param**: `missionId` (API 포맷 `mission-1`, 내부 ML로 변환)
  - **Response**: `MissionResponseDto`

- **POST** `/v1/missions/:missionId/like`
  - **Response**: `{ isLiked: boolean; likeCount: number }`

- **POST** `/v1/missions/:missionId/participate`
  - **Response**: `{ participationId: string; status: string; startedAt: ISOString }`

- **POST** `/v1/missions/:missionId/complete`
  - **Body**: `{ success: boolean }`
  - **Response**: `{ missionId: string; userId: string; status: string; reward: number; coinBalance: number }`

- **GET** `/v1/missions/ai-recommend`
  - **Query**: `lat: number`, `lon: number`, `limit?: number`
  - **Response**: `MissionResponseDto[]`
  - **Notes**: ML 추천 결과 순서대로 반환. 실패 시 인기 미션 fallback.

### MissionResponseDto (API 응답)
- `id: string` (API 포맷, 예: `mission-1`)
- `title: string`
- `imageUrl: string` (placeholder 가능)
- `location: string | null`
- `locationDetail: string | null`
- `distance: string` (예: `"1.2km"`)
- `coinReward: number`
- `category: string` (API 소문자)
- `endDate: string | null`
- `insight: string | null`
- `verificationMethods: string[]`
- `coordinates?: { lat: number; lng: number }`
- `isLiked: boolean`
- `participationStatus?: 'in_progress' | 'completed' | 'failed' | null`
- `completedAt?: string | null`
- `modelProba?: number` (ML 점수)
- `finalScore?: number` (ML 점수)
- `distanceMeters?: number` (ML distance_m 또는 DB distance)

### ID/Category 변환
- **missionId**: API `mission-#` ↔ ML `M###`
- **category**: ML PascalCase ↔ API lowercase (Food→food, Tourist→tour, Self-Dev→study 등)
- **userId**: API `user-#` → ML `U####` (ML 호출 시만)

## Categories
- **GET** `/v1/categories`
  - **Response**: `{ id, name, isActive }[]` (API 카테고리 소문자)
  - **Notes**: DB에는 ML 카테고리(PascalCase) 저장, 응답 시 변환.

## Notifications
- **POST** `/v1/notifications/send`
  - **Body**: `{ token: string; title: string; body: string }`
  - **Response**: `{ status: 'sent' }`

- **POST** `/v1/notifications/register`
  - **Body**: `{ userId?: string; token: string }`
  - **Response**: `{ status: 'registered' }`
  - **Notes**: 기본은 AuthGuard userId 사용. DB에 fcmToken 저장.

- **POST** `/v1/notifications/broadcast-challenge`
  - **Body**: `{ title?: string; body?: string }`
  - **Response**: `{ status: 'sent'|'no_tokens'; sentCount: number }`
  - **Notes**: FCM 토큰 보유 모든 유저에게 브로드캐스트.

## Tabs
- **GET** `/v1/tabs`
  - **Response**: `TabItem[]` (정적 목 데이터)
  - `TabItem`: `{ id: string; name: string; isActive: boolean; hasNotification?: boolean }`

## 주요 변경사항 / API_SPEC 대비 차이
- 미션 ID는 응답 시 `mission-#`로 변환, 내부/DB는 `M###` 사용.
- 카테고리 응답은 API 소문자로 변환됨. DB/ML은 PascalCase.
- `MissionResponseDto`에 ML 점수(`modelProba`, `finalScore`) 포함될 수 있음. API_SPEC에서 언급 없다면 프런트 무시 가능.
- `distance`는 `<km>km` 문자열로 제공, `distanceMeters` 필드는 ML 결과나 DB 값의 수치.
- `imageUrl`, `location`, `endDate`, `insight`, `verificationMethods`는 빈 값/placeholder가 반환될 수 있음 (ML에 없는 필드 보완).
- `current_day_of_week`, `user_id` 등 ML 호출 시 변환/정규화된 값 사용 (프런트에는 노출되지 않음).
