import type {CheckInConfig,CheckInPerson} from '../types';
export const seatingGroups=(c:CheckInConfig)=>[...new Set([...(c.groups||[]),...c.people.map(p=>p.group)].filter(Boolean))];
export function seatingProblem(people:CheckInPerson[],capacity:number,seats:boolean){
 for(const group of new Set(people.map(p=>p.group).filter(Boolean))){const rows=people.filter(p=>p.group===group);if(rows.length>capacity)return `${group} 已超出 ${capacity} 人上限。`;const used=rows.map(p=>p.seat).filter(Boolean);if(seats&&(new Set(used).size!==used.length||used.some(s=>!/^\d+$/.test(s)||+s<1||+s>capacity)))return `${group} 的座位重複或超出範圍。`;}
 return '';
}
export function movePeople(people:CheckInPerson[],ids:string[],group:string,capacity:number,seats:boolean,seat=''){
 const targets=people.filter(p=>ids.includes(p.id));const occupied=people.filter(p=>p.group===group&&!ids.includes(p.id));
 if(group&&occupied.length+targets.length>capacity)throw Error('目標枱／組剩餘名額不足。');
 const available=Array.from({length:capacity},(_,i)=>String(i+1)).filter(s=>!occupied.some(p=>p.seat===s));
 if(group&&seats&&targets.length===1&&seat&&!available.includes(seat))throw Error('此座位已被使用。');
 let index=0;return people.map(p=>ids.includes(p.id)?{...p,group,seat:group&&seats?(targets.length===1&&seat?seat:available[index++]):''}:p);
}
export function applySeating(current:CheckInPerson[],draft:CheckInPerson[]){return current.map(p=>{const d=draft.find(d=>d.id===p.id);return !d||(d.group===p.group&&d.seat===p.seat)?p:{...p,group:d.group,seat:d.seat,invitationReady:false,needsResend:p.mailStatus==='SENT'||p.needsResend};});}
