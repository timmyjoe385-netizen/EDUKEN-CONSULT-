/**
 * Run post-save side effects independently so notification failures never turn
 * a successful content write into a misleading save failure.
 * @param {{ run: () => Promise<unknown>, errorLabel: string, warning: string }[]} tasks
 * @returns {Promise<string[]>}
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
