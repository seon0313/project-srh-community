import { Hono } from "hono";
const app = new Hono<{ Bindings: Env & { AI: any } }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

// GET /api/ai?prompt=메세지
app.get("/api/ai", async (c) => {
  const prompt = c.req.query("prompt") || "";
  const ai = c.env.AI;
  const result = await ai.run("@cf/openai/gpt-oss-120b", {
    input: prompt,
  });
  return c.json(result);
});

export default app;
