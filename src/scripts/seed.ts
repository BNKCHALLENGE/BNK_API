import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Category } from '../modules/categories/entities/category.entity';
import { Mission } from '../modules/missions/entities/mission.entity';
import { MissionLike } from '../modules/missions/entities/mission-like.entity';
import { MissionParticipation } from '../modules/missions/entities/mission-participation.entity';
import { User } from '../modules/users/entities/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Category, Mission, MissionLike, MissionParticipation],
  synchronize: false,
  logging: false,
});

/* -----------------------------
   1. User Dummy Data
----------------------------- */
const users: User[] = [
  {
    id: 'user-1',
    name: '채수원',
    gender: 'male',
    age: 25,
    profileImageUrl: 'https://example.com/profile-chaesuwon.jpg',
    preferences: {
      categories: [],
      isOnboardingComplete: false,
    },
    fcmToken: null,
  },
  {
    id: 'user-2',
    name: '박보은',
    gender: 'female',
    age: 22,
    profileImageUrl: 'https://example.com/profile-boeun.jpg',
    preferences: {
      categories: [],
      isOnboardingComplete: false,
    },
    fcmToken: null,
  },
  {
    id: 'user-3',
    name: '윤민석',
    gender: 'male',
    age: 60,
    profileImageUrl: 'https://example.com/profile-minseok.jpg',
    preferences: {
      categories: [],
      isOnboardingComplete: false,
    },
    fcmToken: null,
  },
];

/* -----------------------------
   2. Category Dummy Data
----------------------------- */
const categories: Category[] = [
  { id: 'food', name: '맛집', isActive: true },
  { id: 'cafe', name: '카페', isActive: false },
  { id: 'tour', name: '관광', isActive: false },
  { id: 'festival', name: '축제', isActive: false },
  { id: 'study', name: '공부', isActive: false },
  { id: 'exercise', name: '운동', isActive: false },
  { id: 'exhibition', name: '전시', isActive: false },
  { id: 'sports', name: '스포츠', isActive: false },
  { id: 'volunteer', name: '봉사', isActive: false },
];

/* -----------------------------
   3. Missions Dummy Data
----------------------------- */
const missions: Mission[] = [
  {
    id: 'mission-1',
    title: '해운대 맛집 투어',
    imageUrl: 'https://example.com/mission1.jpg',
    location: '부산 해운대구',
    locationDetail: '해운대 해수욕장 인근',
    distance: randomDistance(),
    coinReward: 100,
    category: 'food',
    endDate: '2025.12.31',
    insight: '요즘 뜨는 해운대 맛집을 둘러보세요.',
    verificationMethods: ['사진 인증', '방문 스탬프'],
    coordinates: { lat: 35.1587, lng: 129.1604 },
    isLiked: false,
  },
  {
    id: 'mission-2',
    title: '광안리 카페 라운지',
    imageUrl: 'https://example.com/mission2.jpg',
    location: '부산 수영구',
    locationDetail: '광안리 해변 카페 거리',
    distance: randomDistance(),
    coinReward: 80,
    category: 'cafe',
    endDate: '2025.12.31',
    insight: '카페에서 여유를 즐겨보세요.',
    verificationMethods: ['음료 사진 인증'],
    coordinates: { lat: 35.1532, lng: 129.1187 },
    isLiked: false,
  },
  {
    id: 'mission-3',
    title: '감천문화마을 투어',
    imageUrl: 'https://example.com/mission3.jpg',
    location: '부산 사하구',
    locationDetail: '감천문화마을',
    distance: randomDistance(),
    coinReward: 120,
    category: 'tour',
    endDate: '2025.12.31',
    insight: '감천문화마을을 산책하며 사진을 찍어보세요.',
    verificationMethods: ['포토존 인증샷'],
    coordinates: { lat: 35.0971, lng: 129.0104 },
    isLiked: false,
  },
  {
    id: 'mission-4',
    title: '부산 불꽃축제 관람',
    imageUrl: 'https://example.com/mission4.jpg',
    location: '부산 수영구',
    locationDetail: '광안리 해변 일대',
    distance: randomDistance(),
    coinReward: 150,
    category: 'festival',
    endDate: '2025.11.15',
    insight: '불꽃축제를 즐기고 인증하세요.',
    verificationMethods: ['불꽃 사진 인증'],
    coordinates: { lat: 35.1538, lng: 129.1187 },
    isLiked: false,
  },
  {
    id: 'mission-5',
    title: '북카페 스터디',
    imageUrl: 'https://example.com/mission5.jpg',
    location: '부산 남구',
    locationDetail: '경성대 부경대역 인근 북카페',
    distance: randomDistance(),
    coinReward: 70,
    category: 'study',
    endDate: '2025.10.01',
    insight: '책을 읽고 느낀 점을 공유하세요.',
    verificationMethods: ['독서 인증샷'],
    coordinates: { lat: 35.1365, lng: 129.1004 },
    isLiked: false,
  },
  {
    id: 'mission-6',
    title: '황령산 러닝',
    imageUrl: 'https://example.com/mission6.jpg',
    location: '부산 연제구',
    locationDetail: '황령산 둘레길',
    distance: randomDistance(),
    coinReward: 130,
    category: 'exercise',
    endDate: '2025.09.30',
    insight: '산책 겸 러닝으로 건강 챙기기.',
    verificationMethods: ['런닝 앱 기록 인증'],
    coordinates: { lat: 35.1456, lng: 129.0764 },
    isLiked: false,
  },
  {
    id: 'mission-7',
    title: '시립미술관 전시 관람',
    imageUrl: 'https://example.com/mission7.jpg',
    location: '부산 해운대구',
    locationDetail: '부산시립미술관',
    distance: randomDistance(),
    coinReward: 90,
    category: 'exhibition',
    endDate: '2025.08.31',
    insight: '전시를 감상하고 후기 남기기.',
    verificationMethods: ['입장권 인증'],
    coordinates: { lat: 35.1691, lng: 129.1366 },
    isLiked: false,
  },
  {
    id: 'mission-8',
    title: '롯데 자이언츠 직관',
    imageUrl: 'https://example.com/mission8.jpg',
    location: '부산 동래구',
    locationDetail: '사직야구장',
    distance: randomDistance(),
    coinReward: 200,
    category: 'sports',
    endDate: '2025.07.31',
    insight: '야구 직관 후 응원 인증샷.',
    verificationMethods: ['응원 도구 인증샷'],
    coordinates: { lat: 35.1940, lng: 129.0617 },
    isLiked: false,
  },
  {
    id: 'mission-9',
    title: '광안리 해변 쓰레기 줍기',
    imageUrl: 'https://example.com/mission9.jpg',
    location: '부산 수영구',
    locationDetail: '광안리 해변',
    distance: randomDistance(),
    coinReward: 110,
    category: 'volunteer',
    endDate: '2025.06.30',
    insight: '해변을 깨끗하게 만들어요.',
    verificationMethods: ['전/후 사진 인증'],
    coordinates: { lat: 35.1532, lng: 129.1187 },
    isLiked: false,
  },
  {
    id: 'mission-10',
    title: '부산타워 전망대 방문',
    imageUrl: 'https://example.com/mission10.jpg',
    location: '부산 중구',
    locationDetail: '용두산공원 부산타워',
    distance: randomDistance(),
    coinReward: 95,
    category: 'tour',
    endDate: '2025.12.31',
    insight: '부산 전경을 감상하고 인증샷 남기기.',
    verificationMethods: ['전망대 인증샷'],
    coordinates: { lat: 35.0994, lng: 129.0328 },
    isLiked: false,
  },
  {
    id: 'mission-11',
    title: '남포동 길거리 음식 탐방',
    imageUrl: 'https://example.com/mission11.jpg',
    location: '부산 중구',
    locationDetail: '남포동 BIFF 광장 일대',
    distance: randomDistance(),
    coinReward: 85,
    category: 'food',
    endDate: '2025.11.30',
    insight: '길거리 음식을 맛보고 기록하세요.',
    verificationMethods: ['음식 사진 인증'],
    coordinates: { lat: 35.0997, lng: 129.0260 },
    isLiked: false,
  },
];

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

function randomDistance(): number {
  return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
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
