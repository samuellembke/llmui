"use client"
import {createContext, ReactNode, useContext, useState} from "react";
import {inferenceProvider} from "@/server/db/schema";
import {api} from "@/trpc/react";

export type userProvider = typeof inferenceProvider.$inferSelect;

type State = {
  providers: userProvider[];
  activeProvider: userProvider | null;
};

const initialState: State = {
  providers: [],
  activeProvider: null,
};

export const ProvidersContext = createContext<{
  state: State;
  createProvider: (provider: { providerName: string; accountName: string; }) => Promise<userProvider | null>;
  setActiveProvider: (provider: userProvider | null) => void;
  refetchProviders?: () => void;
}>({
  state: initialState,
  createProvider: async () => null,
  setActiveProvider: () => {},
  refetchProviders: () => {},
});

export default function ProvidersProvider({ children }: {
  children: ReactNode;
}) {

  const providersQuery = api.providers.getUserProviders.useQuery();
  const createProvider = api.providers.createProvider.useMutation();

  const createNewProvider = async ({ providerName, accountName }: { providerName: string; accountName: string; }) => {
    const newProvider = await createProvider.mutateAsync({
      providerName: providerName,
      accountName: accountName,
    });
    if (newProvider && newProvider.length > 0) {
      await providersQuery.refetch();
      return newProvider[0] ?? null;
    }
    return null;
  }

  const refetchProviders = async () => {
    await providersQuery.refetch();
  }

  const [activeProvider, setActiveProvider] = useState<userProvider | null>(null);

  return (
    <ProvidersContext.Provider value={{
      state: {
        providers: providersQuery.data ?? [],
        activeProvider: activeProvider,
      },
      createProvider: createNewProvider,
      setActiveProvider,
      refetchProviders
    }}>
      {children}
    </ProvidersContext.Provider>
  )
}

export function useProviders() {
  const { state, createProvider, setActiveProvider, refetchProviders } = useContext(ProvidersContext);

  return {
    providers: state.providers,
    activeProvider: state.activeProvider,
    createProvider,
    setActiveProvider,
    refetchProviders
  }
}