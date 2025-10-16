import { Hono } from "hono";
const app = new Hono<{ Bindings: Env & { AI: any } }>();

// 게시글 목록 예시 데이터
const posts = [
  { id: 1, title: "첫 번째 게시글", author: "관리자", date: "2025-10-16" },
  { id: 2, title: "두 번째 게시글", author: "홍길동", date: "2025-10-15" },
];

// 게시글 목록 API
app.get("/api/posts", (c) => c.json(posts));

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/ai", async (c) => {
  const prompt = c.req.query("prompt") || "";
  const ai = c.env.AI;
  // Llama 모델은 prompt 필드 사용
  const stream = await ai.run("@cf/meta/llama-3.1-8b-instruct-fast", {
    prompt,
    stream: true
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream"
    }
  });
});

export default app;
