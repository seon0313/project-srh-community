import { Hono } from "hono";
const app = new Hono<{ Bindings: Env & { AI: any, DB: D1Database } }>();

// 게시글 목록 예시 데이터
const posts = [
  { id: 1, title: "첫 번째 게시글", author: "관리자", date: "2025-10-16" },
  { id: 2, title: "두 번째 게시글", author: "홍길동", date: "2025-10-15" },
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
