import { Microscope, Pill, FileText } from 'lucide-react';
import { TESTS, MEDS, statusOf } from './sampleData.js';
export * from './sampleData.js';

export const KIND = { Lab: { color: 'teal', icon: Microscope }, Prescription: { color: 'violet', icon: Pill }, Visit: { color: 'orange', icon: FileText } };
export const fmtDate = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(); };

export const EVENTS = [
  { id: 'e1', date: 'OCT 10, 2026', title: 'Complete Blood Count', sub: 'City Diagnostics · Lab report', kind: 'Lab', color: 'teal', icon: Microscope, tag: '3 observations',
    details: TESTS.slice(0, 3).map(t => ({ k: t.name, v: `${t.value} ${t.unit}`, flag: statusOf(t) !== 'normal' })) },
  { id: 'e2', date: 'OCT 08, 2026', title: 'Prescription added', sub: 'Dr. Sharma Clinic · Prescription', kind: 'Prescription', color: 'violet', icon: Pill, tag: '2 medicines',
    details: MEDS.slice(0, 2).map(m => ({ k: m.name, v: `${m.dose} · ${m.freq}` })) },
  { id: 'e3', date: 'OCT 05, 2026', title: 'Discharge summary', sub: 'Apollo Clinic · Visit summary', kind: 'Visit', color: 'orange', icon: FileText, tag: 'Reviewed',
    details: [{ k: 'Diagnosis', v: 'Viral fever — resolved (sample)' }, { k: 'Advice', v: 'Rest, fluids' }, { k: 'Follow-up', v: 'In 2 weeks' }] },
  { id: 'e4', date: 'SEP 22, 2026', title: 'Vitamin D test', sub: 'City Diagnostics · Lab report', kind: 'Lab', color: 'blue', icon: Microscope, tag: '1 observation',
    details: [{ k: 'Vitamin D (25-OH)', v: '15.1 ng/mL', flag: true }] },
];
