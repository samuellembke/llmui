import { api } from "@/trpc/server";
import ChatsProvider from "@/components/dashboard/chats/ChatsProvider";
import {ReactNode} from "react";

export default async function ChatsProviderWrapper({children}: {children: ReactNode}) {
  const threads = await api.threads.getUsersThreads()

  async function createThread() {
    "use server"
    return await api.threads.createThread({
      title: "New Thread"
    });
  }

  return (
    <ChatsProvider fetchedThreads={threads} createThread={createThread}>
      {children}
    </ChatsProvider>
  )
}