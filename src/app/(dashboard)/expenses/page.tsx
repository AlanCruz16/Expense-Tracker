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
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense
                    </Button>
                </Link>
            </div>
            <ExpensesList />
        </div>
    )
}
