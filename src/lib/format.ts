export const formatCurrency = (n: number) => {
  if (!n) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};
export const formatNumber = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: n >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
export const formatRuntime = (m: number | null | undefined) => {
  if (!m) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h ? `${h}h ${min}m` : `${min}m`;
};
