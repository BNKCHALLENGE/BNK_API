# BNK API 엔드포인트 명세

- 기본 도메인: `https://bnk-api.up.railway.app`
- 공통 Prefix: `/v1`
- 인증: 전역 `AuthGuard` 적용. `Authorization: Bearer user-1` 형태.
  - 요청 처리용 userId: `user-1` → ML 전송 시 `U0001`으로 변환됨.
- 카테고리 변환: DB/ML은 PascalCase(예: `Food`), 프론트 응답은 소문자(예: `food`).
- 미션 ID 변환: DB/ML은 `M001`, 프론트는 `mission-1`.

## 헬스 체크
- `GET /v1/health`
  - 응답: `{ success: true, data: 'ok' }` (TransformInterceptor)

## Users
- `GET /v1/users/me`
  - 반환: 사용자 정보 + 코인 잔액
  - 응답 데이터 예: `{ id, name, profileImageUrl, gender, age, coinBalance, preferences:{ categories, isOnboardingComplete }, acceptanceRate, activeTimeSlot }`
- `POST /v1/users/me/preferences`
  - Body: `{ categories: string[] }`
  - 반환: 저장된 preferences
- `GET /v1/users/me/preferences`
  - 반환: 현재 preferences

## Missions
- `GET /v1/missions`
  - Query: `category?`(소문자; 내부에서 ML 카테고리로 변환), `page?`, `limit?`, `sort?`
  - 응답: MissionResponseDto[]
    - 주요 필드: `id(mission-1 형식)`, `title`, `imageUrl`, `location`, `locationDetail`, `distance("1.2km")`, `coinReward`, `category`(소문자), `endDate`, `insight`, `verificationMethods`, `coordinates`, `isLiked`, `participationStatus|null`, `completedAt|null`, `modelProba?`, `finalScore?`
- `GET /v1/missions/:missionId`
  - `missionId`: `mission-#` 형식(내부 변환 후 조회)
  - 응답: MissionResponseDto (상동)
- `POST /v1/missions/:missionId/like`
  - 반환: `{ isLiked: boolean, likeCount: number }`
- `POST /v1/missions/:missionId/participate`
  - 반환: `{ participationId, status, startedAt }`
- `POST /v1/missions/:missionId/complete`
  - Body: `{ success: boolean }`
  - 성공 시 코인 적립/실패 시 상태만 변경
  - 반환: `{ missionId, userId, status, reward, coinBalance }`
- `GET /v1/missions/ai-recommend`
  - Query: `lat`, `lon`, `limit?`
  - 동작: ML 서버 호출 → 추천 ID(ML 형식) → DB 조회 → API 응답 변환
  - 응답: MissionResponseDto[] (추천 순서 유지, distance 문자열, modelProba/finalScore 포함)

## Categories
- `GET /v1/categories`
  - 응답: 카테고리 목록 (id/name 모두 소문자 API 형식)

## Notifications
- `POST /v1/notifications/send`
  - Body: `{ token, title, body }`
  - 단일 FCM 토큰 테스트 발송
- `POST /v1/notifications/register`
  - Body: `{ token, userId? }` (없으면 인증된 userId 사용)
  - 동작: 유저 fcmToken 저장 → `{ status: 'registered' }`
- `POST /v1/notifications/broadcast-challenge`
  - Body(옵션): `{ title?, body? }`
  - 동작: fcmToken이 있는 모든 유저에게 일괄 발송 → `{ status: 'sent' | 'no_tokens', sentCount }`

## Tabs
- `GET /v1/tabs`
  - 응답: 명세서의 탭 JSON (모킹 데이터)

---

## 변환/규칙 요약
- 미션 ID: 응답 `mission-#`, 입력 `mission-#` → 내부 `M###`
- 카테고리: 응답 소문자(api), 내부/ML PascalCase
- 거리: DB 숫자(m 단위) → 응답 문자열 `"<km>km"` (소수점 1자리)
- 날짜/시간: ISO 문자열 사용
- ML 호출 시 `current_day_of_week`는 숫자 0(월)~6(일)로 변환

## 누락/추가 확인 메모
- 위 목록은 모든 controller 데코레이터 기준으로 수집됨. 추가 엔드포인트 없음.
- API_SPEC.md와 비교 시: 미션 응답에 ML 추천 필드(`modelProba`, `finalScore`)가 추가 노출될 수 있음(프론트가 사용하지 않으면 무시 가능).
