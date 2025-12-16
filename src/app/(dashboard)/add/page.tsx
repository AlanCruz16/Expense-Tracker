import { AddExpenseForm } from '@/components/expenses/add-expense-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddExpensePage() {
    return (
        <div className="w-full h-full flex flex-col pt-6 md:pt-0">
            {/* Header for Mobile only (hidden on desktop if sidebar exists, but useful for context) */}
            <div className="md:hidden px-6 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">New Expense</h1>
            </div>

            <div className="flex-1 w-full max-w-2xl mx-auto md:p-8">
                <AddExpenseForm />
            </div>
        </div>
    )
}
