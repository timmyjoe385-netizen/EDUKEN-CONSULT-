const optionalFields = [
  ["email", 254],
  ["state", 100],
  ["educationLevel", 100],
  ["interest", 160],
  ["schoolCourse", 200],
];

const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);

export function validateConsultationBody(body) {
  if (!isRecord(body)) return { error: "A valid consultation request is required." };

  for (const [field] of optionalFields) {
    if (body[field] != null && typeof body[field] !== "string") {
      return { error: "One or more consultation fields are invalid." };
    }
  }

  for (const field of ["name", "whatsapp", "message"]) {
    if (typeof body[field] !== "string") {
      return { error: "Name, WhatsApp number and message are required." };
    }
  }

  const data = {
    name: body.name.trim(),
    whatsapp: body.whatsapp.trim(),
    message: body.message.trim(),
    email: typeof body.email === "string" ? body.email.trim() : "",
    state: typeof body.state === "string" ? body.state.trim() : "",
    educationLevel: typeof body.educationLevel === "string"
      ? body.educationLevel.trim()
      : typeof body.education_level === "string" ? body.education_level.trim() : "",
    interest: typeof body.interest === "string" ? body.interest.trim() : "",
    schoolCourse: typeof body.schoolCourse === "string"
      ? body.schoolCourse.trim()
      : typeof body.school_course === "string" ? body.school_course.trim() : "",
  };

  if (!data.name || !data.whatsapp || !data.message) {
    return { error: "Name, WhatsApp number and message are required." };
  }
  if (
    data.name.length > 120 ||
    data.whatsapp.length > 40 ||
    data.message.length > 4000 ||
    data.email.length > 254 ||
    data.state.length > 100 ||
    data.educationLevel.length > 100 ||
    data.interest.length > 160 ||
    data.schoolCourse.length > 200
  ) {
    return { error: "One or more consultation fields exceed the allowed length." };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { error: "Enter a valid email address." };
  }

  return { data };
}
