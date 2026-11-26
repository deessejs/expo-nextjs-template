import { Hono } from "hono"
import { RPCHandler } from "@orpc/server/fetch"
import { os, ORPCError } from "@orpc/server"
import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { auth } from "@deessejs/auth"
import { db, note } from "@deessejs/database"

const router = {
  notes: {
    list: os.handler(async ({ context }) => {
      const userId = (context as { userId?: string }).userId
      if (!userId) throw new ORPCError("UNAUTHORIZED")
      return db.select().from(note).where(eq(note.userId, userId))
    }),
    create: os
      .input(z.object({ body: z.string().trim().min(1).max(500) }))
      .handler(async ({ input, context }) => {
        const userId = (context as { userId?: string }).userId
        if (!userId) throw new ORPCError("UNAUTHORIZED")
        const [created] = await db
          .insert(note)
          .values({ id: crypto.randomUUID(), userId, body: input.body })
          .returning()
        return created
      }),
    delete: os.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      const userId = (context as { userId?: string }).userId
      if (!userId) throw new ORPCError("UNAUTHORIZED")
      await db.delete(note).where(and(eq(note.id, input.id), eq(note.userId, userId)))
      return { ok: true }
    }),
  },
}
const handler = new RPCHandler(router)
const app = new Hono().basePath("/api")
app.get("/health", (c) => c.json({ status: "ok" }))
app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
app.all("/rpc/*", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  const result = await handler.handle(c.req.raw, {
    prefix: "/api/rpc",
    context: { userId: session?.user.id },
  })
  return result.matched ? c.newResponse(result.response.body, result.response) : c.notFound()
})
export { app }
export const appRouter = router
export type AppRouter = typeof appRouter
