import { ExpensesList } from '@/components/expenses/expenses-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function ExpensesPage() {
    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
                <Link href="/add">
                    <Button className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md transition-all duration-300">
                        <Plus className="mr-2 h-4 w-4 text-white" />
                        <span className="text-white font-semibold">Add Expense</span>
                    </Button>
                </Link>
            </div>
            <ExpensesList />
        </div>
    )
}
