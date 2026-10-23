export function normalizeFlutterwaveStatus(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isSuccessfulFlutterwaveTransaction(transaction) {
  return normalizeFlutterwaveStatus(transaction?.status) === "successful";
}

export function isFinalFlutterwaveFailure(transaction) {
  return ["failed", "cancelled", "canceled", "expired"].includes(normalizeFlutterwaveStatus(transaction?.status));
}

export function getNextFlutterwavePaymentStatus(transaction) {
  if (isSuccessfulFlutterwaveTransaction(transaction)) return "Paid";
  if (isFinalFlutterwaveFailure(transaction)) return "Failed";
  return "Pending";
}

// Flutterwave v3 reports NGN amounts in naira, unlike Paystack's kobo amount.
export function matchesStoredFlutterwavePayment(transaction, { amount, currency = "NGN", reference }) {
  if (!transaction || typeof transaction !== "object") return false;
  const expectedAmount = Number(amount);
  const providerAmount = Number(transaction.amount);
  if (!Number.isFinite(expectedAmount) || expectedAmount <= 0 || !Number.isFinite(providerAmount) || providerAmount <= 0) return false;
  return Math.round(expectedAmount * 100) === Math.round(providerAmount * 100)
    && String(transaction.currency || "").toUpperCase() === String(currency).toUpperCase()
    && String(transaction.tx_ref || "") === reference;
}

export function getFlutterwaveCheckoutUrl(result) {
  if (!result || result.status !== "success" || typeof result.data?.link !== "string") return null;
  try {
    const url = new URL(result.data.link);
    if (
      url.protocol !== "https:"
      || url.hostname !== "checkout.flutterwave.com"
      || url.port
      || url.username
      || url.password
      || !url.pathname
      || url.pathname === "/"
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// Flutterwave's v3 webhook uses the configured secret hash in the verif-hash header.
export function isValidFlutterwaveWebhookSignature(providedHash, configuredHash) {
  if (typeof providedHash !== "string" || typeof configuredHash !== "string" || !providedHash || !configuredHash) return false;
  if (providedHash.length !== configuredHash.length) return false;
  let difference = 0;
  for (let index = 0; index < configuredHash.length; index++) {
    difference |= providedHash.charCodeAt(index) ^ configuredHash.charCodeAt(index);
  }
  return difference === 0;
}

// Require an explicit test-mode flag and a Flutterwave test secret key.
export function isFlutterwaveTestModeEnabled(mode, secretKey) {
  return typeof mode === "string"
    && mode.trim().toLowerCase() === "test"
    && typeof secretKey === "string"
    && /^FLWSECK_TEST-[A-Za-z0-9_-]+$/.test(secretKey.trim());
}

export function getFlutterwaveCallbackUrl(siteUrl, reference) {
  if (typeof reference !== "string" || !/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)) return null;
  if (typeof siteUrl !== "string" || !siteUrl.trim()) return null;
  try {
    const parsed = new URL(siteUrl.trim());
    if (
      parsed.protocol !== "https:"
      || parsed.username
      || parsed.password
      || parsed.pathname !== "/"
      || parsed.search
      || parsed.hash
    ) return null;
    const callback = new URL("/make-payments", parsed.origin);
    callback.searchParams.set("reference", reference);
    callback.searchParams.set("provider", "flutterwave");
    return callback.toString();
  } catch {
    return null;
  }
}
