"use client"
import React, {createContext, useCallback, useEffect, useState} from 'react';

import {thread} from '@/server/db/schema';

type userThread = typeof thread.$inferSelect;

type State = {
  threads: userThread[];
};

const initialState: State = {
  threads: [],
};

export const ChatsContext = createContext<{
  state: State;
  setThreads: (threads: userThread[]) => void;
  updateThreads: (threads: userThread[]) => void;
  createThread: () => Promise<userThread[]>;
}>({
  state: initialState,
  setThreads: () => {},
  updateThreads: () => {},
  createThread: async () => [],
});

export default function ChatsProvider({ children, fetchedThreads, createThread }: {
  children: React.ReactNode;
  fetchedThreads: userThread[];
  createThread: () => Promise<userThread[]>;
}) {

  const [state, setState] = useState({
    threads: fetchedThreads,
  });

  const setThreads = useCallback((threads: userThread[]) => {
    setState({ threads });
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

    setState({ threads: oldThreads });
  }, [state])

  const createNewThread = async () => {
    return await createThread();
  }

  useEffect(() => {
    // setState({ threads: fetchedThreads });
  }, [fetchedThreads])

  return (
    <ChatsContext.Provider value={{ state, setThreads, updateThreads, createThread: createNewThread }}>
      {children}
    </ChatsContext.Provider>
  );
}

export const useChats = () => {
  const { state, setThreads, updateThreads } = React.useContext(ChatsContext);


  return {
    threads: state.threads,
    setThreads,
    updateThreads,
  };
};