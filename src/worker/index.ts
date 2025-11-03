import { Hono } from "hono";
import { sign, verify } from "hono/jwt";

type Env = {
  SECRET_KEY: string;
  SECRET_PW_KEY: string;
};

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

// sha256 해시 함수 (Cloudflare Workers 호환)
async function sha256(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 회원가입 API (app 선언 이후에 위치)
app.post("/api/signup", async (c) => {
  const { id, email, password } = await c.req.json<{ id: string; email: string; password: string }>();
  if (!id || !email || !password) {
    return c.json({ error: "모든 항목을 입력해주세요." }, 400);
  }
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: "올바른 이메일 형식을 입력해주세요." }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: "비밀번호는 6자 이상이어야 합니다." }, 400);
  }
  try {
    // 아이디 중복 체크
    const { results: idResults } = await c.env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(id).all();
    if (idResults.length > 0) {
      return c.json({ error: "이미 존재하는 아이디입니다." }, 409);
    }
    // 이메일 중복 체크
    const { results: emailResults } = await c.env.DB.prepare("SELECT email FROM users WHERE email = ?").bind(email).all();
    if (emailResults.length > 0) {
      return c.json({ error: "이미 존재하는 이메일입니다." }, 409);
    }
    // 비밀번호 해시 (sha256)
    const hashedPassword = await sha256(password + c.env.SECRET_PW_KEY);
    // DB 저장
    await c.env.DB.prepare(
      "INSERT INTO users (id, email, password, role, created_at, verificati) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, email, hashedPassword, 0, Date.now(), 0).run();
    return c.json({ success: true, message: "회원가입이 완료되었습니다." });
  } catch (error) {
    return c.json({ error: "회원가입 처리 중 오류가 발생했습니다." }, 500);
  }
});

// 로그인 API (DB users 테이블 기반)
app.post("/api/login", async (c) => {
  const { id, password } = await c.req.json<{ id: string; password: string }>();
  if (!id || !password) {
    return c.json({ error: "아이디와 비밀번호를 입력하세요." }, 400);
  }
  const hashedPassword = await sha256(password + c.env.SECRET_PW_KEY);
  try {
    // users 테이블에서 id, password 일치하는 사용자 조회 (패스워드 평문 예시)
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ? AND password = ?"
    ).bind(id, hashedPassword).all();
    if (results.length === 0) {
      return c.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, 401);
    }
    // JWT 발급 (비밀번호 제외)
    const user = results[0];
    delete user.password;
    // 클라이언트 IP 추출 (Cloudflare 환경에서는 cf-connecting-ip 헤더 사용)
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const token = await sign(
      { id: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
        role: user.role,
        ip
      },
      c.env.SECRET_KEY
    );
    return c.json({ success: true, token, user });
  } catch (error) {
    return c.json({ error: "로그인 처리 중 오류가 발생했습니다." }, 500);
  }
});


// 인증 테스트용 API
app.post("/api/auth", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    // 현재 요청의 IP 추출
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    return c.json({ success: true, payload });
  } catch (e) {
    return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
  }
});

// 게시글 목록 API
app.get("/api/posts", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM post").all();
    console.log("쿼리 결과:", results);
    return c.json(results);
  } catch (error) {
    console.error("게시글 가져오기 오류:", error);
    return c.json(posts);
  }
});
app.get("/api/post", async (c) => {
  const postId = c.req.query("id");
  if (!postId) {
    return c.json({ error: "Missing 'id' parameter" }, 400);
  }

  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM post WHERE id = ?").bind(postId).all();
    return c.json(results[0] || { error: "Post not found" }, results.length ? 200 : 404);
  } catch (error) {
    console.error("Database query error:", error);

    // 명시적으로 에러 메시지를 추출
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: errorMessage }, 500);
  }
});
app.post("/api/notice-posts", (c) => c.json(notice_posts));
app.get("/api/guides", (c) => c.json(guide));

// JWT 연장 API
app.post("/api/extend-jwt", async (c) => {
  try {
    const { token } = await c.req.json<{ token: string }>();
    if (!token) {
      return c.json({ error: "JWT가 필요합니다." }, 400);
    }
    let payload;
    try {
      payload = await verify(token, c.env.SECRET_KEY);
    } catch (e) {
      return c.json({ error: "유효하지 않은 JWT입니다." }, 401);
    }
    // IP 교차검증
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 JWT입니다" }, 401);
    }
    // exp가 현재 시간보다 크면(아직 만료 전)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return c.json({ error: "만료된 JWT입니다." }, 401);
    }
    // exp, iat 등 기존 payload에서 제거 후 새 exp로 재발급
    const { exp, iat, ...rest } = payload;
    const newExp = now + 60 * 5; // 5분 연장
    const newToken = await sign({ ...rest, exp: newExp }, c.env.SECRET_KEY);
    return c.json({ success: true, token: newToken });
  } catch (e) {
    return c.json({ error: "JWT 연장 처리 중 오류가 발생했습니다." }, 500);
  }
});

// 현재 사용자 조회/수정/삭제 API
app.post("/api/me", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    const { results } = await c.env.DB.prepare("SELECT id, email, nickname, role, created_at FROM users WHERE id = ?").bind(payload.id).all();
    if (!results || results.length === 0) return c.json({ error: "사용자를 찾을 수 없습니다." }, 404);
    return c.json({ success: true, user: results[0] });
  } catch (e) {
    return c.json({ error: "유효하지 않은 토큰입니다." }, 401);
  }
});

app.put("/api/me", async (c) => {
  const body = await c.req.json<{ token: string; email?: string; nickname?: string; password?: string }>();
  const { token, email, nickname, password } = body || {} as any;
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    // Build dynamic update with validated inputs
    const updates: string[] = [];
    const values: any[] = [];
    
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return c.json({ error: "올바른 이메일 형식이 아닙니다." }, 400);
      updates.push("email = ?");
      values.push(email);
    }
    if (nickname !== undefined) {
      // Validate nickname length (optional: add more validation)
      if (typeof nickname === 'string' && nickname.length > 16) {
        return c.json({ error: "닉네임은 16자 이하여야 합니다." }, 400);
      }
      updates.push("nickname = ?");
      values.push(nickname);
    }
    if (password !== undefined && password !== null && password !== '') {
      if (password.length < 6) return c.json({ error: "비밀번호는 6자 이상이어야 합니다." }, 400);
      const hashed = await sha256(password + c.env.SECRET_PW_KEY);
      updates.push("password = ?");
      values.push(hashed);
    }
    if (updates.length === 0) return c.json({ error: "변경할 항목이 없습니다." }, 400);
    values.push(payload.id);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(sql).bind(...values).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: "프로필 수정 중 오류가 발생했습니다." }, 500);
  }
});

app.delete("/api/me", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(payload.id).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: "계정 삭제 중 오류가 발생했습니다." }, 500);
  }
});

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

// API to fetch and print the list of existing tables
app.get("/api/tables", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    ).all();

    console.log("Tables:", results);
    return c.json(results);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return c.json({ error: "Failed to fetch tables." }, 500);
  }
});

export default app;
