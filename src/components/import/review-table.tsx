'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Loader2, Check, X, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Database } from '@/types/supabase'

type Category = Database['public']['Tables']['categories']['Row']
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
type ImportRule = Database['public']['Tables']['import_rules']['Row']

interface ExtractedExpense {
    date: string
    description: string
    amount: number
    category_id?: string
    payment_method_id?: string
    selected: boolean
}

interface ReviewTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any[]
    onCancel: () => void
}

export function ReviewTable({ initialData, onCancel }: ReviewTableProps) {
    const [expenses, setExpenses] = useState<ExtractedExpense[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [rules, setRules] = useState<ImportRule[]>([])
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const [catRes, methodRes, ruleRes] = await Promise.all([
                supabase.from('categories').select('*'),
                supabase.from('payment_methods').select('*'),
                supabase.from('import_rules').select('*')
            ])

            if (catRes.data) setCategories(catRes.data)
            if (methodRes.data) setMethods(methodRes.data)
            if (ruleRes.data) setRules(ruleRes.data)

            // Process initial data with rules
            const processed = initialData.map(item => {
                // Find matching rule
                const rule = ruleRes.data?.find(r =>
                    item.description.toLowerCase().includes(r.keyword.toLowerCase())
                )

                return {
                    ...item,
                    category_id: rule ? rule.category_id : '',
                    payment_method_id: methodRes.data?.[0]?.id || '', // Default to first method
                    selected: true
                }
            })

            setExpenses(processed)
            setLoading(false)
        }
        fetchData()
    }, [initialData])

    const handleImport = async () => {
        console.log('Starting import...')
        setImporting(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.error('No user found')
            toast.error('Authentication error: User not found')
            setImporting(false)
            return
        }

        const selectedExpenses = expenses.filter(e => e.selected)

        if (selectedExpenses.length === 0) {
            toast.error('No expenses selected')
            setImporting(false)
            return
        }

        // Validate categories
        const missingCategories = selectedExpenses.some(e => !e.category_id)
        if (missingCategories) {
            toast.error('Please select a category for all expenses')
            setImporting(false)
            return
        }

        // Validate payment methods
        const missingMethods = selectedExpenses.some(e => !e.payment_method_id)
        if (missingMethods) {
            toast.error('Please select a payment method for all expenses')
            setImporting(false)
            return
        }

        // 1. Save Expenses
        const { error } = await supabase.from('expenses').insert(
            selectedExpenses.map(e => ({
                user_id: user.id,
                date: e.date,
                amount: e.amount,
                comment: e.description,
                category_id: e.category_id || null, // Ensure null if empty string (though validation prevents this)
                payment_method_id: e.payment_method_id || null
            }))
        )

        if (error) {
            toast.error('Failed to import expenses')
            setImporting(false)
            return
        }

        // 2. Learn Rules (Optional - simplified for now)
        // We could ask user if they want to save new rules here.
        // For now, let's just import.

        toast.success(`Imported ${selectedExpenses.length} expenses`)
        router.push('/expenses')
        router.refresh()
    }

    const updateExpense = <K extends keyof ExtractedExpense>(index: number, field: K, value: ExtractedExpense[K]) => {
        const newExpenses = [...expenses]
        newExpenses[index] = { ...newExpenses[index], [field]: value }
        setExpenses(newExpenses)
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Review & Import</h3>
                <div className="space-x-2">
                    <Button variant="outline" onClick={onCancel} disabled={importing}>Cancel</Button>
                    <Button onClick={handleImport} disabled={importing}>
                        {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import {expenses.filter(e => e.selected).length} Expenses
                    </Button>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={expenses.every(e => e.selected)}
                                    onCheckedChange={(checked) => {
                                        setExpenses(expenses.map(e => ({ ...e, selected: !!checked })))
                                    }}
                                />
                            </TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Payment Method</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.map((expense, index) => (
                            <TableRow key={index} className={!expense.selected ? 'opacity-50' : ''}>
                                <TableCell>
                                    <Checkbox
                                        checked={expense.selected}
                                        onCheckedChange={(checked) => updateExpense(index, 'selected', !!checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="date"
                                        value={expense.date}
                                        onInput={(e) => updateExpense(index, 'date', (e.target as HTMLInputElement).value)}
                                        className="w-[140px]"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={expense.description}
                                        onInput={(e) => updateExpense(index, 'description', (e.target as HTMLInputElement).value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={expense.amount}
                                        onInput={(e) => updateExpense(index, 'amount', parseFloat((e.target as HTMLInputElement).value))}
                                        className="w-[100px]"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={expense.category_id}
                                        onValueChange={(val) => updateExpense(index, 'category_id', val)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={expense.payment_method_id}
                                        onValueChange={(val) => updateExpense(index, 'payment_method_id', val)}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {methods.map(m => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
