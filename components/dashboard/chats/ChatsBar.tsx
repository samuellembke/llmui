"use client"
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {thread} from "@/server/db/schema";
import React, {useEffect, useState} from "react";
import {ChatsContext, useChats} from "@/components/dashboard/chats/ChatsProvider";

type userThread = typeof thread.$inferSelect

export default function ChatsBar() {

  const { state, updateThreads, createThread, setActiveThread } = React.useContext(ChatsContext);

  return (
    <div className="h-full w-full border-e-border">
      <div className="p-[.5rem]">
        <Input placeholder="Search chats" className="mb-[.5rem]"/>
        <Button variant="outline" className="w-full" onClick={() => {
          createThread().then((data) => {
            if (data && data.length > 0) {
              updateThreads(data)
            }
          })
        }}>
          New Chat
        </Button>
      </div>
      <Separator/>
      {state.threads?.map((thread) => (
        <div key={thread.id} className="p-[.5rem] border-b border-border" onClick={() => {
          setActiveThread(thread)
        }}>
          <h3>
            {thread.name}
          </h3>
          {thread.createdAt && (
            <p className="text-xs">{new Date(thread.createdAt).toLocaleDateString()}</p>
          )}
        </div>
      ))}
    </div>
  )
}