'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { toast } from 'sonner'
import { Database } from '@/types/supabase'

// I need to install Progress component or build it. I'll assume I have it or use a div.
// I'll use a simple div for progress if Shadcn Progress isn't installed (it wasn't in my list).
// Actually, I can just use a styled div.

type Expense = Database['public']['Tables']['expenses']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row']
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ReportsDashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [income, setIncome] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const start = startOfMonth(new Date()).toISOString()
        const end = endOfMonth(new Date()).toISOString()

        const [expenseRes, profileRes] = await Promise.all([
            supabase
                .from('expenses')
                .select('*, categories(*)')
                .gte('date', start)
                .lte('date', end),
            supabase
                .from('profiles')
                .select('monthly_income')
                .eq('id', user.id)
                .single()
        ])

        if (expenseRes.data) setExpenses(expenseRes.data as Expense[])
        if (profileRes.data) setIncome(profileRes.data.monthly_income || 0)

        setLoading(false)
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    // Calculations
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const leftToSpend = income - totalSpent
    const savingsRate = income > 0 ? ((income - totalSpent) / income) * 100 : 0

    // Category Data for Pie Chart
    const categoryData = Object.values(expenses.reduce((acc, e) => {
        const name = e.categories?.name || 'Uncategorized'
        if (!acc[name]) acc[name] = { name, value: 0 }
        acc[name].value += e.amount
        return acc
    }, {} as Record<string, { name: string, value: number }>))

    // Daily Data for Bar Chart
    const days = eachDayOfInterval({ start: startOfMonth(new Date()), end: new Date() })
    const dailyData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const amount = expenses
            .filter(e => e.date === dateStr)
            .reduce((sum, e) => sum + e.amount, 0)
        return {
            date: format(day, 'd'),
            amount
        }
    })

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {expenses.length} transactions this month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${income.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Left to Spend</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${leftToSpend < 0 ? 'text-destructive' : 'text-green-600'}`}>
                            ${leftToSpend.toFixed(2)}
                        </div>
                        <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full ${leftToSpend < 0 ? 'bg-destructive' : 'bg-green-600'}`}
                                style={{ width: `${Math.min((totalSpent / income) * 100, 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Daily Trend */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Daily Spending</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip />
                                    <Bar dataKey="amount" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
