"use client"

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
import {useSources} from "@/components/dashboard/inferenceSource/SourceProvider";
import {inferenceSource} from "@/server/db/schema";
import {useProviders} from "@/components/dashboard/providers/ProvidersProvider";

type userSource = typeof inferenceSource.$inferSelect

function CreateSourceDialog(
  {
    children,
    createSource
  }: {
    children: React.ReactNode,
    createSource: (
      source: { name: string; type: string; providerId: number }
    ) => Promise<userSource | null> }
) {
  const {providers} = useProviders()

  const [open, setOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  const formSchema = z.object({
    type: z.string().refine((value) => value.length > 0 && (value === 'normal' || value === "assistant"), {
      message: "Please select a valid type"
    }),
    providerId: z.number().refine((value) => value && providers.some((provider) => provider.id === value), {
      message: "Please select a valid provider"
    }),
    name: z.string().min(1),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "normal",
      providerId: providers[0]?.id,
      name: "",
    }
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (data) {
      setCreating(true)

      createSource({
        name: data.name,
        type: data.type,
        providerId: data.providerId,
      }).then(() => {
        form.reset()
        setCreating(false)
        toast.success("Source created")
        setOpen(false)
      }).catch((e) => {
        console.error("Failed to create source",e)
        setCreating(false)
        toast.error("Failed to create source")
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
            Create new source
          </DialogTitle>
          <DialogDescription>
            Create a new inference source.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({field, fieldState}) => (
                    <FormItem >
                      <div className="grid grid-flow-col items-center gap-4">
                        <FormLabel className="w-[6.875rem]">
                          Source Type
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-[14rem]">
                              <SelectValue placeholder="Normal"/>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">
                                Normal
                              </SelectItem>
                              <SelectItem value="assistant">
                                Assistant
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
                  name="providerId"
                  render={({field, fieldState}) => (
                    <FormItem >
                      <div className="grid grid-flow-col items-center gap-4">
                        <FormLabel className="w-[6.875rem]">
                          Provider
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value+""}>
                            <SelectTrigger className="w-[14rem]">
                              <SelectValue placeholder=""/>
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id+""}>
                                  {provider.providerName} - {provider.accountName}
                                </SelectItem>
                              ))}
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
                  name="name"
                  render={({field, fieldState}) => (
                    <FormItem >
                      <div className="grid grid-flow-col items-center gap-4">
                        <FormLabel className="w-[6.875rem]">
                          Source Name
                        </FormLabel>
                        <FormControl>
                          <Input  {...field} placeholder="GPT-4o " className="w-[14rem]"/>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function SourceBar() {
  const {providers} = useProviders()
  const { sources, activeSource, setActiveSource, selectedSource, setSelectSource, refetchSources, createSource } = useSources()


  return (
    <div className="h-full w-full border-e-border">
      <div className="p-[.5rem]">
        <CreateSourceDialog createSource={createSource}>
          <Button variant="outline" className="w-full">
            New Source
          </Button>
        </CreateSourceDialog>
      </div>
      <Separator/>
      {sources.map((source) => {
        const provider = providers.find((provider) => provider.id === source.providerId);
        return (
          <div key={source.id} className={`p-[.5rem] border-b border-border ${activeSource?.id === source.id ? 'bg-muted' : ''}`} onClick={() => {
            // setActiveProvider(provider)
          }}>
            <h3>
              {source.name}
            </h3>
            <p className="text-xs">
              Type: {source.type}
              { provider && ` - Provider: ${provider.providerName} - ${provider.accountName}`}
            </p>
          </div>
        )
      })}
    </div>
  )
}