import { readFile } from "node:fs/promises";
import { parseCsv, validateNewSubjectBank } from "./cbt-bank-validation.mjs";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/validate-cbt-bank.mjs <new-subjects.csv>");
  process.exit(2);
}
const rows = parseCsv(await readFile(input,"utf8"));
const report = validateNewSubjectBank(rows);
console.log(JSON.stringify(report,null,2));
if (!report.valid) process.exit(1);
