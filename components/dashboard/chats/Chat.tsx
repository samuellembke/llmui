"use client"
import {thread, userMessages, inferenceMessage} from "@/server/db/schema";
import React, {Fragment, useEffect, useMemo} from "react";
import {ChatsContext, useChats} from "@/components/dashboard/chats/ChatsProvider";
import {Input} from "@/components/ui/input";
import {useMessages} from "@/components/dashboard/chats/MessageProvider";
import {api} from "@/trpc/react";
import {useChat} from "ai/react";
import Markdown from "react-markdown";

type userThread = typeof thread.$inferSelect
type userMessage = typeof userMessages.$inferSelect
type inferenceMessage = typeof inferenceMessage.$inferSelect

type uMessage = {
  data: userMessage,
  type: "user",
}

type iMessage = {
  data: inferenceMessage,
  type: "inference",
}

function UserMessage({content}: { content: string }) {
  return (
    <div className="flex flex-row justify-end gap-2">
      <div className="bg-white/10 p-2 rounded-md text-end text-[#bbb7cd] markdown">
        <Markdown>
          {content}
        </Markdown>
      </div>
    </div>
  )
}

function InferenceMessage({content}: { content: string }) {
  return (
    <div className="flex flex-row justify-start gap-2">
      <div className="bg-white/10 p-2 rounded-md text-start text-[#bbb7cd] markdown">
        <Markdown>
          {content}
        </Markdown>
      </div>
    </div>
  )
}


export default function Chat() {

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const { activeThread } = useChats()
  // const { userMessages, inferenceMessages, setActiveThread } = useMessages()
  const userMessagesQuery = api.messages.getUserMessages.useQuery({
    threadId: activeThread?.id ?? 0,
  })
  const inferenceMessagesQuery = api.messages.getInferenceMessages.useQuery({
    threadId: activeThread?.id ?? 0,
  })
  const sendInferenceMessage = api.messages.sendInferenceMessage.useMutation({
    onSuccess: (data) => {
      inferenceMessagesQuery.refetch()
    }
  })
  const messages = useMemo(() => {
    const uMessages: uMessage[] = userMessagesQuery.data?.reduce((acc: uMessage[], message) => {
      acc.push({
        data: message,
        type: "user",
      })
      return acc
    }, [] as uMessage[]) ?? [] as uMessage[]

    const iMessages: iMessage[] = inferenceMessagesQuery.data?.reduce((acc: iMessage[], message) => {
      acc.push({
        data: message,
        type: "inference",
      })
      return acc
    }, [] as iMessage[]) ?? [] as iMessage[]

    return [...uMessages, ...iMessages].sort((a, b) => {
      if (!a.data.createdAt || !b.data.createdAt) return 0
      else return a.data.createdAt.getTime() - b.data.createdAt.getTime()
    })
  }, [userMessagesQuery.data, inferenceMessagesQuery.data])
  const { messages: aiMessages, input, handleInputChange, handleSubmit, data } = useChat({
    initialMessages: messages.map((message) => {
      if (message.type === "user") {
        return {
          id: message.data.id+"",
          role: "user",
          content: message.data.content.message ?? "",
          createdAt: message.data.createdAt ?? new Date(),

        }
      } else if (message.type === "inference") {
        return {
          id: message.data.id+"",
          role: "assistant",
          content: message.data.content.message ?? "",
          createdAt: message.data.createdAt ?? new Date(),
        }
      }
      return {
        role: "user",
        content: "",
        createdAt: new Date(),
        id: "empty-"+Math.random(),
      }
    }),
    onFinish: (message) => {
      if (message.role === "assistant") {
        console.log(`Saving message for thread ${activeThread!.id}`)
        sendInferenceMessage.mutate({
          threadId: activeThread!.id,
          sourceId: 2,
          type: "text",
          finishedStreaming: new Date(),
          content: {
            message: message.content,
          }
        })
      }
    },

    id: activeThread?.id+"" ?? "-1",
  });
  const sendUserMessage = api.messages.sendUserMessage.useMutation({
    onSuccess: (data) => {
      userMessagesQuery.refetch()
    }
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])


  return (
    <div className="h-full max-h-full w-full bg-background flex flex-col justify-start items-start">
      <div className="w-full h-full flex-grow flex flex-row justify-center items-stretch">
        <div className="w-full h-full relative max-w-[48rem]">
          <div
            className="absolute top-0 start-0 w-full h-full flex overflow-auto" ref={scrollRef}>
            <div
              className="w-full h-fit flex flex-col justify-start items-stretch gap-[2rem] p-[1rem]">
              {aiMessages.map((message, index) => {
                return (
                  <Fragment key={index}>
                    {message.role === "user" && (
                      <UserMessage content={message.content} />
                    )}
                    {message.role === "assistant" && (
                      <InferenceMessage content={message.content} />
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-[1rem] py-[2rem]">
        <form onSubmit={(e) => {
          sendUserMessage.mutate({
            threadId: activeThread!.id,
            content: {
              message: input,
            },
            type: "text",
          })
          handleSubmit(e)
        }}>
          <Input placeholder="Type a message" className="w-full" value={input} onChange={handleInputChange}/>
        </form>
      </div>
    </div>
  )
}