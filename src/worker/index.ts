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

// 게시글 목록 API
app.get("/api/posts", (c) => c.json(posts));

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
