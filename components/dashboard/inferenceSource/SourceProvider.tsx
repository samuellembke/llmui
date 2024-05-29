"use client"
import { inferenceSource } from "@/server/db/schema";
import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {api} from "@/trpc/react";

export type inferenceSource = typeof inferenceSource.$inferSelect;

type State = {
  sources: inferenceSource[];
  activeSource: inferenceSource | null;
  selectedSource: inferenceSource | null;
}

const initialState: State = {
  sources: [],
  activeSource: null,
  selectedSource: null,
}

export const SourceContext = createContext<{
  state: State;
  createSource: (source: { type: string; name: string; providerId: number }) => Promise<inferenceSource | null>;
  setActiveSource: (source: inferenceSource | null) => void;
  setSelectSource: (source: inferenceSource | null) => void;
  refetchSources?: () => void;
}>({
  state: initialState,
  createSource: async () => null,
  setActiveSource: () => {},
  setSelectSource: () => {},
  refetchSources: () => {},
});

export default function SourceProvider({ children }: {
  children: ReactNode;
}) {

  const sourcesQuery = api.sources.getUserSources.useQuery();
  const createSource = api.sources.createSource.useMutation();
  const deleteSource = api.sources.deleteSource.useMutation();

  const initRef = useRef(false);

  const createNewSource = async ({ type, name, providerId }: { type: string; name: string; providerId: number }) => {
    const newSource = await createSource.mutateAsync({
      type: type,
      name: name,
      providerId: providerId,
    });
    if (newSource && newSource.length > 0) {
      await sourcesQuery.refetch();
      return newSource[0] ?? null;
    }
    return null;
  }

  const refetchSources = async () => {
    await sourcesQuery.refetch();
  }

  const deleteSelectedSource = async (source: inferenceSource | null) => {
    if (source) {
      await deleteSource.mutateAsync({
        id: source.id,
      });
      await sourcesQuery.refetch();
    }
  }

  const [activeSource, setActiveSource] = useState<inferenceSource | null>(null);

  const [selectedSource, setSelectSource] = useState<inferenceSource | null>(null);

  useEffect(() => {
    if (!initRef.current) {
      if (sourcesQuery.data && sourcesQuery.data.length > 0) {
        initRef.current = true;
        setActiveSource(sourcesQuery.data[0]);
        setSelectSource(sourcesQuery.data[0]);
      }
    }
  }, [sourcesQuery.data])

  return <SourceContext.Provider value={{
    state: {
      sources: sourcesQuery.data ?? [],
      activeSource: activeSource,
      selectedSource: selectedSource,
    },
    createSource: createNewSource,
    setActiveSource: setActiveSource,
    setSelectSource: setSelectSource,
    refetchSources: refetchSources,
  }}>
    {children}
  </SourceContext.Provider>
}

export function useSources() {
  const { state, createSource, setActiveSource, setSelectSource, refetchSources } = useContext(SourceContext);

  return {
    sources: state.sources,
    activeSource: state.activeSource,
    selectedSource: state.selectedSource,
    createSource,
    setActiveSource,
    setSelectSource,
    refetchSources,
  }
}