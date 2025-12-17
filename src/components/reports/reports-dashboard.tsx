'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Database } from '@/types/supabase'

// I need to install Progress component or build it. I'll assume I have it or use a div.
// I'll use a simple div for progress if Shadcn Progress isn't installed (it wasn't in my list).
// Actually, I can just use a styled div.

type Expense = Database['public']['Tables']['expenses']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row']
}

// ... imports ...

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#064e3b'];

export function ReportsDashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [income, setIncome] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

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

    useEffect(() => {
        // eslint-disable-next-line
        fetchData()
    }, [])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>

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
        <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* Total Spent - Prominent */}
                <Card className="col-span-2 md:col-span-1 glass border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold text-foreground">${totalSpent.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {expenses.length} transactions
                        </p>
                    </CardContent>
                </Card>

                {/* Left to Spend - Critical Status */}
                <Card className="col-span-2 md:col-span-1 glass border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Left to Spend</CardTitle>
                        <TrendingDown className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl md:text-3xl font-bold ${leftToSpend < 0 ? 'text-red-500' : 'text-primary'}`}>
                            ${leftToSpend.toFixed(2)}
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${leftToSpend < 0 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min((totalSpent / income) * 100, 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Income */}
                <Card className="glass border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-foreground">${income.toFixed(0)}</div>
                    </CardContent>
                </Card>

                {/* Savings Rate */}
                <Card className="glass border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-foreground">{savingsRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>

                {/* Daily Spending Graph - Wide Tile */}
                <Card className="col-span-2 md:col-span-2 glass border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Daily Spending</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'var(--muted-foreground)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        cursor={{ fill: 'var(--muted)/0.2' }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="var(--primary)"
                                        radius={[4, 4, 0, 0]}
                                        fillOpacity={0.8}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown - Wide Tile */}
                <Card className="col-span-2 md:col-span-2 glass border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toFixed(2)}`}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
