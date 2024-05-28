import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {getServerAuthSession} from "@/server/auth";
import {redirect} from "next/navigation";


export default async function CheckEmailPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-start pt-[25vh]">
      <Card className="w-[20rem]">
        <CardHeader>
          <CardTitle>
            Check your email
          </CardTitle>
          <CardDescription>
            We&apos;ve sent you an email with a link to verify your email address. Click the link in the email to continue.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}