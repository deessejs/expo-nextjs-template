import { useEffect, useState } from "react"
import { Pressable, Text, TextInput, View, FlatList, Alert } from "react-native"
import { LogOut, Plus, Trash2 } from "lucide-react-native"
import { authClient } from "../lib/auth"
import { rpc } from "../lib/rpc"
type Note = { id: string; body: string }
export default function Home() {
  const { data: session, isPending } = authClient.useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  const [notes, setNotes] = useState<Note[]>([])
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
  if (isPending)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading…</Text>
      </View>
    )
  if (!session)
    return (
      <View className="flex-1 justify-center gap-3 bg-stone-50 px-7">
        <Text className="text-sm font-bold text-violet-700">DEESSEJS STARTER</Text>
        <Text className="text-3xl font-bold">Your workspace</Text>
        <TextInput
          className="rounded-xl border border-stone-200 bg-white p-4"
          placeholder="Name (for sign up)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="rounded-xl border border-stone-200 bg-white p-4"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="rounded-xl border border-stone-200 bg-white p-4"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          className="rounded-xl bg-violet-700 p-4"
          onPress={async () => {
            const r = await authClient.signIn.email({ email, password })
            if (r.error) Alert.alert("Sign in failed", r.error.message)
          }}
        >
          <Text className="text-center font-bold text-white">Sign in</Text>
        </Pressable>
        <Pressable
          className="rounded-xl border border-stone-300 p-4"
          onPress={async () => {
            const r = await authClient.signUp.email({ name, email, password })
            if (r.error) Alert.alert("Sign up failed", r.error.message)
          }}
        >
          <Text className="text-center font-bold">Create account</Text>
        </Pressable>
      </View>
    )
  return (
    <View className="flex-1 bg-stone-50 px-6 pt-20">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-bold text-violet-700">DEESSEJS STARTER</Text>
          <Text className="mt-2 text-3xl font-bold">Hello, {session.user.name}</Text>
        </View>
        <Pressable onPress={() => authClient.signOut()}>
          <LogOut color="#555" />
        </Pressable>
      </View>
      <Text className="mt-8 text-lg font-bold">Your private notes</Text>
      <View className="mt-4 flex-row gap-2">
        <TextInput
          className="flex-1 rounded-xl border border-stone-200 bg-white p-4"
          placeholder="Add a note…"
          value={body}
          onChangeText={setBody}
        />
        <Pressable
          className="justify-center rounded-xl bg-violet-700 px-4"
          onPress={async () => {
            if (!body.trim()) return
            await rpc.notes.create({ body })
            setBody("")
            await refresh()
          }}
        >
          <Plus color="white" />
        </Pressable>
      </View>
      <FlatList
        className="mt-3"
        data={notes}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between border-b border-stone-200 py-4">
            <Text>{item.body}</Text>
            <Pressable
              onPress={async () => {
                await rpc.notes.delete({ id: item.id })
                await refresh()
              }}
            >
              <Trash2 color="#777" size={18} />
            </Pressable>
          </View>
        )}
      />
    </View>
  )
}
