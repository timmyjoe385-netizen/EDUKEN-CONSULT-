import { FormEvent, useState } from 'react';
import { api } from './lib/api';
import { FilePlus2, ShieldCheck } from 'lucide-react';

type Section = 'opportunities' | 'admissions' | 'updates' | 'services' | 'faqs';
const SECTION_LABELS: Record<Section, string> = { opportunities: 'Opportunities', admissions: 'Admissions', updates: 'Educational updates', services: 'Services', faqs: 'FAQs' };

export default function QuickDraftInbox() {
  const [section, setSection] = useState<Section>('opportunities');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const reset = () => { setTitle(''); setSummary(''); setContent(''); setSourceUrl(''); setCategory(''); };
  const submitDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError(''); setMessage('');
    const cleanTitle = title.trim(), cleanContent = content.trim(), cleanSource = sourceUrl.trim();
    if (!cleanTitle || !cleanContent) { setError('Add a title and the main content before saving.'); return; }
    if (cleanSource) { try { const parsed = new URL(cleanSource); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { setError('Enter a valid source link beginning with https:// or http://.'); return; } }
    const common = { status: 'DRAFT', is_published: false, category: category.trim() };
    const source = ['opportunities', 'admissions', 'updates'].includes(section) ? { sourceUrl: cleanSource } : {};
    let payload: Record<string, unknown>;
    if (section === 'opportunities') payload = { ...common, ...source, title: cleanTitle, description: summary.trim() || cleanContent.split(/\\r?\\n/)[0].slice(0, 180), content: cleanContent, verified: false, featured: false, urgent: false, notifyOnPublish: false };
    else if (section === 'admissions') payload = { ...common, ...source, school: cleanTitle, title: cleanTitle, description: summary.trim(), details: cleanContent, verified: false, featured: false, urgent: false, notifyOnPublish: false };
    else if (section === 'updates') payload = { ...common, ...source, title: cleanTitle, description: summary.trim(), body: cleanContent, verified: false, featured: false, urgent: false, notifyOnPublish: false };
    else if (section === 'services') payload = { ...common, name: cleanTitle, description: summary.trim() || cleanContent.slice(0, 240), requirements: cleanContent };
    else payload = { ...common, question: cleanTitle, answer: cleanContent };
    setSubmitting(true);
    try { await api.post('/api/admin/content/' + section, payload); setMessage('Draft saved to ' + SECTION_LABELS[section] + '. It is not published.'); reset(); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'The draft could not be saved. Please try again.'); }
    finally { setSubmitting(false); }
  };
  return <section className="quick-draft-panel" aria-labelledby="quick-draft-title">
    <div className="quick-draft-intro"><div className="quick-draft-icon"><FilePlus2 size={21}/></div><div><h2 id="quick-draft-title">Create an unpublished draft</h2><p>Paste researched content prepared with ChatGPT, add its source, and save it directly to the selected EDUKEN section.</p></div></div>
    <div className="quick-draft-safety"><ShieldCheck size={18}/><span><strong>Draft-only protection:</strong> this form cannot publish content, mark it verified, feature it, or send publish notifications.</span></div>
    <form className="quick-draft-form" onSubmit={submitDraft}>
      <label><span>EDUKEN section</span><select value={section} onChange={e => setSection(e.target.value as Section)} disabled={submitting}>{Object.entries(SECTION_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label><span>{section === 'admissions' ? 'School / institution name' : section === 'faqs' ? 'Question' : section === 'services' ? 'Service name' : 'Title'}</span><input value={title} onChange={e => setTitle(e.target.value)} maxLength={180} required placeholder="Enter a clear title" disabled={submitting}/></label>
      {section !== 'faqs' && <label><span>Short summary (optional)</span><textarea value={summary} onChange={e => setSummary(e.target.value)} maxLength={700} rows={2} placeholder="A brief description for the content listing" disabled={submitting}/></label>}
      {section !== 'faqs' && <label><span>Category (optional)</span><input value={category} onChange={e => setCategory(e.target.value)} maxLength={80} placeholder="e.g. Scholarship, Admission, Education" disabled={submitting}/></label>}
      <label><span>{section === 'faqs' ? 'Answer' : section === 'admissions' ? 'Admission details' : section === 'services' ? 'Requirements / full details' : 'Full content'}</span><textarea value={content} onChange={e => setContent(e.target.value)} maxLength={18000} rows={9} required placeholder="Paste the prepared content here. Keep dates, eligibility and instructions clear." disabled={submitting}/></label>
      {['opportunities', 'admissions', 'updates'].includes(section) && <label><span>Original source link (recommended)</span><input type="url" inputMode="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} maxLength={1000} placeholder="https://official-website.gov.ng/..." disabled={submitting}/></label>}
      {error && <p className="quick-draft-error" role="alert">{error}</p>}{message && <p className="quick-draft-success" role="status">{message}</p>}
      <div className="quick-draft-actions"><button className="primary" type="submit" disabled={submitting}>{submitting ? 'Saving draft…' : 'Save as unpublished draft'}</button><button className="secondary" type="button" disabled={submitting} onClick={reset}>Clear form</button></div>
    </form>
  </section>;
}
