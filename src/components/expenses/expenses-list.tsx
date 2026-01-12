'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parse } from 'date-fns'
import { Loader2, Trash2, Calendar, CreditCard, Utensils, Car, ShoppingBag, Film, ShoppingCart, Zap, Activity, Plane, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Database } from '@/types/supabase'

type ExpenseWithDetails = Database['public']['Tables']['expenses']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row'] | null
    payment_methods: Database['public']['Tables']['payment_methods']['Row'] | null
}

const ICONS = {
    'utensils': Utensils,
    'car': Car,
    'shopping-bag': ShoppingBag,
    'film': Film,
    'shopping-cart': ShoppingCart,
    'zap': Zap,
    'activity': Activity,
    'plane': Plane,
    'help-circle': HelpCircle,
}

export function ExpensesList() {
    const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchExpenses = async () => {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        categories (*),
        payment_methods (*)
      `)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            toast.error('Failed to load expenses')
        } else {
            setExpenses(data as ExpenseWithDetails[])
        }
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line
        fetchExpenses()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return

        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error('Failed to delete expense')
        } else {
            toast.success('Expense deleted')
            setExpenses(expenses.filter(e => e.id !== id))
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (expenses.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                No expenses found. Start adding some!
            </div>
        )
    }

    // Group expenses by date
    const groupedExpenses = expenses.reduce((groups, expense) => {
        const date = expense.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(expense)
        return groups
    }, {} as Record<string, ExpenseWithDetails[]>)

    return (
        <div className="space-y-6">
            {Object.keys(groupedExpenses).map((date) => (
                <Card key={date} className="rounded-2xl border-border/60 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="py-3 bg-muted/20 border-b border-border/40">
                        <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            {format(parse(date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM do, yyyy')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {groupedExpenses[date].map((expense) => {
                            // @ts-expect-error - Icon string access
                            const Icon = ICONS[expense.categories?.icon || 'help-circle'] || HelpCircle
                            return (
                                <div key={expense.id} className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-primary/5 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="p-2 rounded-xl text-white shadow-sm"
                                            style={{ backgroundColor: expense.categories?.color || '#ccc' }}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground/90">{expense.categories?.name || 'Uncategorized'}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-1 max-w-[150px] sm:max-w-xs">
                                                {expense.comment || expense.payment_methods?.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-foreground">
                                                ${expense.amount.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-end">
                                                <CreditCard className="mr-1 h-3 w-3" />
                                                {expense.payment_methods?.name}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="ml-1 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => handleDelete(expense.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
