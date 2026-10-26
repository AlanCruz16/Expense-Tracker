import type { TooltipContentProps } from 'recharts'

// Recharts injects these when the tooltip is used as `content`
type ChartTooltipProps = Partial<Pick<TooltipContentProps<number, string>, 'active' | 'payload' | 'label'>>

// Custom tooltip for recharts
export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-border/50 bg-background/90 backdrop-blur-xl p-3 shadow-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-semibold text-foreground">${Number(entry.value).toFixed(2)}</span>
                </div>
            ))}
        </div>
    )
}
