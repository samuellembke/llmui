import Sidebar from "@/components/dashboard/Sidebar";

export default async function Settings() {
  return (
    <div className="min-h-screen flex flex-row justify-start items-stretch">
      <Sidebar currentPath="/settings" />

    </div>
  )
}