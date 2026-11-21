import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv, validateNewSubjectBank } from "../scripts/cbt-bank-validation.mjs";

const headers="subject,topic,question_text,option_A,option_B,option_C,option_D,correct_option,explanation,difficulty,source_type,source_name,source_year,provenance_notes,licensing_notes";
test("CSV parser preserves quoted commas and escaped quotes",()=>{
  const rows=parseCsv(headers+String.fromCharCode(10)+'Commerce,Trade,"What is trade, in simple terms?",A,B,C,D,A,"Trade is the exchange of goods and services.",easy,original,"EDUKEN original practice bank",,"Original question written for EDUKEN.","Original EDUKEN-authored practice content; no copied past-question text."');
  assert.equal(rows[0].question_text,"What is trade, in simple terms?");
});
test("new-subject QA rejects missing explanations, repeated options and non-original sources",()=>{
  const rows=[];
  for(const subject of ["Christian Religious Studies","Commerce","Principles of Accounts"]){
    for(let i=0;i<200;i++)rows.push({subject,topic:"Topic "+(i%30),question_text:"Identify the accounting treatment for transaction code"+i+" when business case"+(i*7)+" occurs.",option_A:"Option A "+i,option_B:"Option B "+i,option_C:"Option C "+i,option_D:"Option D "+i,correct_option:["A","B","C","D"][i%4],explanation:"This explanation gives the reason for the correct response "+i+".",difficulty:["easy","medium","hard"][i%3],source_type:"original",source_name:"EDUKEN original practice bank",source_year:"",provenance_notes:"Original question written for EDUKEN.",licensing_notes:"Original EDUKEN-authored practice content; no copied past-question text."});
  }
  rows[0].explanation="";
  rows[1].option_D=rows[1].option_C;
  rows[2].source_type="past_question";
  const report=validateNewSubjectBank(rows);
  assert.equal(report.valid,false);
  assert.ok(report.errors.some(x=>x.code==="missing_field"));
  assert.ok(report.errors.some(x=>x.code==="options_not_four_distinct"));
  assert.ok(report.errors.some(x=>x.code==="non_original_source"));
});
