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

// 게시글 목록 API
app.get("/api/posts", (c) => c.json(posts));
app.get("/api/guides", (c) => c.json(guide));

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
