import { styles, type Receipt } from './engine.ts';
export const STORAGE_KEY = 'life-receipt:v1';
export type Saved = { history: Receipt[]; draft: string; current?: Receipt };
function validReceipt(value: unknown): value is Receipt {
  if (!value || typeof value !== 'object') return false;
  const r=value as Receipt;
  return typeof r.id==='string' && r.id.length<100 && typeof r.date==='string' && Number.isFinite(Date.parse(r.date)) && typeof r.input==='string' && r.input.length<=2000 && styles.some(s=>s.id===r.style) && Array.isArray(r.items) && r.items.length>0 && r.items.length<=30 && r.items.every(i=>i && typeof i.id==='string' && typeof i.raw==='string' && i.raw.length<=2000 && typeof i.rule==='string' && Number.isInteger(i.quantity) && i.quantity>=1 && i.quantity<=99 && Number.isInteger(i.unit) && Math.abs(i.unit)<=100 && (i.customName===undefined || typeof i.customName==='string' && i.customName.length<=200));
}
export function readSaved(): { data: Saved; warning: string } {
  try {
    const raw=localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data:{history:[],draft:''}, warning:'' };
    const saved=JSON.parse(raw);
    if (!saved || !Array.isArray(saved.history) || !saved.history.every(validReceipt) || typeof saved.draft!=='string' || saved.draft.length>2000 || saved.current && !validReceipt(saved.current)) throw new Error('invalid');
    return { data:{...saved,history:saved.history.slice(0,20)}, warning:'' };
  } catch { return { data:{history:[],draft:''}, warning:'本地记录暂时无法读取。为保护原记录，本次不自动写入存储；仍可生成和导出 PNG，刷新将丢失本次内容。' }; }
}
export function writeSaved(saved: Saved) { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
export function remember(history: Receipt[], receipt: Receipt) { return [receipt,...history.filter(r=>r.id!==receipt.id)].slice(0,20); }
