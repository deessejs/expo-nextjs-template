import type { NextConfig } from "next"
import { loadEnvConfig } from "@next/env"

// Load the shared monorepo root .env when Next is started from apps/web.
loadEnvConfig(`${process.cwd()}/../..`)

const nextConfig: NextConfig = {
  transpilePackages: ["@deessejs/api", "@deessejs/auth", "@deessejs/database"],
}
export default nextConfig
