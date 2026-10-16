export function parseJsonObjectBody(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return { valid: false, error: "A valid JSON request body is required." };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, error: "A JSON object request body is required." };
  }

  return { valid: true, value };
}
