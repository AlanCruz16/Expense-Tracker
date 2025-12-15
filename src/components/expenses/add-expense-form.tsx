'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Database } from '@/types/supabase'

// I need to install Textarea, but I'll use Input for now or add it later.
// Actually, I'll just use Input for comment to keep it simple or add Textarea component.
// I'll stick to Input for now.

const formSchema = z.object({
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    date: z.date(),
    category_id: z.string().min(1, 'Category is required'),
    payment_method_id: z.string().min(1, 'Payment method is required'),
    comment: z.string().optional(),
})

type Category = Database['public']['Tables']['categories']['Row']
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']

export function AddExpenseForm() {
    const [categories, setCategories] = useState<Category[]>([])
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            date: new Date(),
            category_id: '',
            payment_method_id: '',
            comment: '',
        },
    })

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [catRes, methodRes] = await Promise.all([
                supabase.from('categories').select('*').order('name'),
                supabase.from('payment_methods').select('*').order('name')
            ])

            if (catRes.data) setCategories(catRes.data)
            if (methodRes.data) setMethods(methodRes.data)

            // Set defaults if available
            if (methodRes.data && methodRes.data.length > 0) {
                form.setValue('payment_method_id', methodRes.data[0].id)
            }

            setLoading(false)
        }
        fetchData()
    }, [])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast.error('You must be logged in')
            return
        }

        const { error } = await supabase.from('expenses').insert({
            user_id: user.id,
            amount: values.amount,
            date: format(values.date, 'yyyy-MM-dd'),
            category_id: values.category_id,
            payment_method_id: values.payment_method_id,
            comment: values.comment || null,
        })

        if (error) {
            toast.error('Failed to add expense')
        } else {
            toast.success('Expense added successfully')
            form.reset({
                amount: 0,
                date: new Date(),
                category_id: '',
                payment_method_id: values.payment_method_id, // Keep last used method
                comment: '',
            })
            router.refresh()
        }
        setSubmitting(false)
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Amount</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-xl font-bold text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="pl-8 text-2xl h-14 font-bold"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="payment_method_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a payment method" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {methods.map((method) => (
                                        <SelectItem key={method.id} value={method.id}>
                                            {method.name} ({method.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comment (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Dinner with friends..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Save Expense
                </Button>
            </form>
        </Form>
    )
}
