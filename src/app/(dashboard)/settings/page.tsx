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
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
                <p className="text-muted-foreground">Manage your preferences, categories, and payment methods.</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-muted/30 p-1 rounded-2xl w-full sm:w-auto h-auto grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 sm:inline-flex">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
                    >
                        General
                    </TabsTrigger>
                    <TabsTrigger
                        value="categories"
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
                    >
                        Categories
                    </TabsTrigger>
                    <TabsTrigger
                        value="payment-methods"
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
                    >
                        Payment Methods
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="rounded-2xl border-border/60 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-muted/10">
                            <CardTitle>Monthly Income</CardTitle>
                            <CardDescription>
                                Set your expected monthly income to calculate savings rates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <IncomeForm initialIncome={profile?.monthly_income || 0} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <CategoriesManager />
                </TabsContent>

                <TabsContent value="payment-methods" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <PaymentMethodsManager />
                </TabsContent>
            </Tabs>
        </div>
    )
}
