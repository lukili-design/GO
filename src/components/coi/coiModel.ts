import {useSyncExternalStore} from 'react';
import {policyStaff} from '../policies/policyModel';
import type {PolicyNotificationSettings} from '../policies/PolicyNotifications';
export type CoiStatus='UPDATED'|'REVIEW'|'EXEMPT';
export const statusLabels:Record<CoiStatus,string>={UPDATED:'已更新',REVIEW:'年度覆核到期',EXEMPT:'毋須申報'};
export type CoiPerson={employeeId:string;status:CoiStatus;submitted?:string;reviewed?:string;reference?:string;nextDue?:string};
export type Coi={id:string;name:string;year:string;description:string;deadline?:string;url:string;people:CoiPerson[];notifications?:PolicyNotificationSettings;demo?:boolean};
export const demo:Coi={id:'COI-DEMO-2026',name:'COI申報',year:'2026',description:'請前往外部合規平台完成年度申報；本頁只展示合規狀態，不儲存申報詳情。',deadline:'2026-12-31T18:00',url:'',demo:true,people:policyStaff.map((s,i)=>({employeeId:s.employeeId,status:(['REVIEW','UPDATED','REVIEW','REVIEW','EXEMPT'] as CoiStatus[])[i%5],...(i%5===1?{submitted:'2026-11-06 09:00',reviewed:'2026-11-06 09:00',reference:`COI-2026-${s.employeeId}`}:{})}))};
const key='go-coi-v1';
let items:Coi[];try{items=JSON.parse(localStorage.getItem(key)||'null')||[demo]}catch{items=[demo]}
export function normalizeCoi(item:Coi):Coi {
 return {...item,name:/^(2026 )?(年度利益衝突申報|年度 COI 申報|COI申報)（演示）$/.test(item.name)?'COI申報':item.name,people:item.people.map((p,i)=>({...p,status:p.status==='UPDATED'||p.status==='EXEMPT'?p.status:'REVIEW',nextDue:p.nextDue||(item.demo&&p.status!=='EXEMPT'?`202${p.status==='UPDATED'?'7':'6'}-${String(11+i%2).padStart(2,'0')}-15 18:00`:undefined)})),notifications:item.notifications?{...item.notifications,...Object.fromEntries(['push','popup','email','escalation'].map(k=>{const t=item.notifications![k as 'push'];return [k,{...t,audience:(t.audience as string)==='OVERDUE'?'PENDING':t.audience}]}))}:undefined};
}
items=items.map(normalizeCoi);
const listeners=new Set<()=>void>();
export function saveCoi(item:Coi){const next=items.some(x=>x.id===item.id)?items.map(x=>x.id===item.id?item:x):[item,...items];localStorage.setItem(key,JSON.stringify(next));items=next;listeners.forEach(f=>f())}
window.addEventListener('storage',e=>{if(e.key===key){try{items=JSON.parse(e.newValue||'[]');listeners.forEach(f=>f())}catch{}}});
export function useCoi(){return useSyncExternalStore(cb=>{listeners.add(cb);return()=>{listeners.delete(cb)}},()=>items)}
export function personStatus(c:Coi,p:CoiPerson):CoiStatus{return p.status==='UPDATED'||p.status==='EXEMPT'?p.status:'REVIEW'}
export function coiRows(c:Coi){return normalizeCoi(c).people.flatMap(p=>{const s=policyStaff.find(x=>x.employeeId===p.employeeId);return s?[{...s,...p,status:personStatus(c,p)}]:[]})}
export function validLink(url:string){try{return ['https:','http:'].includes(new URL(url).protocol)}catch{return false}}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function importIds(text:string,existing:string[]){const seen=new Set(existing);return text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim()).map((line,i)=>{const id=line.split(',')[0].trim().replace(/^"|"$/g,'');if(i===0&&['員工編號','employeeId'].includes(id))return null;const staff=policyStaff.find(s=>s.employeeId===id),result=!staff?'找不到員工':seen.has(id)?'重複／已在名單':'可匯入';seen.add(id);return {id,name:staff?.name||'—',result}}).filter((x):x is {id:string;name:string;result:string}=>!!x)}

export function coiArticles(){return items.map(c=>({id:'ART-'+c.id,title:c.name,titleEn:'Annual COI Declaration',category:'COI申報',author:'人力資源部',coverImage:'',summary:c.description,content:c.description,contentType:'TEXT' as const,status:'PUBLISHED' as const,publishDate:'2026-11-07 09:00:00',viewCount:0,linkedCampaignIds:[],visibility:{mode:'STAFF_TYPES' as const,ids:['S','E','A']},pinned:true,coi:c}))}

export const coiStatusColors:Record<CoiStatus,string>={UPDATED:'bg-emerald-100 text-emerald-800',REVIEW:'bg-amber-100 text-amber-800',EXEMPT:'bg-slate-200 text-slate-600'};
