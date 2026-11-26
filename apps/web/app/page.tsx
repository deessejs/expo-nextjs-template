"use client"
import { useEffect, useState } from "react"
import { ArrowRight, LogOut, Plus, Trash2 } from "lucide-react"
import { authClient } from "../lib/auth-client"
import { rpc } from "../lib/rpc"
type Note = { id: string; body: string }
export default function Home() {
  const { data: session, isPending } = authClient.useSession()
  const [notes, setNotes] = useState<Note[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState("")
  async function refresh() {
    try {
      setNotes(await rpc.notes.list({}))
    } catch {
      setNotes([])
    }
  }
  // This effect synchronizes the owned note list after the auth session changes.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    if (session) void refresh()
  }, [session])
  if (isPending) return <main className="p-10">Loading…</main>
  if (!session)
    return (
      <main className="mx-auto mt-24 max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-violet-700">DEESSEJS STARTER</p>
        <h1 className="mt-3 text-3xl font-bold">Your workspace</h1>
        <p className="mt-2 text-gray-500">Create an account or sign in to sync your notes.</p>
        <div className="mt-7 grid gap-3">
          <input
            className="rounded-xl border p-3"
            placeholder="Name (for sign up)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-xl bg-violet-700 p-3 font-semibold text-white"
              onClick={async () => {
                setError("")
                const r = await authClient.signIn.email({ email, password })
                if (r.error) setError(r.error.message ?? "Sign in failed")
              }}
            >
              Sign in
            </button>
            <button
              className="flex-1 rounded-xl border p-3 font-semibold"
              onClick={async () => {
                setError("")
                const r = await authClient.signUp.email({ name, email, password })
                if (r.error) setError(r.error.message ?? "Sign up failed")
              }}
            >
              Create account
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </main>
    )
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-700">DEESSEJS STARTER</p>
          <h1 className="mt-2 text-4xl font-bold">Welcome, {session.user.name}</h1>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3"
          onClick={() => authClient.signOut()}
        >
          <LogOut size={16} /> Sign out
        </button>
      </header>
      <section className="mt-10 rounded-3xl bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold">Your private notes</h2>
        <p className="mt-1 text-gray-500">Stored in PostgreSQL and scoped to your account.</p>
        <form
          className="mt-6 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!body.trim()) return
            await rpc.notes.create({ body })
            setBody("")
            await refresh()
          }}
        >
          <input
            className="min-w-0 flex-1 rounded-xl border p-3"
            placeholder="Add a note…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="rounded-xl bg-violet-700 px-4 text-white">
            <Plus />
          </button>
        </form>
        <ul className="mt-5 divide-y">
          {notes.map((n) => (
            <li className="flex items-center justify-between py-4" key={n.id}>
              <span>{n.body}</span>
              <button
                aria-label="Delete note"
                onClick={async () => {
                  await rpc.notes.delete({ id: n.id })
                  await refresh()
                }}
              >
                <Trash2 size={17} />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-6 flex items-center gap-2 text-sm text-gray-500">
        Same authenticated backend powers the mobile app <ArrowRight size={14} />
      </p>
    </main>
  )
}
