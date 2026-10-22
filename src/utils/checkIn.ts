import {seatLabel} from './checkInLabels';
import type { Activity, CheckInConfig, CheckInPerson } from '../types';
export const localTime = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${d.toTimeString().slice(0,8)}`; };
export const defaultCheckIn = (): CheckInConfig => ({location:'', opensAt:'', grouping:'NONE', groupLabel:'組', capacity:10, seats:false, people:[]});
export function activityDisplayStatus(a: Activity, now=Date.now()) {
  if(a.status==='DRAFT') return '草稿';
  if(a.status==='ENDED' || now >= Date.parse(a.endTime.replace(' ','T'))) return '已結束';
  return now < Date.parse(a.startTime.replace(' ','T')) ? '待開始' : '進行中';
}
export function publishProblem(a: Activity): string {
  if(!a.title.trim() || !a.startTime || !a.endTime) return '請填寫活動名稱、開始及結束時間。';
  const start=Date.parse(a.startTime.replace(' ','T')), end=Date.parse(a.endTime.replace(' ','T'));
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start) return '活動結束時間須晚於開始時間。';
  if(!a.modules.some(m=>m.enabled&&m.type==='CHECK_IN')) return '';
  const c=a.checkIn;
  if(c?.sessions?.length){for(const session of c.sessions){const problem=publishProblem({...a,checkIn:{...session,people:c.people.filter(p=>(p.sessionId||c.sessions![0].id)===session.id),sessions:undefined}});if(problem)return `${session.name}：${problem}`;}return '';}
  const settingsError=checkInSettingsProblem(a);if(settingsError)return settingsError;
  if(!c?.location.trim() || !c.opensAt) return '請填寫活動地點及簽到開放時間。';
  const opens=Date.parse(c.opensAt.replace(' ','T'));
  if(!Number.isFinite(opens)||opens>end) return '簽到開放時間須早於活動結束時間。';
  if(!c.people.length) return '請保存草稿後，先導入參與名單。';
  if(c.grouping==='GROUP' && c.people.some(p=>!p.group || (c.seats&&!p.seat))) return '請先完成所有人員的分組及座位安排。';
  const assigned=c.people.map(p=>`${p.group}:${p.seat}`);
  if(c.grouping==='GROUP'&&c.seats&&new Set(assigned).size!==assigned.length) return '同一組內座位號不可重複。';
  if(c.grouping==='GROUP'&&(!Number.isInteger(c.capacity)||c.capacity<1||c.people.some(p=>c.people.filter(x=>x.group===p.group).length>c.capacity))) return '分組人數超過設定容量，請調整安排。';
  if(c.people.some(p=>!p.invitationReady)) return '請先生成並確認所有邀請函，再發布活動。';
  return '';
}
export function checkInProblem(a: Activity, p: CheckInPerson|undefined, now=Date.now()) {
  if(!p) return '無效二維碼或不屬於本活動。';
  if(p.checkedAt) return `已簽到：${p.checkedAt}，不可重複核銷。`;
  if(a.status!=='PUBLISHED') return '活動尚未發布或已結束，不能簽到。';
  const opens=Date.parse((a.checkIn?.opensAt||'').replace(' ','T'));
  const end=Date.parse((a.checkIn?.closesAt||a.endTime).replace(' ','T'));
  if(!Number.isFinite(opens)||!Number.isFinite(end)||now<opens) return '尚未到簽到開放時間。';
  if(now>=end) return a.checkIn?.closesAt?'簽到已截止。':'活動已結束，不能簽到。';
  return '';
}
export function assignGroups(c: CheckInConfig): CheckInPerson[] {
  const capacity=Math.max(1,Math.floor(c.capacity));
  const ordered=[...c.people].sort((a,b)=>a.department.localeCompare(b.department,'zh-Hant'));
  return ordered.map((p,i)=>({...p,group:String(Math.floor(i/capacity)+1),seat:c.seats?String(i%capacity+1):'',invitationReady:false,needsResend:p.mailStatus==='SENT'||p.needsResend}));
}
export function parsePeopleCSV(text:string, existing:CheckInPerson[]) {
  const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
  const input=text.replace(/^\uFEFF/,'');
  for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field.trim());field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}
  row.push(field.trim());if(row.some(Boolean))rows.push(row);
  if(quoted) throw new Error('CSV 引號未閉合。');
  if(rows.shift()?.join(',')!=='員工編號,姓名,部門,電郵') throw new Error('請使用模板：員工編號、姓名、部門、電郵。');
  const ids=new Set(existing.map(p=>p.employeeId)),emails=new Set(existing.map(p=>p.email.toLowerCase()));
  const people:CheckInPerson[]=[],errors:string[]=[];
  rows.forEach((r,i)=>{const [employeeId,name,department,email]=r;
    if(r.length!==4||!employeeId||!name||!department||!email||!/^\S+@\S+\.\S+$/.test(email)){errors.push(`第 ${i+2} 行資料缺漏或電郵格式錯誤`);return;}
    if(ids.has(employeeId)||emails.has(email.toLowerCase())){errors.push(`第 ${i+2} 行員工或電郵重複`);return;}
    ids.add(employeeId);emails.add(email.toLowerCase());people.push({id:crypto.randomUUID(),employeeId,name,department,email,group:'',seat:'',token:crypto.randomUUID(),mailStatus:'NOT_SENT'});
  });return {people,errors};
}
export function downloadCSV(name:string,rows:string[][]){const data='\uFEFF'+rows.map(r=>r.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\n');const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export function banquetDemo(): Activity {
  const date=localTime().slice(0,10);const now=localTime();
  return {id:'ACT-DEMO-BANQUET',title:'新春盆菜宴',description:'同聚一堂，共迎新春。請攜帶個人邀請函到場簽到。',startTime:date+' 18:00:00',endTime:date+' 23:59:59',status:'DRAFT',modules:[{id:'BANQUET-CHECKIN',type:'CHECK_IN',title:'活動簽到',enabled:true,order:1}],creator:'系統管理員',createdAt:now,updatedAt:now,checkIn:{...defaultCheckIn(),location:'TVB 電視城宴會廳',opensAt:date+' 00:00:00',grouping:'GROUP',groupLabel:'桌',seats:true}};
}

/** Prepared demo records; never replaces an existing participant list. */
export function completeBanquetDemo(): Activity {
  const a=banquetDemo();
  const date=a.startTime.slice(0,10);
  const names=['陳志明','李嘉欣','黃偉文','張美玲','林家豪','何詠晴','劉俊傑','吳雅婷','鄭文軒','梁芷欣','周子健','徐佩珊','郭志豪','馬嘉敏','羅俊熙','謝穎欣','許家樂','鄧詠儀','馮文浩','蔡美琪','曾偉霖','潘嘉怡','葉志遠','鍾慧敏','蘇家俊','盧雅雯','杜振宇','彭思穎'];
  const people:CheckInPerson[]=names.map((name,i)=>({
    id:`BANQUET-PERSON-${i+1}`,employeeId:`DEMO${i+1}`,name,
    department:['行政部','財務部','製作部'][Math.floor(i/10)],email:`staff${i+1}@example.com`,
    group:String(Math.floor(i/10)+1),seat:String(i%10+1),token:crypto.randomUUID(),invitationReady:true,
    mailStatus:i<24?'SENT':i<26?'NOT_SENT':'FAILED',
    ...(i<24?{sentAt:date+' 08:00:00'}:{}),
    ...(i<18?{checkedAt:date+` 08:${String(10+i).padStart(2,'0')}:00`}:{})
  }));
  return {...a,status:'PUBLISHED',description:'新春盆菜宴完整演示：28 位員工、3 桌，包含邀請函、電郵發送及現場簽到示例資料。',rules:'請出示個人邀請函二維碼核驗入場，按指定桌號及座位入座。每張邀請函只可簽到一次。',checkIn:{...a.checkIn!,people}};
}

export function prepareBanquetDemo(activities:Activity[]):Activity[] {
  return activities.map(a=>{
    if(a.id!=='ACT-DEMO-BANQUET'||a.checkIn?.people.length) return a;
    const demo=completeBanquetDemo();
    return {...a,status:demo.status,description:demo.description,rules:a.rules||demo.rules,
      modules:[...a.modules.filter(m=>m.type!=='CHECK_IN'),demo.modules[0]],
      checkIn:{...demo.checkIn!,...a.checkIn,people:demo.checkIn!.people}};
  });
}

const invitationFields = '\n\n場次：{場次名稱}\n簽到時間：{簽到開始時間} 至 {簽到截止時間}\n活動地點：{活動地點}\n簽到位置：{簽到位置}\n枱號：{枱號}\n座位號：{座位號}';
export const invitationCopy = '{姓名}，您好！誠邀您參加 {活動名稱}。'+invitationFields+'\n\n請於入場時出示個人二維碼。';
export const invitationEmailSubject = '活動邀請｜{活動名稱}';
const previousInvitationEmailBody = '{姓名}，您好！誠邀您參加 {活動名稱}。'+invitationFields+'\n\n請點擊下方按鈕查看您的電子邀請函，並於入場時出示二維碼。';
export const invitationEmailBody = '誠邀您出席！活動詳情請見下方電子邀請函，入場時請出示函內的個人二維碼。';
export function invitationTemplate(value:string|undefined,email=false){
 const old=email?'您好！誠邀您參加本次活動。請點擊下方按鈕查看您的電子邀請函，並於入場時出示二維碼。':'誠邀您出席，請攜帶此電子邀請函，並於入場時出示個人二維碼。';
 return value===undefined||value===old||(email&&value===previousInvitationEmailBody)?(email?invitationEmailBody:invitationCopy):value;
}
export function renderInvitationText(text:string,a:Activity,p?:CheckInPerson){
 const c=a.checkIn;
 const fields:Record<string,string>={'姓名':p?.name||'待選擇人員','部門':p?.department||'待選擇人員','活動名稱':a.title,'場次名稱':(c as CheckInConfig & {name?:string})?.name||'待選擇場次','場次時間':`${c?.opensAt||'待配置'} — ${c?.closesAt||a.endTime}`,'簽到開始時間':c?.opensAt||'待配置','簽到截止時間':c?.closesAt||a.endTime||'待配置','活動地點':c?.location||'待配置','簽到位置':c?.checkInLocation?.trim()||'於活動地點簽到','枱號':p?.group||'待分配','座位號':seatLabel(p?.seat||'')||'待分配'};
 return text.split('\n').filter(line=>!(c?.grouping!=='GROUP'&&/\{(枱號|座位號)\}/.test(line))&&!(c?.seats===false&&line.includes('{座位號}'))).join('\n').replace(/\{([^{}]+)\}/g,(token,key)=>fields[key]??token);
}

export function checkInSettingsProblem(a:Activity):string {
 const c=a.checkIn;if(c?.sessions?.length){for(const session of c.sessions){if(!session.name.trim())return '請填寫場次名稱。';const problem=checkInSettingsProblem({...a,checkIn:{...session,people:c.people.filter(p=>p.sessionId===session.id),sessions:undefined}});if(problem)return `${session.name}：${problem}`;}return '';}if(!c)return '請先配置簽到資料。';
 if(c.registrationMode==='OPEN'){const start=Date.parse((c.registrationStart||'').replace(' ','T')),end=Date.parse((c.registrationEnd||'').replace(' ','T'));if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return '請設定有效的報名起止時間。';if(!Number.isInteger(c.registrationCapacity)||c.registrationCapacity!<1)return '請設定正整數報名名額。';if(end>Date.parse((c.closesAt||a.endTime).replace(' ','T')))return '報名截止時間不可晚於簽到截止時間。';}
 if(!c.location.trim())return '請填寫活動地點。';
 const open=Date.parse(c.opensAt.replace(' ','T')),close=Date.parse((c.closesAt||a.endTime).replace(' ','T')),end=Date.parse(a.endTime.replace(' ','T'));
 if(!Number.isFinite(open)||!Number.isFinite(close)||close<=open)return '簽到截止時間須晚於開放時間。';
 if(Number.isFinite(end)&&close>end)return '簽到截止時間不可晚於活動結束時間。';
 if(c.grouping==='GROUP'&&(!Number.isInteger(c.capacity)||c.capacity<1))return '每組人數須為正整數。';
 if(c.emailSubject!==undefined&&!c.emailSubject.trim())return '請填寫電郵主旨。';
 if(c.emailBody!==undefined&&!c.emailBody.trim())return '請填寫電郵正文。';
 if(c.emailSendAt){const send=Date.parse(c.emailSendAt.replace(' ','T'));if(!Number.isFinite(send)||send>=close)return '電郵發送時間須早於簽到截止時間。';}
 return '';
}
export function checkInSendProblem(a:Activity,now=Date.now()):string {
 if(!a.modules.some(m=>m.type==='CHECK_IN'&&m.enabled)||a.status!=='PUBLISHED')return '請先關聯並發布活動，再發送電郵。';
 const problem=checkInSettingsProblem(a);if(problem)return problem;
 if(a.checkIn?.emailSendAt&&now<Date.parse(a.checkIn.emailSendAt.replace(' ','T')))return '尚未到設定的電郵發送時間。本演示不會自動寄信，到時可手動模擬發送。';
 return '';
}
