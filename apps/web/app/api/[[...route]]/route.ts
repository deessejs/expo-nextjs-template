import { app } from "@deessejs/api"
export const runtime = "nodejs"
const handle = (request: Request) => app.fetch(request)
export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
