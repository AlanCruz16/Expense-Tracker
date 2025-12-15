import { ImportZone } from '@/components/import/import-zone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ImportPage() {
    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Smart Import</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Statement</CardTitle>
                </CardHeader>
                <CardContent>
                    <ImportZone />
                </CardContent>
            </Card>
        </div>
    )
}
