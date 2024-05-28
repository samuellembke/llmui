import AuthCard from "@/components/auth/AuthCard";
import {getServerAuthSession} from "@/server/auth";
import {redirect} from "next/navigation";


export default async function AuthPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-start pt-[25vh]">
      <AuthCard />
    </div>
  )
}