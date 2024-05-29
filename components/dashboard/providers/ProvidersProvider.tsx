"use client"
import {createContext, ReactNode, useContext, useState} from "react";
import {inferenceProvider} from "@/server/db/schema";
import {api} from "@/trpc/react";

export type userProvider = typeof inferenceProvider.$inferSelect;

type State = {
  providers: userProvider[];
  activeProvider: userProvider | null;
  selectedProvider: userProvider | null;
};

const initialState: State = {
  providers: [],
  activeProvider: null,
  selectedProvider: null,
};

export const ProvidersContext = createContext<{
  state: State;
  createProvider: (provider: { providerName: string; accountName: string; }) => Promise<userProvider | null>;
  setActiveProvider: (provider: userProvider | null) => void;
  setSelectProvider: (provider: userProvider | null) => void;
  refetchProviders?: () => void;
}>({
  state: initialState,
  createProvider: async () => null,
  setActiveProvider: () => {},
  setSelectProvider: () => {},
  refetchProviders: () => {},
});

export default function ProvidersProvider({ children }: {
  children: ReactNode;
}) {

  const providersQuery = api.providers.getUserProviders.useQuery();
  const createProvider = api.providers.createProvider.useMutation();
  const userProvider = api.providers.getUserProvider.useQuery()
  const setUserProvider = api.providers.setUserProvider.useMutation()

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

  const setSelectProvider = async (provider: userProvider | null) => {
    await setUserProvider.mutateAsync({
      id: provider?.id ?? 0
    });
    await userProvider.refetch()
  }

  const [activeProvider, setActiveProvider] = useState<userProvider | null>(null);

  return (
    <ProvidersContext.Provider value={{
      state: {
        providers: providersQuery.data ?? [],
        activeProvider: activeProvider,
        selectedProvider: userProvider.data ?? null,
      },
      createProvider: createNewProvider,
      setActiveProvider,
      setSelectProvider,
      refetchProviders
    }}>
      {children}
    </ProvidersContext.Provider>
  )
}

export function useProviders() {
  const { state, createProvider, setActiveProvider, refetchProviders, setSelectProvider } = useContext(ProvidersContext);

  return {
    providers: state.providers,
    activeProvider: state.activeProvider,
    selectedProvider: state.selectedProvider,
    createProvider,
    setActiveProvider,
    setSelectProvider,
    refetchProviders
  }
}