export function parseJsonBody(text) {
  try {
    return { valid: true, value: JSON.parse(text) };
  } catch {
    return { valid: false, value: undefined };
  }
}
