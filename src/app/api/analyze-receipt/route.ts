import { createClient } from '@/lib/supabase/server'
import { MAX_IMAGE_BYTES, decodedByteLength } from '@/lib/receipt-image'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 60 // Allow longer timeout for vision

export async function POST(req: Request) {
    // Every request is a billed Gemini call, so only signed-in users get one
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new Response('Unauthorized', { status: 401 })
    }

    const { image } = await req.json()

    if (typeof image !== 'string' || !image) {
        return new Response('No image provided', { status: 400 })
    }

    if (decodedByteLength(image) > MAX_IMAGE_BYTES) {
        return new Response('Image too large', { status: 413 })
    }

    try {
        const { object } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: z.object({
                expenses: z.array(z.object({
                    date: z.string().describe('YYYY-MM-DD format'),
                    description: z.string(),
                    amount: z.number(),
                })),
            }),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract the transaction date, description, and amount from this bank statement. Ignore headers, balances, and page numbers. Return a JSON array.' },
                        { type: 'image', image },
                    ],
                },
            ],
        })

        return Response.json(object)
    } catch (error) {
        console.error('AI Error:', error)
        return new Response('Failed to analyze image', { status: 500 })
    }
}
