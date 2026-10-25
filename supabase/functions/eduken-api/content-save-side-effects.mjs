/**
 * Run post-save side effects independently so notification failures never turn
 * a successful content write into a misleading save failure.
 */
export async function runContentSaveSideEffects(
  tasks: { run: () => Promise<unknown>; errorLabel: string; warning: string }[],
): Promise<string[]> {
  const warnings: string[] = [];
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
