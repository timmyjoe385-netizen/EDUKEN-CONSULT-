export function validateServiceRequestBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A valid request object is required." };
  }

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const details = typeof body.details === "string" ? body.details.trim() : "";
  if (body.email != null && typeof body.email !== "string") {
    return { error: "Enter a valid email address." };
  }
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
  if (typeof body.serviceId === "string" && body.serviceId.trim() &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.serviceId.trim())) {
    return { error: "Invalid service selection." };
  }

  return {
    data: {
      customerName,
      whatsapp,
      details,
      email,
      serviceId: body.serviceId?.trim() || null,
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
export function isPublishedService(service) {
  return Boolean(service && service.is_published === true);
}
