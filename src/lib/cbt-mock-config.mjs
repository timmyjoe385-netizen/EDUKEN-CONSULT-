export const DEFAULT_CBT_MOCK_QUESTION_COUNT = 10;

export function getCbtMockFallbackDurationSeconds(requestedCount) {
  return requestedCount === 180 ? 120 * 60 : 30 * 60;
}
