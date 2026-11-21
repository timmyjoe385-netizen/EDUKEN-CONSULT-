const REQUIRED = ["subject","topic","question_text","option_A","option_B","option_C","option_D","correct_option","explanation","difficulty","source_type","source_name","provenance_notes","licensing_notes"];
const CANONICAL = new Set(["Christian Religious Studies","Commerce","Principles of Accounts"]);
const LETTERS = ["A","B","C","D"];
const STOP = new Set(["the","a","an","of","in","on","at","to","for","from","by","with","which","what","when","where","who","how","is","are","was","were","be","been","being","and","or","as","that","this","these","those","it","its","does","do","did","can","may","most","best"]);

export function normalizeText(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^\\p{L}\\p{N}]+/gu," ").trim().replace(/\\s+/g," ");
}

export function parseCsv(text) {
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c === '"' && quoted && text[i+1] === '"'){cell+='"';i++;}
    else if(c === '"') quoted=!quoted;
    else if(c === ',' && !quoted){row.push(cell);cell="";}
    else if((c === "\\n" || c === "\\r") && !quoted){if(c==="\\r"&&text[i+1]==="\\n")i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell="";}
    else cell+=c;
  }
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
  if(rows.length<2)throw new Error("CSV must contain a header and at least one row.");
  const headers=rows[0].map(x=>x.trim());
  return rows.slice(1).map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]||"").trim()])));
}

function similarity(a,b){
  const words = s => normalizeText(s).split(" ").filter(w=>w.length>2&&!STOP.has(w));
  const A=words(a), B=words(b);
  if(Math.min(A.length,B.length)<5)return 0;
  const setA=new Set(A),setB=new Set(B);
  let intersection=0;for(const word of setA)if(setB.has(word))intersection++;
  const jaccard=intersection/(setA.size+setB.size-intersection);
  const bigrams = arr => new Set(arr.slice(0,-1).map((w,i)=>w+" "+arr[i+1]));
  const ba=bigrams(A),bb=bigrams(B);let bi=0;for(const x of ba)if(bb.has(x))bi++;
  const dice=ba.size+bb.size?2*bi/(ba.size+bb.size):0;
  return Math.max(jaccard,dice);
}

export function validateNewSubjectBank(rows,{expectedPerSubject=200,existingRows=[]}={}){
  const errors=[];const seen=new Map();const all=[...existingRows,...rows];
  const counts=new Map();const topics=new Map();const answers=new Map();const difficulties=new Map();
  rows.forEach((q,index)=>{
    const n=index+2;
    for(const key of REQUIRED)if(!String(q[key]??"").trim())errors.push({row:n,code:"missing_field",field:key});
    if(!CANONICAL.has(q.subject))errors.push({row:n,code:"unsupported_subject",subject:q.subject});
    counts.set(q.subject,(counts.get(q.subject)||0)+1);
    if(q.topic){if(!topics.has(q.subject))topics.set(q.subject,new Set());topics.get(q.subject).add(normalizeText(q.topic));}
    if(q.correct_option&&!LETTERS.includes(q.correct_option.toUpperCase()))errors.push({row:n,code:"invalid_answer_key"});
    const optionValues=LETTERS.map(letter=>normalizeText(q["option_"+letter]));
    if(optionValues.some(v=>!v)||new Set(optionValues).size!==4)errors.push({row:n,code:"options_not_four_distinct"});
    if(q.explanation.trim().length<12)errors.push({row:n,code:"explanation_too_short"});
    if(q.source_type!=="original")errors.push({row:n,code:"non_original_source"});
    if(q.source_year)errors.push({row:n,code:"unexpected_source_year"});
    if(!/original|written for EDUKEN/i.test(q.provenance_notes))errors.push({row:n,code:"provenance_missing"});
    if(!/original|no copied past-question/i.test(q.licensing_notes))errors.push({row:n,code:"rights_note_missing"});
    const a=q.correct_option.toUpperCase();if(LETTERS.includes(a))answers.set(q.subject,{...(answers.get(q.subject)||{}),[a]:(answers.get(q.subject)?.[a]||0)+1});
    difficulties.set(q.subject,{...(difficulties.get(q.subject)||{}),[q.difficulty]:(difficulties.get(q.subject)?.[q.difficulty]||0)+1});
  });
  for(const subject of CANONICAL){
    if((counts.get(subject)||0)!==expectedPerSubject)errors.push({code:"wrong_subject_count",subject,actual:counts.get(subject)||0,expected:expectedPerSubject});
    const topicCount=topics.get(subject)?.size||0;
    if(topicCount<(subject==="Christian Religious Studies"?25:subject==="Commerce"?12:14))errors.push({code:"weak_topic_coverage",subject,topicCount});
    const d=difficulties.get(subject)||{};
    if(!["easy","medium","hard"].every(k=>(d[k]||0)>0))errors.push({code:"difficulty_not_balanced",subject});
    const total=counts.get(subject)||0;
    for(const letter of LETTERS)if((answers.get(subject)?.[letter]||0)>total*0.4)errors.push({code:"answer_key_imbalance",subject,letter});
  }
  for(let i=0;i<all.length;i++){
    const a=all[i], stem=normalizeText(a.question_text);
    if(!stem)continue;
    const key=(a.subject||"")+"|"+stem+"|"+LETTERS.map(l=>normalizeText(a["option_"+l]||"")).join("|");
    if(seen.has(key))errors.push({row:i+2,code:"exact_duplicate",matches:seen.get(key)});
    else seen.set(key,i+2);
  }
  // Near-duplicate screening is limited to the new bank and uses a high threshold to avoid
  // treating common syllabus terminology as a duplicate.
  for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
    if(rows[i].subject!==rows[j].subject)continue;
    if(similarity(rows[i].question_text,rows[j].question_text)>=0.88)
      errors.push({row:j+2,code:"possible_near_duplicate",matches:i+2});
  }
  return {valid:errors.length===0,errors,counts:Object.fromEntries(counts),topicCounts:Object.fromEntries([...topics].map(([k,v])=>[k,v.size]))};
}
