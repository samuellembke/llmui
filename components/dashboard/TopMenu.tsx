"use client"

import {Menubar, MenubarMenu, MenubarTrigger} from "@/components/ui/menubar";

export default function TopMenu() {
  return (
    <div className="p-[.5rem] mb-[.25rem] flex-shrink-0">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>
            File
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}