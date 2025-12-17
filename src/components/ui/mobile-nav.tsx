'use client'

import Link from 'next/link'
import {
    LayoutDashboard,
    PlusCircle,
    CreditCard,
    Settings,
    PieChart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function MobileNav() {
    const pathname = usePathname()

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
        },
        {
            href: '/settings',
            icon: Settings,
            label: 'Settings'
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
            </nav>
        </div>
    )
}
