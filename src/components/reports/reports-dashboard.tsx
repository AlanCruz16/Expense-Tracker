'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    startOfMonth, endOfMonth, format, subMonths,
    eachDayOfInterval, eachMonthOfInterval, isSameMonth, parseISO
} from 'date-fns'
import {
    Loader2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    CalendarDays, ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Area, AreaChart
} from 'recharts'
import { Database } from '@/types/supabase'

type Expense = Database['public']['Tables']['expenses']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row']
}

const CATEGORY_COLORS = [
    'oklch(0.65 0.20 145)',   // Primary green
    'oklch(0.60 0.18 260)',   // Blue-violet
    'oklch(0.65 0.22 330)',   // Pink
    'oklch(0.70 0.18 60)',    // Orange
    'oklch(0.70 0.15 180)',   // Teal
    'oklch(0.65 0.15 290)',   // Purple
    'oklch(0.75 0.15 90)',    // Yellow-green
]

const MONTH_COMPARISON_COLORS = [
    'oklch(0.55 0.20 145)',   // Current month (primary)
    'oklch(0.75 0.10 145)',   // Previous month (muted)
]

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-border/50 bg-background/90 backdrop-blur-xl p-3 shadow-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-semibold text-foreground">${Number(entry.value).toFixed(2)}</span>
                </div>
            ))}
        </div>
    )
}

export function ReportsDashboard() {
    const [allExpenses, setAllExpenses] = useState<Expense[]>([])
    const [income, setIncome] = useState(0)
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const supabase = createClient()

    // How many months of history to load
    const HISTORY_MONTHS = 6

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const start = startOfMonth(subMonths(new Date(), HISTORY_MONTHS - 1)).toISOString()
        const end = endOfMonth(new Date()).toISOString()

        const [expenseRes, profileRes] = await Promise.all([
            supabase
                .from('expenses')
                .select('*, categories(*)')
                .gte('date', start)
                .lte('date', end)
                .order('date', { ascending: false }),
            supabase
                .from('profiles')
                .select('monthly_income')
                .eq('id', user.id)
                .single()
        ])

        if (expenseRes.data) setAllExpenses(expenseRes.data as Expense[])
        if (profileRes.data) setIncome(profileRes.data.monthly_income || 0)

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Derived data ──

    const selectedMonthStart = startOfMonth(selectedDate)
    const selectedMonthEnd = endOfMonth(selectedDate)
    const prevMonthStart = startOfMonth(subMonths(selectedDate, 1))
    const prevMonthEnd = endOfMonth(subMonths(selectedDate, 1))

    // Expenses for selected month (excluding savings)
    const selectedMonthExpenses = useMemo(() =>
        allExpenses.filter(e => {
            const d = parseISO(e.date)
            return d >= selectedMonthStart && d <= selectedMonthEnd && e.categories?.name !== 'Savings'
        }),
        [allExpenses, selectedMonthStart, selectedMonthEnd]
    )

    // Expenses for previous month (excluding savings)
    const prevMonthExpenses = useMemo(() =>
        allExpenses.filter(e => {
            const d = parseISO(e.date)
            return d >= prevMonthStart && d <= prevMonthEnd && e.categories?.name !== 'Savings'
        }),
        [allExpenses, prevMonthStart, prevMonthEnd]
    )

    // All expenses excluding savings
    const allActualExpenses = useMemo(() =>
        allExpenses.filter(e => e.categories?.name !== 'Savings'),
        [allExpenses]
    )

    const totalSelectedMonth = selectedMonthExpenses.reduce((s, e) => s + e.amount, 0)
    const totalPrevMonth = prevMonthExpenses.reduce((s, e) => s + e.amount, 0)
    const monthChange = totalPrevMonth > 0
        ? ((totalSelectedMonth - totalPrevMonth) / totalPrevMonth) * 100
        : 0

    const avgDaily = selectedMonthExpenses.length > 0
        ? totalSelectedMonth / eachDayOfInterval({ start: selectedMonthStart, end: new Date() > selectedMonthEnd ? selectedMonthEnd : new Date() }).length
        : 0

    // ── Chart data builders ──

    // 1. Month-over-month comparison (bar chart)
    const monthlyComparisonData = useMemo(() => {
        const months = eachMonthOfInterval({
            start: subMonths(new Date(), HISTORY_MONTHS - 1),
            end: new Date()
        })
        return months.map(month => {
            const monthExpenses = allActualExpenses.filter(e =>
                isSameMonth(parseISO(e.date), month)
            )
            const total = monthExpenses.reduce((s, e) => s + e.amount, 0)
            return {
                month: format(month, 'MMM yy'),
                total,
                isSelected: isSameMonth(month, selectedDate)
            }
        })
    }, [allActualExpenses, selectedDate])

    // 2. Category breakdown for selected month (pie + bar)
    const categoryBreakdown = useMemo(() => {
        const map: Record<string, { name: string; current: number; previous: number }> = {}
        selectedMonthExpenses.forEach(e => {
            const name = e.categories?.name || 'Uncategorized'
            if (!map[name]) map[name] = { name, current: 0, previous: 0 }
            map[name].current += e.amount
        })
        prevMonthExpenses.forEach(e => {
            const name = e.categories?.name || 'Uncategorized'
            if (!map[name]) map[name] = { name, current: 0, previous: 0 }
            map[name].previous += e.amount
        })
        return Object.values(map).sort((a, b) => b.current - a.current)
    }, [selectedMonthExpenses, prevMonthExpenses])

    // 3. Category pie data
    const categoryPieData = useMemo(() =>
        categoryBreakdown.filter(c => c.current > 0).map(c => ({
            name: c.name,
            value: c.current
        })),
        [categoryBreakdown]
    )

    // 4. Daily spending trend for selected month (area chart)
    const dailyTrend = useMemo(() => {
        const endDate = new Date() > selectedMonthEnd ? selectedMonthEnd : new Date()
        if (endDate < selectedMonthStart) return []
        const days = eachDayOfInterval({ start: selectedMonthStart, end: endDate })
        let cumulative = 0
        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayTotal = selectedMonthExpenses
                .filter(e => e.date === dateStr)
                .reduce((s, e) => s + e.amount, 0)
            cumulative += dayTotal
            return {
                date: format(day, 'MMM d'),
                daily: dayTotal,
                cumulative
            }
        })
    }, [selectedMonthExpenses, selectedMonthStart, selectedMonthEnd])

    // 5. Top expenses for selected month
    const topExpenses = useMemo(() =>
        [...selectedMonthExpenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5),
        [selectedMonthExpenses]
    )

    // ── Navigation ──
    const canGoForward = !isSameMonth(selectedDate, new Date())
    const navigateMonth = (dir: number) => {
        const next = dir > 0 ? subMonths(selectedDate, -1) : subMonths(selectedDate, 1)
        if (next <= new Date()) setSelectedDate(next)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-24 md:pb-0">
            {/* ── Month Selector ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateMonth(-1)}
                        className="h-9 w-9 rounded-full"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span className="text-lg font-semibold">
                            {format(selectedDate, 'MMMM yyyy')}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateMonth(1)}
                        disabled={!canGoForward}
                        className="h-9 w-9 rounded-full"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                {!isSameMonth(selectedDate, new Date()) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(new Date())}
                        className="text-xs"
                    >
                        Current Month
                    </Button>
                )}
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <Card className="glass border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Spent
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${totalSelectedMonth.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {selectedMonthExpenses.length} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            vs Last Month
                        </CardTitle>
                        {monthChange >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${monthChange >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {monthChange >= 0 ? '+' : ''}{monthChange.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ${Math.abs(totalSelectedMonth - totalPrevMonth).toFixed(2)} {monthChange >= 0 ? 'more' : 'less'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="col-span-2 md:col-span-1 glass border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Daily Average
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${avgDaily.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            per day
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Cumulative Spending Trend ── */}
            <Card className="glass border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-base">Spending Trend</CardTitle>
                    <p className="text-xs text-muted-foreground">Daily & cumulative spending for {format(selectedDate, 'MMMM')}</p>
                </CardHeader>
                <CardContent className="pl-0 pr-2">
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyTrend}>
                                <defs>
                                    <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="oklch(0.65 0.20 145)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="oklch(0.65 0.20 145)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--muted-foreground)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `$${v}`}
                                    width={50}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="cumulative"
                                    name="Cumulative"
                                    stroke="oklch(0.65 0.20 145)"
                                    strokeWidth={2}
                                    fill="url(#gradCumulative)"
                                />
                                <Bar
                                    dataKey="daily"
                                    name="Daily"
                                    fill="oklch(0.55 0.20 145)"
                                    fillOpacity={0.6}
                                    radius={[3, 3, 0, 0]}
                                    barSize={8}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* ── Month-over-Month Comparison ── */}
            <Card className="glass border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-base">Monthly Comparison</CardTitle>
                    <p className="text-xs text-muted-foreground">Total spending across the last {HISTORY_MONTHS} months</p>
                </CardHeader>
                <CardContent className="pl-0 pr-2">
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="month"
                                    stroke="var(--muted-foreground)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `$${v}`}
                                    width={55}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="total"
                                    name="Total"
                                    radius={[6, 6, 0, 0]}
                                    barSize={32}
                                >
                                    {monthlyComparisonData.map((entry, index) => (
                                        <Cell
                                            key={`bar-${index}`}
                                            fill={entry.isSelected ? 'oklch(0.55 0.20 145)' : 'oklch(0.75 0.10 145)'}
                                            fillOpacity={entry.isSelected ? 1 : 0.6}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* ── Category Breakdown: Pie + List ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Category Breakdown</CardTitle>
                        <p className="text-xs text-muted-foreground">{format(selectedDate, 'MMMM yyyy')}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryPieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '11px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Category vs Previous Month */}
                <Card className="glass border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Category Trends</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {format(selectedDate, 'MMM')} vs {format(subMonths(selectedDate, 1), 'MMM')}
                        </p>
                    </CardHeader>
                    <CardContent className="pl-0 pr-2">
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={categoryBreakdown.slice(0, 6)}
                                    layout="vertical"
                                    margin={{ left: 10, right: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} horizontal={false} />
                                    <XAxis
                                        type="number"
                                        stroke="var(--muted-foreground)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `$${v}`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="var(--muted-foreground)"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        width={80}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar
                                        dataKey="current"
                                        name={format(selectedDate, 'MMM')}
                                        fill={MONTH_COMPARISON_COLORS[0]}
                                        radius={[0, 4, 4, 0]}
                                        barSize={10}
                                    />
                                    <Bar
                                        dataKey="previous"
                                        name={format(subMonths(selectedDate, 1), 'MMM')}
                                        fill={MONTH_COMPARISON_COLORS[1]}
                                        radius={[0, 4, 4, 0]}
                                        barSize={10}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Top Expenses ── */}
            <Card className="glass border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-base">Top Expenses</CardTitle>
                    <p className="text-xs text-muted-foreground">Largest transactions in {format(selectedDate, 'MMMM yyyy')}</p>
                </CardHeader>
                <CardContent>
                    {topExpenses.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No expenses for this month.</p>
                    ) : (
                        <div className="space-y-3">
                            {topExpenses.map((expense, i) => {
                                const pct = totalSelectedMonth > 0 ? (expense.amount / totalSelectedMonth) * 100 : 0
                                return (
                                    <div key={expense.id} className="flex items-center gap-3 group">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-sm font-medium truncate">
                                                        {expense.comment || expense.categories?.name || 'Expense'}
                                                    </span>
                                                    {expense.comment && expense.categories?.name && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                                                            {expense.categories.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold ml-2 shrink-0">
                                                    ${expense.amount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary/60 transition-all duration-700 ease-out"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground w-8 text-right">
                                                    {pct.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
