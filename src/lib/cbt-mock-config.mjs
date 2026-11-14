export const DEFAULT_CBT_MOCK_QUESTION_COUNT = 10;

export function getCbtMockFallbackDurationSeconds(requestedCount) {
  if (requestedCount === 4) return 4 * 60;
  if (requestedCount === 180) return 120 * 60;
  return 30 * 60;
}
