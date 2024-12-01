'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Package, Truck, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '../../hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.enum(['customer', 'deliveryAgent'], {
    required_error: 'Please select a role.',
  }),
  rfidData: z.string().min(1, {
    message: 'RFID data is required.',
  }),
})

export default function OnboardingForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      rfidData: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Here you would typically send the data to your backend or directly to the blockchain
    console.log(values)
    
    // Simulating an API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    toast({
      title: 'Registration Successful',
      description: `You have been registered as a ${values.role === 'customer' ? 'Customer' : 'Delivery Agent'}.`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Package className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold ml-4">BOX3 Onboarding</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your full name as it appears on official documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    We'll use this email for important notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="customer" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <User className="w-4 h-4 inline-block mr-2" />
                          Customer
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="deliveryAgent" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <Truck className="w-4 h-4 inline-block mr-2" />
                          Delivery Agent
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rfidData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFID Data</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter RFID data" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the RFID data associated with your BOX3 device.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

