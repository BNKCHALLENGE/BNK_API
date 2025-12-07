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

const MISSIONS_CSV: [
  string,       // id
  string,       // category
  string,       // title
  number,       // lat
  number,       // lng
  number,       // reqTimeMin
  number,       // coinReward
  number,       // priorityWeight
  number        // finalWeight
][] = [
  ["M001","Food","자갈치시장 꼼장어 골목 방문",35.0968,129.0306,40,50,1,1.1],
  ["M002","Food","부산대 앞 토스트 골목 간식타임",35.2327,129.0823,40,50,0,1.0],
  ["M003","Cafe","전포 카페거리 힙한 카페 찾기",35.1557,129.0629,30,50,0,1.0],
  ["M004","Cafe","영도 흰여울문화마을 오션뷰 카페",35.0768,129.0419,30,50,1,1.1],
  ["M005","Tourist","해운대 블루라인파크 해변열차 구경",35.1876,129.2068,10,100,2,1.2],
  ["M006","Tourist","감천문화마을 어린왕자와 사진찍기",35.0976,129.0104,10,100,2,1.2],
  ["M007","Culture","영화의전당 시네마테크 관람",35.1716,129.1307,60,250,1,1.1],
  ["M008","Culture","부산시립미술관 전시회 관람",35.1729,129.1296,60,250,1,1.1],
  ["M009","Culture","F1963 복합문화공간 방문",35.1506,129.0629,60,250,1,1.1],
  ["M010","Festival","광안리 해수욕장 불꽃축제 명당 찾기",35.1532,129.1189,10,100,3,1.3],
  ["M011","Festival","BIFF 광장 먹자골목 투어",35.0989,129.0305,10,100,2,1.2],
  ["M012","Walk","부산시민공원 20분 걷기 챌린지",35.1687,129.0571,20,200,1,1.1],
  ["M013","Walk","동백섬 산책로 한 바퀴 돌기",35.1588,129.1345,20,200,1,1.1],
  ["M014","Walk","온천천 벚꽃길 산책 코스 완주",35.1971,129.0857,20,200,1,1.1],
  ["M015","Shopping","부전시장 장보기 챌린지",35.1639,129.0604,30,150,1,1.1],
  ["M016","Shopping","신세계 센텀시티 아이쇼핑",35.1688,129.1306,30,150,2,1.2],
  ["M017","Shopping","국제시장 구제골목 탐방",35.0998,129.0304,30,150,1,1.1],
  ["M018","Self-Dev","부산은행 본점(BIFC) 금융센터 방문",35.1143,129.0476,60,300,3,1.3],
  ["M019","Self-Dev","부산광역시립도서관 열람실 이용",35.2052,129.0863,60,300,0,1.0],
  ["M020","Self-Dev","영풍문고 광복점 베스트셀러 구경",35.0989,129.0311,60,300,0,1.0],
  ["M021","Sports","사직야구장 롯데 자이언츠 직관",35.194,129.0615,40,200,2,1.2],
  ["M022","Sports","BNK 썸 농구단 홈경기 응원",35.1937,129.0608,40,200,3,1.3],
  ["M023","Sports","삼락생태공원 자전거 라이딩",35.1808,128.9856,40,200,1,1.1],
];

const S3_BASE = 'https://amzn-s3-mseoky-bucket.s3.ap-northeast-2.amazonaws.com/bnk-challenge-images';

const missions: Mission[] = MISSIONS_CSV.map((m) => {
  const [id, categoryMl, title, lat, lng, reqTimeMin, coinReward, priorityWeight, finalWeight] = m;
  const categoryApi = toApiCategory(categoryMl);

  if (!categoryApi) {
    throw new Error(`FATAL: Could not map ML category "${categoryMl}" to an API category for mission ${id}.`);
  }

  return {
    id,
    title,
    category: categoryApi,
    coordinates: { lat, lng },
    coinReward,
    priorityWeight,
    finalWeight,
    reqTimeMin,

    // PLACEHOLDERS required by Mission entity:
    distance: 0,
    imageUrl: `${S3_BASE}/${id}.jpg`,   // 자동 생성
    location: '부산 전역',
    locationDetail: '상세 위치는 지도 참고',
    endDate: '2025-12-31',
    insight: '미션을 수행해보세요.',
    verificationMethods: ['사진 인증'],
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
