import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IncomeForm } from '@/components/settings/income-form'
import { CategoriesManager } from '@/components/settings/categories-manager'
import { PaymentMethodsManager } from '@/components/settings/payment-methods-manager'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch initial data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your preferences, categories, and payment methods.</p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Income</CardTitle>
                            <CardDescription>
                                Set your expected monthly income to calculate savings rates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IncomeForm initialIncome={profile?.monthly_income || 0} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <CategoriesManager />
                </TabsContent>

                <TabsContent value="payment-methods" className="space-y-4">
                    <PaymentMethodsManager />
                </TabsContent>
            </Tabs>
        </div>
    )
}
