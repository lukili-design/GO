import type {PolicyNotificationSettings} from './PolicyNotifications';
import {useSyncExternalStore} from 'react';
import type {VoteArticle,ArticleContentType} from '../../types';
import {COMPANY_STAFF_DATABASE} from '../../utils/employeeDirectory';
// Organization labels below are demonstration data, not an HR directory integration.
export const policyStaff=COMPANY_STAFF_DATABASE.map((staff,index)=>({...staff,company:'TVB',
 division:index<6?'節目及內容事業部':'企業服務事業部',
 businessUnit:index<6?'內容製作':'營運支援',
 office:index===2?'將軍澳新聞中心':index===8?'九龍灣辦公室':'將軍澳電視城'
}));
export const policyUser={...policyStaff.find(s=>s.employeeId==='EMP002')!,staffType:'S'};
export type PolicyFile={name:string;ref:string};
export type PolicyVersion={notifications?:PolicyNotificationSettings;version:number;round:string;title:string;content:string;contentType?:ArticleContentType;richContent?:string;linkUrl?:string;videoFile?:PolicyFile;mode:'TEXT'|'PDF';pdf?:PolicyFile;attachments:PolicyFile[];signature:boolean;buttonText?:string;readDelaySeconds?:number;targets:string[];publishedAt:string};
export type PolicyConfig={notifications?:PolicyNotificationSettings;enabled:boolean;mode:'TEXT'|'PDF';pdf?:PolicyFile;attachments:PolicyFile[];signature:boolean;buttonText?:string;readDelaySeconds?:number;reconfirm:boolean;versions:PolicyVersion[];targets:string[];demoRecordsVersion?:number;push:boolean;email:boolean;remindAt:string;reminderEnabled?:boolean;reminderFrequency?:'ONCE'|'DAILY'|'WEEKLY';escalate:string[]};
export const newPolicy=():PolicyConfig=>({enabled:true,readDelaySeconds:0,buttonText:'已閱讀並同意',mode:'TEXT',attachments:[],signature:false,reconfirm:true,versions:[],targets:policyStaff.map(s=>s.employeeId),push:true,email:false,remindAt:'',escalate:[]});
export type PolicyRecord={articleId:string;round:string;employeeId:string;openedAt:string;agreedAt?:string;version?:number;signature?:string};
const key='go-policy-records-v1';
let raw=localStorage.getItem(key)||'[]';
let records:PolicyRecord[];try{records=JSON.parse(raw)}catch{records=[]}
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(l=>l());
window.addEventListener('storage',e=>{if(e.key===key){try{records=JSON.parse(e.newValue||'[]');emit()}catch{}}});
export function usePolicyRecords(){return useSyncExternalStore(cb=>{listeners.add(cb);return()=>{listeners.delete(cb)}},()=>records)}
export function writePolicyRecord(record:PolicyRecord){const old=records.find(r=>r.articleId===record.articleId&&r.round===record.round&&r.employeeId===record.employeeId);if(old?.agreedAt)return;const next=[...records.filter(r=>r!==old),{...old,...record,openedAt:old?.openedAt||record.openedAt}];localStorage.setItem(key,JSON.stringify(next));records=next;emit();}
export function policyVersionChanged(article:VoteArticle){
 const p=article.policy;if(!p?.enabled||article.status!=='PUBLISHED')return false;
 const last=p.versions.at(-1);return !last||(last.readDelaySeconds||0)!==(p.readDelaySeconds||0)||(last.buttonText||'已閱讀並同意')!==(p.buttonText?.trim()||'已閱讀並同意')||last.contentType!==article.contentType||last.richContent!==article.richContent||last.linkUrl!==article.linkUrl||JSON.stringify(last.videoFile)!==JSON.stringify(article.videoFile)||last.title!==article.title||last.content!==article.content||last.mode!==p.mode||last.signature!==p.signature||JSON.stringify(last.pdf)!==JSON.stringify(p.pdf)||JSON.stringify(last.attachments)!==JSON.stringify(p.attachments);
}
export function reminderDateErrors(settings?:PolicyNotificationSettings,now=Date.now()){
 if(!settings)return [];
 const names={push:'APP Push 提醒',popup:'APP 內彈窗提醒',email:'電郵提醒',escalation:'升級跟進'};
 return (Object.keys(names) as (keyof typeof names)[]).flatMap(key=>{
  const c=settings[key];if(!c.enabled||c.timing!=='SCHEDULED')return [];
  let next=new Date(c.at+'+08:00').getTime();
  if(c.frequency!=='ONCE'){
   if(!c.startDate||!c.endDate||!c.sendTime||c.endDate<c.startDate)return [names[key]];
   next=Math.max(new Date(c.startDate+'T'+c.sendTime+'+08:00').getTime(),new Date(new Date(now+28800000).toISOString().slice(0,10)+'T'+c.sendTime+'+08:00').getTime());
   if(next<=now)next+=86400000;
   if(c.frequency==='WEEKLY'){
    if(!/^[0-6]$/.test(c.weekday||''))return [names[key]];
    next+=((Number(c.weekday)-new Date(next+28800000).getUTCDay()+7)%7)*86400000;
   }
   if(next>new Date(c.endDate+'T'+c.sendTime+'+08:00').getTime())return [names[key]];
  }
  return !Number.isFinite(next)||next<=now?[names[key]]:[];
 });
}
export function publishPolicy(article:VoteArticle,activateReminders=false):VoteArticle{
 const p=article.policy;if(!p?.enabled||article.status!=='PUBLISHED')return article;
 const last=p.versions.at(-1);const changed=policyVersionChanged(article);
 if(!changed)return article;
 const version=(last?.version||0)+1;
 const snapshot:PolicyVersion={version,round:!last||p.reconfirm?crypto.randomUUID():last.round,title:article.title,content:article.content,contentType:article.contentType,richContent:article.richContent,linkUrl:article.linkUrl,videoFile:article.videoFile,mode:p.mode,pdf:p.pdf,attachments:p.attachments,signature:p.signature,buttonText:p.buttonText?.trim()||'已閱讀並同意',readDelaySeconds:p.readDelaySeconds||0,targets:[...p.targets],publishedAt:new Date().toISOString()};
 let notifications=p.notifications;
 const history=p.versions.map(v=>v===last?{...v,notifications:p.notifications}:v);
 if(last&&p.reconfirm){
  if(activateReminders&&reminderDateErrors(notifications).length)throw new Error("請先更新已過期或無效的提醒日期。");
  if(notifications&&!activateReminders)notifications={...notifications,...Object.fromEntries(['push','popup','email','escalation'].map(k=>[k,{...notifications![k as 'push'],enabled:false}]))};
  const jobsKey='go-policy-notification-jobs';let jobs:any[]=[];try{jobs=JSON.parse(localStorage.getItem(jobsKey)||'[]')}catch{}
  const stopped=jobs.map(j=>j.articleId===article.id&&j.template?.timing==='SCHEDULED'&&j.status!=='STOPPED'&&!j.sentAt?{...j,status:'STOPPED',stoppedAt:new Date().toISOString(),stopReason:'發布新版本並要求重新確認，舊排程已停止。'}:j);
  const newJobs=activateReminders&&notifications?(['push','popup','email','escalation'] as const).filter(channel=>notifications![channel].enabled&&notifications![channel].timing==='SCHEDULED').map(channel=>{
   const people=policyStaff.filter(s=>p.targets.includes(s.employeeId));
   const recipients=notifications!.recipients.map(r=>({...r,employeeIds:people.filter(s=>r.role==='hr'||(r.role==='department'?s.dept:s.division)===r.scope).map(s=>s.employeeId)})).filter(r=>r.employeeIds.length);
   return {id:crypto.randomUUID(),articleId:article.id,version,channel,template:{...notifications![channel]},at:new Date().toISOString(),employeeIds:people.map(s=>s.employeeId),recipients:channel==='escalation'?recipients:[],status:'DEMO_ONLY'};
  }):[];
  localStorage.setItem(jobsKey,JSON.stringify([...stopped,...newJobs]));
 }
 return {...article,policy:{...p,notifications,versions:[...history,{...snapshot,notifications}]}};
}
export const policyDemo:VoteArticle=publishPolicy({id:'ART-POLICY-DEMO',title:'集團政策與程序：員工行為守則（演示）',category:'政策同意書',titleEn:'Group Policy and Procedures: Employee Code of Conduct (Demo)',contentType:'TEXT',author:'人力資源部',coverImage:new URL('../../assets/banquet-banner.svg',import.meta.url).href,summary:'請閱讀本政策，並於閱讀完畢後確認已閱讀並同意。',content:'一、政策目的\n本演示政策用於展示員工閱讀確認及手寫簽名流程，並非正式公司政策。\n\n二、適用範圍\n所有獲指定的員工均須閱讀相關內容，了解工作中應遵守的要求。\n\n三、工作操守\n員工應以誠信及專業態度履行職責，尊重同事及合作夥伴，妥善處理工作資料。\n\n四、資料保護\n處理公司資料時，應依照公司適用程序及授權範圍使用。如有疑問，請向所屬部門或人力資源部查詢。\n\n五、政策更新\n政策更新後，管理員可要求員工再次確認。系統會保留各版本的確認時間。\n\n六、閱讀確認\n請閱讀至本頁底部，點擊「已閱讀並同意」，並完成手寫簽名。',linkedCampaignIds:[],status:'PUBLISHED',publishDate:'2026-11-05 09:00:00',viewCount:0,policy:{...newPolicy(),signature:true}});

// Populate only the explicitly labelled demonstration article, once per fixture revision.
export function preparePolicyDemo(article:VoteArticle):VoteArticle {
 if(article.id!=='ART-POLICY-DEMO'||!article.policy||(article.policy.demoRecordsVersion||0)>=1)return article;
 const p=article.policy,v=p.versions[0];
 if(v){
  const additions:PolicyRecord[]=policyStaff.slice(0,7).filter(s=>!records.some(r=>r.articleId===article.id&&r.round===v.round&&r.employeeId===s.employeeId)).map((s,index)=>({
   articleId:article.id,round:v.round,employeeId:s.employeeId,openedAt:`2026-11-05T0${index+1}:00:00+08:00`,
   ...(index<4?{agreedAt:`2026-11-05T0${index+1}:05:00+08:00`,version:v.version,signature:v.signature?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160"><rect width="480" height="160" fill="white"/><text x="30" y="90" font-size="30" fill="#64748b">DEMO SIGNATURE</text></svg>'):undefined}:{})
  }));
  records=[...records,...additions];localStorage.setItem(key,JSON.stringify(records));
 }
 return {...article,policy:{...p,demoRecordsVersion:1,targets:policyStaff.map(s=>s.employeeId)}};
}

export const confirmedPolicyDemo:VoteArticle=publishPolicy({...policyDemo,id:'ART-POLICY-CONFIRMED-DEMO',title:'資料保密政策（演示）',titleEn:'Information Confidentiality Policy (Demo)',pinned:true,summary:'了解公司資料保密要求，並保留你的閱讀確認記錄。',content:'本文件僅供閱讀確認功能演示，並非正式公司政策。\n\n一、資料保密\n妥善保管工作資料，僅在授權範圍內使用。\n\n二、分享資料\n分享前確認接收對象及資料範圍。\n\n三、閱讀確認\n閱讀完成後確認已閱讀並同意。',policy:{...newPolicy(),signature:false}});
export function preparePolicyShowcase(article:VoteArticle):VoteArticle {
 if(!article.policy)return article;
 if(article.id===confirmedPolicyDemo.id){const v=article.policy.versions.at(-1);if(article.policy.demoRecordsVersion!==2&&v){writePolicyRecord({articleId:article.id,round:v.round,employeeId:policyUser.employeeId,version:v.version,openedAt:'2026-11-06T09:00:00+08:00',agreedAt:'2026-11-06T09:05:00+08:00'});return {...article,pinned:true,policy:{...article.policy,demoRecordsVersion:2}};}return article;}
 if(article.id!==policyDemo.id||(article.policy.demoRecordsVersion||0)>=3)return article;
 const p=article.policy,last=p.versions.at(-1);if(!last)return article;
 // Keep previous confirmations as history; create one new demo round for the pending example.
 const next={...last,version:last.version+1,round:crypto.randomUUID(),publishedAt:new Date().toISOString()};
 const copies=records.filter(r=>r.articleId===article.id&&r.round===last.round&&r.employeeId!==policyUser.employeeId).map(r=>({...r,round:next.round,version:r.version?next.version:undefined}));
 records=[...records,...copies];localStorage.setItem(key,JSON.stringify(records));
 return {...article,pinned:true,policy:{...p,demoRecordsVersion:3,versions:[...p.versions,next]}};
}
