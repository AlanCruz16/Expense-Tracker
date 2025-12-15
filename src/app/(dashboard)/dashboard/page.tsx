import { ReportsDashboard } from '@/components/reports/reports-dashboard'

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <ReportsDashboard />
        </div>
    )
}
