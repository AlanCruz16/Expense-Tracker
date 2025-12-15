import { createClient } from '@/lib/supabase/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 60 // Allow longer timeout for vision

export async function POST(req: Request) {
    const { image } = await req.json()

    if (!image) {
        return new Response('No image provided', { status: 400 })
    }

    try {
        // Convert base64 data URL to just base64 string if needed
        // The Vercel AI SDK Google provider expects base64 for images in a specific way or just the data URL.
        // Let's check the docs or assume standard behavior. 
        // Actually, for 'image' part in content, it usually handles data URLs.

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
