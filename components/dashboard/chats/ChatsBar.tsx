"use client"
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {thread} from "@/server/db/schema";
import React, {useEffect, useState} from "react";
import {ChatsContext, useChats} from "@/components/dashboard/chats/ChatsProvider";
import {useSources} from "@/components/dashboard/inferenceSource/SourceProvider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

type userThread = typeof thread.$inferSelect

export default function ChatsBar() {
  const { sources, activeSource, setActiveSource, selectedSource, setSelectSource, refetchSources, createSource } = useSources()
  const { state, updateThreads, createThread, setActiveThread } = React.useContext(ChatsContext);

  return (
    <div className="h-full w-full border-e-border">
      <div className="p-[.5rem]">
        { sources && sources.length > 0 && selectedSource && (
          <Select defaultValue={selectedSource?.id+""} onValueChange={(value) => {
            const source = sources.find((source) => source.id === parseInt(value))
            if (source)
              setSelectSource(source)
          }}>
            <SelectTrigger className="mb-[.5rem]">
              <SelectValue placeholder="Select Inference Source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id+""}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) }
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