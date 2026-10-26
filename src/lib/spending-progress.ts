// How full the dashboard's "Left to Spend" bar is: the share of monthly income
// already spent, from 0 to 100. With no income set, any spending counts as over budget.
export function spendingProgressPercent(outflows: number, income: number): number {
  if (income <= 0) return outflows > 0 ? 100 : 0
  return Math.min((outflows / income) * 100, 100)
}
