import type {Activity,CheckInPerson} from '../types';
import {sessionConfig} from './checkInSessions';
export const appEmployee={employeeId:'TVB-8821',name:'陳大文 (Tai Man Chan)',department:'綜藝節目部',email:'taiman@example.com'};
export function registerActivity(a:Activity,sessionId:string,employee=appEmployee,now=Date.now()):Activity{
 const c=sessionConfig(a),s=c.sessions!.find(s=>s.id===sessionId);
 if(a.status!=='PUBLISHED'||Date.parse(a.endTime.replace(' ','T'))<=now)throw Error('活動尚未發佈或已結束。');
 if(!a.modules.some(m=>m.enabled&&m.type==='CHECK_IN')||!s||s.registrationMode!=='OPEN')throw Error('此場次不開放報名。');
 const start=Date.parse((s.registrationStart||'').replace(' ','T')),end=Date.parse((s.registrationEnd||'').replace(' ','T'));
 if(!Number.isFinite(start)||!Number.isFinite(end)||now<start||now>=end)throw Error('目前不在報名時間內。');
 if(c.people.some(p=>p.employeeId===employee.employeeId))throw Error('您已參加此活動的場次，不能重複報名。');
 if(!Number.isInteger(s.registrationCapacity)||s.registrationCapacity!<1||c.people.filter(p=>p.sessionId===sessionId).length>=s.registrationCapacity!)throw Error('此場次名額已滿。');
 const person:CheckInPerson={...employee,id:crypto.randomUUID(),sessionId,token:crypto.randomUUID(),group:'',seat:'',invitationReady:false,mailStatus:'NOT_SENT'};
 return {...a,checkIn:{...c,people:[...c.people,person]}};
}
