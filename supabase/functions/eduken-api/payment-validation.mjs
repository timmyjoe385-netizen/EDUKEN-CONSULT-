export function normalizePaystackStatus(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isSuccessfulPaystackTransaction(transaction) {
  return normalizePaystackStatus(transaction?.status) === "success";
}

export function isFinalPaystackFailure(transaction) {
  return ["failed", "abandoned", "reversed"].includes(normalizePaystackStatus(transaction?.status));
}

export function matchesStoredPaystackPayment(transaction, { amount, currency = "NGN", reference }) {
  if (!transaction || typeof transaction !== "object") return false;
  const expectedKobo = Math.round(Number(amount) * 100);
  const providerAmount = Number(transaction.amount);
  const providerCurrency = String(transaction.currency || "").toUpperCase();
  const providerReference = String(transaction.reference || "");
  return Number.isFinite(expectedKobo)
    && expectedKobo > 0
    && providerAmount === expectedKobo
    && providerCurrency === String(currency).toUpperCase()
    && providerReference === reference;
}

export function getNextPaymentStatus(transaction) {
  if (isSuccessfulPaystackTransaction(transaction)) return "Paid";
  if (isFinalPaystackFailure(transaction)) return "Failed";
  return "Pending";
}
