import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import type { appRouter } from "@deessejs/api"
import { authClient } from "./auth"
const link = new RPCLink({
  url: `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"}/api/rpc`,
  headers: async () => ({ Cookie: (await authClient.getCookie()) ?? "" }),
  fetch: (request, init) => fetch(request, { ...init, credentials: "omit" }),
})
export const rpc = createORPCClient<RouterClient<typeof appRouter>>(link)
