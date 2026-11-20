export const DEFAULT_CBT_MOCK_QUESTION_COUNT = 10;

export function getCbtMockFallbackDurationSeconds(requestedCount) {
  return requestedCount === 180 ? 120 * 60 : requestedCount === 4 ? 4 * 60 : 30 * 60;
}
