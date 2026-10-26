import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// The browser Supabase client for a component, created once per mount. Because
// it never changes, it can be an effect dependency without refetching every render.
export function useSupabaseClient() {
    const [supabase] = useState(createClient)
    return supabase
}
