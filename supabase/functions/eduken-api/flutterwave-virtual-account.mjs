export function parseFlutterwaveVirtualAccount(result) {
  if (!result || result.status !== "success" || !result.data || typeof result.data !== "object") return null;
  const data = result.data;
  const accountNumber = typeof data.account_number === "string" ? data.account_number.trim() : "";
  const bankName = typeof data.bank_name === "string" ? data.bank_name.trim() : "";
  const transferAmount = Number(data.amount);
  if (data.response_code !== "02" || !/^\d{8,20}$/.test(accountNumber) || !bankName || bankName.length > 120) return null;
  if (!Number.isFinite(transferAmount) || transferAmount <= 0) return null;
  let expiresAt = null;
  if (typeof data.expiry_date === "string" && data.expiry_date.trim() && data.expiry_date.trim().toUpperCase() !== "N/A") {
    const parsed = new Date(data.expiry_date);
    if (!Number.isFinite(parsed.getTime())) return null;
    expiresAt = parsed.toISOString();
  }
  return { accountNumber, bankName, transferAmount, expiresAt };
}
