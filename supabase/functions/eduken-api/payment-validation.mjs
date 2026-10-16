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

export function getPaystackAuthorizationUrl(result) {
  if (!result || result.status !== true || typeof result.data?.authorization_url !== "string") return null;
  try {
    const url = new URL(result.data.authorization_url);
    if (
      url.protocol !== "https:"
      || url.hostname !== "checkout.paystack.com"
      || url.port
      || url.username
      || url.password
      || !url.pathname || url.pathname === "/"
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}


export async function isValidPaystackWebhookSignature(rawBody, signature, secret) {
  if (typeof rawBody !== "string" || typeof signature !== "string" || typeof secret !== "string" || !secret) return false;
  if (!/^[a-f0-9]{128}$/i.test(signature)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  const expected = Array.from(digest, byte => byte.toString(16).padStart(2, "0")).join("");
  const provided = signature.toLowerCase();
  if (expected.length !== provided.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index++) {
    difference |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return difference === 0;
}
