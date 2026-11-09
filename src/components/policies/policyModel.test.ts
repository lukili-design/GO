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
