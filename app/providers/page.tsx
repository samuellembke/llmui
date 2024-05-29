import Sidebar from "@/components/dashboard/Sidebar";
import TopMenu from "@/components/dashboard/TopMenu";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import ProvidersProvider from "@/components/dashboard/providers/ProvidersProvider";
import ProvidersBar from "@/components/dashboard/providers/ProvidersBar";
import ProviderSettings from "@/components/dashboard/providers/ProviderSettings";

export default async function Providers() {
  return (
    <div className="min-h-screen flex flex-row justify-start items-stretch">
      <Sidebar currentPath="/providers"/>
      <div className="w-full flex flex-col justify-start items-stretch">
        <TopMenu/>
        <div className="p-[.5rem] flex-grow flex flex-col justify-start items-stretch">
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full border-border border-[.0625rem] rounded-md flex-grow"
          >
            <ResizablePanel defaultSize={14} maxSize={20} minSize={12}>
              <ProvidersBar/>
            </ResizablePanel>
            <ResizableHandle withHandle={true}/>
            <ResizablePanel defaultSize={70}>
              <ProviderSettings/>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}