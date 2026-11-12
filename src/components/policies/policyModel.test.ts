import {test} from 'node:test';
import assert from 'node:assert/strict';
const store=new Map<string,string>();
Object.assign(globalThis,{localStorage:{getItem:(key:string)=>store.get(key)||null,setItem:(key:string,v:string)=>store.set(key,v)},window:{addEventListener:()=>{}}});
const {publishPolicy,policyDemo,writePolicyRecord}=await import('./policyModel');
test('new confirmation round preserves previous signed version',()=>{
 const first=structuredClone(policyDemo),round=first.policy!.versions[0].round;
 const next=publishPolicy({...first,content:first.content+'\nUpdated'});
 assert.equal(next.policy!.versions.length,2);assert.notEqual(next.policy!.versions[1].round,round);assert.equal(next.policy!.versions[0].content,first.content);
 writePolicyRecord({articleId:first.id,round,employeeId:'TEST',openedAt:'open',agreedAt:'agreed',version:1,signature:'signature'});
 writePolicyRecord({articleId:first.id,round,employeeId:'TEST',openedAt:'overwrite'});
 const records=JSON.parse(store.get('go-policy-records-v1')!);assert.equal(records[0].agreedAt,'agreed');assert.equal(records[0].signature,'signature');
});
test('update without reconfirm keeps the same round and original confirmation version',()=>{
 const first=structuredClone(policyDemo);first.policy!.reconfirm=false;
 const next=publishPolicy({...first,title:'New policy title'});
 assert.equal(next.policy!.versions.length,2);assert.equal(next.policy!.versions[1].round,first.policy!.versions[0].round);
 assert.equal(publishPolicy(next).policy!.versions.length,2);
});
test('draft does not publish and attachments/signature changes create a version',()=>{
 const first=structuredClone(policyDemo);
 assert.equal(publishPolicy({...first,status:'DRAFT',content:'draft'}).policy!.versions.length,1);
 const next=publishPolicy({...first,policy:{...first.policy!,signature:false,attachments:[{name:'policy.pdf',ref:'go-media:test'}]}});
 assert.equal(next.policy!.versions.length,2);assert.equal(next.policy!.versions[1].attachments.length,1);assert.equal(next.policy!.versions[0].attachments.length,0);
});

const {defaultNotifications}=await import('./PolicyNotifications');
test('reconfirmation stops pending schedules and disables new reminders, retaining history',()=>{
 const first=structuredClone(policyDemo);
 first.policy!.notifications=defaultNotifications();first.policy!.notifications.push.enabled=true;
 const jobs=[{articleId:first.id,status:'DEMO_ONLY',template:{timing:'SCHEDULED'}},{articleId:first.id,status:'DEMO_SENT',sentAt:'2026-11-01',template:{timing:'SCHEDULED'}},{articleId:'other',status:'DEMO_ONLY',template:{timing:'SCHEDULED'}}];
 store.set('go-policy-notification-jobs',JSON.stringify(jobs));
 const next=publishPolicy({...first,content:first.content+' revised'});
 assert.equal(next.policy!.notifications!.push.enabled,false);
 assert.equal(next.policy!.versions[0].notifications!.push.enabled,true);
 const saved=JSON.parse(store.get('go-policy-notification-jobs')!);
 assert.equal(saved[0].status,'STOPPED');assert.equal(saved[1].status,'DEMO_SENT');assert.equal(saved[2].status,'DEMO_ONLY');
 first.policy!.reconfirm=false;store.set('go-policy-notification-jobs',JSON.stringify(jobs));
 const sameRound=publishPolicy({...first,content:first.content+' revised'});
 assert.equal(sameRound.policy!.notifications!.push.enabled,true);
 assert.deepEqual(JSON.parse(store.get('go-policy-notification-jobs')!),jobs);
});

test('confirmed inheritance enables valid schedules for new version and rejects expired dates',async()=>{
 const {reminderDateErrors}=await import('./policyModel');
 const first=structuredClone(policyDemo);first.policy!.notifications=defaultNotifications();
 const c=first.policy!.notifications.push;c.enabled=true;c.timing='SCHEDULED';c.at='2099-12-01T09:00';
 store.set('go-policy-notification-jobs','[]');
 const next=publishPolicy({...first,content:first.content+' new'},true);
 assert.equal(next.policy!.notifications!.push.enabled,true);
 assert.equal(next.policy!.notifications!.push.title,c.title);
 const jobs=JSON.parse(store.get('go-policy-notification-jobs')!);
 assert.equal(jobs.length,1);assert.equal(jobs[0].version,2);
 assert.deepEqual(jobs[0].employeeIds,first.policy!.targets);
 c.at='2000-01-01T09:00';assert.equal(reminderDateErrors(first.policy!.notifications).length,1);
 assert.throws(()=>publishPolicy({...first,content:'expired'},true));
 const paused=publishPolicy({...first,content:'expired'},false);
 assert.equal(paused.policy!.notifications!.push.at,c.at);
 assert.equal(paused.policy!.notifications!.push.enabled,false);
});

test('reading delay is versioned without changing historical requirements',()=>{
 const first=structuredClone(policyDemo);
 const next=publishPolicy({...first,policy:{...first.policy!,readDelaySeconds:15}});
 assert.equal(next.policy!.versions.length,2);
 assert.equal(next.policy!.versions[1].readDelaySeconds,15);
 assert.equal(next.policy!.versions[0].readDelaySeconds||0,0);
 assert.equal(publishPolicy(next).policy!.versions.length,2);
});
