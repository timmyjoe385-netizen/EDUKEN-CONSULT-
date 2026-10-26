export function parseFlutterwaveVirtualAccount(result) {
  if (!result || result.status !== "success" || !result.data || typeof result.data !== "object") return null;
  const data = result.data;
  const accountNumber = typeof data.account_number === "string" ? data.account_number.trim() : "";
  const bankName = typeof data.bank_name === "string" ? data.bank_name.trim() : "";
  const rawAccountName = data.account_name ?? data.accountName ?? data.account_holder_name ?? data.beneficiary_name;
  const accountName = typeof rawAccountName === "string" ? rawAccountName.trim().replace(/\s+/g, " ").slice(0, 160) : "";
  const transferAmount = Number(data.amount);
  if (data.response_code !== "02" || !/^\d{8,20}$/.test(accountNumber) || !bankName || bankName.length > 120) return null;
  if (!Number.isFinite(transferAmount) || transferAmount <= 0) return null;
  let expiresAt = null;
  if (typeof data.expiry_date === "string" && data.expiry_date.trim() && data.expiry_date.trim().toUpperCase() !== "N/A") {
    const parsed = new Date(data.expiry_date);
    if (!Number.isFinite(parsed.getTime())) return null;
    expiresAt = parsed.toISOString();
  }
  return { accountNumber, bankName, accountName, transferAmount, expiresAt };
}
