'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Database } from '@/types/supabase'
import { Wallet, Tag, FileText, Calendar as CalendarIcon, Loader2, Check, DollarSign } from 'lucide-react'


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

type FormValues = z.infer<typeof formSchema>
type Category = Database['public']['Tables']['categories']['Row']
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']

export function AddExpenseForm() {
    const [categories, setCategories] = useState<Category[]>([])
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
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

                <div className="flex flex-col items-center justify-center py-6 bg-card rounded-3xl shadow-sm border border-border/50">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <FormLabel className="block text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">Amount</FormLabel>
                                <FormControl>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-6xl font-bold text-primary pb-2">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="w-48 text-7xl font-bold border-none shadow-none text-left p-0 h-24 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/20 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                            {...field}
                                            onFocus={(e) => {
                                                if (field.value === 0) {
                                                    field.onChange('')
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === '') {
                                                    field.onChange(0)
                                                }
                                                field.onBlur()
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 px-2">


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                        <Tag className="w-4 h-4" /> Category
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-border/50 bg-card/50">
                                                <SelectValue placeholder="Select Category" />
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
                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                        <Wallet className="w-4 h-4" /> Wallet
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-border/50 bg-card/50">
                                                <SelectValue placeholder="Select Wallet" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {methods.map((method) => (
                                                <SelectItem key={method.id} value={method.id}>
                                                    {method.name} <span className="text-muted-foreground text-xs ml-1">({method.type})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="w-4 h-4" /> Date
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-12 pl-3 text-left font-normal rounded-xl border-border/50 bg-card/50",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
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
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                        <FileText className="w-4 h-4" /> Note
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Description..."
                                            {...field}
                                            className="h-12 rounded-xl border-border/50 bg-card/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                        Save Expense
                    </Button>
                </div>
            </form>
        </Form>
    )
}
