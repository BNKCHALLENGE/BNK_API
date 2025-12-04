# BNK 챌린지 API 명세서

## Base URL

```
https://api.bnk-challenge.com/v1
```

---

## 1. 사용자 (User)

### 1.1 현재 사용자 정보 조회

```
GET /users/me
```

**Headers**
| Key | Value | Required |
|-----|-------|----------|
| Authorization | Bearer {token} | ✅ |

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "user-1",
    "name": "채수원",
    "profileImageUrl": "https://example.com/profile.png"
  }
}
```

---

### 1.2 사용자 선호도 저장 (온보딩)

```
POST /users/me/preferences
```

**Headers*
| Key | Value | Required |
|-----|-------|----------|d
| Authorization | Bearer {token} | ✅ |
| Content-Type | application/json | ✅ |

**Request Body**

```json
{
  "categories": ["food", "cafe", "tour", "sports"]
}
```

**카테고리 ID 목록**
| ID | 이름 |
|----|------|
| food | 맛집 |
| cafe | 카페 |
| tour | 관광 |
| festival | 축제 |
| study | 공부 |
| exercise | 운동 |
| exhibition | 전시 |
| sports | 스포츠 |
| volunteer | 봉사 |

**Response 200**

```json
{
  "success": true,
  "message": "선호도가 저장되었습니다."
}
```

---

### 1.3 사용자 선호도 조회

```
GET /users/me/preferences
```

**Headers**
| Key | Value | Required |
|-----|-------|----------|
| Authorization | Bearer {token} | ✅ |

**Response 200**

```json
{
  "success": true,
  "data": {
    "categories": ["food", "cafe", "tour", "sports"],
    "isOnboardingComplete": true
  }
}
```

---

## 2. 카테고리 (Category)

### 2.1 카테고리 목록 조회

```
GET /categories
```

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "전체",
      "isActive": true
    },
    {
      "id": "cat-2",
      "name": "음식카페",
      "isActive": false
    },
    {
      "id": "cat-3",
      "name": "관광명소",
      "isActive": false
    },
    {
      "id": "cat-4",
      "name": "문화생활",
      "isActive": false
    },
    {
      "id": "cat-5",
      "name": "축제행사",
      "isActive": false
    }
  ]
}
```

---

## 3. 미션 (Mission)

### 3.1 AI 추천 미션 목록 조회

```
GET /missions/ai-recommend
```

**Headers**
| Key | Value | Required |
|-----|-------|----------|
| Authorization | Bearer {token} | ✅ |

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | ✅ | 사용자 ID |
| limit | number | ❌ | 조회 개수 (기본값: 5) |

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "mission-1",
      "title": "송도 케이블카 타기",
      "imageUrl": "https://example.com/image.jpg",
      "location": "부산 서구",
      "locationDetail": "송도해상케이블카",
      "distance": "18km",
      "coinReward": 100,
      "category": "관광명소",
      "isLiked": false,
      "endDate": "2025.12.15",
      "insight": "최근 해당 챌린지에 대한 시민 관심도 65%가 증가했습니다.",
      "verificationMethods": [
        "위치 기반 인증 또는 현장 QR 코드 스캔",
        "난이도별 배지 (예: 동백 새싹 배지) 지급"
      ],
      "coordinates": {
        "lat": 35.0686,
        "lng": 129.0208
      }
    }
  ]
}
```

---

### 3.2 전체 미션 목록 조회

```
GET /missions
```

**Headers**
| Key | Value | Required |
|-----|-------|----------|
| Authorization | Bearer {token} | ✅ |

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | ❌ | 카테고리 필터 (전체, 음식카페, 관광명소, 문화생활, 축제행사) |
| sort | string | ❌ | 정렬 방식 (distance, popular, recent) 기본값: distance |
| page | number | ❌ | 페이지 번호 (기본값: 1) |
| limit | number | ❌ | 페이지당 개수 (기본값: 10) |

**Sort 옵션**
| Value | Description |
|-------|-------------|
| distance | 거리순 |
| popular | 인기순 |
| recent | 최신순 |

**Response 200**

```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": "mission-3",
        "title": "롯데 자이언츠 야구 직관 가기",
        "imageUrl": "https://example.com/image.jpg",
        "location": "부산 동래구",
        "locationDetail": "사직야구장",
        "distance": "4.8km",
        "coinReward": 200,
        "category": "문화생활",
        "isLiked": false,
        "endDate": "2025.10.31",
        "insight": "야구 시즌 기간 중 참여율이 120% 상승했습니다.",
        "verificationMethods": [
          "위치 기반 인증 또는 현장 QR 코드 스캔",
          "경기 티켓 인증",
          "난이도별 배지 (예: 동백 새싹 배지) 지급"
        ],
        "coordinates": {
          "lat": 35.1939,
          "lng": 129.0615
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 48,
      "hasNext": true
    }
  }
}
```

---

### 3.3 미션 상세 조회

```
GET /missions/{missionId}
```

**Headers**
| Key | Value | Required |
|-----|-------|----------|
| Authorization | Bearer {token} | ✅ |

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| missionId | string | ✅ | 미션 ID |

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "mission-6",
    "title": "광안리 불꽃축제 챌린지",
    "imageUrl": "https://example.com/image.jpg",
    "location": "부산 수영구",
    "locationDetail": "광안리 해수욕장",
    "distance": "6.8km",
    "coinReward": 500,
    "category": "축제행사",
    "isLiked": false,
    "endDate": "2025.11.30",
    "insight": "최근 해당 챌린지에 대한 시민 관심도 80%가 증가했습니다.",
    "verificationMethods": [
      "위치 기반 인증 또는 현장 QR 코드 스캔",
      "난이도별 배지 (예: 동백 새싹 배지) 지급"
    ],
    "coordinates": {
      "lat": 35.1531,
      "lng": 129.1186
    },
    "participantCount": 1234,
    "completionRate": 78.5
  }
}
```

---

### 3.4 미션 좋아요 토글

```
POST /missions/{missionId}/like
```

**Headers**
| Key | Value | Required |
|-----|-------|----------|
| Authorization | Bearer {token} | ✅ |

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| missionId | string | ✅ | 미션 ID |

**Response 200**

```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 156
  }
}
```

---

### 3.5 미션 참여하기

```
POST /missions/{missionId}/participate
```

**Headers**
| Key | Value | Required |
|-----|-------|----------|
| Authorization | Bearer {token} | ✅ |

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| missionId | string | ✅ | 미션 ID |

**Response 200**

```json
{
  "success": true,
  "data": {
    "participationId": "part-123",
    "status": "in_progress",
    "startedAt": "2025-12-04T10:30:00Z"
  },
  "message": "미션 참여가 완료되었습니다!"
}
```

**Response 400 (이미 참여 중)**

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_PARTICIPATING",
    "message": "이미 참여 중인 미션입니다."
  }
}
```

---

## 4. 탭 네비게이션 (선택적)

### 4.1 탭 목록 조회

```
GET /tabs
```

**Response 200**

```json
{
  "success": true,
  "data": [
    { "id": "tab-1", "name": "홈", "isActive": false },
    {
      "id": "tab-2",
      "name": "챌린지",
      "isActive": true,
      "hasNotification": true
    },
    { "id": "tab-3", "name": "금융자산", "isActive": false },
    { "id": "tab-4", "name": "상품가입", "isActive": false },
    { "id": "tab-5", "name": "도전", "isActive": false }
  ]
}
```

---

## 공통 에러 응답

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다."
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "요청한 리소스를 찾을 수 없습니다."
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버 오류가 발생했습니다."
  }
}
```

---

## 데이터 타입 정의

### Mission

| Field               | Type     | Required | Description                       |
| ------------------- | -------- | -------- | --------------------------------- |
| id                  | string   | ✅       | 미션 고유 ID                      |
| title               | string   | ✅       | 미션 제목                         |
| imageUrl            | string   | ✅       | 미션 대표 이미지 URL              |
| location            | string   | ✅       | 지역 (예: 부산 서구)              |
| locationDetail      | string   | ❌       | 상세 장소 (예: 송도해상케이블카)  |
| distance            | string   | ✅       | 현재 위치로부터 거리              |
| coinReward          | number   | ✅       | 보상 코인                         |
| category            | string   | ✅       | 카테고리                          |
| isLiked             | boolean  | ✅       | 좋아요 여부                       |
| endDate             | string   | ❌       | 마감일 (YYYY.MM.DD)               |
| insight             | string   | ❌       | 인사이트 메시지                   |
| verificationMethods | string[] | ❌       | 인증 방식 목록                    |
| coordinates         | object   | ❌       | 좌표 { lat: number, lng: number } |

### User

| Field           | Type   | Required | Description       |
| --------------- | ------ | -------- | ----------------- |
| id              | string | ✅       | 사용자 고유 ID    |
| name            | string | ✅       | 사용자 이름       |
| profileImageUrl | string | ❌       | 프로필 이미지 URL |

### Category

| Field    | Type    | Required | Description      |
| -------- | ------- | -------- | ---------------- |
| id       | string  | ✅       | 카테고리 고유 ID |
| name     | string  | ✅       | 카테고리 이름    |
| isActive | boolean | ✅       | 활성화 여부      |

---

## API 요약

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | /users/me                  | 현재 사용자 정보 조회 |
| POST   | /users/me/preferences      | 사용자 선호도 저장    |
| GET    | /users/me/preferences      | 사용자 선호도 조회    |
| GET    | /categories                | 카테고리 목록 조회    |
| GET    | /missions/ai-recommend     | AI 추천 미션 조회     |
| GET    | /missions                  | 전체 미션 목록 조회   |
| GET    | /missions/{id}             | 미션 상세 조회        |
| POST   | /missions/{id}/like        | 미션 좋아요 토글      |
| POST   | /missions/{id}/participate | 미션 참여하기         |
| GET    | /tabs                      | 탭 목록 조회 (선택적) |
