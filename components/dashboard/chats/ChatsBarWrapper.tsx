import { api } from "@/trpc/server";
import ChatsBar from "@/components/dashboard/chats/ChatsBar";

export default async function ChatsBarWrapper() {
  const threads = await api.threads.getUsersThreads()

  async function createThread() {
    "use server"
    return await api.threads.createThread({
      title: "New Thread"
    });
  }

  return (
    <div className="h-full w-full border-e-border">
      <ChatsBar fetchedThreads={threads} createThread={createThread} />
    </div>
  )
}