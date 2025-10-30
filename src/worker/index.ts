import { Hono } from "hono";
const app = new Hono<{ Bindings: Env & { AI: any, DB: D1Database } }>();

// 게시글 목록 예시 데이터
const posts = [
  { id: 1, title: "첫 번째 게시글", author: "관리자", date: "2025-10-16" },
  { id: 2, title: "두 번째 게시글", author: "홍길동", date: "2025-10-15" },
  { id: 3, title: "세 번째 게시글", author: "김철수", date: "2025-10-14" },
  { id: 4, title: "네 번째 게시글", author: "이영희", date: "2025-10-13" },
  { id: 5, title: "다섯 번째 게시글", author: "박민수", date: "2025-10-12" },
  { id: 6, title: "여섯 번째 게시글", author: "최수진", date: "2025-10-11" },
  { id: 7, title: "일곱 번째 게시글", author: "정대현", date: "2025-10-10" },
  { id: 8, title: "여덟 번째 게시글", author: "강지우", date: "2025-10-09" },
  { id: 9, title: "아홉 번째 게시글", author: "윤서연", date: "2025-10-08" },
  { id: 10, title: "열 번째 게시글", author: "임하늘", date: "2025-10-07" },
  { id: 11, title: "열한 번째 게시글", author: "송민지", date: "2025-10-06" },
  { id: 12, title: "열두 번째 게시글", author: "오준혁", date: "2025-10-05" },
];
const notice_posts = [
  { id: 1, title: "첫 번째 공지사항", author: "관리자", date: "2025-10-16" },
  { id: 2, title: "두 번째 공지사항", author: "관리자", date: "2025-10-15" },
  { id: 3, title: "세 번째 공지사항", author: "관리자", date: "2025-10-14" },
  { id: 4, title: "네 번째 공지사항", author: "관리자", date: "2025-10-13" },
]

const guide = [
    { id: 1, title: "김치볶음밥 만들어보자", description: "김치볶음밥에 대한 모든 것", author: "요리왕", date: "2025-10-16", steps: 5, needtime: 15, thumbnail: "/vite.svg" },  
    { id: 2, title: "Python 기초 완벽 정복", description: "파이썬 기초 문법부터 실전까지", author: "코딩마스터", date: "2025-10-15", steps: 10, needtime: 120, thumbnail: "/vite.svg" },
    { id: 3, title: "홈 카페 라떼아트 배우기", description: "집에서 카페 수준의 라떼 만들기", author: "바리스타김", date: "2025-10-14", steps: 7, needtime: 30, thumbnail: "/vite.svg" },
    { id: 4, title: "기타 코드 10분 마스터", description: "기본 코드로 노래 연주하기", author: "음악쟁이", date: "2025-10-13", steps: 8, needtime: 10, thumbnail: "/vite.svg" },
    { id: 5, title: "Arduino LED 제어 프로젝트", description: "아두이노로 LED 깜빡이기", author: "메이커박", date: "2025-10-12", steps: 6, needtime: 45, thumbnail: "/vite.svg" },
    { id: 6, title: "셀프 네일아트 기초", description: "집에서 쉽게 따라하는 네일아트", author: "뷰티러버", date: "2025-10-11", steps: 4, needtime: 20, thumbnail: "/vite.svg" },
    { id: 7, title: "Photoshop 사진 보정", description: "인물 사진 자연스럽게 보정하기", author: "포토그래퍼", date: "2025-10-10", steps: 9, needtime: 60, thumbnail: "/vite.svg" },
    { id: 8, title: "반려식물 키우기 입문", description: "초보자를 위한 식물 돌보기", author: "그린핑거", date: "2025-10-09", steps: 5, needtime: 10, thumbnail: "/vite.svg" },
    { id: 9, title: "React 컴포넌트 설계", description: "재사용 가능한 컴포넌트 만들기", author: "프론트개발자", date: "2025-10-08", steps: 12, needtime: 90, thumbnail: "/vite.svg" },
    { id: 10, title: "홈트 전신 운동 루틴", description: "집에서 30분 전신 운동", author: "헬스트레이너", date: "2025-10-07", steps: 8, needtime: 30, thumbnail: "/vite.svg" },
    { id: 11, title: "유튜브 썸네일 디자인", description: "클릭률 높이는 썸네일 만들기", author: "유튜버", date: "2025-10-06", steps: 6, needtime: 25, thumbnail: "/vite.svg" },
    { id: 12, title: "3D 프린터 첫 출력", description: "3D 프린터 설정부터 출력까지", author: "3D프린팅", date: "2025-10-05", steps: 7, needtime: 50, thumbnail: "/vite.svg" },
];

// 각 가이드에 맞는 단계별 아이템 더미 데이터 생성
type GuideItem = {
  id: number;
  parentId: number;
  title: string;
  author: string;
  content: string;
  date: string;
  needtime: number;
  thumbnail: string;
};

const guide_items: GuideItem[] = guide.flatMap((g) => {
  const perStepTime = Math.max(1, Math.round(g.needtime / Math.max(1, g.steps)));
  const steps = Math.max(1, g.steps);
  const items: GuideItem[] = [];
  for (let i = 1; i <= steps; i++) {
    items.push({
      id: g.id * 1000 + i, // 간단한 고유 ID 규칙
      parentId: g.id,
      title: `${i} - ${g.title} 단계`,
      author: g.author,
      content: `${g.title}의 ${i}번째 단계에 대한 설명입니다. 예시 더미 텍스트로 채워집니다.`,
      date: g.date,
      needtime: perStepTime,
      thumbnail: g.thumbnail,
    });
  }
  return items;
});

// 사용자 명함 정보 타입
type UserProfile = {
  id: number;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  bio?: string;
  avatar: string;
  location?: string;
  website?: string;
  joinDate: string;
  lastActive: string;
  isOnline: boolean;
  badges: string[];
  stats: {
    posts: number;
    guides: number;
    followers: number;
    following: number;
  };
};

// 사용자 명함 더미 데이터
const users: UserProfile[] = [
  {
    id: 1,
    username: "admin",
    displayName: "홍일동",
    email: "admin@community.com",
    phone: "010-1234-5678",
    company: "김밥천국",
    position: "시스템 관리자",
    department: "IT팀",
    bio: "커뮤니티를 운영하고 관리하는 관리자입니다. 궁금한 점이 있으시면 언제든 문의해주세요!",
    avatar: "/vite.svg",
    location: "서울, 대한민국",
    website: "https://community.srh.co.kr",
    joinDate: "2024-01-01",
    lastActive: "2025-10-22",
    isOnline: true,
    badges: ["관리자", "베테랑", "도움왕"],
    stats: {
      posts: 156,
      guides: 23,
      followers: 1284,
      following: 45
    }
  },
  {
    id: 2,
    username: "hongkildong",
    displayName: "홍이동",
    email: "hong@example.com",
    phone: "010-1234-5678",
    company: "헤븐김밥",
    position: "프로덕트 매니저",
    department: "기획팀",
    bio: "사용자 경험을 개선하는 것이 제 열정입니다. 새로운 기술과 트렌드에 관심이 많아요.",
    avatar: "/vite.svg",
    location: "경기도 성남시",
    website: "https://hong-portfolio.com",
    joinDate: "2024-03-15",
    lastActive: "2025-10-22",
    isOnline: true,
    badges: ["기획자", "트렌드세터"],
    stats: {
      posts: 89,
      guides: 12,
      followers: 456,
      following: 123
    }
  },
  {
    id: 3,
    username: "kimchulsu",
    displayName: "홍삼동",
    email: "kim.cs@tech.com",
    phone: "010-1234-5678",
    company: "치킨나라",
    position: "시니어 개발자",
    department: "플랫폼개발팀",
    bio: "10년차 백엔드 개발자입니다. Java, Spring 전문이며 아키텍처 설계를 좋아합니다.",
    avatar: "/vite.svg",
    location: "서울 강남구",
    website: "https://github.com/kimchulsu",
    joinDate: "2024-02-20",
    lastActive: "2025-10-21",
    isOnline: false,
    badges: ["개발자", "멘토", "오픈소스"],
    stats: {
      posts: 234,
      guides: 45,
      followers: 892,
      following: 67
    }
  },
  {
    id: 4,
    username: "leeyounghee",
    displayName: "홍사동",
    email: "lee.yh@design.co.kr",
    phone: "010-1234-5678",
    company: "피자왕국",
    position: "UX/UI 디자이너",
    department: "디자인팀",
    bio: "사용자 중심의 디자인을 추구합니다. 피그마와 스케치를 주로 사용해요.",
    avatar: "/vite.svg",
    location: "서울 홍대입구",
    website: "/",
    joinDate: "2024-04-10",
    lastActive: "2025-10-22",
    isOnline: true,
    badges: ["디자이너", "크리에이티브"],
    stats: {
      posts: 67,
      guides: 18,
      followers: 345,
      following: 89
    }
  },
  {
    id: 5,
    username: "parkminsoo",
    displayName: "홍오동",
    email: "park.ms@startup.io",
    phone: "010-1234-5678",
    company: "떡볶이마을",
    position: "데이터 사이언티스트",
    department: "AI연구팀",
    bio: "머신러닝과 딥러닝 연구에 몰두하고 있습니다. Python과 TensorFlow 전문가예요.",
    avatar: "/vite.svg",
    location: "판교 테크노밸리",
    joinDate: "2024-05-05",
    lastActive: "2025-10-21",
    isOnline: false,
    badges: ["데이터사이언티스트", "AI전문가"],
    stats: {
      posts: 123,
      guides: 28,
      followers: 567,
      following: 134
    }
  },
  {
    id: 6,
    username: "choosujin",
    displayName: "홍육동",
    email: "choi@marketing.com",
    phone: "010-1234-5678",
    company: "커피하우스",
    position: "디지털 마케터",
    department: "마케팅팀",
    bio: "디지털 마케팅 캠페인 기획과 SNS 마케팅이 주 업무입니다. 데이터 분석도 좋아해요!",
    avatar: "/vite.svg",
    location: "서울 강남구",
    website: "https://blog.naver.com/choosujin",
    joinDate: "2024-06-12",
    lastActive: "2025-10-22",
    isOnline: true,
    badges: ["마케터", "SNS전문가"],
    stats: {
      posts: 78,
      guides: 15,
      followers: 234,
      following: 156
    }
  },
  {
    id: 7,
    username: "jungdaehyun",
    displayName: "홍칠동",
    email: "jung@freelancer.kr",
    phone: "010-1234-5678",
    company: "햄버거타운",
    position: "풀스택 개발자",
    bio: "React, Node.js, MongoDB 스택으로 웹 애플리케이션을 개발합니다. 스타트업과 협업 경험이 많아요.",
    avatar: "/vite.svg",
    location: "부산광역시",
    website: "https://jungdaehyun.dev",
    joinDate: "2024-07-01",
    lastActive: "2025-10-20",
    isOnline: false,
    badges: ["풀스택개발자", "프리랜서"],
    stats: {
      posts: 156,
      guides: 32,
      followers: 678,
      following: 98
    }
  },
  {
    id: 8,
    username: "kangjiwoo",
    displayName: "홍팔동",
    email: "kang.jw@student.ac.kr",
    phone: "010-1234-5678",
    company: "도넛공방",
    position: "컴퓨터공학과 4학년",
    department: "공과대학",
    bio: "컴퓨터공학과 학부생입니다. 알고리즘과 자료구조에 관심이 많고, 개발 공부 중이에요!",
    avatar: "/vite.svg",
    location: "서울 관악구",
    joinDate: "2024-08-15",
    lastActive: "2025-10-22",
    isOnline: true,
    badges: ["학생", "알고리즘"],
    stats: {
      posts: 45,
      guides: 8,
      followers: 123,
      following: 234
    }
  },
  {
    id: 9,
    username: "yoonseoyeon",
    displayName: "홍구동",
    email: "yoon@content.media",
    phone: "010-1234-5678",
    company: "라면월드",
    position: "콘텐츠 크리에이터",
    department: "콘텐츠팀",
    bio: "영상 편집과 그래픽 디자인을 전문으로 하는 크리에이터입니다. 유튜브 채널도 운영해요!",
    avatar: "/vite.svg",
    location: "서울 마포구",
    website: "https://youtube.com/@yoonseoyeon",
    joinDate: "2024-09-03",
    lastActive: "2025-10-21",
    isOnline: false,
    badges: ["크리에이터", "영상편집"],
    stats: {
      posts: 92,
      guides: 22,
      followers: 445,
      following: 67
    }
  },
  {
    id: 10,
    username: "imhaneul",
    displayName: "홍십동",
    email: "im.sky@consulting.kr",
    phone: "010-1234-5678",
    company: "샐러드나라",
    position: "주니어 컨설턴트",
    department: "전략컨설팅팀",
    bio: "기업 전략 수립과 프로세스 개선 업무를 담당하고 있습니다. 비즈니스 분석이 전문 분야예요.",
    avatar: "/vite.svg",
    location: "서울 중구",
    joinDate: "2024-10-01",
    lastActive: "2025-10-22",
    isOnline: true,
    badges: ["컨설턴트", "분석전문가"],
    stats: {
      posts: 34,
      guides: 7,
      followers: 156,
      following: 89
    }
  }
];

// 게시글 목록 API
app.get("/api/posts", (c) => c.json(posts));
app.post("/api/notice-posts", (c) => c.json(notice_posts));
app.get("/api/guides", (c) => c.json(guide));

// 사용자 목록 API
app.get("/api/users", (c) => {
  // 민감한 정보 제외한 공개 정보만 반환
  const publicUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    company: user.company,
    position: user.position,
    department: user.department,
    bio: user.bio,
    avatar: user.avatar,
    location: user.location,
    website: user.website,
    joinDate: user.joinDate,
    isOnline: user.isOnline,
    badges: user.badges,
    stats: user.stats
  }));
  return c.json(publicUsers);
});

// 특정 사용자 상세 정보 API
app.get("/api/users/:id", (c) => {
  const userId = parseInt(c.req.param("id"));
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return c.json({ error: "사용자를 찾을 수 없습니다." }, 404);
  }
  
  // 개인정보 보호를 위해 이메일과 전화번호는 제외
  const publicUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    company: user.company,
    position: user.position,
    department: user.department,
    bio: user.bio,
    avatar: user.avatar,
    location: user.location,
    website: user.website,
    joinDate: user.joinDate,
    lastActive: user.lastActive,
    isOnline: user.isOnline,
    badges: user.badges,
    stats: user.stats
  };
  
  return c.json(publicUser);
});

// 사용자명으로 검색 API
app.get("/api/users/search/:username", (c) => {
  const username = c.req.param("username");
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return c.json({ error: "사용자를 찾을 수 없습니다." }, 404);
  }
  
  const publicUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    company: user.company,
    position: user.position,
    department: user.department,
    bio: user.bio,
    avatar: user.avatar,
    location: user.location,
    website: user.website,
    joinDate: user.joinDate,
    lastActive: user.lastActive,
    isOnline: user.isOnline,
    badges: user.badges,
    stats: user.stats
  };
  
  return c.json(publicUser);
});

// 가이드 아이템 조회 API (parentId로 필터 가능)
app.get("/api/guide-items", (c) => {
  const url = new URL(c.req.url);
  const parentId = url.searchParams.get("id");
  if (parentId) {
    const pid = Number(parentId);
    return c.json(guide_items.filter((it) => it.parentId === pid));
  }
  return c.json(guide_items);
});

// 배너 이미지 생성 API (Lorem Picsum 사용)
app.get("/api/banners", (c) => {
  const url = new URL(c.req.url);
  const count = parseInt(url.searchParams.get("count") || "5");
  const banners = [];
  for (let i = 1; i <= count; i++) {
    banners.push(`https://picsum.photos/1200/400?random=${i}`);
  }
  return c.json({ banners });
});

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

// AI API - POST로 메시지 리스트 전체 전송
app.post("/api/ai", async (c) => {
  const { messages } = await c.req.json<{ 
    messages: { role: "user" | "system"; message: string }[] 
  }>();
  
  const ai = c.env.AI;
  
  // Cloudflare AI 형식으로 변환
  const formattedMessages = messages.map(msg => ({
    role: msg.role === "system" ? "assistant" : "user",
    content: msg.message
  }));
  
  const stream = await ai.run("@cf/meta/llama-3.1-8b-instruct-fast", {
    messages: formattedMessages,
    stream: true
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Access-Control-Allow-Origin": "*"
    }
  });
});

export default app;
