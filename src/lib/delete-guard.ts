import { toast } from "sonner"
import type { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

// Categories and payment methods are referenced by expenses (and categories by
// import rules) through restrictive foreign keys, so the database refuses to
// delete one that is still in use. Check first so the user gets a clear reason
// instead of a generic failure.

type SupabaseBrowserClient = ReturnType<typeof createClient>
type TableName = keyof Database["public"]["Tables"]

export type DeletableKind = "category" | "paymentMethod"

type Noun = { singular: string; plural: string }

type Reference = { table: TableName; column: string; noun: Noun }

type KindConfig = {
  table: TableName
  label: string
  references: Reference[]
}

const EXPENSE: Noun = { singular: "expense", plural: "expenses" }
const IMPORT_RULE: Noun = { singular: "import rule", plural: "import rules" }

const KINDS: Record<DeletableKind, KindConfig> = {
  category: {
    table: "categories",
    label: "category",
    references: [
      { table: "expenses", column: "category_id", noun: EXPENSE },
      { table: "import_rules", column: "category_id", noun: IMPORT_RULE },
    ],
  },
  paymentMethod: {
    table: "payment_methods",
    label: "payment method",
    references: [{ table: "expenses", column: "payment_method_id", noun: EXPENSE }],
  },
}

type DeleteCheck =
  | { ok: true }
  | { ok: false; message: string }

type Deletable = { id: string; name: string }

async function checkDeletable(
  supabase: SupabaseBrowserClient,
  kind: DeletableKind,
  { id, name }: Deletable,
): Promise<DeleteCheck> {
  const { label, references } = KINDS[kind]
  const uses: string[] = []
  for (const ref of references) {
    const { count, error } = await supabase
      .from(ref.table)
      .select("id", { count: "exact", head: true })
      .eq(ref.column, id)
    if (error) return { ok: false, message: `Couldn't check whether "${name}" is in use. Please try again.` }
    if (count) uses.push(`${count} ${count === 1 ? ref.noun.singular : ref.noun.plural}`)
  }

  if (uses.length === 0) return { ok: true }
  return {
    ok: false,
    message: `Can't delete "${name}": it's used by ${uses.join(" and ")}. Move ${uses.length > 1 ? "them" : "those"} to another ${label} first.`,
  }
}

// Postgres foreign_key_violation: something started using the row between the
// check and the delete.
function isInUseError(error: { code?: string } | null) {
  return error?.code === "23503"
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// The whole delete flow behind a settings trash button: refuse with a reason if
// the item is in use, otherwise confirm and delete. Every outcome is reported
// with a toast. Resolves to whether the item was deleted.
export async function deleteIfUnused(
  supabase: SupabaseBrowserClient,
  kind: DeletableKind,
  item: Deletable,
): Promise<boolean> {
  const { table, label, references } = KINDS[kind]

  const check = await checkDeletable(supabase, kind, item)
  if (!check.ok) {
    toast.error(check.message)
    return false
  }

  if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return false

  const { error } = await supabase.from(table).delete().eq("id", item.id)

  if (isInUseError(error)) {
    const usedBy = references.map((ref) => ref.noun.plural).join(" or ")
    toast.error(`Can't delete "${item.name}": it's now used by ${usedBy}.`)
    return false
  }
  if (error) {
    toast.error(`Failed to delete ${label}`)
    return false
  }
  toast.success(`${capitalize(label)} deleted`)
  return true
}
