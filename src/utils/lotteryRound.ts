import type {Draw} from '../components/activity/LotteryManager';
import {seatLabel} from './checkInLabels';
export const sameLotteryScope=(a:Draw,b:Draw)=>a.source==='ACTIVITY'&&b.source==='ACTIVITY'&&a.activityId===b.activityId&&(a.sessionId||'session-1')===(b.sessionId||'session-1');
const identity=(p:{employeeId:string;id:string})=>p.employeeId.trim().toLowerCase()||p.id;
export function lotteryProgress(d:Draw,prizeId:string){const rows=d.winners.filter(w=>w.prizeId===prizeId);return d.mode==='TABLE'?new Set(rows.map(w=>seatLabel(w.seat))).size:rows.length;}
export function lotteryPool(d:Draw,all:Draw[],prizeId:string){
 const own=[...d.winners,...(d.pending||[])];
 const excluded=d.repeat?own.filter(w=>w.prizeId===prizeId):[...own,...all.filter(x=>x.id!==d.id&&sameLotteryScope(d,x)).flatMap(x=>[...x.winners,...(x.pending||[])])];
 const ids=new Set(excluded.map(identity));const used=new Set(own.filter(w=>w.prizeId===prizeId).map(w=>seatLabel(w.seat)));
 return [...new Map(d.people.map(p=>[identity(p),p])).values()].filter(p=>!ids.has(identity(p))&&(d.mode!=='TABLE'||(!!p.seat&&(d.groups||[]).includes(p.group)&&!used.has(seatLabel(p.seat)))));
}
