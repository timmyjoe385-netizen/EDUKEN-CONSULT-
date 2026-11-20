const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "support", "eduken", "official",
  "moderator", "system", "jamb", "guest",
]);

export function validateStudentUsername(value) {
  const username = String(value ?? "").trim();
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return { valid: false, username: "", error: "Choose a username with 3–20 letters, numbers or underscores." };
  }
  if (RESERVED_USERNAMES.has(username.toLowerCase())) {
    return { valid: false, username: "", error: "That username is reserved. Please choose another." };
  }
  return { valid: true, username, error: "" };
}

export function aggregateCbtSubjectScores(review) {
  if (!Array.isArray(review)) return [];
  const grouped = new Map();
  for (const item of review) {
    const subject = String(item?.subject ?? "").trim();
    if (!subject) continue;
    const current = grouped.get(subject) || { subject, score: 0, total: 0 };
    current.total += 1;
    if (item?.isCorrect === true) current.score += 1;
    grouped.set(subject, current);
  }
  return [...grouped.values()];
}

export function isNationalLeaderboardEligible(attempt) {
  return Boolean(attempt?.user_id) && attempt?.mode === "mock" && Number(attempt?.total) === 180;
}

export function isSubjectLeaderboardEligible(subjectScore) {
  return Boolean(subjectScore?.user_id) &&
    Number.isInteger(Number(subjectScore?.total)) &&
    Number(subjectScore.total) >= 20 &&
    Number(subjectScore.score) >= 0 &&
    Number(subjectScore.score) <= Number(subjectScore.total);
}
