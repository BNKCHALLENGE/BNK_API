# BNK_API

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=flat&logo=railway&logoColor=white)](https://railway.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> BNK 챌린지 서비스의 메인 백엔드입니다.  
> NestJS 기반으로 사용자, 미션, 카테고리, 참여 상태, 좋아요, 푸시 알림을 관리하고, `ML_API`와 연동해 AI 추천 결과를 앱 친화적인 응답으로 변환합니다.

---

## 🎬 Demo

[![BNK Backend Demo](https://img.youtube.com/vi/e7bv3mprB2A/0.jpg)](https://youtu.be/e7bv3mprB2A)

---

## 📌 Overview

- **Framework**: NestJS 11 + TypeORM
- **Database**: PostgreSQL
- **External services**: `ML_API` 추천 서버, Firebase Admin(FCM)
- **Deployment**: Railway
- **API Prefix**: `/v1`
- **Response convention**
  - success: `{ success: true, data: ... }`
  - error: `{ success: false, error: { code, message } }`

이 서버는 세 가지 역할을 수행합니다.

1. 앱이 직접 사용하는 REST API 제공
2. Postgres에 저장된 사용자/미션/참여/좋아요 데이터 관리
3. ML 서버의 추천 결과를 프런트 형식으로 변환해 제공

---

## ✨ Key responsibilities

- 사용자 정보 및 선호 카테고리 조회/저장
- 전체 미션 목록, 상세 조회, 좋아요, 참여, 완료 처리
- 진행 중 미션 상태 조회
- AI 추천 미션 조회
- 카테고리 목록 조회
- FCM 토큰 등록 및 푸시 발송
- 앱 탭 데이터 제공

---

## 📁 Project structure

```text
src/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── common/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── modules/
│   ├── users/
│   ├── categories/
│   ├── missions/
│   ├── notifications/
│   └── tabs/
└── scripts/
    └── seed.ts
```

---

## 🧩 Core modules

### Users

- `GET /v1/users/me`
- `GET /v1/users/me/preferences`
- `POST /v1/users/me/preferences`

사용자 프로필, 코인 잔액, 선호 카테고리, 온보딩 완료 여부를 관리합니다.

### Missions

- `GET /v1/missions`
- `GET /v1/missions/:missionId`
- `GET /v1/missions/ai-recommend`
- `POST /v1/missions/:missionId/like`
- `POST /v1/missions/:missionId/participate`
- `POST /v1/missions/:missionId/complete`

미션 목록, 상세, 참여/완료, 좋아요, 추천 기능을 담당하는 핵심 도메인입니다.

### Categories

- `GET /v1/categories`

DB에 저장된 카테고리를 조회한 뒤 프런트 응답 형식의 소문자 카테고리 코드로 반환합니다.

### Notifications

- `POST /v1/notifications/send`
- `POST /v1/notifications/register`
- `POST /v1/notifications/broadcast-challenge`

Firebase Admin SDK를 이용해 개별 또는 일괄 푸시를 발송합니다.

### Tabs

- `GET /v1/tabs`

앱 하단 탭 데이터를 제공합니다.

---

## 🔄 Request flow

1. `BNK_WEB`가 `Authorization: Bearer user-1` 헤더로 API를 호출합니다.
2. `AuthGuard`가 헤더에서 user id를 추출해 `request.user.id`에 주입합니다.
3. 일반 API는 Postgres에서 직접 데이터를 조회합니다.
4. AI 추천 API는 사용자 프로필과 현재 좌표를 조합해 `ML_API`의 `/recommend`를 호출합니다.
5. ML 응답의 미션 ID와 카테고리를 프런트 형식으로 다시 변환합니다.
6. 모든 응답은 공통 포맷으로 래핑되어 반환됩니다.

---

## 🧭 Important conventions

### Auth

현재 구현은 아래 형식의 Authorization 헤더를 사용합니다.

```http
Authorization: Bearer user-1
```

### Identifier mapping

- user id
  - backend/web: `user-1`
  - ML: `U0001`
- mission id
  - backend/web: `mission-1`
  - internal/ML: `M001`

### Category mapping

- frontend: `food`, `cafe`, `tour`, `culture`, `festival`, `walk`, `shopping`, `study`, `sports`
- ML/internal: `Food`, `Cafe`, `Tourist`, `Culture`, `Festival`, `Walk`, `Shopping`, `Self-Dev`, `Sports`

---

## 📡 API summary

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/v1/health` | Health check |
| `GET` | `/v1/users/me` | 현재 사용자 조회 |
| `GET` | `/v1/users/me/preferences` | 선호 카테고리 조회 |
| `POST` | `/v1/users/me/preferences` | 선호 카테고리 저장 |
| `GET` | `/v1/categories` | 카테고리 목록 |
| `GET` | `/v1/missions` | 미션 목록 |
| `GET` | `/v1/missions/:missionId` | 미션 상세 |
| `GET` | `/v1/missions/ai-recommend` | AI 추천 미션 |
| `POST` | `/v1/missions/:missionId/like` | 좋아요 토글 |
| `POST` | `/v1/missions/:missionId/participate` | 미션 참여 |
| `POST` | `/v1/missions/:missionId/complete` | 미션 완료 처리 |
| `POST` | `/v1/notifications/send` | 단일 푸시 발송 |
| `POST` | `/v1/notifications/register` | FCM 토큰 등록 |
| `POST` | `/v1/notifications/broadcast-challenge` | 전체 푸시 발송 |
| `GET` | `/v1/tabs` | 탭 목록 |

세부 명세는 [`BNK_API_SPEC.md`](./BNK_API_SPEC.md)에서 확인할 수 있습니다.

---

## ⚙️ Environment variables

```bash
PORT=3000
DATABASE_URL=postgresql://...
ML_SERVER_URL=https://your-ml-api

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## 🚀 Run locally

```bash
npm install
npm run start:dev
```

production build:

```bash
npm run build
npm run start:prod
```

---

## 🌱 Seed data

초기 사용자, 카테고리, 미션 데이터는 seed 스크립트로 적재합니다.

```bash
npm run seed
```

이 스크립트는 다음을 수행합니다.

- users upsert
- categories upsert
- 23개 mission upsert
- mission likes / participations 초기화

---

## 🧪 Testing

```bash
npm run test
npm run test:e2e
```

---

## 🚢 Deployment

- Frontend: https://bnk-web.vercel.app/
- Backend API: https://bnk-api.up.railway.app

---

## 🔗 Related projects

- Frontend: [`BNK_WEB`](https://github.com/BNKCHALLENGE/BNK_WEB)
- ML recommendation service: [`ML_API`](https://github.com/BNKCHALLENGE/ML_API)

---

## 📄 License

이 프로젝트에는 별도 `LICENSE` 파일이 포함되어 있으며 현재 내용은 MIT 라이선스입니다.
