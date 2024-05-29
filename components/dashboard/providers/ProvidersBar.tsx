"use client"

import {useProviders, userProvider} from "@/components/dashboard/providers/ProvidersProvider";
import {Button} from "@/components/ui/button";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {toast} from "sonner";
import {Separator} from "@/components/ui/separator";

function CreateProviderDialog({children, createProvider}: { children: React.ReactNode, createProvider: (provider: { providerName: string; accountName: string; }) => Promise<userProvider | null> }) {
  const [open, setOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  const formSchema = z.object({
    providerName: z.string().refine((value) => value.length > 0 && (value === 'openai'), {
      message: "Please select a valid provider"
    }),
    accountName: z.string().min(1),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providerName: "openai",
      accountName: "",
    }
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (data) {
      setCreating(true)

      createProvider({
        accountName: data.accountName,
        providerName: data.providerName,
      }).then(() => {
        form.reset()
        setCreating(false)
        toast.success("Provider created")
        setOpen(false)
      }).catch((e) => {
        console.error("Failed to create provider",e)
        setCreating(false)
        toast.error("Failed to create provider")
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[25rem]">
        <DialogHeader>
          <DialogTitle>
            Create new provider
          </DialogTitle>
          <DialogDescription>
            Create a new inference provider.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <FormField
                  control={form.control}
                  name="providerName"
                  render={({field, fieldState}) => (
                    <FormItem >
                      <div className="grid grid-flow-col items-center gap-4">
                        <FormLabel>
                          Provider Name
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-[14rem]">
                              <SelectValue placeholder="OpenAI"/>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">
                                OpenAI
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({field, fieldState}) => (
                    <FormItem >
                      <div className="grid grid-flow-col items-center gap-4">
                        <FormLabel>
                          Account Name
                        </FormLabel>
                        <FormControl>
                          <Input  {...field} placeholder="Main Account" className="w-[14rem]"/>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function ProvidersBar() {
  const {providers, activeProvider, setActiveProvider, createProvider} = useProviders()

  return (
    <div className="h-full w-full border-e-border">
      <div className="p-[.5rem]">
        <CreateProviderDialog createProvider={createProvider}>
          <Button variant="outline" className="w-full">
            New Provider
          </Button>
        </CreateProviderDialog>
      </div>
      <Separator/>
      {providers.map((provider) => (
        <div key={provider.id} className={`p-[.5rem] border-b border-border ${activeProvider?.id === provider.id ? 'bg-muted' : ''}`} onClick={() => {
          setActiveProvider(provider)
        }}>
          <h3>
            {provider.accountName}
          </h3>
          <p className="text-xs">provider: {provider.providerName}</p>
        </div>
      ))}
    </div>
  )
}