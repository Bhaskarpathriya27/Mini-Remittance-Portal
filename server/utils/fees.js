export function calcFees(amount) {
  const fixed = Number(process.env.FIXED_FEE || 2);
  const pct = Number(process.env.PERCENT_FEE || 0.5); // percent
  const variable = (pct / 100) * amount;
  const total = fixed + variable;
  return { fixed, percent: pct, variable, total };
}
