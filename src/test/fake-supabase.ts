// A small in-memory stand-in for the Supabase browser client, covering only the
// query shapes the settings managers use: select (optionally count/head), eq,
// order, and delete. Deletes are recorded so tests can assert on them.

type Row = Record<string, unknown>
type Result = { data: Row[] | null; count: number | null; error: { code?: string; message: string } | null }

export type FakeSupabase = ReturnType<typeof createFakeSupabase>

// Restrictive foreign keys from supabase/schema.sql: a row can't be deleted while
// another table still references it.
const REFERENCES: Record<string, [table: string, column: string][]> = {
  categories: [["expenses", "category_id"], ["import_rules", "category_id"]],
  payment_methods: [["expenses", "payment_method_id"]],
}

export function createFakeSupabase(initial: Record<string, Row[]>) {
  const tables: Record<string, Row[]> = Object.fromEntries(
    Object.entries(initial).map(([name, rows]) => [name, rows.map((row) => ({ ...row }))])
  )
  const deletes: { table: string; id: unknown }[] = []
  let user: { id: string } | null = { id: "user-1" }

  function from(table: string) {
    const filters: [string, unknown][] = []
    let mode: "select" | "delete" = "select"
    let head = false
    let withCount = false

    const rows = () => (tables[table] ?? []).filter((row) => filters.every(([col, val]) => row[col] === val))

    function run(): Result {
      const matched = rows()
      if (mode === "delete") {
        const referenced = (REFERENCES[table] ?? []).some(([refTable, col]) =>
          (tables[refTable] ?? []).some((ref) => matched.some((row) => ref[col] === row.id))
        )
        if (referenced) {
          return { data: null, count: null, error: { code: "23503", message: "violates foreign key constraint" } }
        }
        tables[table] = (tables[table] ?? []).filter((row) => !matched.includes(row))
        matched.forEach((row) => deletes.push({ table, id: row.id }))
        return { data: null, count: null, error: null }
      }
      return { data: head ? null : matched, count: withCount ? matched.length : null, error: null }
    }

    const builder = {
      select(_cols?: string, opts?: { count?: string; head?: boolean }) {
        mode = "select"
        head = !!opts?.head
        withCount = !!opts?.count
        return builder
      },
      delete() {
        mode = "delete"
        return builder
      },
      eq(col: string, val: unknown) {
        filters.push([col, val])
        return builder
      },
      order() {
        return builder
      },
      then<T>(resolve: (value: Result) => T, reject?: (reason: unknown) => T) {
        try {
          return Promise.resolve(resolve(run()))
        } catch (err) {
          return reject ? Promise.resolve(reject(err)) : Promise.reject(err)
        }
      },
    }
    return builder
  }

  return {
    from,
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    // Simulates the session expiring in an open tab: getUser() now returns no user.
    expireSession() {
      user = null
    },
    tables,
    deletes,
  }
}
