'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, CreditCard, Banknote } from 'lucide-react'
import { Database } from '@/types/supabase'

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']

export function PaymentMethodsManager() {
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [supabase] = useState(() => createClient())

    // Form state
    const [name, setName] = useState('')
    const [type, setType] = useState('Credit')
    const [submitting, setSubmitting] = useState(false)

    const fetchMethods = useCallback(async () => {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('name')

        if (error) {
            toast.error('Failed to load payment methods')
        } else {
            setMethods(data || [])
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        // eslint-disable-next-line
        fetchMethods()
    }, [fetchMethods])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('payment_methods')
            .insert({
                user_id: user.id,
                name,
                type
            })

        if (error) {
            toast.error('Failed to add payment method')
        } else {
            toast.success('Payment method added')
            setOpen(false)
            setName('')
            fetchMethods()
        }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will affect expenses using this method.')) return

        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error('Failed to delete payment method')
        } else {
            toast.success('Payment method deleted')
            fetchMethods()
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your credit cards, debit cards, and cash accounts.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Method
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Payment Method</DialogTitle>
                            <DialogDescription>Add a new source of funds.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdd}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Amex Gold"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Credit">Credit Card</SelectItem>
                                            <SelectItem value="Debit">Debit Card</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {methods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        {method.type === 'Cash' ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <div className="font-medium">{method.name}</div>
                                        <div className="text-xs text-muted-foreground">{method.type}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
