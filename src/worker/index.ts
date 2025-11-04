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

// 게시글 생성 API (JWT 검증 + D1 컬럼 자동 매핑)
app.post("/api/posts", async (c) => {
  // Schema:
  // CREATE TABLE post (
  //   id text, type text, category text, author text, author_id text,
  //   thumbnail_url text, title text, content text DEFAULT 0,
  //   upload_time real, edited integer, state text, tags text, ip text
  // )

  const TYPE_SET = new Set(["public", "student", "parent"]);
  const CATEGORY_SET = new Set(["nomal", "notice", "question", "private"]); // 'nomal' per schema

  type Body = {
    token?: string; // optional (익명 업로드 허용)
    title: string;
    content?: string; // markdown
    tags?: string[] | string;
    thumbnail_url?: string;
    category?: string; // must be in CATEGORY_SET
    type?: string; // must be in TYPE_SET
  };

  const body = await c.req.json<Body>().catch(() => null);
  if (!body) return c.json({ error: "잘못된 요청입니다." }, 400);

  const { token, title } = body;
  if (!title || !title.trim()) return c.json({ error: "제목이 필요합니다." }, 400);

  // Validate enums with defaults
  const typeVal = (body.type || "public").toLowerCase();
  const categoryVal = (body.category || "nomal").toLowerCase();
  if (!TYPE_SET.has(typeVal)) return c.json({ error: "type 값이 올바르지 않습니다." }, 400);
  if (!CATEGORY_SET.has(categoryVal)) return c.json({ error: "category 값이 올바르지 않습니다." }, 400);

  const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const maskIp = (ip: string) => {
    if (!ip || ip === "unknown") return "unknown";
    if (ip.includes(".")) {
      const parts = ip.split(".");
      return parts.slice(0, 2).join(".");
    }
    if (ip.includes(":")) {
      const parts = ip.split(":");
      return parts.slice(0, 2).join(":");
    }
    return ip;
  };

  let authorName = "";
  let authorId = "";

  // 토큰이 있으면 검증 시도, 실패해도 익명으로 계속 진행
  if (token) {
    try {
      const payload = await verify(token, c.env.SECRET_KEY);
      if (payload && (payload as any).ip === reqIp) {
        authorId = String((payload as any).id || "");
        authorName = String((payload as any).username || authorId || "");
        // 닉네임 우선 조회
        try {
          const me = await c.env.DB.prepare("SELECT nickname FROM users WHERE id = ?").bind(authorId).all();
          if (me.results && me.results[0] && (me.results[0] as any).nickname) {
            authorName = (me.results[0] as any).nickname as string;
          }
        } catch {}
      }
    } catch {
      // ignore - fallback to anonymous
    }
  }

  if (!authorName) {
    authorName = `익명(${maskIp(reqIp)})`;
    authorId = "";
  }

  try {
    const postId = (crypto as any).randomUUID ? crypto.randomUUID() : `${Date.now()}`;
    const now = Date.now();
    const tagsStr = Array.isArray(body.tags)
      ? body.tags.join(",")
      : typeof body.tags === "string"
        ? body.tags
        : "";

    // 명시적으로 스키마에 맞춰 INSERT (ip 포함)
    const sql = `INSERT INTO post (id, type, category, author, author_id, thumbnail_url, title, content, upload_time, edited, state, tags, ip)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      postId,
      typeVal,
      categoryVal,
      authorName,
      authorId,
      body.thumbnail_url || "",
      title.trim(),
      body.content || "",
      now,
      0,
      "active",
      tagsStr,
      reqIp,
    ];
    await c.env.DB.prepare(sql).bind(...params).run();

    return c.json({ success: true, id: postId });
  } catch (e) {
    console.error("게시글 생성 오류:", e);
    return c.json({ error: "게시글 생성 중 오류가 발생했습니다." }, 500);
  }
});

// 가이드 목록 조회 API (DB 기반)
app.get("/api/guides", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, author_id, title, description, date, step, needtime, thumbnail_url, edited, status FROM guide WHERE status = 0 ORDER BY date DESC"
    ).all();
    return c.json(results);
  } catch (error) {
    console.error("가이드 목록 조회 오류:", error);
    return c.json({ error: "가이드 목록을 불러올 수 없습니다." }, 500);
  }
});

// 특정 가이드 조회 API
app.get("/api/guide", async (c) => {
  const guideId = c.req.query("id");
  if (!guideId) {
    return c.json({ error: "가이드 ID가 필요합니다." }, 400);
  }
  
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, author_id, title, description, date, step, needtime, thumbnail_url, edited, status FROM guide WHERE id = ?"
    ).bind(guideId).all();
    
    if (!results || results.length === 0) {
      return c.json({ error: "가이드를 찾을 수 없습니다." }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    console.error("가이드 조회 오류:", error);
    return c.json({ error: "가이드를 불러올 수 없습니다." }, 500);
  }
});

// 가이드 생성 API
app.post("/api/guides", async (c) => {
  const { token, title, description, step, needtime, thumbnail_url } = await c.req.json<{
    token: string;
    title: string;
    description?: string;
    step?: number;
    needtime?: number;
    thumbnail_url?: string;
  }>();
  
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  if (!title) return c.json({ error: "제목이 필요합니다." }, 400);
  
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    
    const guideId = crypto.randomUUID();
    const now = Date.now();
    
    await c.env.DB.prepare(
      "INSERT INTO guide (id, author_id, title, description, date, step, needtime, thumbnail_url, edited, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      guideId,
      payload.id,
      title,
      description || "",
      now,
      step || 0,
      needtime || 0,
      thumbnail_url || "",
      0,
      0 // status: 0 = active
    ).run();
    
    return c.json({ success: true, id: guideId });
  } catch (e) {
    console.error("가이드 생성 오류:", e);
    return c.json({ error: "가이드 생성 중 오류가 발생했습니다." }, 500);
  }
});

// 가이드 수정 API
app.put("/api/guides", async (c) => {
  const { token, id, title, description, step, needtime, thumbnail_url } = await c.req.json<{
    token: string;
    id: string;
    title?: string;
    description?: string;
    step?: number;
    needtime?: number;
    thumbnail_url?: string;
  }>();
  
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  if (!id) return c.json({ error: "가이드 ID가 필요합니다." }, 400);
  
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    
    // 권한 확인: 작성자 본인이거나 관리자인지 체크
    const { results: guideResults } = await c.env.DB.prepare(
      "SELECT author_id FROM guide WHERE id = ?"
    ).bind(id).all();
    
    if (!guideResults || guideResults.length === 0) {
      return c.json({ error: "가이드를 찾을 수 없습니다." }, 404);
    }
    
    const guide = guideResults[0] as any;
    if (guide.author_id !== payload.id && payload.role !== 1) {
      return c.json({ error: "수정 권한이 없습니다." }, 403);
    }
    
    // 동적 업데이트 쿼리 생성
    const updates: string[] = [];
    const values: any[] = [];
    
    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (step !== undefined) {
      updates.push("step = ?");
      values.push(step);
    }
    if (needtime !== undefined) {
      updates.push("needtime = ?");
      values.push(needtime);
    }
    if (thumbnail_url !== undefined) {
      updates.push("thumbnail_url = ?");
      values.push(thumbnail_url);
    }
    
    if (updates.length === 0) {
      return c.json({ error: "변경할 항목이 없습니다." }, 400);
    }
    
    updates.push("edited = ?");
    values.push(Date.now());
    values.push(id);
    
    const sql = `UPDATE guide SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(sql).bind(...values).run();
    
    return c.json({ success: true });
  } catch (e) {
    console.error("가이드 수정 오류:", e);
    return c.json({ error: "가이드 수정 중 오류가 발생했습니다." }, 500);
  }
});

// 가이드 삭제 API (soft delete)
app.delete("/api/guides", async (c) => {
  const { token, id } = await c.req.json<{ token: string; id: string }>();
  
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  if (!id) return c.json({ error: "가이드 ID가 필요합니다." }, 400);
  
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    
    // 권한 확인
    const { results: guideResults } = await c.env.DB.prepare(
      "SELECT author_id FROM guide WHERE id = ?"
    ).bind(id).all();
    
    if (!guideResults || guideResults.length === 0) {
      return c.json({ error: "가이드를 찾을 수 없습니다." }, 404);
    }
    
    const guide = guideResults[0] as any;
    if (guide.author_id !== payload.id && payload.role !== 1) {
      return c.json({ error: "삭제 권한이 없습니다." }, 403);
    }
    
    // Soft delete: status를 -1로 변경
    await c.env.DB.prepare(
      "UPDATE guide SET status = -1, edited = ? WHERE id = ?"
    ).bind(Date.now(), id).run();
    
    return c.json({ success: true });
  } catch (e) {
    console.error("가이드 삭제 오류:", e);
    return c.json({ error: "가이드 삭제 중 오류가 발생했습니다." }, 500);
  }
});

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

// 가이드 아이템 목록 조회 API (parent_id로 필터 가능)
app.get("/api/guide-items", async (c) => {
  const parentId = c.req.query("id");
  const includeContent = c.req.query("content") === "true"; // content 포함 여부
  
  // content 포함 여부에 따라 SELECT 절 구성
  const selectFields = includeContent
    ? "id, parent_id, author_id, title, description, content, date, needtime, thumbnail_url, edited, status"
    : "id, parent_id, author_id, title, description, date, needtime, thumbnail_url, edited, status";
  
  try {
    if (parentId) {
      // 특정 가이드의 아이템만 조회
      const { results } = await c.env.DB.prepare(
        `SELECT ${selectFields} FROM guide_item WHERE parent_id = ? AND status = 0 ORDER BY date ASC`
      ).bind(parentId).all();
      return c.json(results);
    } else {
      // 모든 활성 가이드 아이템 조회
      const { results } = await c.env.DB.prepare(
        `SELECT ${selectFields} FROM guide_item WHERE status = 0 ORDER BY parent_id, date ASC`
      ).all();
      return c.json(results);
    }
  } catch (error) {
    console.error("가이드 아이템 조회 오류:", error);
    return c.json({ error: "가이드 아이템을 불러올 수 없습니다." }, 500);
  }
});

// 특정 가이드 아이템 조회 API
app.get("/api/guide-item", async (c) => {
  const itemId = c.req.query("id");
  if (!itemId) {
    return c.json({ error: "아이템 ID가 필요합니다." }, 400);
  }
  
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, parent_id, author_id, title, description, content, date, needtime, thumbnail_url, edited, status FROM guide_item WHERE id = ?"
    ).bind(itemId).all();
    
    if (!results || results.length === 0) {
      return c.json({ error: "가이드 아이템을 찾을 수 없습니다." }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    console.error("가이드 아이템 조회 오류:", error);
    return c.json({ error: "가이드 아이템을 불러올 수 없습니다." }, 500);
  }
});

// 가이드 아이템 생성 API
app.post("/api/guide-items", async (c) => {
  const { token, parent_id, title, description, content, needtime, thumbnail_url } = await c.req.json<{
    token: string;
    parent_id: string;
    title: string;
    description?: string;
    content?: string;
    needtime?: number;
    thumbnail_url?: string;
  }>();
  
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  if (!parent_id) return c.json({ error: "상위 가이드 ID가 필요합니다." }, 400);
  if (!title) return c.json({ error: "제목이 필요합니다." }, 400);
  
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    
    // parent_id가 유효한 가이드인지 확인
    const { results: parentResults } = await c.env.DB.prepare(
      "SELECT id FROM guide WHERE id = ? AND status = 0"
    ).bind(parent_id).all();
    
    if (!parentResults || parentResults.length === 0) {
      return c.json({ error: "상위 가이드를 찾을 수 없습니다." }, 404);
    }
    
    const itemId = crypto.randomUUID();
    const now = Date.now();
    
    await c.env.DB.prepare(
      "INSERT INTO guide_item (id, parent_id, author_id, title, description, content, date, needtime, thumbnail_url, edited, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      itemId,
      parent_id,
      payload.id,
      title,
      description || "",
      content || "",
      now,
      needtime || 0,
      thumbnail_url || "",
      0,
      0 // status: 0 = active
    ).run();
    
    return c.json({ success: true, id: itemId });
  } catch (e) {
    console.error("가이드 아이템 생성 오류:", e);
    return c.json({ error: "가이드 아이템 생성 중 오류가 발생했습니다." }, 500);
  }
});

// 가이드 아이템 수정 API
app.put("/api/guide-items", async (c) => {
  const { token, id, title, description, content, needtime, thumbnail_url } = await c.req.json<{
    token: string;
    id: string;
    title?: string;
    description?: string;
    content?: string;
    needtime?: number;
    thumbnail_url?: string;
  }>();
  
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  if (!id) return c.json({ error: "아이템 ID가 필요합니다." }, 400);
  
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    
    // 권한 확인: 작성자 본인이거나 관리자인지 체크
    const { results: itemResults } = await c.env.DB.prepare(
      "SELECT author_id FROM guide_item WHERE id = ?"
    ).bind(id).all();
    
    if (!itemResults || itemResults.length === 0) {
      return c.json({ error: "가이드 아이템을 찾을 수 없습니다." }, 404);
    }
    
    const item = itemResults[0] as any;
    if (item.author_id !== payload.id && payload.role !== 1) {
      return c.json({ error: "수정 권한이 없습니다." }, 403);
    }
    
    // 동적 업데이트 쿼리 생성
    const updates: string[] = [];
    const values: any[] = [];
    
    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (content !== undefined) {
      updates.push("content = ?");
      values.push(content);
    }
    if (needtime !== undefined) {
      updates.push("needtime = ?");
      values.push(needtime);
    }
    if (thumbnail_url !== undefined) {
      updates.push("thumbnail_url = ?");
      values.push(thumbnail_url);
    }
    
    if (updates.length === 0) {
      return c.json({ error: "변경할 항목이 없습니다." }, 400);
    }
    
    updates.push("edited = ?");
    values.push(Date.now());
    values.push(id);
    
    const sql = `UPDATE guide_item SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(sql).bind(...values).run();
    
    return c.json({ success: true });
  } catch (e) {
    console.error("가이드 아이템 수정 오류:", e);
    return c.json({ error: "가이드 아이템 수정 중 오류가 발생했습니다." }, 500);
  }
});

// 가이드 아이템 삭제 API (soft delete)
app.delete("/api/guide-items", async (c) => {
  const { token, id } = await c.req.json<{ token: string; id: string }>();
  
  if (!token) return c.json({ error: "JWT가 필요합니다." }, 400);
  if (!id) return c.json({ error: "아이템 ID가 필요합니다." }, 400);
  
  try {
    const payload = await verify(token, c.env.SECRET_KEY);
    const reqIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    if (!payload.ip || payload.ip !== reqIp) {
      return c.json({ error: "유효하지 않은 토큰입니다" }, 401);
    }
    
    // 권한 확인
    const { results: itemResults } = await c.env.DB.prepare(
      "SELECT author_id FROM guide_item WHERE id = ?"
    ).bind(id).all();
    
    if (!itemResults || itemResults.length === 0) {
      return c.json({ error: "가이드 아이템을 찾을 수 없습니다." }, 404);
    }
    
    const item = itemResults[0] as any;
    if (item.author_id !== payload.id && payload.role !== 1) {
      return c.json({ error: "삭제 권한이 없습니다." }, 403);
    }
    
    // Soft delete: status를 -1로 변경
    await c.env.DB.prepare(
      "UPDATE guide_item SET status = -1, edited = ? WHERE id = ?"
    ).bind(Date.now(), id).run();
    
    return c.json({ success: true });
  } catch (e) {
    console.error("가이드 아이템 삭제 오류:", e);
    return c.json({ error: "가이드 아이템 삭제 중 오류가 발생했습니다." }, 500);
  }
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
