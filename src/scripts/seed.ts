import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Category } from '../modules/categories/entities/category.entity';
import { Mission } from '../modules/missions/entities/mission.entity';
import { MissionLike } from '../modules/missions/entities/mission-like.entity';
import { MissionParticipation } from '../modules/missions/entities/mission-participation.entity';
import { User } from '../modules/users/entities/user.entity';
import { toApiCategory } from '../modules/missions/category-transform.util';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [User, Category, Mission, MissionLike, MissionParticipation],
  synchronize: false,
  logging: false,
});

/* -----------------------------
   1) Users
----------------------------- */
const users: User[] = [
  {
    id: 'user-1',
    name: '채수원',
    gender: 'M',
    age: 22,
    profileImageUrl: 'https://example.com/profile-1.jpg',
    acceptanceRate: 0.1,
    activeTimeSlot: 'Day',
    coinBalance: 0,
    preferences: { categories: [], isOnboardingComplete: false },
    fcmToken: null,
  },
  {
    id: 'user-2',
    name: '박보은',
    gender: 'F',
    age: 22,
    profileImageUrl: 'https://example.com/profile-2.jpg',
    acceptanceRate: 0.2,
    activeTimeSlot: 'Day',
    coinBalance: 0,
    preferences: { categories: [], isOnboardingComplete: false },
    fcmToken: null,
  },
  {
    id: 'user-3',
    name: '윤민석',
    gender: 'M',
    age: 60,
    profileImageUrl: 'https://example.com/profile-3.jpg',
    acceptanceRate: 0.05,
    activeTimeSlot: 'Day',
    coinBalance: 0,
    preferences: { categories: [], isOnboardingComplete: false },
    fcmToken: null,
  },
];

/* -----------------------------
   2) Categories
----------------------------- */
const categories: Category[] = [
  { id: 'food', name: '맛집', isActive: true },
  { id: 'cafe', name: '카페', isActive: true },
  { id: 'tour', name: '관광', isActive: true },
  { id: 'culture', name: '문화', isActive: true },
  { id: 'festival', name: '축제', isActive: true },
  { id: 'walk', name: '산책', isActive: true },
  { id: 'shopping', name: '쇼핑', isActive: true },
  { id: 'study', name: '공부', isActive: true },
  { id: 'sports', name: '스포츠', isActive: true },
  { id: 'volunteer', name: '봉사', isActive: false },
  { id: 'exhibition', name: '전시', isActive: false },
  { id: 'exercise', name: '운동', isActive: false },
];

/* -----------------------------
   3) ML 미션 23개 → 엔티티 전체 필드 포함
----------------------------- */

type MissionSeed = {
  id: string;
  categoryMl: string;
  title: string;
  lat: number;
  lng: number;
  reqTimeMin: number;
  coinReward: number;
  priorityWeight: number;
  finalWeight: number;
  location: string;
  locationDetail: string;
  endDate: string;
  insight: string;
  verificationMethods: string[];
};

나는 지금 해커톤을 위해 NestJS 기반 백엔드를 개발 중이다. 기능은 크게 다음과 같다: 1) 전체 미션 목록 조회 API (/v1/missions) 2) 특정 미션 조회 API 3) 미션 참여 API (/participate) 4) 미션 좋아요 API (/like) 5) AI 추천 미션 API (/v1/missions/ai-recommend) 6) 백엔드는 PostgreSQL + TypeORM 구조로 되어 있음 7) 프론트는 React Native이고, 프론트에서 GPS 위치를 받아 백엔드에 전달한다. 현재 시스템은 다음처럼 동작한다: - AI 추천 미션 API는 프론트에서 유저 GPS 좌표(lat, lon)를 백엔드로 전달하면, 백엔드는 그 좌표를 ML 서버로 전달한다. - ML 서버는 모든 미션과 유저 위치의 거리를 계산해 추천 결과를 백엔드로 보낸다. - 백엔드는 이를 프론트에 그대로 전달한다. → **그래서 AI 추천 미션 목록에서는 distance가 정상적으로 보인다.** 하지만 문제는 **일반 미션 조회 API(/v1/missions)** 이다. 문제 상황: - 기본 미션 리스트의 경우, 프론트로 미션 데이터는 잘 내려간다. - 하지만 모든 distance 값이 "0.0km" 로 표시된다. - 즉, 거리 계산이 전혀 안 되고 있다. 내 추측: 1) 프론트에서 GET /v1/missions 호출 시 유저 좌표(lat, lon)를 쿼리스트링으로 안 보내고 있을 가능성 2) 또는 프론트는 보내는데, 백엔드에서 query.lat / query.lon 파싱을 실패하는 경우 3) 또는 백엔드 MissionsService.getMissions() 함수 내에서 거리 계산 로직이 제대로 작동하지 않고 기본값 mission.distance(0)만 반환되고 있을 가능성 백엔드 일부 코드 구조는 다음과 같다: - getAiRecommendations() → userLat, userLon을 받아서 ML 서버로 전달 → 거리 정상 작동 - getMissions() → query.lat / query.lon을 기반으로 haversineDistanceMeters()를 계산해 distanceMetersOverride로 넘기도록 작성됨 - toMissionResponseDto() 내부는 distanceMetersOverride가 undefined면 mission.distance(0)을 사용하므로 항상 0km가 되는 문제가 있다. 지금 필요한 작업: 1) 프론트가 /v1/missions 요청 시 lat, lon을 제대로 전달하는지 확인 2) 백엔드에서 query.lat / query.lon이 정상적으로 숫자로 파싱되는지 검증 3) getMissions()가 실제로 distanceMetersOverride 값을 toMissionResponseDto()에 넘기고 있는지 검증 4) 최종적으로 toMissionResponseDto()가 distanceMetersOverride를 우선 사용하도록 의도대로 동작하는지 확인 5) 위 오류의 근본 원인을 찾아 해결 방법을 제시하고 코드 패치를 제안해달라 목표: "AI 추천 미션은 거리 정상, 기본 미션은 거리 0km" 문제의 원인을 추적하고 해결해줘. 필요하면 추가적인 코드 요청도 해도 된다.



나는 지금 해커톤을 위해 NestJS 기반 백엔드를 개발 중이다. 기능은 크게 다음과 같다:

전체 미션 목록 조회 API (/v1/missions)
특정 미션 조회 API
미션 참여 API (/participate)
미션 좋아요 API (/like)
AI 추천 미션 API (/v1/missions/ai-recommend)
백엔드는 PostgreSQL + TypeORM 구조로 되어 있음
프론트는 React Native이고, 프론트에서 GPS 위치를 받아 백엔드에 전달한다.
현재 시스템은 다음처럼 동작한다:

AI 추천 미션 API는 프론트에서 유저 GPS 좌표(lat, lon)를 백엔드로 전달하면,
백엔드는 그 좌표를 ML 서버로 전달한다.
ML 서버는 모든 미션과 유저 위치의 거리를 계산해 추천 결과를 백엔드로 보낸다.
백엔드는 이를 프론트에 그대로 전달한다.
→ 그래서 AI 추천 미션 목록에서는 distance가 정상적으로 보인다.
하지만 문제는 일반 미션 조회 API(/v1/missions) 이다.

문제 상황:

기본 미션 리스트의 경우, 프론트로 미션 데이터는 잘 내려간다.
하지만 모든 distance 값이 "0.0km" 로 표시된다.
즉, 거리 계산이 전혀 안 되고 있다.
내 추측:

프론트에서 GET /v1/missions 호출 시 유저 좌표(lat, lon)를 쿼리스트링으로 안 보내고 있을 가능성
또는 프론트는 보내는데, 백엔드에서 query.lat / query.lon 파싱을 실패하는 경우
또는 백엔드 MissionsService.getMissions() 함수 내에서 거리 계산 로직이 제대로 작동하지 않고
기본값 mission.distance(0)만 반환되고 있을 가능성
백엔드 일부 코드 구조는 다음과 같다:

getAiRecommendations() → userLat, userLon을 받아서 ML 서버로 전달 → 거리 정상 작동
getMissions() → query.lat / query.lon을 기반으로 haversineDistanceMeters()를 계산해 distanceMetersOverride로 넘기도록 작성됨
toMissionResponseDto() 내부는 distanceMetersOverride가 undefined면 mission.distance(0)을 사용하므로 항상 0km가 되는 문제가 있다.
지금 필요한 작업:

프론트가 /v1/missions 요청 시 lat, lon을 제대로 전달하는지 확인
백엔드에서 query.lat / query.lon이 정상적으로 숫자로 파싱되는지 검증
getMissions()가 실제로 distanceMetersOverride 값을 toMissionResponseDto()에 넘기고 있는지 검증
최종적으로 toMissionResponseDto()가 distanceMetersOverride를 우선 사용하도록 의도대로 동작하는지 확인
위 오류의 근본 원인을 찾아 해결 방법을 제시하고 코드 패치를 제안해달라
목표:
"AI 추천 미션은 거리 정상, 기본 미션은 거리 0km" 문제의 원인을 추적하고 해결해줘.

필요하면 추가적인 코드 요청도 해도 된다.


Findings

In src/modules/missions/missions.service.ts (line 78), distance for the base list is only computed when lat and lon are provided. If either is missing, it falls back to mission.distance ?? 0, and the seeded missions in src/scripts/seed.ts set distance to 0, so the API returns "0.0km".
The API spec for GET /missions (API_SPEC.md) documents only category, sort, page, and limit; lat/lon are not mentioned, so the RN client likely never sends them (unlike /missions/ai-recommend, where the client does send coords).
Query parsing itself is fine: getMissions converts query.lat/query.lon to numbers and passes the computed distanceMeters into toMissionResponseDto. toMissionResponseDto prefers the override (distanceMetersOverride ?? ...), so the logic would work as soon as coords arrive.
Fix Suggestions

Send coords from the RN client on the base list call: GET /v1/missions?lat={userLat}&lon={userLon}&sort=distance. Update the API spec to list lat/lon so the client team doesn’t miss them.
Add validation/transform to fail fast if coords are omitted for distance sorting and to coerce query strings to numbers:
main.ts: register a global pipe new ValidationPipe({ transform: true, whitelist: true }).
missions.types.ts: mark lat/lon with @IsNumber() and @Type(() => Number), and make them required when sorting by distance.
Optionally guard in getMissions so missing coords return 400 instead of silently returning 0 km.
Next Steps

Update the RN call to include lat/lon and retest; 2) Patch backend validation as above to prevent silent fallbacks; 3) Refresh API spec so future consumers send coords by default.
너는 NestJS + TypeORM 기반 백엔드 프로젝트의 코드 리뷰 및 디버깅을 수행하는 전문가다.
현재 프로젝트는 “BNK 로컬 챌린지” 해커톤용 백엔드이며 주요 기능은 다음과 같다:

미션 전체 조회

카테고리별 미션 조회

AI 추천 미션 조회

미션 참여/완료 기능

AI 추천 미션은 정상적으로 동작하며, 유효한 미션 리스트를 프론트로 전달하고 있다.

그러나 카테고리별 미션 조회(GET /v1/missions?category=xxx) 를 요청하면
프론트가 “더미 미션(가짜 데이터)”를 띄운다.
이는 프론트가 백엔드로부터 정상적인 missions array 를 받지 못했다는 의미이다.

확인해야 하는 주요 포인트

아래 파일들을 중심으로 정밀 점검해줘:

src/modules/missions/category-transform.util.ts

src/modules/missions/missions.service.ts

src/modules/categories/*

src/scripts/seed.ts 의 mission.category 값 저장 부분

정확히 의심되는 문제

프론트는 예: "exercise", "culture", "walk" 등 소문자 API category 문자열을 보낸다.

백엔드는 toMlCategory() 에서 내부 ML용 카테고리 enum으로 변환해야 한다.

이 변환이 실패하면 WHERE mission.category = :category 조건이 false가 되어
DB에서 조회되는 미션이 0개가 된다.

미션 배열이 빈 배열 → 프론트는 fallback으로 “dummy missions” 를 띄움.

또한 다음 가능성도 체크해줘:

실제 DB의 mission.category 값이 ML category 기준으로 저장되어 있는가?
예: ‘Sports’, ‘Cafe’, ‘Food’, ‘Tourist’ 등

API category → ML category 변환 규칙이 seed 데이터와 1:1 매칭되는가?

toApiCategory() 가 프런트에 반환할 때 문자열이 깨지거나 변환이 잘못되는가?

missions.service.ts 내부에서 category 필터링이 조건 불일치로 인해 항상 empty를 반환하는가?

요청 사항

아래를 반드시 수행해줘:

전체 흐름을 따라 오류가 발생하는 지점을 정확히 pinpoint
(프론트 입력 → controller → query DTO → service → WHERE 조건 → 반환 → DTO 변환)

category-transform.util.ts 내용을 검증하고,
API category와 ML category, DB category가 서로 호환되는지 매핑 테이블을 작성해서 설명해줘.

Seed 데이터의 category 값과 변환 유틸이 불일치하는 경우 수정안 제시

missions.service.ts의 getMissions()에서 category 필터링 로직을 점검하고 수정 코드 제시

문제를 확실히 해결할 수 있도록 코드 수정 패치를 diff 형식으로 제공해줘.

테스트 시나리오 (3가지 정도) 를 포함해
실제로 GET /v1/missions?category=exercise 요청 시 정상 미션이 반환되는지 설명해줘.

목표는:

프론트가 category=xxx 를 보내면

백엔드가 올바르게 변환 후 DB에서 정상 조회하여

missions array 를 빈 배열이 아닌 정상 데이터로 반환하게 하는 것.


What’s wrong

mission.category in DB is stored as API-style strings (food, tour, sports, …) from seed.ts via toApiCategory.
getMissions filters with toMlCategory, so category=food becomes Food and the SQL WHERE mission.category = 'Food' matches nothing → empty missions → RN shows dummy data.
The reverse mapping in category-transform.util.ts is also broken: exercise/exhibition overrides are overwritten by the reducer, so exercise stays exercise instead of mapping to Sports.
Mapping table (after fix)

ML category (CSV/ML)	API/front input	Stored in DB
Food	food	food
Cafe	cafe	cafe
Tourist	tour	tour
Culture	culture	culture
Festival	festival	festival
Walk	walk	walk
Shopping	shopping	shopping
Self-Dev	study	study
Sports	sports / exercise	sports
Culture	exhibition	culture
Patch (diff)

*** Update File: src/modules/missions/category-transform.util.ts
@@
-const ML_TO_API_CATEGORY: Record<string, string> = {
-  Food: 'food',
-  Cafe: 'cafe',
-  Tourist: 'tour',
-  Culture: 'culture',
-  Festival: 'festival',
-  Walk: 'walk',
-  Shopping: 'shopping',
-  'Self-Dev': 'study',
-  Sports: 'sports',
-  // Additional mappings for API spec alignment
-  exhibition: 'exhibition',
-  exercise: 'exercise',
-};
-
-const API_TO_ML_CATEGORY: Record<string, string> = Object.entries(ML_TO_API_CATEGORY).reduce(
-  (acc, [ml, api]) => {
-    acc[api] = ml;
-    return acc;
-  },
-  {
-    // manual overrides and additions
-    exercise: 'Sports',
-    exhibition: 'Culture',
-  } as Record<string, string>,
-);
+const ML_TO_API_CATEGORY: Record<string, string> = {
+  Food: 'food',
+  Cafe: 'cafe',
+  Tourist: 'tour',
+  Culture: 'culture',
+  Festival: 'festival',
+  Walk: 'walk',
+  Shopping: 'shopping',
+  'Self-Dev': 'study',
+  Sports: 'sports',
+};
+
+// Canonical API categories we store in DB; also capture synonyms the app may send.
+const API_CATEGORY_CANON: Record<string, string> = {
+  food: 'food',
+  cafe: 'cafe',
+  tour: 'tour',
+  culture: 'culture',
+  festival: 'festival',
+  walk: 'walk',
+  shopping: 'shopping',
+  study: 'study',
+  sports: 'sports',
+  exercise: 'sports',   // synonym → sports missions
+  exhibition: 'culture', // synonym → culture missions
+};
+
+const API_TO_ML_CATEGORY: Record<string, string> = {
+  exercise: 'Sports',
+  exhibition: 'Culture',
+};
+
+for (const [ml, api] of Object.entries(ML_TO_API_CATEGORY)) {
+  if (!(api in API_TO_ML_CATEGORY)) {
+    API_TO_ML_CATEGORY[api] = ml;
+  }
+}
@@
 export function toApiCategory(mlCategory?: string | null): string | undefined {
   if (!mlCategory) return undefined;
   return ML_TO_API_CATEGORY[mlCategory] ?? mlCategory.toLowerCase();
 }
 
 export function toMlCategory(apiCategory?: string | null): string | undefined {
-  if (!apiCategory) return undefined;
-  return API_TO_ML_CATEGORY[apiCategory] ?? apiCategory;
+  const normalized = normalizeApiCategory(apiCategory);
+  if (!normalized) return undefined;
+  return API_TO_ML_CATEGORY[normalized] ?? normalized;
 }
 
 export const CATEGORY_MAPPINGS = {
   mlToApi: ML_TO_API_CATEGORY,
   apiToMl: API_TO_ML_CATEGORY,
+  apiCanonical: API_CATEGORY_CANON,
 };
+
+export function normalizeApiCategory(apiCategory?: string | null): string | undefined {
+  if (!apiCategory) return undefined;
+  const key = apiCategory.toLowerCase();
+  return API_CATEGORY_CANON[key] ?? key;
+}
*** Update File: src/modules/missions/missions.service.ts
@@
-import { toApiCategory, toMlCategory } from './category-transform.util';
+import { normalizeApiCategory, toApiCategory, toMlCategory } from './category-transform.util';
@@
-    if (query.category) {
-      const mlCategory = toMlCategory(query.category);
-      if (mlCategory) {
-        qb.andWhere('mission.category = :category', { category: mlCategory });
-      }
-    }
+    if (query.category) {
+      const apiCategory = normalizeApiCategory(query.category);
+      if (apiCategory) {
+        qb.andWhere('mission.category = :category', { category: apiCategory });
+      }
+    }
Why this fixes it

We now normalize the incoming API category (including synonyms like exercise → sports) and filter against the stored API category strings, so the SQL matches rows.
The reverse map keeps the manual overrides, so exercise correctly maps to Sports when we need ML categories (e.g., for user prefs).
Test scenarios

GET /v1/missions?category=exercise&sort=distance → returns missions seeded with Sports (e.g., M021–M023), distance populated.
GET /v1/missions?category=culture → returns missions with ML Culture (stored culture, e.g., M007–M009).
GET /v1/missions?category=walk → returns walk missions (M012–M014). Optionally verify category=food also succeeds.
Apply the diff above, redeploy/restart, and re-run the three calls to confirm the missions array is non-empty.

해당 분석을 바탕으로 올바르게 동작하도록 코드를 수정해줘.


Updated the category mapping and filtering so category queries return real missions instead of empty results.

Changes made

src/modules/missions/category-transform.util.ts: Introduced canonical API category map (includes synonyms like exercise→sports, exhibition→culture), fixed reverse mapping so overrides aren’t overwritten, added normalizeApiCategory helper, and kept a clear ML↔API mapping table.
src/modules/missions/missions.service.ts: Category filter now uses the normalized API category (the value actually stored in DB) instead of converting to ML category, so the SQL WHERE mission.category = :category matches rows.
Why this fixes it

Missions are stored with API-style lowercase categories (from seed.ts). Previously, category=food was converted to Food and filtered against the DB, yielding zero rows. Now we normalize to the stored API value and match correctly.
Synonyms from the app are handled (exercise hits sports missions, exhibition hits culture missions).
Quick mapping reference
| ML (seed/CSV) | API/front | Stored in DB |
| Food | food | food |
| Cafe | cafe | cafe |
| Tourist | tour | tour |
| Culture | culture / exhibition | culture |
| Festival | festival | festival |
| Walk | walk | walk |
| Shopping | shopping | shopping |
| Self-Dev | study | study |
| Sports | sports / exercise | sports |

Test scenarios (after rebuild/restart)

GET /v1/missions?category=exercise → returns sports missions (e.g., M021–M023), non-empty.
GET /v1/missions?category=culture → returns culture missions (M007–M009), non-empty.
GET /v1/missions?category=walk → returns walk missions (M012–M014), non-empty.
Files touched

src/modules/missions/category-transform.util.ts
src/modules/missions/missions.service.ts
Natural next steps

Redeploy/restart the service so the new mapping is used.
(Optional) Update API docs to list accepted categories and synonyms.
We have an issue with our backend recommendation logic in a NestJS project.

Current Behavior

The backend calls our ML server to fetch AI mission recommendations.

The ML server always returns all missions (23 items) sorted by final_score, regardless of any limit parameter.

The backend simply forwards all received recommendations to the React Native client.

The RN client expects only Top N recommendations (e.g., top 3 or top 5), but receives all 23, which breaks UI behavior.

Goal

Modify only the backend (NestJS) so that:

Even if the ML server returns 23 recommendations,

The backend should slice them to limit before returning to the client.

Files Involved

src/modules/missions/missions.service.ts

Relevant backend code (excerpt)
const recommendations: RecommendationResult[] = userContext
? await this.aiRecommendationService.getRecommendations(userContext, limit)
: [];

if (recommendations.length) {
const missionIds = recommendations.map((r) => r.mission_id);
const missions = await this.missionsRepository.find({
where: { id: In(missionIds) },
});
const missionMap = new Map(missions.map((m) => [m.id, m]));
const ordered = recommendations
.map((rec) => {
const mission = missionMap.get(rec.mission_id);
if (!mission) return null;
return this.toMissionResponseDto(mission, undefined, rec);
})
.filter((m): m is MissionResponseDto => !!m);

if (ordered.length) {
return ordered; // ← FIX HERE: slice the array so only top-N missions are returned
}
}

What I want you to do

Analyze the function getAiRecommendations.

Modify the backend logic so that:

The final returned array is:
return ordered.slice(0, limit);

Ensure no other side effects break the sorting or DTO mapping.

Provide the corrected code snippet or the full updated function.

Confirm that this fix safely limits results without requiring ML server changes.

Deliverables

Updated code section

Explanation of why the fix is correct

Any optional improvements if needed (not required)

Make the answer as precise as possible.


Applied a minimal fix to cap AI recommendations at the requested limit. In src/modules/missions/missions.service.ts, the ordered recommendation list is now returned as ordered.slice(0, limit), so even if the ML server sends all 23 items, the backend will forward only the top N requested by the client. Sorting and DTO mapping remain unchanged; no other side effects introduced.

나는 NestJS 기반 챌린지 백엔드를 유지보수 중이다.
현재 미션 완료 API(/v1/missions/:id/complete)는 정상적으로 작동하고 있으며, 완료 시 다음을 수행한다:

mission_participations 테이블에서 해당 유저·미션 레코드를 찾는다.

status를 "completed"로 업데이트한다.

participatedAt, completedAt도 정상 저장된다.

DB 콘솔에서도 해당 참여기록은 정상적으로 completed 상태로 저장돼 있다.

문제는 프론트 화면에서 '진행중인 챌린지' 섹션이 절대로 사라지지 않는다는 점이다.
이미 완료 처리했고 DB에서도 status가 completed인데도 프론트는 여전히 오래된 진행중 챌린지를 표시한다.

지금 내가 의심하는 원인은 다음 중 하나다:

프론트에서 진행중 챌린지 조회 API 요청을 잘못 보내고 있을 가능성

아마 /v1/missions 또는 /v1/users/me 조회에서 참여정보를 갱신 없이 캐싱하고 있을 수 있다.

혹은 진행중 챌린지 목록을 백엔드가 아닌 로컬 스토리지에서 불러오고 있을 수 있다.

백엔드 getMissions() 또는 toMissionResponseDto()에서 participationStatus를 잘못 계산할 가능성

현재 참여 정보를 조회하는 로직:

participationStatus: participation ? participation.status : null

참여 정보 조회 메서드:

private async getParticipationForMission(userId, missionId)

또는

getParticipationMap()

이 메서드가 completed 상태도 "진행중"으로 인식하거나 조회 자체가 못 되고 있을 수 있다.

프론트가 완료된 챌린지를 제외하는 필터링을 구현하지 않았을 가능성
즉, participationStatus가 completed여도 그냥 "진행중 챌린지" UI에 넣고 있을 수 있음.

내가 너에게 원하는 것

아래 파일들의 동작을 검사해 다음 사항을 점검하고 수정안 또는 패치를 제시해줘:

반드시 검사해야 하는 파일들

src/modules/missions/missions.service.ts

getMissions(), getMissionById(), toMissionResponseDto()

getParticipationMap() / getParticipationForMission()

프론트 요청 스펙 상 진행중 챌린지 목록을 어디에서 가져가는지 추론 필요

반드시 해결해야 하는 문제

미션 완료 후 진행중 챌린지 목록이 백엔드에서 올바르게 내려가는지 점검

프론트가 완료된 챌린지를 제외하지 않고 있는지 검사

participationStatus가 completed로 세팅되어도 그대로 프론트에서 진행중으로 표시될 수 있는 문제 원인 찾기

필요하면 백엔드에서 진행중 챌린지를 명확히 구분하는 API (/v1/missions/active) 등을 만드는 제안 가능

참고사항

참여 테이블 현재 상태 예시:

id: ea8e2b64...
mission_id: M002
user_id: user-1
status: completed

그러나 프론트 UI에는 여전히 "부산대 앞 토스트 골목 간식타임"이 진행중으로 표시됨.

최종 출력 형식

다음 4가지로 정리해서 답변해줘:

문제의 근본 원인

백엔드에서 수정해야 할 부분

프론트에서 수정해야 할 부분

수정된 코드 스니펫(필요 시)


문제의 근본 원인

백엔드 /v1/missions는 미션을 상태별로 필터링하지 않고, participationStatus를 그대로 내려줄 뿐입니다. 완주 후에도 목록에서 제외되지 않으므로 프론트가 별도 필터를 하지 않으면 진행중 섹션에 계속 노출됩니다.
현재 코드상 참여 상태는 정확히 내려가며(participation.status 그대로 DTO에 반영), DB 업데이트도 정상입니다. 즉, 목록에서 “진행중만” 거르는 로직이 프론트 또는 API 사용 측에 없습니다.
추가로, 프론트가 토큰 없이 호출하면 userId가 없어서 participationStatus가 항상 null이 되고, 로컬 캐시/스토리지의 이전 진행중 목록을 계속 보여줄 여지도 있습니다.
백엔드에서 수정해야 할 부분

GET /v1/missions에 선택적 필터 participationStatus를 추가해, 서버에서 바로 진행중/완료를 걸러서 줄 수 있게 했습니다.
MissionsQueryDto에 participationStatus?: 'in_progress' | 'completed' 추가.
getMissions에서 참여 맵을 조회한 뒤, 요청된 상태와 일치하지 않는 미션은 제외하도록 필터링.
프론트에서 수정해야 할 부분

진행중 섹션을 구성할 때 /v1/missions?participationStatus=in_progress로 요청하거나, 응답의 participationStatus가 in_progress인 항목만 클라이언트에서 필터링하세요.
토큰 없이 호출하는 경우 참여 상태가 null로 내려오므로, 인증 후 호출하도록 확인하고, 로컬 캐시된 진행중 리스트가 있다면 완료 처리 직후 갱신/무효화해야 합니다.
수정된 코드 스니펫

src/modules/missions/missions.types.ts:
export class MissionsQueryDto {
  category?: string;
  sort?: 'distance' | 'popular' | 'recent';
  page?: number;
  limit?: number;
  lat?: number;
  lon?: number;
  participationStatus?: 'in_progress' | 'completed';
}
src/modules/missions/missions.service.ts (일부):
let missionsWithDistance = missions.map((mission) => {
  const distanceMeters = /* 기존 거리 계산 */;
  return { mission, distanceMeters };
});

if (query.participationStatus) {
  missionsWithDistance = missionsWithDistance.filter(({ mission }) => {
    const participation = participationMap.get(mission.id);
    return participation?.status === query.participationStatus;
  });
}
요약

백엔드: 상태 필터를 옵션으로 제공하도록 보완했으니, participationStatus=in_progress로 호출하면 완료된 챌린지가 빠진 목록을 바로 받을 수 있습니다.
프론트: 상태 필터 파라미터를 사용하거나, 응답의 participationStatus를 기준으로 클라이언트에서 필터링/캐싱 무효화 로직을 적용해야 진행중 섹션이 올바르게 사라집니다.
2 files changed
+31
-23


missions.service.ts
+22
-15

missions.types.ts
+9
-8

I have a NestJS + TypeORM backend with a seed.ts file that inserts 23 missions into a PostgreSQL DB.
Currently in seed.ts, the following fields for all missions are hardcoded and identical:

location: "부산 전역",
locationDetail: "상세 위치는 지도 참고",
endDate: "2025-12-31",
insight: "미션을 수행해보세요.",
verificationMethods: ["사진 인증"]

I want to customize these per mission instead of using the same placeholder values.

Here is the relevant part of my current seed code:

--- (paste from MISSIONS_CSV to missions mapping section) ---

Requirements:

Modify the seed structure so that each mission can have its own:

location
locationDetail
endDate
insight
verificationMethods (array)
Update the missions mapping so these fields are loaded from a new extended MISSIONS_CSV definition or another structure you propose.

Maintain the existing upsert logic (upsert(missions, ['id'])) so that I can run npm run seed repeatedly and only the changed missions update.

Ensure the final code does NOT break the Mission entity fields and keeps compatibility with TypeORM.

Produce:

Updated MISSIONS_CSV (or a new structure)
Updated mapping logic
The exact diff or full updated seed.ts section
Make the implementation clean and scalable so new missions can be added easily.

Please transform my existing seed.ts accordingly.


Updated src/scripts/seed.ts to support mission-specific seed data.

What changed

Replaced the old tuple-based MISSIONS_CSV with a structured MISSIONS array that includes per-mission location, locationDetail, endDate, insight, and verificationMethods.
Added a MissionSeed type for clarity and scalability.
Updated the mapping to use the new structure and feed all custom fields into the Mission entity while retaining the existing upsert behavior.
Key sections (already applied)

New seed structure:
MissionSeed type and const MISSIONS: MissionSeed[] = [ ... ] with all 23 missions having individualized location, detail, dates, insights, and verification methods.
Mapping update:
const missions: Mission[] = MISSIONS.map((m) => {
  const categoryApi = toApiCategory(m.categoryMl);
  if (!categoryApi) throw new Error(...);

  return {
    id: m.id,
    title: m.title,
    category: categoryApi,
    coordinates: { lat: m.lat, lng: m.lng },
    coinReward: m.coinReward,
    priorityWeight: m.priorityWeight,
    finalWeight: m.finalWeight,
    reqTimeMin: m.reqTimeMin,
    distance: 0,
    imageUrl: `${S3_BASE}/${m.id}.jpg`,
    location: m.location,
    locationDetail: m.locationDetail,
    endDate: m.endDate,
    insight: m.insight,
    verificationMethods: m.verificationMethods,
    isLiked: false,
  };
});
Notes

upsert(missions, ['id']) remains unchanged, so re-running npm run seed will update existing missions by ID.
The Mission entity fields remain compatible with TypeORM.
1 file changed


seed.ts
+415
-64

You are helping me edit a NestJS seed script for our BNK challenge backend.

File: src/scripts/seed.ts (TypeScript)

Right now I have a MISSIONS constant of type MissionSeed[] where each mission has detailed fields like location, locationDetail, endDate, insight, and verificationMethods.

Here is the current MISSIONS array:

type MissionSeed = {
id: string;
categoryMl: string;
title: string;
lat: number;
lng: number;
reqTimeMin: number;
coinReward: number;
priorityWeight: number;
finalWeight: number;
location: string;
locationDetail: string;
endDate: string;
insight: string;
verificationMethods: string[];
};

const MISSIONS: MissionSeed[] = [
{
id: 'M001',
categoryMl: 'Food',
title: '자갈치시장 꼼장어 골목 방문',
lat: 35.0968,
lng: 129.0306,
reqTimeMin: 40,
coinReward: 50,
priorityWeight: 1,
finalWeight: 1.1,
location: '중구 자갈치시장',
locationDetail: '꼼장어 골목 초입',
endDate: '2025-08-31',
insight: '해산물 골목의 활기찬 분위기를 느껴보세요.',
verificationMethods: ['현장 사진 인증'],
},
{
id: 'M002',
categoryMl: 'Food',
title: '부산대 앞 토스트 골목 간식타임',
lat: 35.2327,
lng: 129.0823,
reqTimeMin: 40,
coinReward: 50,
priorityWeight: 0,
finalWeight: 1.0,
location: '금정구 부산대 앞',
locationDetail: '토스트 가게 밀집 구역',
endDate: '2025-09-15',
insight: '학생가의 숨은 맛집을 찾아보세요.',
verificationMethods: ['영수증 사진', '음식 사진'],
},
{
id: 'M003',
categoryMl: 'Cafe',
title: '전포 카페거리 힙한 카페 찾기',
lat: 35.1557,
lng: 129.0629,
reqTimeMin: 30,
coinReward: 50,
priorityWeight: 0,
finalWeight: 1.0,
location: '부산진구 전포동',
locationDetail: '전포 카페거리 일대',
endDate: '2025-10-31',
insight: '감성 카페에서 여유를 즐겨보세요.',
verificationMethods: ['카페 외관 사진', '음료 컵 홀더 사진'],
},
{
id: 'M004',
categoryMl: 'Cafe',
title: '영도 흰여울문화마을 오션뷰 카페',
lat: 35.0768,
lng: 129.0419,
reqTimeMin: 30,
coinReward: 50,
priorityWeight: 1,
finalWeight: 1.1,
location: '영도 흰여울문화마을',
locationDetail: '해안 절벽 뷰 카페',
endDate: '2025-12-31',
insight: '바다 전망과 함께 커피 한 잔.',
verificationMethods: ['뷰가 보이는 창가 사진'],
},
{
id: 'M005',
categoryMl: 'Tourist',
title: '해운대 블루라인파크 해변열차 구경',
lat: 35.1876,
lng: 129.2068,
reqTimeMin: 10,
coinReward: 100,
priorityWeight: 2,
finalWeight: 1.2,
location: '해운대 송정~청사포',
locationDetail: '블루라인 해변열차 승강장',
endDate: '2025-07-31',
insight: '부산의 대표 해안 뷰를 따라 달려보세요.',
verificationMethods: ['열차 탑승 사진', '승차권 사진'],
},
{
id: 'M006',
categoryMl: 'Tourist',
title: '감천문화마을 어린왕자와 사진찍기',
lat: 35.0976,
lng: 129.0104,
reqTimeMin: 10,
coinReward: 100,
priorityWeight: 2,
finalWeight: 1.2,
location: '사하구 감천문화마을',
locationDetail: '어린왕자 조형물 인근',
endDate: '2025-09-30',
insight: '형형색색 마을과 사진 스팟을 기록하세요.',
verificationMethods: ['어린왕자 조형물 배경 사진'],
},
{
id: 'M007',
categoryMl: 'Culture',
title: '영화의전당 시네마테크 관람',
lat: 35.1716,
lng: 129.1307,
reqTimeMin: 60,
coinReward: 250,
priorityWeight: 1,
finalWeight: 1.1,
location: '해운대구 우동',
locationDetail: '영화의전당 시네마테크',
endDate: '2025-11-15',
insight: '예술영화를 한 편 감상해보세요.',
verificationMethods: ['티켓 사진', '상영관 내부 사진'],
},
{
id: 'M008',
categoryMl: 'Culture',
title: '부산시립미술관 전시회 관람',
lat: 35.1729,
lng: 129.1296,
reqTimeMin: 60,
coinReward: 250,
priorityWeight: 1,
finalWeight: 1.1,
location: '해운대구 센텀시티',
locationDetail: '부산시립미술관',
endDate: '2025-12-31',
insight: '현재 진행 중인 전시를 감상하세요.',
verificationMethods: ['전시 티켓 사진', '작품 앞 인증샷'],
},
{
id: 'M009',
categoryMl: 'Culture',
title: 'F1963 복합문화공간 방문',
lat: 35.1506,
lng: 129.0629,
reqTimeMin: 60,
coinReward: 250,
priorityWeight: 1,
finalWeight: 1.1,
location: '수영구 망미동',
locationDetail: 'F1963 스틸하우스 일대',
endDate: '2025-10-15',
insight: '문화·예술 복합공간을 탐방해보세요.',
verificationMethods: ['공간 전경 사진', '전시/매장 사진'],
},
{
id: 'M010',
categoryMl: 'Festival',
title: '광안리 해수욕장 불꽃축제 명당 찾기',
lat: 35.1532,
lng: 129.1189,
reqTimeMin: 10,
coinReward: 100,
priorityWeight: 3,
finalWeight: 1.3,
location: '광안리 해변',
locationDetail: '불꽃 감상 명소 구간',
endDate: '2025-10-31',
insight: '불꽃축제 베스트 스팟을 인증하세요.',
verificationMethods: ['불꽃이 보이는 사진'],
},
{
id: 'M011',
categoryMl: 'Festival',
title: 'BIFF 광장 먹자골목 투어',
lat: 35.0989,
lng: 129.0305,
reqTimeMin: 10,
coinReward: 100,
priorityWeight: 2,
finalWeight: 1.2,
location: '중구 BIFF 광장',
locationDetail: '먹자골목 일대',
endDate: '2025-09-10',
insight: 'BIFF 광장의 활기를 느껴보세요.',
verificationMethods: ['거리 음식 사진', '간판 배경 인증'],
},
{
id: 'M012',
categoryMl: 'Walk',
title: '부산시민공원 20분 걷기 챌린지',
lat: 35.1687,
lng: 129.0571,
reqTimeMin: 20,
coinReward: 200,
priorityWeight: 1,
finalWeight: 1.1,
location: '부산진구 부산시민공원',
locationDetail: '도심 산책로 구간',
endDate: '2025-08-15',
insight: '도심 속 녹지에서 짧은 산책을 즐기세요.',
verificationMethods: ['산책 경로 스크린샷', '공원 표지판 사진'],
},
{
id: 'M013',
categoryMl: 'Walk',
title: '동백섬 산책로 한 바퀴 돌기',
lat: 35.1588,
lng: 129.1345,
reqTimeMin: 20,
coinReward: 200,
priorityWeight: 1,
finalWeight: 1.1,
location: '해운대 동백섬',
locationDetail: '산책로 순환 코스',
endDate: '2025-09-30',
insight: '바다와 숲을 동시에 즐길 수 있는 코스.',
verificationMethods: ['산책로 이정표 사진', '뷰포인트 인증샷'],
},
{
id: 'M014',
categoryMl: 'Walk',
title: '온천천 벚꽃길 산책 코스 완주',
lat: 35.1971,
lng: 129.0857,
reqTimeMin: 20,
coinReward: 200,
priorityWeight: 1,
finalWeight: 1.1,
location: '동래구 온천천',
locationDetail: '벚꽃길 산책로',
endDate: '2025-12-15',
insight: '계절별로 다른 매력을 느껴보세요.',
verificationMethods: ['산책로 표지판 사진', '꽃길/수변 인증샷'],
},
{
id: 'M015',
categoryMl: 'Shopping',
title: '부전시장 장보기 챌린지',
lat: 35.1639,
lng: 129.0604,
reqTimeMin: 30,
coinReward: 150,
priorityWeight: 1,
finalWeight: 1.1,
location: '부전시장',
locationDetail: '청과/수산 구역',
endDate: '2025-12-30',
insight: '전통시장의 활기를 체험하세요.',
verificationMethods: ['시장 전경 사진', '구매 영수증'],
},
{
id: 'M016',
categoryMl: 'Shopping',
title: '신세계 센텀시티 아이쇼핑',
lat: 35.1688,
lng: 129.1306,
reqTimeMin: 30,
coinReward: 150,
priorityWeight: 2,
finalWeight: 1.2,
location: '해운대구 센텀시티',
locationDetail: '신세계 센텀시티 내부',
endDate: '2025-12-25',
insight: '초대형 몰을 돌아보며 신상품을 구경하세요.',
verificationMethods: ['매장 내부 사진', '브랜드 로고 배경 인증'],
},
{
id: 'M017',
categoryMl: 'Shopping',
title: '국제시장 구제골목 탐방',
lat: 35.0998,
lng: 129.0304,
reqTimeMin: 30,
coinReward: 150,
priorityWeight: 1,
finalWeight: 1.1,
location: '중구 국제시장',
locationDetail: '구제/빈티지 골목',
endDate: '2025-12-11',
insight: '빈티지 아이템을 발굴해보세요.',
verificationMethods: ['골목 전경 사진', '득템 아이템 사진'],
},
{
id: 'M018',
categoryMl: 'Self-Dev',
title: '부산은행 본점(BIFC) 금융센터 방문',
lat: 35.1143,
lng: 129.0476,
reqTimeMin: 60,
coinReward: 300,
priorityWeight: 3,
finalWeight: 1.3,
location: '남구 문현동 BIFC',
locationDetail: '부산은행 본점 로비/금융센터',
endDate: '2025-12-21',
insight: '금융센터 방문으로 금융 지식을 쌓아보세요.',
verificationMethods: ['센터 전경 사진', '안내 데스크 배경 인증'],
},
{
id: 'M019',
categoryMl: 'Self-Dev',
title: '부산광역시립도서관 열람실 이용',
lat: 35.2052,
lng: 129.0863,
reqTimeMin: 60,
coinReward: 300,
priorityWeight: 0,
finalWeight: 1.0,
location: '연제구 부산시립도서관',
locationDetail: '열람실/학습실',
endDate: '2025-12-24',
insight: '집중 독서로 자기계발 시간을 확보하세요.',
verificationMethods: ['도서관 출입 인증샷', '열람실 자리 사진'],
},
{
id: 'M020',
categoryMl: 'Self-Dev',
title: '영풍문고 광복점 베스트셀러 구경',
lat: 35.0989,
lng: 129.0311,
reqTimeMin: 60,
coinReward: 300,
priorityWeight: 0,
finalWeight: 1.0,
location: '중구 광복동',
locationDetail: '영풍문고 광복점 매장',
endDate: '2025-12-31',
insight: '베스트셀러 코너에서 새로운 책을 발견하세요.',
verificationMethods: ['매장 간판 사진', '책 표지 인증'],
},
{
id: 'M021',
categoryMl: 'Sports',
title: '사직야구장 롯데 자이언츠 직관',
lat: 35.194,
lng: 129.0615,
reqTimeMin: 40,
coinReward: 200,
priorityWeight: 2,
finalWeight: 1.2,
location: '동래구 사직야구장',
locationDetail: '야구장 내 관람석',
endDate: '2025-12-20',
insight: '직관의 열기를 사진으로 남겨보세요.',
verificationMethods: ['경기장 전광판 사진', '응원 도구 인증'],
},
{
id: 'M022',
categoryMl: 'Sports',
title: 'BNK 썸 농구단 홈경기 응원',
lat: 35.1923,
lng: 129.0607,
reqTimeMin: 40,
coinReward: 200,
priorityWeight: 3,
finalWeight: 1.3,
location: '사직 실내체육관',
locationDetail: '농구장 관람석',
endDate: '2025-12-10',
insight: 'vs KB스타즈 리그 2등과 3등의 접전!',
verificationMethods: ['농구장 관람석에 5초 머무르기 (GPS 기반 인증)'],
},
{
id: 'M023',
categoryMl: 'Sports',
title: '삼락생태공원 자전거 라이딩',
lat: 35.1808,
lng: 128.9856,
reqTimeMin: 40,
coinReward: 200,
priorityWeight: 1,
finalWeight: 1.1,
location: '북구 삼락생태공원',
locationDetail: '자전거 라이딩 코스',
endDate: '2025-12-31',
insight: '강변 라이딩으로 땀을 식혀보세요.',
verificationMethods: ['자전거와 코스 표지판 사진', '라이딩 기록 앱 캡처'],
},
];

Task

Normalize verificationMethods

For every mission, change verificationMethods to be an array with exactly one string.

That string should describe what the user must do or what they must capture, followed by the 인증 방식 in parentheses.

Use one of these 4 인증 방식 labels, in Korean, inside the parentheses:

QR 인증

사진 인증

영수증 인증

GPS 인증

Examples of the final style:

'가게 간판이 보이도록 현장 사진 촬영 (사진 인증)'

'해당 매장에서 결제한 영수증 제출 (영수증 인증)'

'현장에 비치된 QR 코드 스캔 (QR 인증)'

'지정 구간에서 5분 이상 머문 GPS 기록 제출 (GPS 인증)'

Choose the most appropriate 인증 방식 for each mission, based on its content (market/food → 사진 or 영수증, 도서관/금융센터 → 사진 or QR, 걷기/라이딩/머무르기 → GPS, etc.).

Adjust all endDate values

For every mission, change endDate to a date string between 2025-12-09 and 2025-12-31 (inclusive).

Format must remain 'YYYY-MM-DD'.

It is okay if the dates don’t strictly match seasons; just pick reasonable dates in that range (you can distribute them over that period so they are not all identical).

Do not change anything else:

Keep id, categoryMl, title, lat, lng, reqTimeMin, coinReward, priorityWeight, finalWeight, location, locationDetail, and insight exactly as they are now.

Do not change the surrounding code (types, mapping to missions, etc.).

Output format

Return only the updated const MISSIONS: MissionSeed[] = [...] block, with all 23 missions fully expanded and formatted as valid TypeScript.

No extra comments or explanation text outside the code block.


const MISSIONS: MissionSeed[] = [
  {
    id: 'M001',
    categoryMl: 'Food',
    title: '자갈치시장 꼼장어 골목 방문',
    lat: 35.0968,
    lng: 129.0306,
    reqTimeMin: 40,
    coinReward: 50,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '중구 자갈치시장',
    locationDetail: '꼼장어 골목 초입',
    endDate: '2025-12-09',
    insight: '해산물 골목의 활기찬 분위기를 느껴보세요.',
    verificationMethods: ['꼼장어 골목 간판이 보이도록 현장 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M002',
    categoryMl: 'Food',
    title: '부산대 앞 토스트 골목 간식타임',
    lat: 35.2327,
    lng: 129.0823,
    reqTimeMin: 40,
    coinReward: 50,
    priorityWeight: 0,
    finalWeight: 1.0,
    location: '금정구 부산대 앞',
    locationDetail: '토스트 가게 밀집 구역',
    endDate: '2025-12-10',
    insight: '학생가의 숨은 맛집을 찾아보세요.',
    verificationMethods: ['토스트 구매 영수증 제출 (영수증 인증)'],
  },
  {
    id: 'M003',
    categoryMl: 'Cafe',
    title: '전포 카페거리 힙한 카페 찾기',
    lat: 35.1557,
    lng: 129.0629,
    reqTimeMin: 30,
    coinReward: 50,
    priorityWeight: 0,
    finalWeight: 1.0,
    location: '부산진구 전포동',
    locationDetail: '전포 카페거리 일대',
    endDate: '2025-12-11',
    insight: '감성 카페에서 여유를 즐겨보세요.',
    verificationMethods: ['카페 외관 또는 컵 홀더가 보이도록 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M004',
    categoryMl: 'Cafe',
    title: '영도 흰여울문화마을 오션뷰 카페',
    lat: 35.0768,
    lng: 129.0419,
    reqTimeMin: 30,
    coinReward: 50,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '영도 흰여울문화마을',
    locationDetail: '해안 절벽 뷰 카페',
    endDate: '2025-12-12',
    insight: '바다 전망과 함께 커피 한 잔.',
    verificationMethods: ['오션뷰가 보이는 창가 인증 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M005',
    categoryMl: 'Tourist',
    title: '해운대 블루라인파크 해변열차 구경',
    lat: 35.1876,
    lng: 129.2068,
    reqTimeMin: 10,
    coinReward: 100,
    priorityWeight: 2,
    finalWeight: 1.2,
    location: '해운대 송정~청사포',
    locationDetail: '블루라인 해변열차 승강장',
    endDate: '2025-12-13',
    insight: '부산의 대표 해안 뷰를 따라 달려보세요.',
    verificationMethods: ['해변열차 탑승 모습 또는 승차권 사진 제출 (사진 인증)'],
  },
  {
    id: 'M006',
    categoryMl: 'Tourist',
    title: '감천문화마을 어린왕자와 사진찍기',
    lat: 35.0976,
    lng: 129.0104,
    reqTimeMin: 10,
    coinReward: 100,
    priorityWeight: 2,
    finalWeight: 1.2,
    location: '사하구 감천문화마을',
    locationDetail: '어린왕자 조형물 인근',
    endDate: '2025-12-14',
    insight: '형형색색 마을과 사진 스팟을 기록하세요.',
    verificationMethods: ['어린왕자 조형물이 보이도록 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M007',
    categoryMl: 'Culture',
    title: '영화의전당 시네마테크 관람',
    lat: 35.1716,
    lng: 129.1307,
    reqTimeMin: 60,
    coinReward: 250,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '해운대구 우동',
    locationDetail: '영화의전당 시네마테크',
    endDate: '2025-12-15',
    insight: '예술영화를 한 편 감상해보세요.',
    verificationMethods: ['시네마테크 티켓 또는 상영관 내부 사진 제출 (사진 인증)'],
  },
  {
    id: 'M008',
    categoryMl: 'Culture',
    title: '부산시립미술관 전시회 관람',
    lat: 35.1729,
    lng: 129.1296,
    reqTimeMin: 60,
    coinReward: 250,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '해운대구 센텀시티',
    locationDetail: '부산시립미술관',
    endDate: '2025-12-16',
    insight: '현재 진행 중인 전시를 감상하세요.',
    verificationMethods: ['전시 티켓과 작품 앞 인증샷 촬영 (사진 인증)'],
  },
  {
    id: 'M009',
    categoryMl: 'Culture',
    title: 'F1963 복합문화공간 방문',
    lat: 35.1506,
    lng: 129.0629,
    reqTimeMin: 60,
    coinReward: 250,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '수영구 망미동',
    locationDetail: 'F1963 스틸하우스 일대',
    endDate: '2025-12-17',
    insight: '문화·예술 복합공간을 탐방해보세요.',
    verificationMethods: ['F1963 전경이나 전시 공간 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M010',
    categoryMl: 'Festival',
    title: '광안리 해수욕장 불꽃축제 명당 찾기',
    lat: 35.1532,
    lng: 129.1189,
    reqTimeMin: 10,
    coinReward: 100,
    priorityWeight: 3,
    finalWeight: 1.3,
    location: '광안리 해변',
    locationDetail: '불꽃 감상 명소 구간',
    endDate: '2025-12-18',
    insight: '불꽃축제 베스트 스팟을 인증하세요.',
    verificationMethods: ['불꽃이 보이도록 현장 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M011',
    categoryMl: 'Festival',
    title: 'BIFF 광장 먹자골목 투어',
    lat: 35.0989,
    lng: 129.0305,
    reqTimeMin: 10,
    coinReward: 100,
    priorityWeight: 2,
    finalWeight: 1.2,
    location: '중구 BIFF 광장',
    locationDetail: '먹자골목 일대',
    endDate: '2025-12-19',
    insight: 'BIFF 광장의 활기를 느껴보세요.',
    verificationMethods: ['거리 음식 구매 영수증 제출 (영수증 인증)'],
  },
  {
    id: 'M012',
    categoryMl: 'Walk',
    title: '부산시민공원 20분 걷기 챌린지',
    lat: 35.1687,
    lng: 129.0571,
    reqTimeMin: 20,
    coinReward: 200,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '부산진구 부산시민공원',
    locationDetail: '도심 산책로 구간',
    endDate: '2025-12-20',
    insight: '도심 속 녹지에서 짧은 산책을 즐기세요.',
    verificationMethods: ['부산시민공원에서 20분 이상 머문 GPS 기록 제출 (GPS 인증)'],
  },
  {
    id: 'M013',
    categoryMl: 'Walk',
    title: '동백섬 산책로 한 바퀴 돌기',
    lat: 35.1588,
    lng: 129.1345,
    reqTimeMin: 20,
    coinReward: 200,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '해운대 동백섬',
    locationDetail: '산책로 순환 코스',
    endDate: '2025-12-21',
    insight: '바다와 숲을 동시에 즐길 수 있는 코스.',
    verificationMethods: ['동백섬 산책로 완주 GPS 기록 제출 (GPS 인증)'],
  },
  {
    id: 'M014',
    categoryMl: 'Walk',
    title: '온천천 벚꽃길 산책 코스 완주',
    lat: 35.1971,
    lng: 129.0857,
    reqTimeMin: 20,
    coinReward: 200,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '동래구 온천천',
    locationDetail: '벚꽃길 산책로',
    endDate: '2025-12-22',
    insight: '계절별로 다른 매력을 느껴보세요.',
    verificationMethods: ['온천천 산책로 이동 경로 GPS 기록 제출 (GPS 인증)'],
  },
  {
    id: 'M015',
    categoryMl: 'Shopping',
    title: '부전시장 장보기 챌린지',
    lat: 35.1639,
    lng: 129.0604,
    reqTimeMin: 30,
    coinReward: 150,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '부전시장',
    locationDetail: '청과/수산 구역',
    endDate: '2025-12-23',
    insight: '전통시장의 활기를 체험하세요.',
    verificationMethods: ['시장 구매 영수증 제출 (영수증 인증)'],
  },
  {
    id: 'M016',
    categoryMl: 'Shopping',
    title: '신세계 센텀시티 아이쇼핑',
    lat: 35.1688,
    lng: 129.1306,
    reqTimeMin: 30,
    coinReward: 150,
    priorityWeight: 2,
    finalWeight: 1.2,
    location: '해운대구 센텀시티',
    locationDetail: '신세계 센텀시티 내부',
    endDate: '2025-12-24',
    insight: '초대형 몰을 돌아보며 신상품을 구경하세요.',
    verificationMethods: ['센텀시티 매장 내부가 보이도록 현장 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M017',
    categoryMl: 'Shopping',
    title: '국제시장 구제골목 탐방',
    lat: 35.0998,
    lng: 129.0304,
    reqTimeMin: 30,
    coinReward: 150,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '중구 국제시장',
    locationDetail: '구제/빈티지 골목',
    endDate: '2025-12-25',
    insight: '빈티지 아이템을 발굴해보세요.',
    verificationMethods: ['구제골목 전경이 보이도록 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M018',
    categoryMl: 'Self-Dev',
    title: '부산은행 본점(BIFC) 금융센터 방문',
    lat: 35.1143,
    lng: 129.0476,
    reqTimeMin: 60,
    coinReward: 300,
    priorityWeight: 3,
    finalWeight: 1.3,
    location: '남구 문현동 BIFC',
    locationDetail: '부산은행 본점 로비/금융센터',
    endDate: '2025-12-26',
    insight: '금융센터 방문으로 금융 지식을 쌓아보세요.',
    verificationMethods: ['BIFC 금융센터 로비/안내 데스크 현장 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M019',
    categoryMl: 'Self-Dev',
    title: '부산광역시립도서관 열람실 이용',
    lat: 35.2052,
    lng: 129.0863,
    reqTimeMin: 60,
    coinReward: 300,
    priorityWeight: 0,
    finalWeight: 1.0,
    location: '연제구 부산시립도서관',
    locationDetail: '열람실/학습실',
    endDate: '2025-12-27',
    insight: '집중 독서로 자기계발 시간을 확보하세요.',
    verificationMethods: ['열람실 자리 또는 출입 인증 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M020',
    categoryMl: 'Self-Dev',
    title: '영풍문고 광복점 베스트셀러 구경',
    lat: 35.0989,
    lng: 129.0311,
    reqTimeMin: 60,
    coinReward: 300,
    priorityWeight: 0,
    finalWeight: 1.0,
    location: '중구 광복동',
    locationDetail: '영풍문고 광복점 매장',
    endDate: '2025-12-28',
    insight: '베스트셀러 코너에서 새로운 책을 발견하세요.',
    verificationMethods: ['영풍문고 베스트셀러 코너에서 책 표지 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M021',
    categoryMl: 'Sports',
    title: '사직야구장 롯데 자이언츠 직관',
    lat: 35.194,
    lng: 129.0615,
    reqTimeMin: 40,
    coinReward: 200,
    priorityWeight: 2,
    finalWeight: 1.2,
    location: '동래구 사직야구장',
    locationDetail: '야구장 내 관람석',
    endDate: '2025-12-29',
    insight: '직관의 열기를 사진으로 남겨보세요.',
    verificationMethods: ['경기장 전광판이나 응원 장면 사진 촬영 (사진 인증)'],
  },
  {
    id: 'M022',
    categoryMl: 'Sports',
    title: 'BNK 썸 농구단 홈경기 응원',
    lat: 35.1923,
    lng: 129.0607,
    reqTimeMin: 40,
    coinReward: 200,
    priorityWeight: 3,
    finalWeight: 1.3,
    location: '사직 실내체육관',
    locationDetail: '농구장 관람석',
    endDate: '2025-12-10',
    insight: 'vs KB스타즈 리그 2등과 3등의 접전!',
    verificationMethods: ['사직 실내체육관 관람석에서 5초 이상 머문 GPS 기록 제출 (GPS 인증)'],
  },
  {
    id: 'M023',
    categoryMl: 'Sports',
    title: '삼락생태공원 자전거 라이딩',
    lat: 35.1808,
    lng: 128.9856,
    reqTimeMin: 40,
    coinReward: 200,
    priorityWeight: 1,
    finalWeight: 1.1,
    location: '북구 삼락생태공원',
    locationDetail: '자전거 라이딩 코스',
    endDate: '2025-12-31',
    insight: '강변 라이딩으로 땀을 식혀보세요.',
    verificationMethods: ['삼락생태공원 라이딩 경로 GPS 기록 제출 (GPS 인증)'],
  },
];

const S3_BASE = 'https://amzn-s3-mseoky-bucket.s3.ap-northeast-2.amazonaws.com/bnk-challenge-images';

const missions: Mission[] = MISSIONS.map((m) => {
  const categoryApi = toApiCategory(m.categoryMl);

  if (!categoryApi) {
    throw new Error(`FATAL: Could not map ML category "${m.categoryMl}" to an API category for mission ${m.id}.`);
  }

  return {
    id: m.id,
    title: m.title,
    category: categoryApi,
    coordinates: { lat: m.lat, lng: m.lng },
    coinReward: m.coinReward,
    priorityWeight: m.priorityWeight,
    finalWeight: m.finalWeight,
    reqTimeMin: m.reqTimeMin,

    // PLACEHOLDERS required by Mission entity:
    distance: 0,
    imageUrl: `${S3_BASE}/${m.id}.jpg`,   // 자동 생성
    location: m.location,
    locationDetail: m.locationDetail,
    endDate: m.endDate,
    insight: m.insight,
    verificationMethods: m.verificationMethods,
    isLiked: false,
  };
});

/* -----------------------------
   Seed Run
----------------------------- */
async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const missionRepo = dataSource.getRepository(Mission);

  console.log('Seeding users...');
  await userRepo.upsert(users, ['id']);

  console.log('Seeding categories...');
  await categoryRepo.upsert(categories, ['id']);

  console.log('Seeding missions...');
  await missionRepo.upsert(missions, ['id']);

  console.log('Seed completed.');
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
