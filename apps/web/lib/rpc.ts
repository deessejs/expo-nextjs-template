import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import type { appRouter } from "@deessejs/api"
const apiOrigin =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window === "undefined" ? "http://localhost:3000" : window.location.origin)
const link = new RPCLink({
  url: `${apiOrigin}/api/rpc`,
  fetch: (request, init) => fetch(request, { ...init, credentials: "include" }),
})
export const rpc = createORPCClient<RouterClient<typeof appRouter>>(link)
