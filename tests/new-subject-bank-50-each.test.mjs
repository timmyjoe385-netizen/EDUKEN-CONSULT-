import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const csvPath = new URL("../content/cbt/staging/2026-11-21/new-subjects-50-each.csv", import.meta.url);
const REQUIRED = ["exam_type","subject","topic","subtopic","question_text","option_A","option_B","option_C","option_D","correct_option","explanation","difficulty","source_type","source_name","provenance_notes","licensing_notes"];
const SUBJECTS = ["Christian Religious Studies","Commerce","Principles of Accounts"];
const LETTERS = ["A","B","C","D"];

function parseCsv(input) {
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<input.length;i++) {
    const c=input[i];
    if(c === '"' && quoted && input[i+1] === '"') { cell+='"'; i++; }
    else if(c === '"') quoted=!quoted;
    else if(c === ',' && !quoted) { row.push(cell); cell=""; }
    else if((c === "\n" || c === "\r") && !quoted) {
      if(c === "\r" && input[i+1] === "\n") i++;
      row.push(cell); if(row.some(v=>v.trim())) rows.push(row); row=[]; cell="";
    } else cell+=c;
  }
  row.push(cell); if(row.some(v=>v.trim())) rows.push(row);
  const headers=rows[0].map(v=>v.trim());
  return rows.slice(1).map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]||"").trim()])));
}
const normalize = value => String(value||"").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
const stop = new Set("the a an of in on at to for from by with which what when where who how is are was were be been being and or as that this these those it its does do did can may most best".split(" "));
function similarity(a,b) {
  const words=s=>normalize(s).split(" ").filter(w=>w.length>2&&!stop.has(w));
  const A=words(a),B=words(b); if(Math.min(A.length,B.length)<5)return 0;
  const sa=new Set(A),sb=new Set(B); let intersection=0;
  for(const word of sa)if(sb.has(word))intersection++;
  const jaccard=intersection/(sa.size+sb.size-intersection);
  const bigrams=arr=>new Set(arr.slice(0,-1).map((word,i)=>word+" "+arr[i+1]));
  const ba=bigrams(A),bb=bigrams(B); let shared=0;
  for(const pair of ba)if(bb.has(pair))shared++;
  const dice=ba.size+bb.size?2*shared/(ba.size+bb.size):0;
  return Math.max(jaccard,dice);
}
const csv=await readFile(csvPath,"utf8");
const rows=parseCsv(csv);

test("starter bank contains exactly 50 rows for each new subject",()=>{
  assert.equal(rows.length,150);
  for(const subject of SUBJECTS)assert.equal(rows.filter(q=>q.subject===subject).length,50,subject);
});

test("all question rows have required fields, four distinct options and valid answer keys",()=>{
  for(const [index,q] of rows.entries()) {
    for(const field of REQUIRED)assert.ok(q[field],`row ${index+2}: missing ${field}`);
    const options=LETTERS.map(letter=>normalize(q["option_"+letter]));
    assert.equal(new Set(options).size,4,`row ${index+2}: options must be distinct`);
    assert.ok(LETTERS.includes(q.correct_option),`row ${index+2}: invalid answer key`);
    assert.ok(q.explanation.length>=12,`row ${index+2}: explanation too short`);
    assert.ok(["easy","medium","hard"].includes(q.difficulty));
    assert.equal(q.source_type,"original");
    assert.match(q.provenance_notes,/original/i);
    assert.match(q.licensing_notes,/original/i);
  }
});

test("topic coverage, difficulty levels and answer keys are balanced per subject",()=>{
  for(const subject of SUBJECTS) {
    const subset=rows.filter(q=>q.subject===subject);
    assert.ok(new Set(subset.map(q=>q.topic)).size >= (subject==="Christian Religious Studies"?25:subject==="Commerce"?12:14));
    for(const level of ["easy","medium","hard"])assert.ok(subset.some(q=>q.difficulty===level),subject+" "+level);
    for(const letter of LETTERS)assert.ok(subset.filter(q=>q.correct_option===letter).length<=20,subject+" answer "+letter);
  }
});

test("no exact or high-threshold near-duplicate stems occur within a subject",()=>{
  const exact=new Set();
  for(const q of rows) {
    const key=q.subject+"|"+normalize(q.question_text)+"|"+LETTERS.map(l=>normalize(q["option_"+l])).join("|");
    assert.ok(!exact.has(key),"exact duplicate: "+q.question_text);
    exact.add(key);
  }
  for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++) {
    if(rows[i].subject!==rows[j].subject)continue;
    assert.ok(similarity(rows[i].question_text,rows[j].question_text)<0.88,`possible near duplicate rows ${i+2} and ${j+2}`);
  }
});

test("production prepared-import control uses the exact live hostname in both visibility and click guards", async () => {
  const component = await readFile(new URL("../src/CbtQuestionBankAdmin.tsx", import.meta.url), "utf8");
  const productionHost = "https://eduken-consult.timmyjoe385.workers.dev";
  assert.ok(component.includes("window.location.origin === '" + productionHost + "'"), "production import button must be visible on the official production origin");
  assert.ok(component.includes("window.location.origin !== '" + productionHost + "'"), "production import handler must reject every other origin");
  assert.ok(!component.includes("eduken-consult.timmy385.workers.dev"), "the misspelled hostname must not remain");
  assert.ok(component.includes("usesIsolatedTestBackend"), "isolated-backend safety guard must remain active");
});
