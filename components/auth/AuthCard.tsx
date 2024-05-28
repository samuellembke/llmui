"use client"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react"
import {useRouter} from "next/navigation";

const authSchema = z.object({
  email: z.string().email(),
})

export default function AuthCard({url}: {url?: string}) {
  const router = useRouter()
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof authSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    if (values.email) {
      signIn('email', {
        email: values.email,
        callbackUrl: url ? url : `${window.location.origin}/`,
        redirect: false,
      }).then((res) => {
        // @ts-ignore
        if (res != null && res.ok && res.status === 200) {
          router.push('/auth/check-email')
        }
      })
    }
  }

  return (
    <Card className="w-[20rem]">
      <CardHeader>
        <CardTitle>
          Sign In / Sign Up
        </CardTitle>
        <CardDescription>
          Sign in or sign up for a new account
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-[1rem]">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="hello@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" >
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}