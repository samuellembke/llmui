import { getServerAuthSession } from "@/server/auth";
import Image from "next/image";
import {redirect} from "next/navigation";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import TopMenu from "@/components/dashboard/TopMenu";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen flex flex-col justify-start items-stretch">
      <TopMenu />
      <div className="p-[.5rem] flex-grow flex flex-col justify-start items-stretch">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full border-border border-[.0625rem] rounded-md flex-grow"
        >
          <ResizablePanel defaultSize={14} maxSize={20} minSize={12}>
            <div className="h-full w-full border-e-border">
              <h1>Left Panel</h1>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle={true}/>
          <ResizablePanel defaultSize={70}>
            <div className="h-full w-full bg-background">
              <h1>Center Panel</h1>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
