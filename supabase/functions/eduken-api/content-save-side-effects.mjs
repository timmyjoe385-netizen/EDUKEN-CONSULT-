/**
 * Run post-save notification tasks without turning a successful database write
 * into a false save failure. Failures are logged and returned as safe UI warnings.
 */
export async function runContentSaveSideEffects(tasks) {
  const warnings = [];
  for (const task of tasks) {
    try {
      await task.run();
    } catch (error) {
      console.error(task.errorLabel, error);
      warnings.push(task.warning);
    }
  }
  return warnings;
}
