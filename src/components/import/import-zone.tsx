'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, UploadCloud } from 'lucide-react'
import { ReviewTable } from '@/components/import/review-table'

const GENERIC_ANALYSIS_ERROR = 'Failed to analyze statement'
const MAX_ERROR_MESSAGE_LENGTH = 120

// The analyze route answers failures with a short plain-text reason. Anything
// else (an HTML error page or a multi-line dump from the host) isn't fit for a
// toast, so the generic message is shown instead.
async function analysisErrorMessage(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.startsWith('text/plain')) return GENERIC_ANALYSIS_ERROR
    const message = (await response.text().catch(() => '')).trim()
    const isShortMessage = message !== '' && message.length <= MAX_ERROR_MESSAGE_LENGTH && !message.includes('\n')
    return isShortMessage ? message : GENERIC_ANALYSIS_ERROR
}

function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
        reader.readAsDataURL(file)
    })
}

export function ImportZone() {
    const [analyzing, setAnalyzing] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[] | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        setAnalyzing(true)

        try {
            const base64 = await readAsDataURL(file)

            const response = await fetch('/api/analyze-receipt', {
                method: 'POST',
                body: JSON.stringify({ image: base64 }),
            })

            if (!response.ok) {
                toast.error(await analysisErrorMessage(response))
                return
            }

            const result = await response.json()
            setData(result.expenses)
        } catch (error) {
            console.error(error)
            toast.error(GENERIC_ANALYSIS_ERROR)
        } finally {
            setAnalyzing(false)
            // Clear the input so picking the same file again still fires onChange
            e.target.value = ''
        }
    }

    if (data) {
        return <ReviewTable initialData={data} onCancel={() => setData(null)} />
    }

    return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
            <div className="bg-muted p-4 rounded-full mb-4">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Bank Statement</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Drag and drop a screenshot of your bank statement, or click to browse.
                We&apos;ll extract the data automatically.
            </p>

            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    disabled={analyzing}
                />
                <Button disabled={analyzing}>
                    {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {analyzing ? 'Analyzing...' : 'Select Image'}
                </Button>
            </div>
        </div>
    )
}
