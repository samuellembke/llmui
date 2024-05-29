"use client"
import {z} from "zod";
import {useProviders, userProvider} from "@/components/dashboard/providers/ProvidersProvider";
import {api} from "@/trpc/react";
import React from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {inferenceProviderCredentials} from "@/server/db/schema";
import {Separator} from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogActionDestructive, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export type providerCredential = typeof inferenceProviderCredentials.$inferSelect;

function CreateOrUpdateCredential({children, existingCredential, onCredentialSave}: { children: React.ReactNode, existingCredential?: providerCredential, onCredentialSave?: () => void}) {
  const {activeProvider} = useProviders()

  const [open, setOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  const upsertProviderCredential = api.providers.upsertProviderCredential.useMutation()

  const upsertCredential = async (data: {credentialKey: string, credentialValue: string}) => {
    const newCredential = await upsertProviderCredential.mutateAsync({
      id: existingCredential?.id,
      inferenceProviderId: existingCredential?.inferenceProviderId ?? activeProvider?.id ?? 0,
      credentialKey: data.credentialKey,
      credentialValue: data.credentialValue,
    })

    if (newCredential) {
      return newCredential
    }
    return null
  }


  const formSchema = z.object({
    credentialKey: z.string().refine((value) => value.length > 0 && (value === 'OPENAI_API_KEY'), {
      message: "Please select a valid credential key"
    }),
    credentialValue: z.string().min(1),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialKey: "OPENAI_API_KEY",
      credentialValue: existingCredential?.credentialValue ?? "",
    }
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (data) {
      setCreating(true)

      upsertCredential({
        credentialKey: data.credentialKey,
        credentialValue: data.credentialValue,
      }).then(() => {
        form.reset()
        setCreating(false)
        toast.success("Credential saved")
        setOpen(false)
        onCredentialSave && onCredentialSave()
      }).catch((e) => {
        console.error("Failed to save credential",e)
        setCreating(false)
        toast.error("Failed to save credential")
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
            Save Credential
          </DialogTitle>
          <DialogDescription>
            Save a credential to use with the provider
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <FormField
                  control={form.control}
                  name="credentialKey"
                  render={({field, fieldState}) => (
                    <FormItem >
                      <div className="grid grid-flow-col items-center gap-4">
                        <FormLabel className="w-[6.875rem]">
                          Credential Key
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-[14rem]">
                              <SelectValue placeholder="OpenAI Key"/>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPENAI_API_KEY">
                                OpenAI Key
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
                  name="credentialValue"
                  render={({field, fieldState}) => (
                    <FormItem >
                      <div className="grid grid-flow-col items-center gap-4">
                        <FormLabel className="w-[6.875rem]">
                          Credential Value
                        </FormLabel>
                        <FormControl>
                          <Input  {...field} placeholder="******" className="w-[14rem]"/>
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
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteProvider({onConfirm}: {onConfirm: () => void}){

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          Delete Provider
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            provider and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogActionDestructive onClick={() => {
            onConfirm()
          }}>Delete</AlertDialogActionDestructive>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function ProviderSettings() {
  const {providers, activeProvider, setActiveProvider, createProvider, refetchProviders, selectedProvider, setSelectProvider} = useProviders()

  const providerCredentialsQuery = api.providers.getProviderCredentials.useQuery({
    id: activeProvider?.id ?? 0
  })

  const deleteProvider = api.providers.deleteProvider.useMutation()

  const onCredentialSave = () => {
    providerCredentialsQuery.refetch()
  }

  const onDeleteProvider = () => {
    // Delete provider
    if (activeProvider?.id) {
      deleteProvider.mutateAsync({id: activeProvider.id}).then(() => {
        setActiveProvider(null)
        if (refetchProviders) {
          refetchProviders()
        }
      }).catch((e) => {
        console.error("Failed to delete provider", e)
        toast.error("Failed to delete provider")
      })
    }
  }

  return (
    <div className="p-[2rem]">
      { !activeProvider && (
        <div>
          <h1>
            Select a provider to view settings
          </h1>
        </div>
      )}
      { activeProvider && (
        <>
          { providerCredentialsQuery.data && providerCredentialsQuery.data.map((credential) => {
            return (
              <div key={credential.id}>
                <h1>{credential.credentialKey}</h1>
                <h2>{credential.credentialValue}</h2>
              </div>
            )
          })}
          { providerCredentialsQuery.data && providerCredentialsQuery.data.length > 0 && (
            <Separator className="my-[1rem]" />
          )}
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row justify-center items-center gap-[1rem]">
              <Button disabled={activeProvider?.id === selectedProvider?.id} onClick={() => {
                setSelectProvider(activeProvider)
              }}>
                Use Provider
              </Button>
              <CreateOrUpdateCredential onCredentialSave={onCredentialSave}>
                <Button>
                  Add Credential
                </Button>
              </CreateOrUpdateCredential>
            </div>
            <DeleteProvider onConfirm={onDeleteProvider}/>
          </div>
        </>
      )}
    </div>
  )
}