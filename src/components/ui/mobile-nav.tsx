'use client'

import Link from 'next/link'
import {
    LayoutDashboard,
    PlusCircle,
    CreditCard,
    PieChart,
    Menu,
    Upload,
    Settings,
    LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet'

// Pages that don't fit in the bottom bar live in the "More" sheet
const moreItems = [
    {
        href: '/import',
        icon: Upload,
        label: 'Smart Import'
    },
    {
        href: '/settings',
        icon: Settings,
        label: 'Settings'
    }
]

const sheetRowClass = "flex items-center gap-3 h-12 px-3 rounded-lg text-sm font-medium transition-colors"

export function MobileNav() {
    const pathname = usePathname()
    const isMoreActive = moreItems.some((item) => pathname === item.href)

    // Using a curated list of most important actions for mobile
    const navItems = [
        {
            href: '/dashboard',
            icon: LayoutDashboard,
            label: 'Home'
        },
        {
            href: '/expenses',
            icon: CreditCard,
            label: 'Expenses'
        },
        {
            href: '/add',
            icon: PlusCircle,
            label: 'Add',
            highlight: true // Special styling for main action
        },
        {
            href: '/reports',
            icon: PieChart,
            label: 'Reports'
        }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
            <nav className="glass flex justify-around items-center h-16 px-2 pb-2 pt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                                item.highlight && "text-primary -mt-6"
                            )}
                        >
                            <div className={cn(
                                "flex flex-col items-center justify-center p-1 rounded-xl transition-all",
                                item.highlight ? "bg-background border border-border/50 shadow-lg p-3 rounded-full mb-1" : ""
                            )}>
                                <item.icon className={cn("h-6 w-6", item.highlight ? "h-6 w-6" : "")} />
                                {!item.highlight && <span className="text-[10px] font-medium mt-1">{item.label}</span>}
                            </div>
                        </Link>
                    )
                })}
                <Sheet>
                    <SheetTrigger className={cn(
                        "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                        isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}>
                        <div className="flex flex-col items-center justify-center p-1 rounded-xl transition-all">
                            <Menu className="h-6 w-6" />
                            <span className="text-[10px] font-medium mt-1">More</span>
                        </div>
                    </SheetTrigger>
                    <SheetContent side="bottom" aria-describedby={undefined} className="rounded-t-2xl pb-safe">
                        <SheetHeader>
                            <SheetTitle>More</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-1 px-4 pb-4">
                            {moreItems.map((item) => (
                                <SheetClose asChild key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            sheetRowClass,
                                            pathname === item.href ? "bg-accent text-primary" : "hover:bg-accent"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            ))}
                            <form action="/auth/signout" method="post" className="mt-2 border-t pt-2">
                                <button type="submit" className={cn(sheetRowClass, "w-full text-muted-foreground hover:bg-accent")}>
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    )
}
