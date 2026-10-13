export function validateServiceRequestBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A valid request object is required." };
  }

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const details = typeof body.details === "string" ? body.details.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!customerName || !whatsapp || !details) {
    return { error: "Name, WhatsApp number and request details are required." };
  }
  if (customerName.length > 120 || whatsapp.length > 40 || details.length > 4000 || email.length > 200) {
    return { error: "One or more fields exceed the allowed length." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (body.serviceId != null && typeof body.serviceId !== "string") {
    return { error: "Invalid service selection." };
  }

  return {
    data: {
      customerName,
      whatsapp,
      details,
      email,
      serviceId: body.serviceId || null,
    },
  };
}

const allowedServiceRequestStatuses = new Set([
  "New Requests",
  "Contacted",
  "In Progress",
  "Completed",
  "Cancelled",
]);

export function isAllowedServiceRequestStatus(status) {
  return typeof status === "string" && allowedServiceRequestStatuses.has(status);
}
