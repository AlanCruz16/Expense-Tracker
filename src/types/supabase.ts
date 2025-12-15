export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    monthly_income: number | null
                    currency: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    monthly_income?: number | null
                    currency?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    monthly_income?: number | null
                    currency?: string | null
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    icon: string | null
                    color: string | null
                    is_default: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    icon?: string | null
                    color?: string | null
                    is_default?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    icon?: string | null
                    color?: string | null
                    is_default?: boolean | null
                    created_at?: string
                }
            }
            payment_methods: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    type: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    type: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    type?: string
                    created_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    date: string
                    category_id: string | null
                    payment_method_id: string | null
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    date?: string
                    category_id?: string | null
                    payment_method_id?: string | null
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    date?: string
                    category_id?: string | null
                    payment_method_id?: string | null
                    comment?: string | null
                    created_at?: string
                }
            }
            import_rules: {
                Row: {
                    id: string
                    user_id: string
                    keyword: string
                    category_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    keyword: string
                    category_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    keyword?: string
                    category_id?: string
                    created_at?: string
                }
            }
        }
    }
}
