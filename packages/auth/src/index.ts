import { betterAuth } from "better-auth"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { expo } from "@better-auth/expo"
import { db } from "@deessejs/database"
import * as schema from "@deessejs/database"

const secret = process.env.BETTER_AUTH_SECRET
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is required to start the auth server")
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:3000", "http://localhost:8081", "expo://", "deesse-expo://"],
  plugins: [expo()],
})
