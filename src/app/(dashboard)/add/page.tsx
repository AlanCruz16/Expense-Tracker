import { AddExpenseForm } from '@/components/expenses/add-expense-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddExpensePage() {
    return (
        <div className="p-8 flex justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-center">Add New Expense</CardTitle>
                </CardHeader>
                <CardContent>
                    <AddExpenseForm />
                </CardContent>
            </Card>
        </div>
    )
}
