import type { SupabaseClient } from '@supabase/supabase-js'

// Categories and payment methods are referenced by expenses (and categories by
// import rules) through restrictive foreign keys, so the database refuses to
// delete one that is still in use. Check first so the user gets a clear reason
// instead of a generic failure.

type Reference = { table: string; column: string; label: [singular: string, plural: string] }

const REFERENCES = {
    category: [
        { table: 'expenses', column: 'category_id', label: ['expense', 'expenses'] },
        { table: 'import_rules', column: 'category_id', label: ['import rule', 'import rules'] },
    ],
    'payment method': [
        { table: 'expenses', column: 'payment_method_id', label: ['expense', 'expenses'] },
    ],
} satisfies Record<string, Reference[]>

export type DeletableKind = keyof typeof REFERENCES

export type DeleteCheck =
    | { ok: true }
    | { ok: false; message: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkDeletable(supabase: SupabaseClient<any>, kind: DeletableKind, id: string, name: string): Promise<DeleteCheck> {
    const uses: string[] = []
    for (const ref of REFERENCES[kind] as Reference[]) {
        const { count, error } = await supabase
            .from(ref.table)
            .select('id', { count: 'exact', head: true })
            .eq(ref.column, id)
        if (error) return { ok: false, message: `Couldn't check whether "${name}" is in use. Please try again.` }
        if (count) uses.push(`${count} ${count === 1 ? ref.label[0] : ref.label[1]}`)
    }

    if (uses.length === 0) return { ok: true }
    return {
        ok: false,
        message: `Can't delete "${name}": it's used by ${uses.join(' and ')}. Move ${uses.length > 1 ? 'them' : 'those'} to another ${kind} first.`,
    }
}

// Postgres foreign_key_violation: something started using the row between the
// check and the delete.
export function isInUseError(error: { code?: string } | null) {
    return error?.code === '23503'
}
