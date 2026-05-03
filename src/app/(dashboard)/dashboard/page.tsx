import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <DashboardOverview />
        </div>
    )
}
