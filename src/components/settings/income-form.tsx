'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function IncomeForm({ initialIncome }: { initialIncome: number }) {
    const [income, setIncome] = useState(initialIncome)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({ monthly_income: income })
            .eq('id', user.id)

        if (error) {
            toast.error('Failed to update income')
        } else {
            toast.success('Income updated successfully')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSave} className="flex items-end gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="income">Amount</Label>
                <Input
                    id="income"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                />
            </div>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
            </Button>
        </form>
    )
}
