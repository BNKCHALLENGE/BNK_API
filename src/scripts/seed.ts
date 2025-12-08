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
    endDate: '2025-12-30',
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
