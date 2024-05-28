import { getServerAuthSession } from "@/server/auth";
import {redirect} from "next/navigation";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import TopMenu from "@/components/dashboard/TopMenu";
import Sidebar from "@/components/dashboard/Sidebar";
import ChatsBarWrapper from "@/components/dashboard/chats/ChatsBarWrapper";
import ChatsProvider from "@/components/dashboard/chats/ChatsProvider";
import ChatsProviderWrapper from "@/components/dashboard/chats/ChatsProviderWrapper";
import ChatsBar from "@/components/dashboard/chats/ChatsBar";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen flex flex-row justify-start items-stretch">
      <Sidebar />
      <div className="w-full flex flex-col justify-start items-stretch">
        <ChatsProviderWrapper>
          <TopMenu/>
          <div className="p-[.5rem] flex-grow flex flex-col justify-start items-stretch">
            <ResizablePanelGroup
              direction="horizontal"
              className="w-full border-border border-[.0625rem] rounded-md flex-grow"
            >
              <ResizablePanel defaultSize={14} maxSize={20} minSize={12}>
                <ChatsBar />
              </ResizablePanel>
              <ResizableHandle withHandle={true}/>
              <ResizablePanel defaultSize={70}>
                <div className="h-full w-full bg-background">
                  <h1>Center Panel</h1>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ChatsProviderWrapper>
      </div>
    </div>
  );
}
