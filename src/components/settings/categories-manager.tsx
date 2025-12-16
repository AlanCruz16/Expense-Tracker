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
import { Loader2, Plus, Trash2, Utensils, Car, ShoppingBag, Film, ShoppingCart, Zap, Activity, Plane, HelpCircle } from 'lucide-react'
import { Database } from '@/types/supabase'

type Category = Database['public']['Tables']['categories']['Row']

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

export function CategoriesManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [supabase] = useState(() => createClient())

    // Form state
    const [name, setName] = useState('')
    const [icon, setIcon] = useState('help-circle')
    const [color, setColor] = useState('#3b82f6')
    const [submitting, setSubmitting] = useState(false)

    const fetchCategories = useCallback(async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) {
            toast.error('Failed to load categories')
        } else {
            setCategories(data || [])
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        // eslint-disable-next-line
        fetchCategories()
    }, [fetchCategories])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('categories')
            .insert({
                user_id: user.id,
                name,
                icon,
                color,
                is_default: false
            })

        if (error) {
            toast.error('Failed to add category')
        } else {
            toast.success('Category added')
            setOpen(false)
            setName('')
            fetchCategories()
        }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will affect expenses using this category.')) return

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error('Failed to delete category')
        } else {
            toast.success('Category deleted')
            fetchCategories()
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage your expense categories.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
                            <DialogDescription>Create a new category for your expenses.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdd}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="icon" className="text-right">Icon</Label>
                                    <Select value={icon} onValueChange={setIcon}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(ICONS).map((key) => {
                                                // @ts-expect-error - Key index access
                                                const Icon = ICONS[key]
                                                return (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center">
                                                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                                                            {key}
                                                        </div>
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="color" className="text-right">Color</Label>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <Input
                                            id="color"
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="w-12 h-10 p-1"
                                        />
                                        <span className="text-sm text-muted-foreground">{color}</span>
                                    </div>
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
                        {categories.map((category) => {
                            // @ts-expect-error - Icon string access
                            const Icon = ICONS[category.icon || 'help-circle'] || HelpCircle
                            return (
                                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-md text-white"
                                            style={{ backgroundColor: category.color || '#ccc' }}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    {!category.is_default && (
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
