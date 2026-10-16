import type {Activity,CheckInConfig} from '../types';
import {defaultCheckIn} from './checkIn';
export function sessionConfig(a:Activity):CheckInConfig {
 const c=a.checkIn||defaultCheckIn();
 if(c.sessions?.length)return {...c,people:c.people.map(p=>({...p,sessionId:p.sessionId||c.sessions![0].id}))};
 const {people,sessions,...base}=c;
 return {...c,sessions:[{...base,id:'session-1',name:'場次一'},{...base,groups:[],id:'session-2',name:'場次二'}],people:people.map(p=>({...p,sessionId:'session-1'}))};
}
export function sessionActivity(a:Activity,id:string):Activity {
 const c=sessionConfig(a),s=c.sessions!.find(s=>s.id===id)||c.sessions![0];
 return {...a,checkIn:{...c,...s,sessions:undefined,activeSessionId:s.id,people:c.people.filter(p=>p.sessionId===s.id)}};
}
export function mergeSession(a:Activity,next:Activity,id:string):Activity {
 const c=sessionConfig(a),{people,sessions,activeSessionId,...settings}=next.checkIn!;
 return {...a,status:next.status,updatedAt:next.updatedAt,checkIn:{...c,sessions:c.sessions!.map(s=>s.id===id?{...s,...settings,id:s.id}:s),people:[...c.people.filter(p=>p.sessionId!==id),...people.map(p=>({...p,sessionId:id}))]}};
}
export const checkInCode=(a:Activity,p:{token:string;sessionId?:string})=>`GO-CHECKIN:${a.id}:${p.sessionId||a.checkIn?.activeSessionId||'session-1'}:${p.token}`;

export function transferSession(a:Activity,personId:string,target:string):Activity {
 const c=sessionConfig(a),p=c.people.find(p=>p.id===personId);
 if(!p||!c.sessions!.some(s=>s.id===target))throw new Error('人員或場次不存在。');
 if(p.checkedAt)throw new Error('已簽到人員不可調整場次。');
 if(p.sessionId===target)return a;
 return {...a,checkIn:{...c,people:c.people.map(x=>x.id===personId?{...x,sessionId:target,group:'',seat:'',token:crypto.randomUUID(),invitationReady:false,needsResend:x.mailStatus==='SENT'||x.needsResend}:x)}};
}
