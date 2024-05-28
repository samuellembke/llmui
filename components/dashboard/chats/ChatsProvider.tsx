"use client"
import React, {createContext, useCallback, useEffect, useState} from 'react';

import {thread} from '@/server/db/schema';

type userThread = typeof thread.$inferSelect;

type State = {
  threads: userThread[];
  activeThread: userThread | null;
};

const initialState: State = {
  threads: [],
  activeThread: null,
};

export const ChatsContext = createContext<{
  state: State;
  setThreads: (threads: userThread[]) => void;
  updateThreads: (threads: userThread[]) => void;
  createThread: () => Promise<userThread[]>;
  setActiveThread: (thread: userThread) => void;
}>({
  state: initialState,
  setThreads: () => {},
  updateThreads: () => {},
  createThread: async () => [],
  setActiveThread: () => {},
});

export default function ChatsProvider({ children, fetchedThreads, createThread }: {
  children: React.ReactNode;
  fetchedThreads: userThread[];
  createThread: () => Promise<userThread[]>;
}) {

  const [state, setState] = useState<State>({
    threads: fetchedThreads,
    activeThread: null,
  });

  const setThreads = useCallback((threads: userThread[]) => {
    setState(prevState => {
      return {
        threads,
        activeThread: prevState.activeThread,
      }
    });
  }, [])

  const updateThreads = useCallback((threads: userThread[]) => {
    const oldThreads = state.threads;

    threads.forEach((thread) => {
      const index = oldThreads.findIndex((oldThread) => oldThread.id === thread.id);
      if (index === -1) {
        oldThreads.push(thread);
      } else {
        oldThreads[index] = thread;
      }
    })

    setState(prevState => {
      return {
        threads: oldThreads,
        activeThread: prevState.activeThread,
      }
    });
  }, [state])

  const createNewThread = async () => {
    return await createThread();
  }

  const setActiveThread = useCallback((thread: userThread) => {
    setState(prevState => {
      return {
        threads: prevState.threads,
        activeThread: thread,
      }
    });
  }, [])

  useEffect(() => {
    // setState({ threads: fetchedThreads });
  }, [fetchedThreads])

  return (
    <ChatsContext.Provider value={{ state, setThreads, updateThreads, createThread: createNewThread, setActiveThread }}>
      {children}
    </ChatsContext.Provider>
  );
}

export const useChats = () => {
  const { state, setThreads, updateThreads, setActiveThread } = React.useContext(ChatsContext);


  return {
    threads: state.threads,
    activeThread: state.activeThread,
    setThreads,
    updateThreads,
    setActiveThread,
  };
};