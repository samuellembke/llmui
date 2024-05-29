"use client"
import {thread, userMessages, inferenceMessage} from "@/server/db/schema";
import React, {Fragment, useEffect, useMemo} from "react";
import {ChatsContext, useChats} from "@/components/dashboard/chats/ChatsProvider";
import {Input} from "@/components/ui/input";
import {useMessages} from "@/components/dashboard/chats/MessageProvider";
import {api} from "@/trpc/react";
import {useChat} from "ai/react";
import Markdown from "react-markdown";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";

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
      <div className="bg-white/10 p-2 rounded-md text-end  ">
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
      <div className=" rounded-md text-start prose prose-invert">
        <Markdown>
          {content}
        </Markdown>
      </div>
    </div>
  )
}


export default function Chat() {
  const [streaming, setStreaming] = React.useState(false)
  const [autoScroll, setAutoScroll] = React.useState(true)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const scrollWrapperRef = React.useRef<HTMLDivElement>(null)
  const endScrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { activeThread } = useChats()
  const prevThreadID = React.useRef<number | null>(null)
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
    onResponse: (response) => {
      setStreaming(true)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    onFinish: (message) => {
      if (message.role === "assistant") {
        setStreaming(false)
        inputRef.current?.focus()
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
    const handleResize = () => {
      if (autoScroll) {
        endScrollRef.current?.scrollIntoView({ behavior: "instant" })
      }
    }
    const scroll = scrollWrapperRef.current

    const observer = new ResizeObserver(handleResize)
    if (scroll) {
      observer.observe(scroll)
    }


    return () => {
      if (scroll) {
        observer.unobserve(scroll)
      }
      observer.disconnect()
    }

  }, [autoScroll])

  const handleScroll = () => {
    const chat = scrollRef.current

    if (chat) {
      const isAtBottom = Math.abs((chat.scrollHeight - chat.scrollTop) - chat.clientHeight)
      setAutoScroll(isAtBottom < 80)
    }
  }

  useEffect(() => {
    if (!streaming) {
      inputRef.current?.focus()
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }, [streaming])

  useEffect(() => {
    if (prevThreadID.current !== activeThread?.id) {
      prevThreadID.current = activeThread?.id ?? null
    }
  }, [activeThread]);


  return (
    <div className="h-full max-h-full w-full bg-background flex flex-col justify-start items-start">
      <div className="w-full h-full flex-grow flex flex-row justify-center items-stretch">
        <div className="w-full h-full relative">
          <div
            className="absolute top-0 start-0 w-full h-full flex flex-row justify-center items-stretch overflow-auto" ref={scrollRef} onScroll={handleScroll}>
            <div
              className="w-full h-fit flex flex-col justify-start items-stretch gap-[2rem] p-[1rem] max-w-[48rem]" ref={scrollWrapperRef}>
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
              <div className="h-0" ref={endScrollRef}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={cn(`w-full px-[1rem] py-[2rem]`, `${activeThread?.id != null ? '' : 'hidden'}`)}>
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
          <Textarea ref={inputRef} disabled={streaming} placeholder="Type a message" className="w-full resize-none" value={input} onChange={handleInputChange} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              console.log("Submitting", e)
              // @ts-ignore
              e.target.parentElement?.requestSubmit()
              setStreaming(true)
            }
          }}/>
        </form>
      </div>
    </div>
  )
}