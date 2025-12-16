import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    PlusCircle,
    CreditCard,
    Settings,
    LogOut,
    PieChart,
    Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-[100dvh] flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card border-r flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold tracking-tight">Expense App</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/expenses">
                        <Button variant="ghost" className="w-full justify-start">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Expenses
                        </Button>
                    </Link>
                    <Link href="/reports">
                        <Button variant="ghost" className="w-full justify-start">
                            <PieChart className="mr-2 h-4 w-4" />
                            Reports
                        </Button>
                    </Link>
                    <Link href="/add">
                        <Button variant="ghost" className="w-full justify-start">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </Link>
                    <Link href="/import">
                        <Button variant="ghost" className="w-full justify-start">
                            <Upload className="mr-2 h-4 w-4" />
                            Smart Import
                        </Button>
                    </Link>
                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <form action="/auth/signout" method="post">
                        <Button variant="outline" className="w-full justify-start text-muted-foreground">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-background">
                {children}
            </main>
        </div>
    )
}
