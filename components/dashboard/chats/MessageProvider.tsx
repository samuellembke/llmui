"use client"
import React, {createContext, useCallback, useEffect, useState} from 'react';

import {thread, inferenceMessage, userMessages} from '@/server/db/schema';

type userThread = typeof thread.$inferSelect;
type inferenceMessage = typeof inferenceMessage.$inferSelect;
type userMessage = typeof userMessages.$inferSelect;

type State = {
  activeThread: userThread | null;
  inferenceMessages: inferenceMessage[];
  userMessages: userMessage[];
};

const initialState: State = {
  activeThread: null,
  inferenceMessages: [],
  userMessages: [],
};

export const MessageContext = createContext<{
  state: State;
  setActiveThread: (thread: userThread) => void;
  setInferenceMessages: (messages: inferenceMessage[]) => void;
  setUserMessages: (messages: userMessage[]) => void;
  addOrUpdateInferenceMessage: (message: inferenceMessage) => void;
  addOrUpdateUserMessage: (message: userMessage) => void;
}>({
  state: initialState,
  setActiveThread: () => {},
  setInferenceMessages: () => {},
  setUserMessages: () => {},
  addOrUpdateInferenceMessage: () => {},
  addOrUpdateUserMessage: () => {},
});

export default function MessageProvider({ children }: {
  children: React.ReactNode;
}) {

  const [state, setState] = useState<State>({
    activeThread: null,
    inferenceMessages: [],
    userMessages: [],
  });

  const setActiveThread = useCallback((thread: userThread) => {
    setState(prevState => {
      return {
        activeThread: thread,
        inferenceMessages: [],
        userMessages: [],
      }
    });
  }, []);

  const setInferenceMessages = useCallback((messages: inferenceMessage[]) => {
    setState(prevState => {
      return {
        activeThread: prevState.activeThread,
        inferenceMessages: messages,
        userMessages: prevState.userMessages,
      }
    });
  }, []);

  const setUserMessages = useCallback((messages: userMessage[]) => {
    setState(prevState => {
      return {
        activeThread: prevState.activeThread,
        inferenceMessages: prevState.inferenceMessages,
        userMessages: messages,
      }
    });
  }, []);

  const addOrUpdateInferenceMessage = useCallback((message: inferenceMessage) => {
    setState(prevState => {
      const index = prevState.inferenceMessages.findIndex((msg) => msg.id === message.id);
      if (index === -1) {
        return {
          activeThread: prevState.activeThread,
          inferenceMessages: [...prevState.inferenceMessages, message],
          userMessages: prevState.userMessages,
        }
      } else {
        prevState.inferenceMessages[index] = message;
        return {
          activeThread: prevState.activeThread,
          inferenceMessages: prevState.inferenceMessages,
          userMessages: prevState.userMessages,
        }
      }
    });
  }, []);

  const addOrUpdateUserMessage = useCallback((message: userMessage) => {
    setState(prevState => {
      const index = prevState.userMessages.findIndex((msg) => msg.id === message.id);
      if (index === -1) {
        return {
          activeThread: prevState.activeThread,
          inferenceMessages: prevState.inferenceMessages,
          userMessages: [...prevState.userMessages, message],
        }
      } else {
        prevState.userMessages[index] = message;
        return {
          activeThread: prevState.activeThread,
          inferenceMessages: prevState.inferenceMessages,
          userMessages: prevState.userMessages,
        }
      }
    });
  }, []);

  return (
    <MessageContext.Provider value={{ state, setActiveThread, setInferenceMessages, setUserMessages, addOrUpdateInferenceMessage, addOrUpdateUserMessage }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const { state, setActiveThread, setInferenceMessages, setUserMessages, addOrUpdateInferenceMessage, addOrUpdateUserMessage } = React.useContext(MessageContext);

  return {
    userMessages: state.userMessages,
    inferenceMessages: state.inferenceMessages,
    activeThread: state.activeThread,
    setActiveThread,
    setInferenceMessages,
    setUserMessages,
    addOrUpdateInferenceMessage,
    addOrUpdateUserMessage,
  };
}