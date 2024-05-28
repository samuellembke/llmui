import { api } from "@/trpc/server";
import ChatsProvider from "@/components/dashboard/chats/ChatsProvider";
import {ReactNode} from "react";

export default async function ChatsProviderWrapper({children}: {children: ReactNode}) {
  const threads = await api.threads.getUsersThreads()

  // TODO: Implement createThread function not as server function but as client side trpc call
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