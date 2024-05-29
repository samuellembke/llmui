import Sidebar from "@/components/dashboard/Sidebar";
import TopMenu from "@/components/dashboard/TopMenu";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import SourceBar from "@/components/dashboard/inferenceSource/SourceBar";

export default async function Assistants() {
  return (
    <div className="min-h-screen flex flex-row justify-start items-stretch">
      <Sidebar currentPath="/assistants"/>
      <div className="w-full flex flex-col justify-start items-stretch">
        <TopMenu/>
        <div className="p-[.5rem] flex-grow flex flex-col justify-start items-stretch">
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full border-border border-[.0625rem] rounded-md flex-grow"
          >
            <ResizablePanel defaultSize={14} maxSize={20} minSize={12}>
              <SourceBar/>
            </ResizablePanel>
            <ResizableHandle withHandle={true}/>
            <ResizablePanel defaultSize={70}>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}