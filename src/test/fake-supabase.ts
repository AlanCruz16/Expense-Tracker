// A small in-memory stand-in for the Supabase browser client, covering only the
// query shapes the components under test use: select (optionally count/head),
// eq, gte, lte, order, limit, single, and delete. Data selects and deletes
// are recorded so tests can assert on them.

type Row = Record<string, unknown>
type Result = { data: Row[] | Row | null; count: number | null; error: { code?: string; message: string } | null }

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
  const selects: string[] = []
  let user: { id: string } | null = { id: "user-1" }

  function from(table: string) {
    const filters: ((row: Row) => boolean)[] = []
    let mode: "select" | "delete" = "select"
    let head = false
    let withCount = false
    let single = false

    const rows = () => (tables[table] ?? []).filter((row) => filters.every((matches) => matches(row)))

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
      // Count-only (head) selects fetch no rows, so they aren't data loads
      if (!head) selects.push(table)
      if (single) return { data: matched[0] ?? null, count: null, error: null }
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
        filters.push((row) => row[col] === val)
        return builder
      },
      gte(col: string, val: string) {
        filters.push((row) => String(row[col]) >= val)
        return builder
      },
      lte(col: string, val: string) {
        filters.push((row) => String(row[col]) <= val)
        return builder
      },
      order() {
        return builder
      },
      limit() {
        return builder
      },
      single() {
        single = true
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
    // Table name of every data select that ran, in order. Count-only (head)
    // selects are left out.
    selects,
  }
}
