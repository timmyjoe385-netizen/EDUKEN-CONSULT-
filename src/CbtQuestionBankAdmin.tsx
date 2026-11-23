import { useEffect, useMemo, useState } from 'react';
import { api, usesIsolatedTestBackend } from './lib/api';
import { CheckCircle2, FileSpreadsheet, Plus, RefreshCw, Save, Search, ShieldCheck, Upload, X } from 'lucide-react';

type Question = {
  id?: string; exam_type: string; subject: string; topic: string; subtopic?: string;
  question_text: string; options: Record<string,string>; correct_option: string;
  explanation: string; difficulty: string; source_type: string; source_name: string;
  source_year: number | string | null; provenance_notes: string; licensing_notes: string; status: string;
};
const blank = (): Question => ({ exam_type:'JAMB', subject:'', topic:'', subtopic:'', question_text:'', options:{A:'',B:'',C:'',D:''}, correct_option:'A', explanation:'', difficulty:'medium', source_type:'original', source_name:'', source_year:'', provenance_notes:'', licensing_notes:'', status:'draft' });
const statuses = ['draft','reviewed','approved','published','unpublished'];
function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (c === '"' && quoted && text[i+1] === '"') { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) { row.push(cell); cell=''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i+1] === '\n') i++;
      row.push(cell); if (row.some(v=>v.trim())) rows.push(row); row=[]; cell='';
    } else cell += c;
  }
  row.push(cell); if (row.some(v=>v.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('CSV must contain a header row and at least one question row.');
  const headers = rows[0].map(h=>h.trim().toLowerCase());
  return rows.slice(1).map(values => {
    const item: Record<string,string> = {};
    headers.forEach((header,i)=>item[header] = (values[i] || '').trim());
    return {
      exam_type:item.exam_type || 'JAMB', subject:item.subject, topic:item.topic, subtopic:item.subtopic,
      question_text:item.question_text,
      options:{A:item.option_a || item.a, B:item.option_b || item.b, C:item.option_c || item.c, D:item.option_d || item.d},
      correct_option:item.correct_option, explanation:item.explanation, difficulty:item.difficulty || 'medium',
      source_type:item.source_type || 'original', source_name:item.source_name, source_year:item.source_year,
      provenance_notes:item.provenance_notes, licensing_notes:item.licensing_notes,
    };
  });
}
export default function CbtQuestionBankAdmin() {
  const [items,setItems] = useState<Question[]>([]);
  const [form,setForm] = useState<Question | null>(null);
  const [filter,setFilter] = useState('all');
  const [search,setSearch] = useState('');
  const [loading,setLoading] = useState(false);
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const [importResult,setImportResult] = useState<any>(null);
  const [importHistory,setImportHistory] = useState<any[]>([]);
  const [loadingImports,setLoadingImports] = useState(false);
  const [importing,setImporting] = useState(false);
  const [bulkPublishing,setBulkPublishing] = useState(false);
  const [filename,setFilename] = useState('');
  const [showImport,setShowImport] = useState(false);
  const [batchRows,setBatchRows] = useState<Record<string,unknown>[] | null>(null);
  const load = async () => {
    setLoading(true); setError('');
    try { const result = await api.get('/api/admin/cbt/questions' + (filter !== 'all' ? '?status='+encodeURIComponent(filter) : '')); setItems(result.data?.items || []); }
    catch(e) { setError(e instanceof Error ? e.message : 'Could not load question bank.'); }
    finally { setLoading(false); }
  };
  const loadImportHistory = async () => {
    setLoadingImports(true);
    try {
      const result = await api.get('/api/admin/cbt/imports');
      setImportHistory(result.data?.items || []);
    } catch(e) {
      setError(e instanceof Error ? e.message : 'Could not load import history.');
    } finally {
      setLoadingImports(false);
    }
  };
  useEffect(()=>{ void load(); void loadImportHistory(); },[filter]);
  const visible = useMemo(()=>items.filter(q => !search || [q.question_text,q.subject,q.topic,q.subtopic].join(' ').toLowerCase().includes(search.toLowerCase())),[items,search]);
  const change = (key: keyof Question, value: any) => setForm(current => current ? ({...current,[key]:value}) : current);
  const save = async () => {
    if (!form) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const result = form.id ? await api.put('/api/admin/cbt/questions/'+form.id,form) : await api.post('/api/admin/cbt/questions',form);
      setMessage(result.data?.notice || 'Question saved as a draft/reviewable record. Publishing still requires review and approval.');
      setForm(null); await load();
    } catch(e) { setError(e instanceof Error ? e.message : 'Could not save question.'); }
    finally { setSaving(false); }
  };
  const transition = async (q: Question, status: string) => {
    setError(''); setMessage('');
    try { const result = await api.put('/api/admin/cbt/questions/'+q.id,{...q,status}); setMessage(result.data?.notice || 'Question status updated.'); await load(); }
    catch(e) { setError(e instanceof Error ? e.message : 'Could not update status.'); }
  };
  const remove = async (q: Question) => {
    if (!q.id || !window.confirm('Delete this draft/unpublished question?')) return;
    try { await api.delete('/api/admin/cbt/questions/'+q.id); setMessage('Question deleted.'); await load(); }
    catch(e) { setError(e instanceof Error ? e.message : 'Could not delete question.'); }
  };
  const chooseFile = async (file?: File) => {
    if (!file) return;
    setError(''); setMessage(''); setImportResult(null);
    try { const rows=parseCsv(await file.text()); setFilename(file.name); setBatchRows(rows); setShowImport(true); }
    catch(e) { setError(e instanceof Error ? e.message : 'Could not read CSV.'); }
  };
  const bulkPublishNewSubjects = async () => {
    const targetSubjects = new Set(['Christian Religious Studies','Commerce','Principles of Accounts']);
    const preparedBatch = importHistory.find((batch:any) => batch.filename === 'EDUKEN-next-150-new-subjects.csv' && batch.status === 'completed' && Number(batch.inserted_rows) === 150);
    if (filter !== 'all' || !preparedBatch?.id) {
      setError('Bulk publication stopped: refresh import history and confirm the prepared 150-question batch imported successfully.');
      return;
    }
    let targets: Question[] = [];
    try {
      const result = await api.get('/api/admin/cbt/questions?import_batch_id=' + encodeURIComponent(preparedBatch.id));
      targets = (result.data?.items || []).filter((q:Question) => q.id && targetSubjects.has(q.subject));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the exact imported batch. No publication was attempted.');
      return;
    }
    if (targets.length !== 150) {
      setError(`Bulk publication stopped: the selected import batch contains ${targets.length} eligible questions; exactly 150 are required. No publication was attempted.`);
      return;
    }
    if (!window.confirm('Complete publication for all 150 new-subject questions? Each question will pass through Draft → Reviewed → Approved → Published using your authenticated admin account. Already completed stages will be skipped, so this action can safely resume after an interruption.')) return;
    setBulkPublishing(true); setError(''); setMessage('');
    const nextStages = { draft: ['reviewed','approved','published'], reviewed: ['approved','published'], approved: ['published'], published: [] } as const;
    let completed = 0;
    try {
      for (let i = 0; i < targets.length; i += 5) {
        const group = targets.slice(i, i + 5);
        const results = await Promise.allSettled(group.map(async q => {
          const stages = nextStages[q.status as keyof typeof nextStages];
          if (!stages) throw new Error('Unexpected question status for ' + q.id);
          for (const nextStatus of stages) {
            await api.put('/api/admin/cbt/questions/' + q.id, { ...q, status: nextStatus });
          }
        }));
        completed += results.filter(result => result.status === 'fulfilled').length;
        const failed = results.findIndex(result => result.status === 'rejected');
        if (failed !== -1) {
          const reason = results[failed].status === 'rejected' ? results[failed].reason : null;
          throw new Error(`Bulk publication paused after processing ${completed} of 150 questions in this run. ${reason instanceof Error ? reason.message : 'One or more server requests failed.'} Refresh the question bank and retry; completed stages will be preserved.`);
        }
      }
      setMessage('All 150 new-subject questions have passed through the protected review workflow and are published.');
    } catch(e) {
      setError(e instanceof Error ? e.message : 'Bulk publication stopped. Refresh the question bank and inspect statuses before retrying.');
    } finally {
      setBulkPublishing(false);
      await load();
    }
  };
  const runImport = async () => {
    if (!batchRows?.length) return;
    setImporting(true); setError('');
    try {
      const result=await api.post('/api/admin/cbt/import',{filename,sourceLabel:'CSV admin import',rows:batchRows});
      setImportResult(result.data); setMessage('Import finished. All imported questions remain drafts until reviewed.'); setBatchRows(null); await load(); await loadImportHistory();
    } catch(e) { setError(e instanceof Error ? e.message : 'Import failed.'); }
    finally { setImporting(false); }
  };
  const importPrepared150 = async () => {
    if (!usesIsolatedTestBackend) {
      setError('Prepared batch import is disabled outside the isolated test preview. No import was attempted.');
      return;
    }
    if (!window.confirm('Import the prepared 150 CRS, Commerce and Principles of Accounts questions into this isolated preview database as drafts? Nothing will be published or sent to the live site.')) return;
    setImporting(true); setError(''); setMessage(''); setImportResult(null);
    try {
      const response = await fetch('/cbt/eduken-next-150-new-subjects.csv', { cache: 'no-store' });
      if (!response.ok) throw new Error('The prepared question file could not be loaded. Refresh the preview and try again.');
      const rows = parseCsv(await response.text());
      const counts = rows.reduce((acc: Record<string, number>, row: any) => { const subject = String(row.subject || ''); acc[subject] = (acc[subject] || 0) + 1; return acc; }, {});
      if (rows.length !== 150 || counts['Christian Religious Studies'] !== 50 || counts['Commerce'] !== 50 || counts['Principles of Accounts'] !== 50) throw new Error('Safety check stopped the import: the prepared file must contain exactly 50 questions for each of the three subjects.');
      const result = await api.post('/api/admin/cbt/import', { filename: 'EDUKEN-next-150-new-subjects.csv', sourceLabel: 'EDUKEN prepared question batch', rows });
      setImportResult(result.data);
      setMessage('Prepared batch import completed. Questions remain drafts; nothing was published.');
      await load(); await loadImportHistory();
    } catch (e) { setError(e instanceof Error ? e.message : 'Prepared batch import failed.'); }
    finally { setImporting(false); }
  };
  const downloadTemplate = () => {
    const csv='exam_type,subject,topic,subtopic,question_text,option_A,option_B,option_C,option_D,correct_option,explanation,difficulty,source_type,source_name,source_year,provenance_notes,licensing_notes\nJAMB,Use of English,Grammar,Nouns,"Which word is a noun?",quickly,happiness,blue,run,B,"Happiness names a state.",easy,original,,,,';
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a'); a.href=url; a.download='eduken-cbt-question-template.csv'; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="analytics-panel" aria-label="CBT question bank management">
    <div className="analytics-toolbar"><div><span className="tag">ADMIN ONLY · SERVER-VALIDATED</span><h2>CBT Question Bank</h2><p>Create, review and publish questions. CSV imports are checked and saved as drafts only.</p></div><div className="analytics-controls"><button className="secondary" onClick={downloadTemplate}><FileSpreadsheet size={16}/> CSV template</button><button className="secondary" onClick={()=>{setForm(blank());setError('');}}><Plus size={16}/> New question</button>{usesIsolatedTestBackend ? <button className="primary" onClick={()=>void importPrepared150()} disabled={importing || bulkPublishing}><Upload size={16}/>{importing ? "Importing prepared 150…" : "Import prepared 150 questions"}</button> : null}<button className="secondary" onClick={()=>setShowImport(true)}><FileSpreadsheet size={16}/> Import other CSV</button><button className="secondary" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/> Refresh</button></div></div>
    {error ? <div className="analytics-error" role="alert"><b>Action needs attention</b><p>{error}</p></div> : null}
    {message ? <div className="system-setting-row" role="status"><CheckCircle2 size={18}/><span>{message}</span></div> : null}
    <div className="analytics-toolbar"><div className="analytics-controls"><button className="primary" onClick={()=>void bulkPublishNewSubjects()} disabled={bulkPublishing || loading || loadingImports || filter !== 'all' || !importHistory.some((batch:any)=>batch.filename === 'EDUKEN-next-150-new-subjects.csv' && batch.status === 'completed' && Number(batch.inserted_rows) === 150)}><ShieldCheck size={16}/>{bulkPublishing?'Publishing 150 questions…':'Publish 150 new-subject questions'}</button><small>Runs the protected review → approval → publication steps for the three reviewed subject batches.</small></div></div>
    <div className="analytics-toolbar"><div className="analytics-controls"><label>Review state <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All states</option>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></label><label><Search size={15}/> Search <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Question, subject or topic"/></label></div><span>{visible.length} shown</span></div>
    {form ? <div className="system-settings-panel" style={{marginBottom:18}}><div className="analytics-toolbar"><h3>{form.id?'Edit question':'Create question'}</h3><button className="secondary" onClick={()=>setForm(null)}><X size={16}/> Close</button></div>
      <div className="admin-form-grid">
        <label>Exam type<input value={form.exam_type} onChange={e=>change('exam_type',e.target.value)} required/></label>
        <label>Subject<input value={form.subject} onChange={e=>change('subject',e.target.value)} required/></label>
        <label>Topic<input value={form.topic} onChange={e=>change('topic',e.target.value)} required/></label>
        <label>Subtopic<input value={form.subtopic||''} onChange={e=>change('subtopic',e.target.value)}/></label>
        <label>Difficulty<select value={form.difficulty} onChange={e=>change('difficulty',e.target.value)}><option>easy</option><option>medium</option><option>hard</option></select></label>
        <label>Source type<select value={form.source_type} onChange={e=>change('source_type',e.target.value)}><option value="original">Original question</option><option value="past_question">Past question (rights/provenance required)</option><option value="licensed">Licensed content</option><option value="other">Other</option></select></label>
        <label className="admin-form-wide">Question text<textarea rows={3} value={form.question_text} onChange={e=>change('question_text',e.target.value)} required/></label>
        {(['A','B','C','D'] as const).map(k=><label key={k}>Option {k}<input value={form.options?.[k]||''} onChange={e=>change('options',{...form.options,[k]:e.target.value})} required/></label>)}
        <label>Correct answer<select value={form.correct_option} onChange={e=>change('correct_option',e.target.value)}>{['A','B','C','D'].map(k=><option key={k}>{k}</option>)}</select></label>
        <label>Source name<input value={form.source_name||''} onChange={e=>change('source_name',e.target.value)}/></label>
        <label>Source year<input type="number" min="1960" max="2100" value={form.source_year||''} onChange={e=>change('source_year',e.target.value)}/></label>
        <label className="admin-form-wide">Explanation<textarea rows={2} value={form.explanation||''} onChange={e=>change('explanation',e.target.value)}/></label>
        <label className="admin-form-wide">Provenance notes<textarea rows={2} value={form.provenance_notes||''} onChange={e=>change('provenance_notes',e.target.value)}/></label>
        <label className="admin-form-wide">Licensing / usage-rights notes<textarea rows={2} value={form.licensing_notes||''} onChange={e=>change('licensing_notes',e.target.value)}/></label>
      </div><div className="analytics-controls"><button className="primary" onClick={()=>void save()} disabled={saving}><Save size={16}/>{saving?'Saving…':'Save question'}</button><small>Edits to published content return it to draft for a fresh review.</small></div>
    </div> : null}
    {loading ? <div className="admin-empty">Loading question bank…</div> : visible.length ? <div className="system-settings-list">{visible.map(q=><article className="system-setting-row" key={q.id}><span className="system-setting-copy"><b>{q.subject} · {q.topic}</b><small>{q.question_text}</small><small>Source: {q.source_type==='original'?'Original':q.source_name||q.source_type}{q.source_year?' · '+q.source_year:''} · {q.difficulty}</small><small>State: <b>{q.status}</b></small></span><div className="analytics-controls"><button className="secondary" onClick={()=>setForm({...q})}>Edit</button>{q.status==='draft'?<button className="secondary" onClick={()=>void transition(q,'reviewed')}>Mark reviewed</button>:null}{q.status==='reviewed'?<button className="secondary" onClick={()=>void transition(q,'approved')}>Approve</button>:null}{q.status==='approved'?<button className="primary" onClick={()=>void transition(q,'published')}>Publish</button>:null}{q.status==='published'?<button className="secondary" onClick={()=>void transition(q,'unpublished')}>Unpublish</button>:null}{['draft','unpublished'].includes(q.status)?<button className="secondary" onClick={()=>void remove(q)}>Delete</button>:null}</div></article>)}</div> : <div className="admin-empty">No questions match this filter yet. Create one or import a CSV template.</div>}
    {showImport ? <div className="system-settings-panel" style={{marginTop:18}}><div className="analytics-toolbar"><h3>Bulk CSV import</h3><button className="secondary" onClick={()=>{setShowImport(false);setBatchRows(null);}}><X size={16}/> Close</button></div><p>Upload a UTF-8 CSV using the template. Maximum 500 rows per import. Invalid rows and duplicates are reported. Everything imported stays in draft; no question is auto-published.</p><input type="file" accept=".csv,text/csv" onChange={e=>void chooseFile(e.target.files?.[0])}/>{batchRows ? <div className="system-setting-row"><span>{filename}: {batchRows.length} rows ready for validation and import.</span><button className="primary" onClick={()=>void runImport()} disabled={importing}><Upload size={16}/>{importing?'Importing…':'Validate & import drafts'}</button></div>:null}{importResult ? <div className="analytics-error" role="status"><b>Import report</b><p>Inserted: {importResult.inserted} · Duplicates: {importResult.duplicates} · Invalid: {importResult.invalid}</p>{(importResult.errors||[]).slice(0,30).map((e:any,i:number)=><small key={i}>Row {e.row}: {e.errors?.join(' ')}</small>)}</div>:null}</div>:null}
    <div className="system-settings-panel" style={{marginTop:18}}>
      <div className="analytics-toolbar"><div><h3>CSV import history</h3><p>Recent batches and their validation outcomes.</p></div><button className="secondary" onClick={()=>void loadImportHistory()} disabled={loadingImports}><RefreshCw size={16}/>{loadingImports?'Refreshing…':'Refresh history'}</button></div>
      {loadingImports && importHistory.length===0 ? <div className="admin-empty">Loading import history…</div> : importHistory.length===0 ? <div className="admin-empty">No CSV imports recorded yet.</div> : <div className="system-settings-list">{importHistory.map((batch:any)=><article className="system-setting-row" key={batch.id}><span className="system-setting-copy"><b>{batch.filename || 'Unnamed CSV import'}</b><small>{batch.source_label || 'Admin CSV import'} · {new Date(batch.created_at).toLocaleString()}</small><small>{batch.inserted_rows} imported · {batch.duplicate_rows} duplicates · {batch.invalid_rows} invalid · {batch.total_rows} total</small></span><span className="tag">{batch.status}</span></article>)}</div>}
    </div>
    <div className="system-setting-row"><ShieldCheck size={18}/><span>Students can only retrieve published questions through the public API. Administrative writes require the existing server-side admin authorization check. Source and licensing notes are retained for audit.</span></div>
  </section>;
}
